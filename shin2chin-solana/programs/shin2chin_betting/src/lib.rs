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

    /// Place a bet on an active event
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        bet_option: BetOption,
        amount: u64,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        let bet = &mut ctx.accounts.bet;
        let bettor = &ctx.accounts.bettor;
        let clock = Clock::get()?;

        // Validate bet amount
        require!(
            amount >= Bet::MIN_BET_AMOUNT,
            ErrorCode::BetTooSmall
        );

        // Validate event is active
        require!(
            event.status == EventStatus::Active,
            ErrorCode::EventNotActive
        );

        // Validate betting deadline hasn't passed
        require!(
            clock.unix_timestamp < event.deadline,
            ErrorCode::BettingClosed
        );

        // Validate admin cannot bet on own event
        require!(
            bettor.key() != event.admin,
            ErrorCode::AdminCannotBet
        );

        // Transfer SOL from bettor to bet PDA (escrow)
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &bettor.key(),
            &bet.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                bettor.to_account_info(),
                bet.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update event pools with overflow protection
        match bet_option {
            BetOption::OptionA => {
                event.total_pool_a = event.total_pool_a.checked_add(amount)
                    .ok_or(ErrorCode::PoolOverflow)?;
            }
            BetOption::OptionB => {
                event.total_pool_b = event.total_pool_b.checked_add(amount)
                    .ok_or(ErrorCode::PoolOverflow)?;
            }
        }

        // Initialize bet account
        bet.bettor = bettor.key();
        bet.event = event.key();
        bet.bet_option = bet_option;
        bet.amount = amount;
        bet.matched_amount = 0; // Future P2P matching feature
        bet.status = BetStatus::Pending;
        bet.timestamp = clock.unix_timestamp;
        bet.bump = ctx.bumps.bet;

        msg!("Bet placed: {} SOL on {:?} for event {}", 
             amount as f64 / 1_000_000_000.0, bet_option, event.key());
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
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum BetOption {
    /// First betting option (e.g., Team A)
    OptionA,
    /// Second betting option (e.g., Team B)
    OptionB,
}

/// Bet status enumeration for state management
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BetStatus {
    /// Bet placed, awaiting matching or settlement
    Pending,
    /// Bet matched with another user (future P2P functionality)
    Matched,
    /// Event settled by oracle, winner determined
    Settled,
    /// Event cancelled, bet eligible for refund
    Refunded,
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

/**
 * Bet Account - Individual escrow structure for non-custodial betting
 * 
 * Space calculation: 91 bytes total
 * - discriminator: 8 bytes
 * - bettor: 32 bytes (who placed the bet)
 * - event: 32 bytes (references Event PDA)
 * - bet_option: 1 byte (OptionA or OptionB)
 * - amount: 8 bytes (SOL amount in lamports)
 * - matched_amount: 8 bytes (for partial matching - future)
 * - status: 1 byte (Pending/Matched/Settled/Refunded)
 * - timestamp: 8 bytes (when bet was placed)
 * - bump: 1 byte (PDA bump seed)
 * - padding: 37 bytes for future fields
 * 
 * Total: 91 bytes → allocate 128 bytes
 * 
 * PDA Seeds: [b"bet", bettor.key(), event.key()]
 * Escrow: Each bet PDA holds SOL until settlement (non-custodial)
 */
#[account]
pub struct Bet {
    /// User who placed the bet
    pub bettor: Pubkey,
    
    /// Event this bet is for (references Event PDA)
    pub event: Pubkey,
    
    /// Which option the bet is on
    pub bet_option: BetOption,
    
    /// Amount of SOL bet in lamports
    pub amount: u64,
    
    /// Amount matched for partial matching (future feature)
    pub matched_amount: u64,
    
    /// Current status of the bet
    pub status: BetStatus,
    
    /// When the bet was placed
    pub timestamp: i64,
    
    /// PDA bump seed
    pub bump: u8,
}

impl Bet {
    /// Space allocation for Bet account
    pub const SPACE: usize = 128; // 91 bytes actual + 37 padding
    
    /// Minimum bet amount in lamports (0.01 SOL)
    pub const MIN_BET_AMOUNT: u64 = 10_000_000;
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

/// Account structure for placing a bet
/// Uses PDA with seeds [b"bet", bettor.key(), event.key()]
#[derive(Accounts)]
#[instruction(bet_option: BetOption, amount: u64)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,
    
    /// Event account to bet on (must be active)
    #[account(
        mut,
        constraint = event.status == EventStatus::Active @ ErrorCode::EventNotActive
    )]
    pub event: Account<'info, Event>,
    
    /// Bet PDA account - individual escrow for this bet
    /// Seeds: [b"bet", bettor.key(), event.key()]
    #[account(
        init,
        payer = bettor,
        space = Bet::SPACE,
        seeds = [
            b"bet",
            bettor.key().as_ref(),
            event.key().as_ref()
        ],
        bump
    )]
    pub bet: Account<'info, Bet>,
    
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
    // Bet Account validation errors
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