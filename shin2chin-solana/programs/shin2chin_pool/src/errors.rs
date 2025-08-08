use anchor_lang::prelude::*;

#[error_code]
pub enum PoolError {
    #[msg("Betting is closed for this event")]
    BettingClosed,
    #[msg("Event has already been settled")]
    EventAlreadySettled,
    #[msg("Event has not been settled yet")]
    EventNotSettled,
    #[msg("Bet amount must be greater than 0")]
    InvalidBetAmount,
    #[msg("Only admin can settle events")]
    Unauthorized,
    #[msg("Bet cannot be claimed")]
    CannotClaim,
    #[msg("Bet has already been claimed")]
    AlreadyClaimed,
    #[msg("Pool balancing not needed")]
    BalancingNotNeeded,
    #[msg("Teams must have different names")]
    DuplicateTeamNames,
    #[msg("Match start time must be in the future")]
    InvalidMatchTime,
    #[msg("Insufficient funds for payout")]
    InsufficientFunds,
}