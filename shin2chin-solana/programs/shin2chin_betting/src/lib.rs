use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/**
 * Shin2Chin Betting Program - Phase A Foundation
 * 
 * Event Account Structure implementation based on comprehensive analysis:
 * - Complete Event PDA with all required fields
 * - PDA derivation with admin+counter seeds
 * - Proper space allocation (1024 bytes)
 * - EventStatus and BetOption enums
 * - Input validation for all fields
 */

#[program]
pub mod shin2chin_betting {
    use super::*;

    /// Create a new betting event with oracle integration
    pub fn create_event(
        ctx: Context<CreateEvent>,
        title: String,
        description: String,
        option_a: String,
        option_b: String,
        deadline: i64,
        settlement_time: i64,
        oracle_pubkey: Pubkey,
    ) -> Result<()> {
        // Validate all input parameters
        Event::validate_inputs(
            &title,
            &description,
            &option_a,
            &option_b,
            deadline,
            settlement_time,
        )?;

        // Validate oracle is not the same as admin
        require!(
            oracle_pubkey != ctx.accounts.admin.key(),
            ErrorCode::InvalidOracleKey
        );

        // Validate oracle is not the default pubkey (security fix)
        require!(
            oracle_pubkey != Pubkey::default(),
            ErrorCode::InvalidOracleKey
        );

        let event = &mut ctx.accounts.event;
        let clock = Clock::get()?;

        // Initialize event with all required fields
        event.admin = ctx.accounts.admin.key();
        event.oracle_pubkey = oracle_pubkey;
        event.title = title;
        event.description = description;
        event.option_a = option_a;
        event.option_b = option_b;
        event.deadline = deadline;
        event.settlement_time = settlement_time;
        event.created_at = clock.unix_timestamp;
        event.status = EventStatus::Active;
        event.winner = None;
        event.total_pool_a = 0;
        event.total_pool_b = 0;
        event.bump = ctx.bumps.event;

        msg!("Event created successfully with oracle: {}", oracle_pubkey);
        Ok(())
    }
}

/// Event status enumeration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EventStatus {
    /// Event created, betting open
    Active,
    /// Betting closed, awaiting settlement
    Closed,
    /// Event settled, payouts complete
    Settled,
    /// Event cancelled, refunds available
    Cancelled,
}

/// Betting option enumeration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BetOption {
    /// First betting option (e.g., Team A)
    OptionA,
    /// Second betting option (e.g., Team B)
    OptionB,
}

/**
 * Event Account - Complete structure with oracle integration
 * 
 * Space calculation: 1048 bytes total
 * - discriminator: 8 bytes
 * - admin: 32 bytes  
 * - oracle_pubkey: 32 bytes (NEW)
 * - title: 204 bytes (4 + 200)
 * - description: 504 bytes (4 + 500)
 * - option_a: 104 bytes (4 + 100)
 * - option_b: 104 bytes (4 + 100)
 * - timestamps: 24 bytes (3 × 8)
 * - enums: 4 bytes (status + winner option)
 * - pools: 16 bytes (2 × 8)
 * - bump: 1 byte
 * - padding: 24 bytes for future fields
 * 
 * Total: 1048 bytes → allocate 1072 bytes
 */
#[account]
pub struct Event {
    /// Admin who created the event (required for PDA seeds)
    pub admin: Pubkey,
    
    /// Oracle responsible for settling this event
    pub oracle_pubkey: Pubkey,
    
    /// Event metadata
    pub title: String,        // max 200 chars
    pub description: String,  // max 500 chars
    
    /// Betting options
    pub option_a: String,     // max 100 chars (e.g., "Team A")
    pub option_b: String,     // max 100 chars (e.g., "Team B")
    
    /// Event timing
    pub deadline: i64,        // betting deadline timestamp
    pub settlement_time: i64, // when event should be settled
    pub created_at: i64,      // creation timestamp
    
    /// Event status and outcome
    pub status: EventStatus,
    pub winner: Option<BetOption>,
    
    /// Betting pools
    pub total_pool_a: u64,    // total amount bet on option A
    pub total_pool_b: u64,    // total amount bet on option B
    
    /// PDA bump seed
    pub bump: u8,
}

impl Event {
    /// Space allocation for Event account
    pub const SPACE: usize = 1072; // Updated for oracle integration
    
    /// Maximum string lengths for validation
    pub const MAX_TITLE_LENGTH: usize = 200;
    pub const MAX_DESCRIPTION_LENGTH: usize = 500;
    pub const MAX_OPTION_LENGTH: usize = 100;
    
    /// Validate Event input fields
    pub fn validate_inputs(
        title: &str,
        description: &str,
        option_a: &str,
        option_b: &str,
        deadline: i64,
        settlement_time: i64,
    ) -> Result<()> {
        // Length validation
        require!(
            !title.trim().is_empty(),
            ErrorCode::EmptyTitle
        );
        require!(
            title.len() <= Self::MAX_TITLE_LENGTH,
            ErrorCode::TitleTooLong
        );
        require!(
            !description.trim().is_empty(),
            ErrorCode::EmptyDescription
        );
        require!(
            description.len() <= Self::MAX_DESCRIPTION_LENGTH,
            ErrorCode::DescriptionTooLong
        );
        require!(
            !option_a.trim().is_empty(),
            ErrorCode::EmptyOption
        );
        require!(
            option_a.len() <= Self::MAX_OPTION_LENGTH,
            ErrorCode::OptionTooLong
        );
        require!(
            !option_b.trim().is_empty(),
            ErrorCode::EmptyOption
        );
        require!(
            option_b.len() <= Self::MAX_OPTION_LENGTH,
            ErrorCode::OptionTooLong
        );
        
        // Options must be different
        require!(
            option_a.trim() != option_b.trim(),
            ErrorCode::IdenticalOptions
        );
        
        // Time validation
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            deadline > current_time,
            ErrorCode::DeadlineInPast
        );
        require!(
            settlement_time > deadline,
            ErrorCode::SettlementBeforeDeadline
        );
        
        Ok(())
    }
}

/// Account structure for creating a new Event
/// Uses hash-based PDA with seeds [b"event", admin.key(), &hash[0..8]]
#[derive(Accounts)]
#[instruction(
    title: String,
    description: String, 
    option_a: String,
    option_b: String,
    deadline: i64,
    settlement_time: i64,
    oracle_pubkey: Pubkey
)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// Event PDA account with hash-based derivation
    /// Seeds: [b"event", admin.key(), &hash(title+description+options)[0..8]]
    #[account(
        init,
        payer = admin,
        space = Event::SPACE,
        seeds = [
            b"event", 
            admin.key().as_ref(), 
            &hash(format!("{}{}{}{}", title, description, option_a, option_b).as_bytes()).to_bytes()[0..8]
        ],
        bump
    )]
    pub event: Account<'info, Event>,
    
    pub system_program: Program<'info, System>,
}

/// Error codes for Event Account validation
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
}