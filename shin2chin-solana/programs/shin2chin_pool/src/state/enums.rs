use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum EventState {
    /// Event created, waiting for auto-balancing
    Created,
    /// Event has been auto-balanced
    Balanced,
    /// Event has been settled with a winner
    Settled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
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