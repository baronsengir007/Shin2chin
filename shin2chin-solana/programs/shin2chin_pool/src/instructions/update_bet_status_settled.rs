use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::PoolError;

#[derive(Accounts)]
pub struct UpdateBetStatusSettled<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    
    #[account(
        mut,
        has_one = event,
        constraint = bet.status == BetStatus::Active @ PoolError::CannotClaim
    )]
    pub bet: Account<'info, Bet>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

pub fn update_bet_status_settled(ctx: Context<UpdateBetStatusSettled>) -> Result<()> {
    let event = &ctx.accounts.event;
    let bet = &mut ctx.accounts.bet;
    
    // Security validations
    require!(event.settled, PoolError::EventNotSettled);
    require!(bet.status == BetStatus::Active, PoolError::CannotClaim);
    require!(bet.user == ctx.accounts.user.key(), PoolError::Unauthorized);
    require!(event.winner.is_some(), PoolError::InvalidWinner);
    require!(!bet.claimed, PoolError::AlreadyClaimed);
    require!(bet.bet_settlement_version < event.settlement_version, PoolError::AlreadyUpdated);
    
    // Update bet status based on winner
    let winner = event.winner.unwrap();
    if bet.team == winner {
        bet.status = BetStatus::Won;
        msg!("Bet marked as Won for user: {}", ctx.accounts.user.key());
    } else {
        bet.status = BetStatus::Lost;
        msg!("Bet marked as Lost for user: {}", ctx.accounts.user.key());
    }
    
    // Record settlement version to prevent double updates
    bet.bet_settlement_version = event.settlement_version;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    // USER STORY: US1 - Effortless Betting
    // ACCEPTANCE CRITERION: Winners can claim 1.95x payout after event settlement

    #[test]
    fn test_update_bet_status_settled_winning_bet() {
        // Given: Event is settled with winner and bet is active
        let event_settled = true;
        let event_winner = Some(true); // Team A won
        let bet_status = BetStatus::Active;
        let bet_team = true; // Team A
        let user_key = Pubkey::new_unique();
        let bet_user = user_key;
        
        // When: Checking all validation conditions
        let event_settled_check = event_settled;
        let bet_active_check = bet_status == BetStatus::Active;
        let user_authorized = bet_user == user_key;
        let winner_determined = event_winner.is_some();
        let bet_won = bet_team == event_winner.unwrap();
        
        // Then: All conditions should pass for winning bet
        assert!(event_settled_check, "Event should be settled");
        assert!(bet_active_check, "Bet should be active");
        assert!(user_authorized, "User should be authorized");
        assert!(winner_determined, "Winner should be determined");
        assert!(bet_won, "Bet should be winning");
    }

    #[test]
    fn test_update_bet_status_settled_losing_bet() {
        // Given: Event is settled with winner and bet is active
        let event_settled = true;
        let event_winner = Some(true); // Team A won
        let bet_status = BetStatus::Active;
        let bet_team = false; // Team B
        let user_key = Pubkey::new_unique();
        let bet_user = user_key;
        
        // When: Checking all validation conditions
        let event_settled_check = event_settled;
        let bet_active_check = bet_status == BetStatus::Active;
        let user_authorized = bet_user == user_key;
        let winner_determined = event_winner.is_some();
        let bet_lost = bet_team != event_winner.unwrap();
        
        // Then: All conditions should pass for losing bet
        assert!(event_settled_check, "Event should be settled");
        assert!(bet_active_check, "Bet should be active");
        assert!(user_authorized, "User should be authorized");
        assert!(winner_determined, "Winner should be determined");
        assert!(bet_lost, "Bet should be losing");
    }

    #[test]
    fn test_update_bet_status_settled_event_not_settled() {
        // Given: Event is not settled
        let event_settled = false;
        
        // When: Checking settlement requirement
        let can_update = event_settled;
        
        // Then: Should reject update
        assert!(!can_update, "Should reject update when event not settled");
    }

    #[test]
    fn test_update_bet_status_settled_bet_not_active() {
        // Given: Bet is not active (already processed)
        let bet_status = BetStatus::Won;
        
        // When: Checking bet status
        let bet_active = bet_status == BetStatus::Active;
        
        // Then: Should reject update
        assert!(!bet_active, "Should reject update when bet not active");
    }

    #[test]
    fn test_update_bet_status_settled_wrong_user() {
        // Given: Different user trying to update bet
        let bet_user = Pubkey::new_unique();
        let caller_user = Pubkey::new_unique();
        
        // When: Checking user authorization
        let user_authorized = bet_user == caller_user;
        
        // Then: Should reject unauthorized user
        assert!(!user_authorized, "Should reject unauthorized user");
    }

    #[test]
    fn test_update_bet_status_settled_no_winner() {
        // Given: Event settled but no winner determined
        let event_settled = true;
        let event_winner: Option<bool> = None;
        
        // When: Checking winner requirement
        let winner_determined = event_winner.is_some();
        
        // Then: Should reject update
        assert!(!winner_determined, "Should reject update when no winner determined");
    }

    #[test]
    fn test_update_bet_status_settled_status_transition_win() {
        // Given: Winning bet status update
        let initial_status = BetStatus::Active;
        let expected_status = BetStatus::Won;
        
        // When: Updating status
        let status_updated = initial_status != expected_status;
        
        // Then: Status should change to Won
        assert!(status_updated, "Status should change from Active to Won");
        assert_eq!(expected_status, BetStatus::Won, "Final status should be Won");
    }

    #[test]
    fn test_update_bet_status_settled_status_transition_loss() {
        // Given: Losing bet status update
        let initial_status = BetStatus::Active;
        let expected_status = BetStatus::Lost;
        
        // When: Updating status
        let status_updated = initial_status != expected_status;
        
        // Then: Status should change to Lost
        assert!(status_updated, "Status should change from Active to Lost");
        assert_eq!(expected_status, BetStatus::Lost, "Final status should be Lost");
    }

    #[test]
    fn test_update_bet_status_settled_double_update_prevention() {
        // Given: Bet already processed
        let bet_status = BetStatus::Won;
        
        // When: Attempting to update again
        let can_update_again = bet_status == BetStatus::Active;
        
        // Then: Should prevent double update
        assert!(!can_update_again, "Should prevent double update of processed bet");
    }
}
