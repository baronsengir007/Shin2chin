use anchor_lang::prelude::*;
use crate::state::enums::{BetOption, BetStatus};

#[account]
pub struct Bet {
    pub bettor: Pubkey,
    
    pub event: Pubkey,
    
    pub bet_option: BetOption,
    
    pub amount: u64,
    
    pub matched_amount: u64,
    
    pub status: BetStatus,
    
    pub timestamp: i64,
    
    pub bump: u8,
}

impl Bet {
    pub const SPACE: usize = 128;
    
    pub const MIN_BET_AMOUNT: u64 = 10_000_000;
}