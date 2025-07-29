use anchor_lang::prelude::*;

/**
 * Custom error types for the Shin2Chin betting program
 */
#[error_code]
pub enum BettingError {
    #[msg("Event has not started yet")]
    EventNotStarted,
    
    #[msg("Event has already ended")]
    EventEnded,
    
    #[msg("Betting period has closed for this event")]
    BettingClosed,
    
    #[msg("Event does not exist")]
    EventNotFound,
    
    #[msg("Invalid bet amount, must be between min and max limits")]
    InvalidBetAmount,
    
    #[msg("Bet has already been matched")]
    BetAlreadyMatched,
    
    #[msg("Bet has already been paid out")]
    BetAlreadyPaidOut,
    
    #[msg("Event has already been settled")]
    EventAlreadySettled,
    
    #[msg("Unauthorized access, only admins can perform this action")]
    Unauthorized,
    
    #[msg("Team name does not match either team in the event")]
    InvalidTeam,
    
    #[msg("Insufficient funds to place this bet")]
    InsufficientFunds,
    
    #[msg("Result can only be submitted by authorized oracle")]
    UnauthorizedOracle,
    
    #[msg("Cannot match bets on the same team")]
    SameTeamMatch,
    
    #[msg("Cannot withdraw funds until the event is settled")]
    UnsettledEvent,
}