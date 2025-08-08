use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::PoolError;

#[derive(Accounts)]
#[instruction(team_a: String, team_b: String)]
pub struct InitEvent<'info> {
    #[account(
        init,
        payer = admin,
        space = Event::size(team_a.len(), team_b.len()),
        seeds = [b"event", admin.key().as_ref(), team_a.as_bytes(), team_b.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn initialize_event(
    ctx: Context<InitEvent>,
    team_a: String,
    team_b: String,
    match_start_time: i64,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let clock = Clock::get()?;

    // Validation
    require!(team_a != team_b, PoolError::DuplicateTeamNames);
    require!(
        match_start_time > clock.unix_timestamp,
        PoolError::InvalidMatchTime
    );

    // Initialize event
    event.team_a = team_a;
    event.team_b = team_b;
    event.team_a_pool = 0;
    event.team_b_pool = 0;
    event.match_start_time = match_start_time;
    event.balanced = false;
    event.settled = false;
    event.winner = None;
    event.admin = ctx.accounts.admin.key();
    event.bump = ctx.bumps.event;

    msg!(
        "Event created: {} vs {} starting at {}",
        event.team_a,
        event.team_b,
        event.match_start_time
    );

    Ok(())
}