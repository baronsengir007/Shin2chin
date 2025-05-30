use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/**
 * Shin2Chin Betting Program - Solana Implementation
 * 
 * This program implements the Solana-based betting system 
 * for the Shin2Chin platform, providing:
 * 
 * - Non-custodial peer-to-peer betting
 * - Direct wallet-to-smart-contract transactions
 * - Binary betting (Team A vs Team B)
 * - 30-second automatic payouts via oracle
 * - LIFO unmatched bet returns
 */
#[program]
pub mod shin2chin_betting {
    use super::*;

    /**
     * Initialize a new betting event
     * 
     * Implements User Story #5:
     * "As a platform admin, I want to easily create betting events 
     * so that users have legitimate matches to bet on."
     */
    pub fn create_event(
        ctx: Context<CreateEvent>,
        team_a: String,
        team_b: String,
        start_time: i64,
    ) -> Result<()> {
        // To be implemented with actual event creation logic
        // This would store the event data in a PDA account
        msg!("Event created: {} vs {}", team_a, team_b);
        Ok(())
    }

    /**
     * Place a bet on a team for a specific event
     * 
     * Implements User Story #2:
     * "As a crypto wallet holder, I want instant peer-to-peer betting without 
     * custodial deposits so that winning feels immediate and I maintain 
     * complete control of my funds."
     */
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        event_id: Pubkey,
        team: String,
        amount: u64,
    ) -> Result<()> {
        // To be implemented with actual betting logic
        // This would transfer funds and record the bet
        msg!("Bet placed: {} SOL on {}", amount, team);
        Ok(())
    }

    /**
     * Submit result for an event
     * 
     * Implements Oracle-based automatic settlement from User Story #5
     */
    pub fn submit_result(
        ctx: Context<SubmitResult>,
        event_id: Pubkey,
        winning_team: String,
    ) -> Result<()> {
        // To be implemented with result submission and payout logic
        // This would trigger automatic payouts
        msg!("Result submitted: {} wins", winning_team);
        Ok(())
    }
}

/**
 * Account structure for creating a new betting event
 */
#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(init, payer = admin, space = 8 + 256)]
    pub event: Account<'info, EventAccount>,
    
    pub system_program: Program<'info, System>,
}

/**
 * Account structure for placing a bet
 */
#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,
    
    #[account(mut)]
    pub event: Account<'info, EventAccount>,
    
    #[account(init, payer = bettor, space = 8 + 128)]
    pub bet: Account<'info, BetAccount>,
    
    pub system_program: Program<'info, System>,
}

/**
 * Account structure for submitting a result
 */
#[derive(Accounts)]
pub struct SubmitResult<'info> {
    #[account(mut)]
    pub oracle: Signer<'info>,
    
    #[account(mut)]
    pub event: Account<'info, EventAccount>,
    
    pub system_program: Program<'info, System>,
}

/**
 * Event account data structure
 */
#[account]
pub struct EventAccount {
    pub team_a: String,
    pub team_b: String,
    pub start_time: i64,
    pub result_submitted: bool,
    pub winning_team: String,
    pub total_bets_a: u64,
    pub total_bets_b: u64,
}

/**
 * Bet account data structure
 */
#[account]
pub struct BetAccount {
    pub bettor: Pubkey,
    pub event: Pubkey,
    pub team: String,
    pub amount: u64,
    pub matched: bool,
    pub paid_out: bool,
}