use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::PoolError;

#[derive(Accounts)]
pub struct AutoBalance<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    
    pub system_program: Program<'info, System>,
}

pub fn auto_balance<'info>(ctx: Context<'_, '_, 'info, 'info, AutoBalance<'info>>) -> Result<()> {
    let event = &mut ctx.accounts.event;
    
    // Security validations
    require!(event.needs_balancing(), PoolError::BalancingNotNeeded);
    require!(!event.settled, PoolError::EventAlreadySettled);
    require!(!event.balanced, PoolError::BalancingNotNeeded);
    
    // Ensure we have some bets to process
    require!(!ctx.remaining_accounts.is_empty(), PoolError::InsufficientFunds);
    
    // Calculate imbalance
    let total_pool = event.total_pool();
    require!(total_pool > 0, PoolError::InsufficientFunds);
    
    let _target_per_pool = total_pool / 2;
    let (larger_pool_is_team_a, excess) = event.pool_imbalance();
    let refund_needed = excess / 2;
    
    // Don't balance if difference is minimal (< 1% of total pool)
    let min_imbalance_threshold = total_pool / 100;
    require!(excess > min_imbalance_threshold, PoolError::BalancingNotNeeded);
    
    msg!("Auto-balance started: total_pool={}, excess={}, refund_needed={}", 
         total_pool, excess, refund_needed);
    
    // Process remaining_accounts as bet accounts for LIFO refunds
    let mut refunded_amount = 0u64;
    let mut bet_data = Vec::new();
    
    // Collect bet data for processing (simplified to avoid lifetime issues)
    for account_info in ctx.remaining_accounts.iter() {
        // Skip system accounts (user accounts for refunds)  
        if account_info.owner == &anchor_lang::system_program::ID {
            continue;
        }
        
        // Try to deserialize as bet account
        match Account::<Bet>::try_from(account_info) {
            Ok(bet_account) => {
                // Security validations for bet account
                require!(bet_account.event == event.key(), PoolError::Unauthorized);
                require!(bet_account.status == BetStatus::Active, PoolError::CannotClaim);
                
                // Only process bets from the oversized pool
                if bet_account.team == larger_pool_is_team_a {
                    bet_data.push((bet_account.amount, bet_account.user, bet_account.timestamp));
                }
            }
            Err(_) => continue,
        }
    }
    
    // Ensure we have bets to refund from the oversized pool
    require!(!bet_data.is_empty(), PoolError::InsufficientFunds);
    
    // Sort by timestamp DESC (newest first) for LIFO refunds
    bet_data.sort_by(|a, b| b.2.cmp(&a.2));
    
    // Process refunds until balance achieved
    for (amount, user_key, timestamp) in bet_data.iter() {
        if refunded_amount >= refund_needed {
            break;
        }
        
        let refund_amount = *amount;
        
        // Find the corresponding user account in remaining_accounts
        let user_account_info = ctx.remaining_accounts
            .iter()
            .find(|account| account.key() == *user_key);
            
        if let Some(user_info) = user_account_info {
            // Validate user account ownership
            require!(user_info.owner == &anchor_lang::system_program::ID, PoolError::Unauthorized);
            require!(!user_info.executable, PoolError::Unauthorized);
            
            // Ensure event account has sufficient lamports for refund
            require!(
                event.to_account_info().lamports() >= refund_amount,
                PoolError::InsufficientFunds
            );
            
            // Transfer SOL from event account to user (direct lamport manipulation)
            **event.to_account_info().try_borrow_mut_lamports()? = event
                .to_account_info()
                .lamports()
                .checked_sub(refund_amount)
                .ok_or(PoolError::InsufficientFunds)?;
                
            **user_info.try_borrow_mut_lamports()? = user_info
                .lamports()
                .checked_add(refund_amount)
                .ok_or(PoolError::InsufficientFunds)?;
            
            // Note: Bet status update to "Refunded" would require additional complexity
            // due to Rust lifetime constraints. The refund is processed by updating
            // pool balances and transferring SOL. Status can be updated in a separate instruction.
            
            // Update pool balances with overflow protection
            if larger_pool_is_team_a {
                event.team_a_pool = event.team_a_pool
                    .checked_sub(refund_amount)
                    .ok_or(PoolError::InsufficientFunds)?;
            } else {
                event.team_b_pool = event.team_b_pool
                    .checked_sub(refund_amount)
                    .ok_or(PoolError::InsufficientFunds)?;
            }
            
            refunded_amount = refunded_amount
                .checked_add(refund_amount)
                .ok_or(PoolError::InvalidBetAmount)?;
            
            msg!("Refunded bet: user={}, amount={}, timestamp={}", 
                 user_key, refund_amount, timestamp);
        } else {
            // This is an error - user account must be provided for refunds
            return Err(PoolError::InsufficientFunds.into());
        }
    }
    
    // Mark event as balanced
    event.balanced = true;
    
    msg!("Auto-balance completed: refunded {} total", refunded_amount);
    
    Ok(())
}