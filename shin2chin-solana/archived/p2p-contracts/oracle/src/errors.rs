use anchor_lang::prelude::*;

#[error_code]
pub enum OracleError {
    #[msg("Unauthorized access - admin only operation")]
    Unauthorized,
    
    #[msg("Oracle not registered")]
    OracleNotRegistered,
    
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
    
    #[msg("Event already settled")]
    EventAlreadySettled,
    
    #[msg("Invalid event state")]
    InvalidEventState,
    
    #[msg("Invalid score - scores must be non-negative")]
    InvalidScore,
    
    #[msg("Result already submitted")]
    ResultAlreadySubmitted,
    
    #[msg("Oracle data overflow")]
    OracleDataOverflow,
}