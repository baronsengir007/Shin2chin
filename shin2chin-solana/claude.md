# Backend Context - Solana Smart Contract

## Current State
- Anchor framework project
- Has P2P matching logic (to be removed)
- Wallet integration working

## New Pool Contract Structure

### Core Accounts
- Event: Stores match and pool data
- Bet: Individual user bet with timestamp
- GlobalState: Protocol configuration

### Key Instructions
1. initialize_event - Admin creates match
2. place_bet - User bets on team
3. auto_balance - Triggered at match start
4. settle_event - Admin declares winner
5. claim_winnings - Users claim payouts

### LIFO Refund Logic
- Store timestamp with each bet
- At balance time, sort by timestamp DESC
- Refund newest bets first until balanced
- Update bet status to "Refunded"

## Security Considerations
- No admin access to user funds
- Automated balance mechanism
- Fixed payout ratios
- No reentrancy vulnerabilities

## MCP Integration Points

### Available MCPs:
- **Sequential Thinking MCP**: Systematic analysis
- **Memory MCP**: Context persistence  
- **GitHub MCP**: Version control
- **Solana Development MCP**: Blockchain patterns
- **Semgrep MCP**: Security scanning
- **Claude Task Master**: Task breakdown

### Usage per Phase:
- Phase 0-1: Sequential Thinking + Memory MCP
- Phase 2: All MCPs as needed
- Phase 3-4: Semgrep + Sequential Thinking
- Phase 5: Testing with actual execution