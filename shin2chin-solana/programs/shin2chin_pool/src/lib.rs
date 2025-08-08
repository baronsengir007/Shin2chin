use anchor_lang::prelude::*;

// Import modules
pub mod instructions;
pub mod state;
pub mod errors;

// Use instructions
use instructions::*;

declare_id!("11111111111111111111111111111112");

#[program]
pub mod shin2chin_pool {
    use super::*;

    /// Initialize a new betting event
    pub fn initialize_event(
        ctx: Context<InitEvent>,
        team_a: String,
        team_b: String,
        match_start_time: i64,
    ) -> Result<()> {
        instructions::initialize_event(ctx, team_a, team_b, match_start_time)
    }

    /// Place a bet on a team
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        team: bool, // true = team_a, false = team_b
        amount: u64,
    ) -> Result<()> {
        instructions::place_bet(ctx, team, amount)
    }

    /// Auto-balance pools at match start time
    pub fn auto_balance(ctx: Context<AutoBalance>) -> Result<()> {
        instructions::auto_balance(ctx)
    }

    /// Settle the event with winner
    pub fn settle_event(
        ctx: Context<Settle>,
        winner: bool, // true = team_a won
    ) -> Result<()> {
        instructions::settle_event(ctx, winner)
    }

    /// Claim winnings for a bet
    pub fn claim_winnings(ctx: Context<Claim>) -> Result<()> {
        instructions::claim_winnings(ctx)
    }
}