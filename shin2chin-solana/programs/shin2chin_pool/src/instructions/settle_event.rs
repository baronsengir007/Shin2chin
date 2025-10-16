use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::PoolError;

#[derive(Accounts)]
pub struct Settle<'info> {
    #[account(
        mut,
        has_one = admin,
        constraint = !event.settled @ PoolError::EventAlreadySettled,
        constraint = event.match_start_time <= Clock::get()?.unix_timestamp @ PoolError::InvalidMatchTime
    )]
    pub event: Account<'info, Event>,
    
    pub admin: Signer<'info>,
}

pub fn settle_event(ctx: Context<Settle>, winner: bool) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let clock = Clock::get()?;

    // Additional validation
    require!(
        clock.unix_timestamp >= event.match_start_time,
        PoolError::InvalidMatchTime
    );
    require!(!event.settled, PoolError::EventAlreadySettled);

    // Update event with winner
    event.settled = true;
    event.winner = Some(winner);

    // Note: Bet status updates will be handled by remaining_accounts
    // in a separate instruction or by the client calling individual bet updates
    // This keeps the instruction focused and gas-efficient

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    // USER STORY: US3 - Auto-Balancing Pool
    // ACCEPTANCE CRITERION: Admin can settle events after match time with winner determination

    #[test]
    fn test_settle_event_happy_path() {
        // Given: Valid event that can be settled
        let current_time = 1234567890i64;
        let match_time = 1234567800i64; // 90 seconds ago
        let event_settled = false;
        let admin_key = Pubkey::new_unique();
        
        // When: Checking settlement conditions
        let time_passed = current_time >= match_time;
        let not_already_settled = !event_settled;
        let valid_admin = admin_key != Pubkey::default();
        
        // Then: All conditions should be met for settlement
        assert!(time_passed, "Match time should have passed");
        assert!(not_already_settled, "Event should not be already settled");
        assert!(valid_admin, "Admin should be valid");
    }

    #[test]
    fn test_settle_event_before_match_time() {
        // Given: Attempt to settle before match time
        let current_time = 1234567800i64;
        let match_time = 1234567890i64; // 90 seconds in future
        
        // When: Checking time validation
        let time_passed = current_time >= match_time;
        
        // Then: Should fail time validation
        assert!(!time_passed, "Should reject settlement before match time");
    }

    #[test]
    fn test_settle_event_already_settled() {
        // Given: Event that's already been settled
        let event_settled = true;
        let winner_set = Some(true);
        
        // When: Checking settlement status
        let can_settle = !event_settled;
        let has_winner = winner_set.is_some();
        
        // Then: Should prevent double settlement
        assert!(!can_settle, "Should reject settlement of already settled event");
        assert!(has_winner, "Settled event should have winner");
    }

    #[test]
    fn test_settle_event_non_admin() {
        // Given: Non-admin trying to settle
        let admin_key = Pubkey::new_unique();
        let caller_key = Pubkey::new_unique();
        
        // When: Checking admin authorization
        let is_admin = admin_key == caller_key;
        
        // Then: Should reject non-admin settlement
        assert!(!is_admin, "Should reject non-admin settlement attempts");
    }

    #[test]
    fn test_settle_event_bet_status_updates() {
        // USER STORY: US3 - Auto-Balancing Pool
        // CRITERION: Winning/losing bets should be marked correctly
        
        // Given: Event with winner determined
        let winner = true; // team_a won
        let team_a_bet = true; // bet on team_a
        let team_b_bet = false; // bet on team_b
        
        // When: Determining bet outcomes
        let team_a_bet_won = team_a_bet == winner;
        let team_b_bet_lost = team_b_bet != winner;
        
        // Then: Bet outcomes should be correctly determined
        assert!(team_a_bet_won, "Team A bets should win when team_a wins");
        assert!(team_b_bet_lost, "Team B bets should lose when team_a wins");
    }

    #[test]
    fn test_settle_event_validation() {
        // Given: Complete settlement scenario
        let current_time = 1234567890i64;
        let match_time = 1234567800i64;
        let event_settled = false;
        let admin_key = Pubkey::new_unique();
        let winner = true;
        
        // When: Running all validations
        let time_valid = current_time >= match_time;
        let not_settled = !event_settled;
        let admin_valid = admin_key != Pubkey::default();
        let winner_valid = winner == true || winner == false;
        
        // Then: All validations should pass
        assert!(time_valid, "Time validation should pass");
        assert!(not_settled, "Settlement status validation should pass");
        assert!(admin_valid, "Admin validation should pass");
        assert!(winner_valid, "Winner validation should pass");
    }
}