use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    pub event: Account<'info, Event>,
    pub user: Signer<'info>,
}

pub fn place_bet(
    _ctx: Context<PlaceBet>,
    _team: bool,
    _amount: u64,
) -> Result<()> {
    // TODO: Implement place_bet logic
    Ok(())
}