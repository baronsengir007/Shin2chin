use anchor_lang::prelude::*;
use crate::state::{Event, Bet, UserStats};
use crate::errors::BettingError;

/// Module for creating betting events
pub mod create_event;
/// Module for placing bets
pub mod place_bet;
/// Module for submitting event results
pub mod submit_result;

pub use create_event::*;
pub use place_bet::*;
pub use submit_result::*;

/**
 * CreateEvent instruction context
 * 
 * Implements User Story #5:
 * "As a platform admin, I want to easily create betting events 
 * so that users have legitimate matches to bet on."
 */
#[derive(Accounts)]
#[instruction(team_a: String, team_b: String, start_time: i64)]
pub struct CreateEventContext<'info> {
    /// The admin creating the event
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// The new event account to be created
    #[account(
        init,
        payer = admin,
        space = Event::SPACE,
        seeds = ["event".as_bytes(), team_a.as_bytes(), team_b.as_bytes(), start_time.to_le_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

/**
 * PlaceBet instruction context
 * 
 * Implements User Story #2:
 * "As a crypto wallet holder, I want instant peer-to-peer betting without 
 * custodial deposits so that winning feels immediate and I maintain 
 * complete control of my funds."
 */
#[derive(Accounts)]
#[instruction(event_id: Pubkey, team: String, amount: u64)]
pub struct PlaceBetContext<'info> {
    /// The bettor placing the bet
    #[account(mut)]
    pub bettor: Signer<'info>,
    
    /// The event being bet on
    #[account(mut)]
    pub event: Account<'info, Event>,
    
    /// The new bet account to be created
    #[account(
        init,
        payer = bettor,
        space = Bet::SPACE,
        seeds = ["bet".as_bytes(), bettor.key().as_ref(), event.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    
    /// The user's stats account (created if it doesn't exist)
    #[account(
        init_if_needed,
        payer = bettor,
        space = UserStats::SPACE,
        seeds = ["user_stats".as_bytes(), bettor.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

/**
 * SubmitResult instruction context
 * 
 * Implements the Oracle-based automatic settlement from User Story #5
 */
#[derive(Accounts)]
#[instruction(event_id: Pubkey, winning_team: String)]
pub struct SubmitResultContext<'info> {
    /// The oracle submitting the result
    #[account(mut)]
    pub oracle: Signer<'info>,
    
    /// The event to update with results
    #[account(
        mut,
        constraint = event.oracle_pubkey == oracle.key() @ BettingError::UnauthorizedOracle
    )]
    pub event: Account<'info, Event>,
    
    /// System program
    pub system_program: Program<'info, System>,
}