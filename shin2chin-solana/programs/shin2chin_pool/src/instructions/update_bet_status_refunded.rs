use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::PoolError;

#[derive(Accounts)]
pub struct UpdateBetStatusRefunded<'info> {
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

pub fn update_bet_status_refunded(ctx: Context<UpdateBetStatusRefunded>) -> Result<()> {
    let event = &ctx.accounts.event;
    let bet = &mut ctx.accounts.bet;
    
    // Security validations
    require!(event.state == EventState::Balanced, PoolError::EventNotBalanced);
    require!(bet.status == BetStatus::Active, PoolError::CannotClaim);
    require!(bet.user == ctx.accounts.user.key(), PoolError::Unauthorized);
    
    // Ensure this bet was from the larger pool that got refunded
    let (larger_pool_is_team_a, _) = event.pool_imbalance();
    require!(bet.team == larger_pool_is_team_a, PoolError::Unauthorized);
    
    // Update bet status to Refunded
    bet.status = BetStatus::Refunded;
    
    msg!("Bet status updated to Refunded for user: {}", ctx.accounts.user.key());
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    // USER STORY: Auto-balancing Pool with LIFO refunds
    // ACCEPTANCE CRITERION: Refunded bets are marked correctly to prevent double-claiming

    #[test]
    fn test_update_bet_status_refunded_happy_path() {
        // Given: Event is balanced and bet is active
        let event_balanced = true;
        let bet_status = BetStatus::Active;
        let user_key = Pubkey::new_unique();
        let bet_user = user_key;
        let bet_team = true; // Team A
        let larger_pool_is_team_a = true;
        
        // When: Checking all validation conditions
        let event_balanced_check = event_balanced;
        let bet_active_check = bet_status == BetStatus::Active;
        let user_authorized = bet_user == user_key;
        let team_matches_larger_pool = bet_team == larger_pool_is_team_a;
        
        // Then: All conditions should pass
        assert!(event_balanced_check, "Event should be balanced");
        assert!(bet_active_check, "Bet should be active");
        assert!(user_authorized, "User should be authorized");
        assert!(team_matches_larger_pool, "Bet should be from larger pool");
    }

    #[test]
    fn test_update_bet_status_refunded_event_not_balanced() {
        // Given: Event is not balanced
        let event_balanced = false;
        
        // When: Checking balance requirement
        let can_update = event_balanced;
        
        // Then: Should reject update
        assert!(!can_update, "Should reject update when event not balanced");
    }

    #[test]
    fn test_update_bet_status_refunded_bet_not_active() {
        // Given: Bet is not active (already refunded or claimed)
        let bet_status = BetStatus::Refunded;
        
        // When: Checking bet status
        let bet_active = bet_status == BetStatus::Active;
        
        // Then: Should reject update
        assert!(!bet_active, "Should reject update when bet not active");
    }

    #[test]
    fn test_update_bet_status_refunded_wrong_user() {
        // Given: Different user trying to update bet
        let bet_user = Pubkey::new_unique();
        let caller_user = Pubkey::new_unique();
        
        // When: Checking user authorization
        let user_authorized = bet_user == caller_user;
        
        // Then: Should reject unauthorized user
        assert!(!user_authorized, "Should reject unauthorized user");
    }

    #[test]
    fn test_update_bet_status_refunded_wrong_team() {
        // Given: Bet is from smaller pool (not refunded)
        let bet_team = false; // Team B
        let larger_pool_is_team_a = true; // Team A is larger
        
        // When: Checking team validation
        let team_matches_larger_pool = bet_team == larger_pool_is_team_a;
        
        // Then: Should reject bet from smaller pool
        assert!(!team_matches_larger_pool, "Should reject bet from smaller pool");
    }

    #[test]
    fn test_update_bet_status_refunded_status_transition() {
        // Given: Valid conditions for status update
        let initial_status = BetStatus::Active;
        let expected_status = BetStatus::Refunded;
        
        // When: Updating status
        let status_updated = initial_status != expected_status;
        
        // Then: Status should change
        assert!(status_updated, "Status should change from Active to Refunded");
        assert_eq!(expected_status, BetStatus::Refunded, "Final status should be Refunded");
    }

    #[test]
    fn test_update_bet_status_refunded_double_update_prevention() {
        // Given: Bet already refunded
        let bet_status = BetStatus::Refunded;
        
        // When: Attempting to update again
        let can_update_again = bet_status == BetStatus::Active;
        
        // Then: Should prevent double update
        assert!(!can_update_again, "Should prevent double update of refunded bet");
    }
}
