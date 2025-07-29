# PROJECT CONTEXT

## Section 1: Project Foundation

### Project Description & Vision
Shin2Chin is an AI-powered, non-custodial, peer-to-peer crypto betting platform built on Solana. The vision is to radically simplify sports betting for crypto natives by combining conversational AI, instant wallet-based betting, and a minimalist, user-focused experience. The platform eliminates complexity, jargon, and custodial risk, delivering a seamless, knowledge-driven betting journey.

### Target User & Core Motivations
- **Target User:** Crypto natives frustrated by betting complexity
- **Core Motivations:** Knowledge edge, money thrill, simplicity

### User Stories & Acceptance Criteria

#### User Story 1: Conversational Betting
*As a crypto-native sports fan, I want to place simple binary bets through natural conversation so that I can express my sports knowledge without navigating complex betting interfaces.*
- ≤3 Gary conversation turns, 95% first-statement understanding
- Binary betting only (Team A vs Team B)
- Gary validates user confidence ("Nice! You think United's got this one")
- Zero blockchain jargon in UI

#### User Story 2: Non-Custodial P2P
*As a crypto wallet holder, I want instant peer-to-peer betting without custodial deposits so that winning feels immediate and I maintain complete control of my funds.*
- One-click wallet connection (no registration/KYC)
- Direct wallet-to-smart-contract transactions
- 30-second automatic payouts via oracle
- LIFO unmatched bet returns at match start

#### User Story 3: Clear Confirmation
*As someone who believes I have betting edge, I want clear confirmation of my stake and potential winnings so that I understand exactly what I'm risking and what I can win.*
- Gary states bet amount, teams, "winner takes both stakes"
- Explicit "Yes" confirmation required before funds committed
- Immediate confirmation that bet is placed and being matched

#### User Story 4: UI Minimalism
*As a user who wants to focus on my bet, I want only essential information visible so that nothing distracts me from my betting decision.*
- Maximum 3 primary data points visible (match, bet amount, outcome)
- Zero odds/pool sizes/statistics by default
- ≤4 interactive elements per screen for calm experience

#### User Story 5: Admin Event Creation
*As a platform admin, I want to easily create betting events so that users have legitimate matches to bet on.*
- Simple web form (Team A, Team B, start time)
- Events appear immediately in Gary's available matches
- Oracle automatically settles and triggers payouts

### Technical Stack & Architecture Overview
- **Blockchain:** Solana mainnet-beta (low cost, high speed)
- **Smart Contracts:** Rust + Anchor framework
- **Frontend:** React + TypeScript (desktop-first)
- **AI Backend:** HeyAnon Automate SDK for Gary conversational interface
- **Wallets:** Phantom and Solflare support
- **Oracles:** Sports data integration for automatic settlement
- **Architecture:** Non-custodial, peer-to-peer, oracle-based settlement
- **Development Approach:** MCP-enhanced systematic development with Cursor/Kodu hybrid

---

## Section 2: Development Context

### MVP Project Plan Summary
- 28 core tasks (reduced from 51, 45% scope reduction)
- 13-week timeline
- 5 Milestones: Foundation (7), Gary AI (5), Solana Program (7), Admin & Oracle (6), Testing (3)
- Critical Path: Foundation → Solana Program Design → Bet Matching → Oracle Integration → End-to-End Testing

### Architecture Components & Relationships
**11 Refined Components:**
1. Gary AI Interface (React) + Confirmation Protocol
2. AI Backend (HeyAnon SDK)
3. Wallet Connection (Phantom/Solflare) + Transaction Handler
4. Solana Betting Program (Anchor) + Explicit PDA Structure
5. Oracle Integration
6. Admin Interface
7. Payout Handler + Timer Service
8. UI State Manager
9. State Sync Service (NEW)
10. Error Management Service (NEW)
11. Testing Framework

**Component Relationships:**  
- User input → Gary AI → intent parse → bet preview → explicit confirmation → wallet → Solana program → oracle → payout handler → State Sync Service updates UI → Error Management Service handles/report errors throughout.
- Admin input → event form → Solana program/oracle → event listing. All flows monitored by State Sync and Error Management.

### Technical Constraints & Requirements
- Solana mainnet-beta for low costs/speed
- Rust + Anchor for smart contracts
- React + TypeScript for frontend
- HeyAnon SDK for AI
- Phantom/Solflare wallet support
- Sports oracle for settlement
- 30s payout, sub-second Gary responses

### Development Approach & Quality Standards
- MCP-enhanced, systematic, milestone-driven
- No feature creep: Only user-story-driven tasks
- Simplicity and clarity prioritized
- Explicit user story validation at each phase
- Kodu reviews after each major phase

---

## Section 3: Implementation Guidelines

### Solana/Anchor Development Patterns
- Use Anchor framework for all smart contracts
- Define explicit PDA structures for events, bets, admin
- Write Anchor tests for all program logic
- Use local validator for development/testing

### React Component Standards
- Use TypeScript and functional components
- Minimalist UI: ≤3 data points, ≤4 interactive elements per screen
- Explicit confirmation flows for all transactions
- State Sync Service to keep UI in sync with blockchain

### Gary AI Integration Requirements
- Integrate HeyAnon SDK for all conversational flows
- Validate betting intent and user confidence
- Zero blockchain jargon in all user-facing messages
- Explicit "Yes" confirmation before bet placement

### User Story Validation Checkpoints
- Each feature must map to at least one user story acceptance criterion
- All acceptance criteria must be testable and validated before milestone completion

---

## Section 4: MCP Coordination

### When and How to Use Each MCP
- **Memory MCP:** Store/retrieve all project context, decisions, and task outcomes. Use for all context-driven development and documentation.
- **GitHub MCP:** Manage repository structure, documentation, branches, issues, and project boards. Use for all code and documentation updates.
- **Sequential Thinking MCP:** Use for systematic analysis, architecture, planning, and complex decision-making. Required for all major design and planning phases.

### Memory MCP Storage Conventions
- Use clear, descriptive keys (e.g., "project_foundation", "user_story_1", "project_plan", "foundational_prompt_template")
- Store all major decisions, plans, and templates for future reference

### GitHub MCP Workflow Patterns
- Feature branch strategy for all development
- Issue templates for each task type
- Project board setup aligned with milestones
- Commit messages must reference milestone/task

### Sequential Thinking MCP Usage Guidelines
- Use for all architecture, planning, and dependency analysis
- Document all reasoning and decisions in Memory MCP

---

## Usage Instructions

- **Always start any new task by reading PROJECT_CONTEXT.md for complete project foundation**
- Use the Foundational Prompt Template for all new task initiation (see Memory MCP: "foundational_prompt_template")
- Store all major task decisions in Memory MCP with clear naming
- Update GitHub with implementation progress and documentation
- Validate all work against user stories and acceptance criteria 