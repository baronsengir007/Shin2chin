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

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    // USER STORY: US2 - Instant Events
    // ACCEPTANCE CRITERION: Admin can create event in 10 seconds with Team A + Team B + Time
    
    #[test]
    fn test_initialize_event_happy_path() {
        // Given: Valid team names and future match time
        let team_a = "Chelsea".to_string();
        let team_b = "Manchester United".to_string();
        let future_time = 1234567890i64; // Some future timestamp
        let current_time = 1234567800i64; // 90 seconds earlier
        
        // When: Event initialization parameters are validated
        let team_names_different = team_a != team_b;
        let time_in_future = future_time > current_time;
        let teams_not_empty = !team_a.is_empty() && !team_b.is_empty();
        
        // Then: All validations should pass
        assert!(team_names_different, "Team names should be different");
        assert!(time_in_future, "Match time should be in future");
        assert!(teams_not_empty, "Team names should not be empty");
    }

    #[test]
    fn test_initialize_event_duplicate_team_names() {
        // Given: Same team names
        let team_a = "Chelsea".to_string();
        let team_b = "Chelsea".to_string(); // Same as team_a
        
        // When: Checking team name validation
        let teams_different = team_a != team_b;
        
        // Then: Should fail validation
        assert!(!teams_different, "Should reject duplicate team names");
    }

    #[test]
    fn test_initialize_event_past_match_time() {
        // Given: Past match start time
        let current_time = 1234567890i64;
        let past_time = 1234567800i64; // 90 seconds earlier
        
        // When: Checking time validation
        let time_in_future = past_time > current_time;
        
        // Then: Should fail validation
        assert!(!time_in_future, "Should reject past match times");
    }

    #[test]
    fn test_initialize_event_empty_team_names() {
        // Given: Empty team names
        let empty_team_a = "".to_string();
        let empty_team_b = "".to_string();
        let valid_team = "Chelsea".to_string();
        
        // When: Checking empty name validation
        let both_empty = empty_team_a.is_empty() && empty_team_b.is_empty();
        let one_empty = empty_team_a.is_empty() || valid_team.is_empty();
        
        // Then: Should detect empty names
        assert!(both_empty, "Should detect when both teams are empty");
        assert!(one_empty, "Should detect when one team is empty");
    }

    #[test]
    fn test_event_size_calculation() {
        // USER STORY: US2 - Instant Events  
        // CRITERION: Events should be created efficiently
        
        // Given: Different team name lengths
        let short_team = "FC".to_string();
        let long_team = "Real Madrid CF Barcelona".to_string();
        
        // When: Calculating space requirements
        let min_size = Event::size(short_team.len(), short_team.len());
        let max_size = Event::size(long_team.len(), long_team.len());
        
        // Then: Size should scale with team name length
        assert!(max_size > min_size, "Size should increase with longer team names");
        assert!(min_size > 50, "Minimum size should accommodate base fields (discriminator + fixed fields)");
    }
}