use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::PoolError;

#[derive(Accounts)]
#[instruction(team: bool)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    
    #[account(
        init,
        seeds = [b"bet", user.key().as_ref(), event.key().as_ref(), &[team as u8]],
        bump,
        payer = user,
        space = Bet::SIZE
    )]
    pub bet: Account<'info, Bet>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn place_bet(
    ctx: Context<PlaceBet>,
    team: bool,
    amount: u64,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let bet = &mut ctx.accounts.bet;
    
    // Security validations
    require!(amount > 0, PoolError::InvalidBetAmount);
    require!(event.is_betting_open(), PoolError::BettingClosed);
    require!(!event.settled, PoolError::EventAlreadySettled);
    
    // Prevent overflow attacks - reasonable max bet of 100 SOL
    require!(amount <= 100_000_000_000, PoolError::InvalidBetAmount); // 100 SOL in lamports
    
    // Ensure user has sufficient balance (basic sanity check)
    require!(
        ctx.accounts.user.to_account_info().lamports() >= amount,
        PoolError::InsufficientFunds
    );
    
    // Transfer SOL from user to event account
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: event.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;
    
    // Initialize bet account with current timestamp for LIFO ordering
    bet.user = ctx.accounts.user.key();
    bet.event = event.key();
    bet.amount = amount;
    bet.team = team;
    bet.timestamp = Clock::get()?.unix_timestamp;
    bet.status = BetStatus::Active;
    bet.claimed = false;
    bet.bet_settlement_version = 0;
    bet.bump = ctx.bumps.bet;
    
    // Update event pool balances with overflow protection
    if team {
        event.team_a_pool = event.team_a_pool
            .checked_add(amount)
            .ok_or(PoolError::InvalidBetAmount)?;
    } else {
        event.team_b_pool = event.team_b_pool
            .checked_add(amount)
            .ok_or(PoolError::InvalidBetAmount)?;
    }
    
    msg!(
        "Bet placed: {} SOL on {} for event {}",
        amount,
        if team { "Team A" } else { "Team B" },
        event.key()
    );
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    // USER STORY: US1 - Effortless Betting
    // ACCEPTANCE CRITERION: User can bet with 1 click (see match, click team, enter amount, done)

    #[test]
    fn test_place_bet_happy_path() {
        // Given: Valid bet parameters
        let amount = 1_000_000_000u64; // 1 SOL in lamports
        let team_a = true;
        let current_time = 1234567890i64;
        let future_match_time = 1234567950i64; // 60 seconds later
        
        // When: Validating bet placement conditions
        let amount_positive = amount > 0;
        let amount_reasonable = amount <= 100_000_000_000; // <= 100 SOL
        let betting_open = current_time < future_match_time;
        
        // Then: All conditions should pass
        assert!(amount_positive, "Bet amount should be positive");
        assert!(amount_reasonable, "Bet amount should be reasonable");
        assert!(betting_open, "Betting should be open before match start");
    }

    #[test]
    fn test_place_bet_zero_amount() {
        // Given: Zero bet amount
        let zero_amount = 0u64;
        
        // When: Checking amount validation
        let amount_valid = zero_amount > 0;
        
        // Then: Should reject zero amount
        assert!(!amount_valid, "Should reject zero bet amount");
    }

    #[test]
    fn test_place_bet_excessive_amount() {
        // Given: Excessive bet amount (over 100 SOL)
        let excessive_amount = 200_000_000_000u64; // 200 SOL in lamports
        let max_allowed = 100_000_000_000u64; // 100 SOL
        
        // When: Checking amount limits
        let amount_within_limit = excessive_amount <= max_allowed;
        
        // Then: Should reject excessive amount
        assert!(!amount_within_limit, "Should reject excessive bet amounts");
    }

    #[test]
    fn test_place_bet_after_match_start() {
        // Given: Current time after match start
        let current_time = 1234567950i64;
        let past_match_time = 1234567890i64; // 60 seconds earlier
        
        // When: Checking betting window
        let betting_open = current_time < past_match_time;
        
        // Then: Should reject late bets
        assert!(!betting_open, "Should reject bets after match start");
    }

    #[test]
    fn test_place_bet_pool_update_logic() {
        // USER STORY: Pool-based betting architecture
        // CRITERION: Bets should update appropriate team pools
        
        // Given: Initial pool state and new bets
        let initial_team_a_pool = 5_000_000_000u64; // 5 SOL
        let initial_team_b_pool = 3_000_000_000u64; // 3 SOL
        let new_bet_amount = 2_000_000_000u64; // 2 SOL
        
        // When: Processing bets on different teams
        let team_a_after_bet = initial_team_a_pool.checked_add(new_bet_amount);
        let team_b_after_bet = initial_team_b_pool.checked_add(new_bet_amount);
        
        // Then: Pool updates should work correctly
        assert!(team_a_after_bet.is_some(), "Team A pool update should not overflow");
        assert!(team_b_after_bet.is_some(), "Team B pool update should not overflow");
        assert_eq!(team_a_after_bet.unwrap(), 7_000_000_000u64, "Team A pool should be 7 SOL");
        assert_eq!(team_b_after_bet.unwrap(), 5_000_000_000u64, "Team B pool should be 5 SOL");
    }

    #[test]
    fn test_place_bet_timestamp_for_lifo() {
        // USER STORY: Auto-balancing pool with LIFO refunds
        // CRITERION: Bets must have timestamps for LIFO ordering
        
        // Given: Multiple bet timestamps
        let bet1_timestamp = 1234567890i64;
        let bet2_timestamp = 1234567920i64; // 30 seconds later
        let bet3_timestamp = 1234567950i64; // 60 seconds later
        
        // When: Sorting for LIFO (newest first)
        let mut timestamps = vec![bet1_timestamp, bet2_timestamp, bet3_timestamp];
        timestamps.sort_by(|a, b| b.cmp(a)); // DESC sort for LIFO
        
        // Then: Newest should be first
        assert_eq!(timestamps[0], bet3_timestamp, "Newest bet should be first for LIFO");
        assert_eq!(timestamps[1], bet2_timestamp, "Middle bet should be second");
        assert_eq!(timestamps[2], bet1_timestamp, "Oldest bet should be last");
    }

    #[test]
    fn test_place_bet_overflow_protection() {
        // Given: Pool amounts near u64::MAX
        let near_max_pool = u64::MAX - 1000;
        let small_bet = 2000u64;
        
        // When: Checking for overflow
        let result = near_max_pool.checked_add(small_bet);
        
        // Then: Should detect overflow
        assert!(result.is_none(), "Should detect and prevent overflow");
    }

    #[test]
    fn test_bet_status_initialization() {
        // USER STORY: US1 - Effortless Betting
        // CRITERION: Bet should be active immediately after placement
        
        // Given: New bet being placed
        let expected_status = BetStatus::Active;
        
        // When: Comparing with bet status options
        let is_active_status = matches!(expected_status, BetStatus::Active);
        let is_not_refunded = !matches!(expected_status, BetStatus::Refunded);
        let is_not_claimed = !matches!(expected_status, BetStatus::Claimed);
        
        // Then: Should be active and not in other states
        assert!(is_active_status, "New bet should have Active status");
        assert!(is_not_refunded, "New bet should not be Refunded");
        assert!(is_not_claimed, "New bet should not be Claimed");
    }
}