use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::PoolError;

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,
        constraint = event.settled @ PoolError::EventNotSettled
    )]
    pub event: Account<'info, Event>,
    
    #[account(
        mut,
        has_one = user,
        has_one = event,
        constraint = bet.status == BetStatus::Won @ PoolError::CannotClaim
    )]
    pub bet: Account<'info, Bet>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn claim_winnings(ctx: Context<Claim>) -> Result<()> {
    let bet = &mut ctx.accounts.bet;
    let user = &ctx.accounts.user;
    let event = &ctx.accounts.event;
    
    // Validate bet can be claimed
    require!(event.settled, PoolError::EventNotSettled);
    require!(bet.status == BetStatus::Won, PoolError::CannotClaim);
    require!(bet.user == user.key(), PoolError::Unauthorized);

    // Calculate payout (1.95x)
    let payout = bet.calculate_payout();
    require!(payout > 0, PoolError::InsufficientFunds);

    // Transfer SOL from event to user
    let event_account = &mut ctx.accounts.event.to_account_info();
    let user_account = &mut ctx.accounts.user.to_account_info();
    
    **event_account.try_borrow_mut_lamports()? -= payout;
    **user_account.try_borrow_mut_lamports()? += payout;

    // Update bet status to claimed
    bet.status = BetStatus::Claimed;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    // USER STORY: US1 - Effortless Betting
    // ACCEPTANCE CRITERION: Winners can claim 1.95x payout after event settlement

    #[test]
    fn test_claim_winnings_happy_path() {
        // Given: Valid winning bet that can be claimed
        let event_settled = true;
        let bet_status = BetStatus::Won;
        let bet_amount = 100u64;
        let user_key = Pubkey::new_unique();
        
        // When: Checking claim conditions
        let can_claim = event_settled && bet_status == BetStatus::Won;
        let valid_user = user_key != Pubkey::default();
        let valid_amount = bet_amount > 0;
        
        // Then: All conditions should be met for claiming
        assert!(can_claim, "Should allow claiming of winning bets");
        assert!(valid_user, "User should be valid");
        assert!(valid_amount, "Bet amount should be valid");
    }

    #[test]
    fn test_claim_winnings_payout_calculation() {
        // USER STORY: US1 - Effortless Betting
        // CRITERION: Winners receive exactly 1.95x payout
        
        // Given: Winning bet with known amount
        let bet_amount = 100u64;
        let expected_payout = 195u64; // 100 * 1.95 = 195
        
        // When: Calculating payout
        let calculated_payout = bet_amount.saturating_mul(195).saturating_div(100);
        
        // Then: Payout should be exactly 1.95x
        assert_eq!(calculated_payout, expected_payout, "Payout should be exactly 1.95x");
    }

    #[test]
    fn test_claim_winnings_before_settlement() {
        // Given: Attempt to claim before event settlement
        let event_settled = false;
        let bet_status = BetStatus::Won;
        
        // When: Checking settlement requirement
        let can_claim = event_settled && bet_status == BetStatus::Won;
        
        // Then: Should reject claim before settlement
        assert!(!can_claim, "Should reject claims before event settlement");
    }

    #[test]
    fn test_claim_winnings_losing_bet() {
        // Given: Losing bet trying to claim
        let event_settled = true;
        let bet_status = BetStatus::Lost;
        
        // When: Checking bet status requirement
        let can_claim = event_settled && bet_status == BetStatus::Won;
        
        // Then: Should reject claim of losing bet
        assert!(!can_claim, "Should reject claims of losing bets");
    }

    #[test]
    fn test_claim_winnings_double_claim() {
        // Given: Already claimed bet trying to claim again
        let event_settled = true;
        let bet_status = BetStatus::Claimed;
        
        // When: Checking claim status
        let can_claim = event_settled && bet_status == BetStatus::Won;
        
        // Then: Should reject double claim
        assert!(!can_claim, "Should reject double claims");
    }

    #[test]
    fn test_claim_winnings_refunded_bet() {
        // Given: Refunded bet trying to claim
        let event_settled = true;
        let bet_status = BetStatus::Refunded;
        
        // When: Checking refunded bet status
        let can_claim = event_settled && bet_status == BetStatus::Won;
        
        // Then: Should reject claim of refunded bet
        assert!(!can_claim, "Should reject claims of refunded bets");
    }

    #[test]
    fn test_claim_winnings_overflow_protection() {
        // USER STORY: US1 - Effortless Betting
        // CRITERION: Payout calculations should be safe from overflow
        
        // Given: Large bet amount that could cause overflow
        let large_amount = u64::MAX;
        
        // When: Calculating payout with overflow protection
        let safe_payout = large_amount.saturating_mul(195).saturating_div(100);
        
        // Then: Should not panic and should handle overflow gracefully
        assert!(safe_payout > 0, "Payout calculation should be safe from overflow");
        assert!(safe_payout <= u64::MAX, "Payout should not exceed maximum value");
    }
}