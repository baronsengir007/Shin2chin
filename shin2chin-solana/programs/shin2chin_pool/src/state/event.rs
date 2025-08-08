use anchor_lang::prelude::*;

#[account]
pub struct Event {
    /// Team A name
    pub team_a: String,
    /// Team B name  
    pub team_b: String,
    /// Total SOL in team A pool
    pub team_a_pool: u64,
    /// Total SOL in team B pool
    pub team_b_pool: u64,
    /// When betting stops and match starts
    pub match_start_time: i64,
    /// Whether pools have been balanced
    pub balanced: bool,
    /// Whether event has been settled
    pub settled: bool,
    /// Winner: Some(true) = team_a, Some(false) = team_b, None = not settled
    pub winner: Option<bool>,
    /// Admin who created the event
    pub admin: Pubkey,
    /// Bump seed
    pub bump: u8,
}

impl Event {
    /// Calculate space needed for Event account
    pub fn size(team_a_len: usize, team_b_len: usize) -> usize {
        8 + // discriminator
        4 + team_a_len + // team_a String
        4 + team_b_len + // team_b String  
        8 + // team_a_pool u64
        8 + // team_b_pool u64
        8 + // match_start_time i64
        1 + // balanced bool
        1 + // settled bool
        1 + 1 + // winner Option<bool>
        32 + // admin Pubkey
        1 // bump u8
    }

    /// Check if betting is still open
    pub fn is_betting_open(&self) -> bool {
        let clock = Clock::get().unwrap();
        clock.unix_timestamp < self.match_start_time && !self.settled
    }

    /// Check if pools need balancing
    pub fn needs_balancing(&self) -> bool {
        let clock = Clock::get().unwrap();
        clock.unix_timestamp >= self.match_start_time && !self.balanced && !self.settled
    }

    /// Calculate total pool size
    pub fn total_pool(&self) -> u64 {
        self.team_a_pool + self.team_b_pool
    }

    /// Calculate which team has larger pool and by how much
    pub fn pool_imbalance(&self) -> (bool, u64) {
        if self.team_a_pool > self.team_b_pool {
            (true, self.team_a_pool - self.team_b_pool)
        } else {
            (false, self.team_b_pool - self.team_a_pool)
        }
    }
}