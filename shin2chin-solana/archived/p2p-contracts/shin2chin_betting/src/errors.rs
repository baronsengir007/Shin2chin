use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Event title exceeds maximum length of 200 characters")]
    TitleTooLong,
    #[msg("Event description exceeds maximum length of 500 characters")]
    DescriptionTooLong,
    #[msg("Betting option exceeds maximum length of 100 characters")]
    OptionTooLong,
    #[msg("Event deadline cannot be in the past")]
    DeadlineInPast,
    #[msg("Settlement time must be after betting deadline")]
    SettlementBeforeDeadline,
    #[msg("Event title cannot be empty")]
    EmptyTitle,
    #[msg("Event description cannot be empty")]
    EmptyDescription,
    #[msg("Betting options cannot be empty")]
    EmptyOption,
    #[msg("Betting options must be different")]
    IdenticalOptions,
    #[msg("Oracle public key cannot be the same as admin")]
    InvalidOracleKey,
    #[msg("Bet amount is too small (minimum 0.01 SOL)")]
    BetTooSmall,
    #[msg("Event is not active for betting")]
    EventNotActive,
    #[msg("Betting deadline has passed")]
    BettingClosed,
    #[msg("Admin cannot bet on their own events")]
    AdminCannotBet,
    #[msg("Bet already exists for this user and event")]
    BetAlreadyExists,
    #[msg("Insufficient balance to place bet")]
    InsufficientBalance,
    #[msg("Bet event reference does not match Event account")]
    EventMismatch,
    #[msg("Pool overflow - bet amount too large")]
    PoolOverflow,
}