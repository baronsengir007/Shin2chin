use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

mod state;
mod instructions;
mod errors;
mod constants;

use instructions::*;
use state::BetOption;

#[program]
pub mod shin2chin_betting {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        title: String,
        description: String,
        option_a: String,
        option_b: String,
        deadline: i64,
        settlement_time: i64,
        oracle_pubkey: Pubkey,
    ) -> Result<()> {
        instructions::create_event::create_event(
            ctx,
            title,
            description,
            option_a,
            option_b,
            deadline,
            settlement_time,
            oracle_pubkey,
        )
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        bet_option: BetOption,
        amount: u64,
    ) -> Result<()> {
        instructions::place_bet::place_bet(ctx, bet_option, amount)
    }
}