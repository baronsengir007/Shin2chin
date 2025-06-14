use anchor_lang::prelude::*;
use crate::{errors::OracleError, state::{Oracle, EventAccount}};

/// Handler for the submit_result instruction
/// Only registered oracles can submit event results
pub fn handler(
    ctx: Context<crate::SubmitResultContext>,
    team_a_score: u32,
    team_b_score: u32,
) -> Result<()> {
    let oracle = &mut ctx.accounts.oracle;
    let event = &mut ctx.accounts.event;
    
    // Check if event is already settled
    if event.result_submitted {
        return Err(OracleError::EventAlreadySettled.into());
    }
    
    // Update event with scores
    event.team_a_score = team_a_score;
    event.team_b_score = team_b_score;
    
    // Determine winning team (0 = team A, 1 = team B, 2 = draw)
    let winning_team = if team_a_score > team_b_score {
        0
    } else if team_b_score > team_a_score {
        1
    } else {
        2 // Draw
    };
    
    // Set the winning team
    event.winning_team = winning_team;
    
    // Mark result as submitted
    event.result_submitted = true;
    
    // Update oracle stats
    oracle.submissions_count += 1;
    oracle.last_submission = Clock::get()?.unix_timestamp;
    
    msg!("Result submitted: {} vs {}, Winner: {}", 
        team_a_score, team_b_score, winning_team);
    
    Ok(())
}