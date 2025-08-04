use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;
use crate::state::{Event, EventStatus};
use crate::errors::ErrorCode;
use crate::constants::EVENT_SEED;

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
    
    #[account(
        init,
        payer = admin,
        space = Event::SPACE,
        seeds = [
            EVENT_SEED, 
            admin.key().as_ref(), 
            &hash(format!("{}{}{}{}", title, description, option_a, option_b).as_bytes()).to_bytes()[0..8]
        ],
        bump
    )]
    pub event: Account<'info, Event>,
    
    pub system_program: Program<'info, System>,
}

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
    Event::validate_inputs(
        &title,
        &description,
        &option_a,
        &option_b,
        deadline,
        settlement_time,
    )?;

    require!(
        oracle_pubkey != ctx.accounts.admin.key(),
        ErrorCode::InvalidOracleKey
    );

    require!(
        oracle_pubkey != Pubkey::default(),
        ErrorCode::InvalidOracleKey
    );

    let event = &mut ctx.accounts.event;
    let clock = Clock::get()?;

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