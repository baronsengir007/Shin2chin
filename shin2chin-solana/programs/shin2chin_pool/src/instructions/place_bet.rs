use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::PoolError;

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    
    #[account(
        init,
        seeds = [b"bet", user.key().as_ref(), event.key().as_ref()],
        bump,
        payer = user,
        space = Bet::SIZE
    )]
    pub bet: Account<'info, Bet>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn place_bet(
    ctx: Context<PlaceBet>,
    team: bool,
    amount: u64,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let bet = &mut ctx.accounts.bet;
    
    // Security validations
    require!(amount > 0, PoolError::InvalidBetAmount);
    require!(event.is_betting_open(), PoolError::BettingClosed);
    require!(!event.settled, PoolError::EventAlreadySettled);
    
    // Prevent overflow attacks - reasonable max bet of 100 SOL
    require!(amount <= 100_000_000_000, PoolError::InvalidBetAmount); // 100 SOL in lamports
    
    // Ensure user has sufficient balance (basic sanity check)
    require!(
        ctx.accounts.user.to_account_info().lamports() >= amount,
        PoolError::InsufficientFunds
    );
    
    // Transfer SOL from user to event account
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: event.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;
    
    // Initialize bet account with current timestamp for LIFO ordering
    bet.user = ctx.accounts.user.key();
    bet.event = event.key();
    bet.amount = amount;
    bet.team = team;
    bet.timestamp = Clock::get()?.unix_timestamp;
    bet.status = BetStatus::Active;
    bet.bump = ctx.bumps.bet;
    
    // Update event pool balances with overflow protection
    if team {
        event.team_a_pool = event.team_a_pool
            .checked_add(amount)
            .ok_or(PoolError::InvalidBetAmount)?;
    } else {
        event.team_b_pool = event.team_b_pool
            .checked_add(amount)
            .ok_or(PoolError::InvalidBetAmount)?;
    }
    
    msg!(
        "Bet placed: {} SOL on {} for event {}",
        amount,
        if team { "Team A" } else { "Team B" },
        event.key()
    );
    
    Ok(())
}