use anchor_lang::prelude::*;
use super::enums::BetStatus;

#[account]
pub struct Bet {
    /// User who placed the bet
    pub user: Pubkey,
    /// Event this bet belongs to
    pub event: Pubkey,
    /// Amount of SOL bet
    pub amount: u64,
    /// Team bet on: true = team_a, false = team_b
    pub team: bool,
    /// When the bet was placed (for LIFO refunds)
    pub timestamp: i64,
    /// Current status of the bet
    pub status: BetStatus,
    /// Bump seed
    pub bump: u8,
}

impl Bet {
    /// Space needed for Bet account
    pub const SIZE: usize = 8 + // discriminator
        32 + // user Pubkey
        32 + // event Pubkey
        8 + // amount u64
        1 + // team bool
        8 + // timestamp i64
        1 + // status enum
        1; // bump u8

    /// Check if bet is active (not refunded, claimed, etc)
    pub fn is_active(&self) -> bool {
        matches!(self.status, BetStatus::Active | BetStatus::Won | BetStatus::Lost)
    }

    /// Check if bet can be claimed
    pub fn can_claim(&self) -> bool {
        matches!(self.status, BetStatus::Won) 
    }

    /// Check if bet was refunded
    pub fn is_refunded(&self) -> bool {
        matches!(self.status, BetStatus::Refunded)
    }

    /// Calculate payout for winning bet (1.95x = 2x minus 2.5% fee)
    pub fn calculate_payout(&self) -> u64 {
        if matches!(self.status, BetStatus::Won) {
            // 1.95x payout = amount * 195 / 100
            self.amount.saturating_mul(195).saturating_div(100)
        } else {
            0
        }
    }
}