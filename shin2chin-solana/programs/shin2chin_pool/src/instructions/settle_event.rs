use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Settle<'info> {
    pub event: Account<'info, Event>,
}

pub fn settle_event(_ctx: Context<Settle>, _winner: bool) -> Result<()> {
    // TODO: Implement settle_event logic
    Ok(())
}