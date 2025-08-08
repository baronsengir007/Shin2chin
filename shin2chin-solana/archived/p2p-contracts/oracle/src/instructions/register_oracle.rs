use anchor_lang::prelude::*;
use crate::{errors::OracleError, state::Oracle};

/// Handler for the register_oracle instruction
/// Only admin can register trusted oracle providers
pub fn handler(
    ctx: Context<crate::RegisterOracleContext>,
    oracle_name: String,
    oracle_authority: Pubkey,
) -> Result<()> {
    let oracle = &mut ctx.accounts.oracle;
    
    // Validate name length to prevent overflow
    if oracle_name.len() > 32 {
        return Err(OracleError::OracleDataOverflow.into());
    }
    
    // Set oracle account data
    oracle.authority = oracle_authority;
    oracle.name = oracle_name;
    oracle.submissions_count = 0;
    oracle.last_submission = 0; // No submissions yet
    oracle.bump = *ctx.bumps.get("oracle").unwrap();
    
    msg!("Oracle registered: {}", oracle.name);
    
    Ok(())
}