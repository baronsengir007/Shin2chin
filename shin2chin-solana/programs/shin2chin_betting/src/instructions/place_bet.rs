use anchor_lang::prelude::*;
use crate::state::{Event, EventStatus, Bet, BetOption, BetStatus};
use crate::errors::ErrorCode;
use crate::constants::BET_SEED;

#[derive(Accounts)]
#[instruction(bet_option: BetOption, amount: u64)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,
    
    #[account(
        mut,
        constraint = event.status == EventStatus::Active @ ErrorCode::EventNotActive
    )]
    pub event: Account<'info, Event>,
    
    #[account(
        init,
        payer = bettor,
        space = Bet::SPACE,
        seeds = [
            BET_SEED,
            bettor.key().as_ref(),
            event.key().as_ref()
        ],
        bump
    )]
    pub bet: Account<'info, Bet>,
    
    pub system_program: Program<'info, System>,
}

pub fn place_bet(
    ctx: Context<PlaceBet>,
    bet_option: BetOption,
    amount: u64,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let bet = &mut ctx.accounts.bet;
    let bettor = &ctx.accounts.bettor;
    let clock = Clock::get()?;

    require!(
        amount >= Bet::MIN_BET_AMOUNT,
        ErrorCode::BetTooSmall
    );

    require!(
        event.status == EventStatus::Active,
        ErrorCode::EventNotActive
    );

    require!(
        clock.unix_timestamp < event.deadline,
        ErrorCode::BettingClosed
    );

    require!(
        bettor.key() != event.admin,
        ErrorCode::AdminCannotBet
    );

    let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
        &bettor.key(),
        &bet.key(),
        amount,
    );
    anchor_lang::solana_program::program::invoke(
        &transfer_instruction,
        &[
            bettor.to_account_info(),
            bet.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    match bet_option {
        BetOption::OptionA => {
            event.total_pool_a = event.total_pool_a.checked_add(amount)
                .ok_or(ErrorCode::PoolOverflow)?;
        }
        BetOption::OptionB => {
            event.total_pool_b = event.total_pool_b.checked_add(amount)
                .ok_or(ErrorCode::PoolOverflow)?;
        }
    }

    bet.bettor = bettor.key();
    bet.event = event.key();
    bet.bet_option = bet_option;
    bet.amount = amount;
    bet.matched_amount = 0;
    bet.status = BetStatus::Pending;
    bet.timestamp = clock.unix_timestamp;
    bet.bump = ctx.bumps.bet;

    msg!("Bet placed: {} SOL on {:?} for event {}", 
         amount as f64 / 1_000_000_000.0, bet_option, event.key());
    Ok(())
}