use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Claim<'info> {
    pub event: Account<'info, Event>,
    pub user: Signer<'info>,
}

pub fn claim_winnings(_ctx: Context<Claim>) -> Result<()> {
    // TODO: Implement claim_winnings logic
    Ok(())
}