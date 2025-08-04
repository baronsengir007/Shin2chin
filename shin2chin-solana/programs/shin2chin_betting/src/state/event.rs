use anchor_lang::prelude::*;
use crate::state::enums::{EventStatus, BetOption};
use crate::errors::ErrorCode;

#[account]
pub struct Event {
    pub admin: Pubkey,
    
    pub oracle_pubkey: Pubkey,
    
    pub title: String,
    pub description: String,
    
    pub option_a: String,
    pub option_b: String,
    
    pub deadline: i64,
    pub settlement_time: i64,
    pub created_at: i64,
    
    pub status: EventStatus,
    pub winner: Option<BetOption>,
    
    pub total_pool_a: u64,
    pub total_pool_b: u64,
    
    pub bump: u8,
}

impl Event {
    pub const SPACE: usize = 1072;
    
    pub const MAX_TITLE_LENGTH: usize = 200;
    pub const MAX_DESCRIPTION_LENGTH: usize = 500;
    pub const MAX_OPTION_LENGTH: usize = 100;
    
    pub fn validate_inputs(
        title: &str,
        description: &str,
        option_a: &str,
        option_b: &str,
        deadline: i64,
        settlement_time: i64,
    ) -> Result<()> {
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
        
        require!(
            option_a.trim() != option_b.trim(),
            ErrorCode::IdenticalOptions
        );
        
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