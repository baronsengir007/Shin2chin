use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BetStatus {
    /// Bet is active and waiting for event settlement
    Active,
    /// Bet was refunded due to auto-balancing (LIFO)
    Refunded,
    /// Bet won and can be claimed
    Won,
    /// Bet lost
    Lost,
    /// Winnings have been claimed
    Claimed,
}