# FOUNDATIONAL PROMPT TEMPLATE

---

## 1. Project Context Section

**Reference:** For full project foundation, always consult `PROJECT_CONTEXT.md`.

**Project Description:**
Shin2Chin is an AI-powered, non-custodial, peer-to-peer crypto betting platform built on Solana. The vision is to radically simplify sports betting for crypto natives by combining conversational AI, instant wallet-based betting, and a minimalist, user-focused experience.

**User Stories Summary:**
1. **Conversational Betting:** Place simple binary bets via natural conversation (no complex UI).
2. **Non-Custodial P2P:** Instant wallet-to-wallet betting, no custodial risk, fast payouts.
3. **Clear Confirmation:** Explicit confirmation of stake, outcome, and winnings before funds are committed.
4. **UI Minimalism:** Only essential info visible, maximum simplicity, minimal distractions.
5. **Admin Event Creation:** Admins can easily create and list betting events for users.

**Technical Stack Overview:**
- Blockchain: Solana (mainnet-beta)
- Smart Contracts: Rust + Anchor
- Frontend: React + TypeScript
- AI Backend: HeyAnon Automate SDK
- Wallets: Phantom, Solflare
- Oracles: Sports data for settlement

**Development Approach:**
- MCP-enhanced, milestone-driven, user-story validation at each phase
- Simplicity and clarity prioritized; no feature creep
- Systematic, test-driven, and modular

---

## 2. Task Structure Template

### [TASK_NAME]

**Task Requirements:**
[TASK_REQUIREMENTS]

**Specific Context:**
[SPECIFIC_CONTEXT]

**MCP Integration Guidelines:**
- Use Memory MCP for context retrieval and storage of analysis, design, and implementation outcomes
- Use GitHub MCP for repository management, branching, and documentation
- Use Sequential Thinking MCP for systematic analysis, planning, and validation

**Context Retrieval Requirements:**
- Retrieve relevant project context, technical constraints, dependencies, and architecture from Memory MCP
- Analyze current repository state and codebase structure with GitHub MCP

**User Story Validation Checkpoints:**
- Which user story does this solution serve?
- How does this contribute to SMART acceptance criteria?
- Is this the simplest solution that delivers user value?
- Are we optimizing for user story completion or technical elegance?
- STOP if solution cannot be mapped to a user story or adds unnecessary complexity

---

## 3. Quality Standards

**Implementation Requirements:**
- Follow project architecture and technical stack
- Adhere to modular, test-driven, and simplicity-first patterns
- Use explicit configuration and directory structure

**Testing Expectations:**
- All features must be testable and validated before milestone completion
- Use Anchor tests for smart contracts, integration tests for flows, and mock oracles as needed

**Documentation Standards:**
- Update README, PROJECT_CONTEXT.md, or relevant docs with any new setup, issues, or decisions
- Document setup steps, troubleshooting, and platform-specific notes

**Success Criteria Format:**
- All verification steps pass successfully
- Environment or feature is ready for subsequent development
- Documentation is updated and clear
- Team can reproduce or use the feature reliably

---

## 4. Usage Instructions

- **How to Customize:**
  - Replace [TASK_NAME], [TASK_REQUIREMENTS], [SPECIFIC_CONTEXT], and [MCP_USAGE] with task-specific details
  - Add or remove context as needed for the specific phase or milestone
- **When to Use:**
  - For any new task, especially when Kodu or other tools cannot access Memory MCP
  - To ensure consistent, systematic context and quality across all tasks
- **MCP Coordination Patterns:**
  - Always start with context retrieval and user story validation
  - Store all major decisions and outcomes in Memory MCP
  - Use GitHub MCP for all code and documentation changes
  - Use Sequential Thinking MCP for all planning, analysis, and validation phases

---

**Copy and customize this template for any new task to ensure systematic, context-driven development.** 
