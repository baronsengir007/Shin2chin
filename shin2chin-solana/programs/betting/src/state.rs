use anchor_lang::prelude::*;

/**
 * Event account - Stores information about a betting event
 * 
 * Implements the data storage for User Story #5:
 * "As a platform admin, I want to easily create betting events 
 * so that users have legitimate matches to bet on."
 */
#[account]
pub struct Event {
    // Admin who created the event
    pub admin: Pubkey,
    
    // Team information
    pub team_a: String,
    pub team_b: String,
    
    // Timestamps
    pub start_time: i64,
    pub end_time: Option<i64>,
    
    // Betting statistics
    pub total_bets_a: u64,
    pub total_bets_b: u64,
    pub total_matched: u64,
    
    // Result information
    pub result_submitted: bool,
    pub winning_team: Option<String>,
    pub oracle_pubkey: Pubkey,
    
    // Flags
    pub betting_closed: bool,
    pub settled: bool,
    
    // Reserved space for future upgrades
    pub bump: u8,
}

impl Event {
    // Space required for the account
    pub const SPACE: usize = 8 +  // discriminator
        32 +                      // admin pubkey
        4 + 50 +                  // team_a (string with max 50 chars)
        4 + 50 +                  // team_b (string with max 50 chars)
        8 +                       // start_time
        1 + 8 +                   // end_time option
        8 +                       // total_bets_a
        8 +                       // total_bets_b
        8 +                       // total_matched
        1 +                       // result_submitted
        1 + 4 + 50 +              // winning_team option
        32 +                      // oracle_pubkey
        1 +                       // betting_closed
        1 +                       // settled
        1 +                       // bump
        100;                      // padding for future fields
}

/**
 * Bet account - Stores information about a placed bet
 * 
 * Implements the data storage for User Story #2:
 * "As a crypto wallet holder, I want instant peer-to-peer betting without 
 * custodial deposits so that winning feels immediate and I maintain 
 * complete control of my funds."
 */
#[account]
pub struct Bet {
    // Bettor who placed the bet
    pub bettor: Pubkey,
    
    // Event this bet is for
    pub event: Pubkey,
    
    // Bet details
    pub team: String,            // Team name
    pub amount: u64,             // Amount in lamports
    pub timestamp: i64,          // When the bet was placed
    
    // Matching and settlement
    pub matched_amount: u64,     // How much of this bet is matched
    pub matched: bool,           // Whether bet is fully matched
    pub paid_out: bool,          // Whether bet has been paid out
    pub refunded: bool,          // Whether unmatched amount was refunded
    
    // Reserved space for future upgrades
    pub bump: u8,
}

impl Bet {
    // Space required for the account
    pub const SPACE: usize = 8 +  // discriminator
        32 +                      // bettor pubkey
        32 +                      // event pubkey
        4 + 50 +                  // team (string with max 50 chars)
        8 +                       // amount
        8 +                       // timestamp
        8 +                       // matched_amount
        1 +                       // matched
        1 +                       // paid_out
        1 +                       // refunded
        1 +                       // bump
        50;                       // padding for future fields
}

/**
 * User Stats account - Stores betting statistics for a user
 * 
 * Tracks user betting history and performance
 */
#[account]
pub struct UserStats {
    // User public key
    pub user: Pubkey,
    
    // Betting statistics
    pub total_bets: u64,
    pub total_wins: u64,
    pub total_amount_bet: u64,
    pub total_amount_won: u64,
    pub total_amount_refunded: u64,
    pub first_bet_timestamp: Option<i64>,
    pub last_bet_timestamp: Option<i64>,
    
    // Reserved space for future upgrades
    pub bump: u8,
}

impl UserStats {
    // Space required for the account
    pub const SPACE: usize = 8 +  // discriminator
        32 +                      // user pubkey
        8 +                       // total_bets
        8 +                       // total_wins
        8 +                       // total_amount_bet
        8 +                       // total_amount_won
        8 +                       // total_amount_refunded
        1 + 8 +                   // first_bet_timestamp option
        1 + 8 +                   // last_bet_timestamp option
        1 +                       // bump
        50;                       // padding for future fields
}