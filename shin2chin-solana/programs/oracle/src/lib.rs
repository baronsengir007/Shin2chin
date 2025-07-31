use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod oracle {
    use super::*;

    /// Register an oracle provider to submit event results
    /// This is admin-only to ensure trusted oracles
    pub fn register_oracle(ctx: Context<RegisterOracleContext>, oracle_name: String, oracle_authority: Pubkey) -> Result<()> {
        instructions::register_oracle::handler(ctx, oracle_name, oracle_authority)
    }

    /// Submit a result for a specific event
    /// Only registered oracles can call this
    pub fn submit_result(ctx: Context<SubmitResultContext>, team_a_score: u32, team_b_score: u32) -> Result<()> {
        instructions::submit_result::handler(ctx, team_a_score, team_b_score)
    }
}

#[derive(Accounts)]
pub struct RegisterOracleContext<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// The oracle account to be created
    #[account(
        init,
        payer = admin,
        space = 8 + state::Oracle::SPACE,
        seeds = [b"oracle", oracle_authority.key().as_ref()],
        bump
    )]
    pub oracle: Account<'info, state::Oracle>,
    
    /// The authority that will sign oracle submissions
    /// CHECK: We're just storing this pubkey
    pub oracle_authority: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitResultContext<'info> {
    #[account(mut)]
    pub oracle_authority: Signer<'info>,
    
    /// The oracle account which must be registered
    #[account(
        mut,
        seeds = [b"oracle", oracle_authority.key().as_ref()],
        bump,
        constraint = oracle.authority == oracle_authority.key() @ errors::OracleError::UnauthorizedOracle
    )]
    pub oracle: Account<'info, state::Oracle>,
    
    /// The event account to update with results (from betting program)
    #[account(mut)]
    pub event: Account<'info, shin2chin_betting::Event>,
}