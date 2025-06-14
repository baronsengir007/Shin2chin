use anchor_lang::prelude::*;

/// Oracle account - represents a registered event result provider
#[account]
#[derive(Debug)]
pub struct Oracle {
    /// The authority that can sign oracle submissions
    pub authority: Pubkey,
    
    /// Human-readable name of the oracle provider
    pub name: String,
    
    /// Number of results submitted by this oracle
    pub submissions_count: u64,
    
    /// Timestamp of last result submission
    pub last_submission: i64,
    
    /// Reserved space for future extensions
    pub reserved: [u8; 64],
    
    /// Account discriminator bump
    pub bump: u8,
}

impl Oracle {
    pub const SPACE: usize = 
        32 +                // authority: Pubkey
        4 + 32 +            // name: String (max 32 chars)
        8 +                 // submissions_count: u64
        8 +                 // last_submission: i64
        64 +                // reserved: [u8; 64]
        1;                  // bump: u8
}

/// EventAccount is defined in the betting program
/// This is a reference structure for schema compatibility
#[derive(Debug)]
pub struct EventAccount {
    pub admin: Pubkey,
    pub team_a: String,
    pub team_b: String,
    pub betting_open: bool,
    pub start_time: i64,
    pub end_time: i64, 
    pub total_pool_amount: u64,
    pub team_a_amount: u64,
    pub team_b_amount: u64,
    pub result_submitted: bool,
    pub team_a_score: u32,
    pub team_b_score: u32,
    pub winning_team: u8,
    pub settled: bool,
    pub bump: u8,
}