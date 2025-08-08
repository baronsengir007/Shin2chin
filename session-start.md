# SESSION START PROTOCOL

## Quick Start

1. Read claude.md for context
2. Check plan.md for current task
3. Review changelog.md for decisions

## With MCPs

* **Memory MCP**: Load previous session
* **Sequential Thinking**: Analyze current state
* **GitHub MCP**: Check repository
* **Task Master**: Identify today's work

   SESSION START: Auto-Balance Pool Development
* 
* \## 1. CONTEXT RETRIEVAL (Memory MCP)
* 
* \*\*Memory MCP\*\*: Retrieve stored context from previous session
* \- Load `project\_foundation` (user stories)
* \- Load `project\_architecture` (pool system design)
* \- Load `task\_master\_breakdown` (current sprint)
* 
* \## 2. READ DOCUMENTATION FILES
* 
* \*\*Filesystem MCP\*\*: Read current documentation:
* ```bash
* \# Read master context
* cat ./claude.md
* 
* \# Check current tasks
* cat ./plan.md | grep -A 20 "Day"
* 
* \# Review recent decisions
* tail -20 ./changelog.md
* 
* \# Read frontend context
* cat ./frontend/claude.md
* 
* \# Read backend context  
* cat ./shin2chin-solana/claude.md
* 3\. ANALYZE CURRENT STATE (Sequential Thinking MCP)
* Sequential Thinking MCP: Analyze where we are in the development process:
* 
* What phase are we in? (Check against MCP Development Guide phases)
* Which user story are we implementing?
* What acceptance criteria must be met?
* What's the next uncompleted task?
* 
* 4\. GITHUB STATUS CHECK (GitHub MCP)
* GitHub MCP: Check repository state:
* bash# Check current branch
* git branch
* 
* \# Check uncommitted changes
* git status
* 
* \# Review recent commits
* git log --oneline -5
* 
* \# Check if main is up to date
* git fetch origin
* git status
* 5\. IDENTIFY TODAY'S TASK (Claude Task Master MCP)
* Claude Task Master MCP:
* 
* What's the current task from plan.md?
* What are the dependencies?
* Estimated time?
* Success criteria?
* 
* Based on plan.md, today's task is:
* \[CURRENT\_TASK\_FROM\_PLAN]
* 6\. MCP RECOMMENDATIONS FOR TASK
* MCP Magic AI: Suggest which MCPs to use for current task:
* For Backend Refactor Tasks:
* 
* Solana Development MCP: For smart contract patterns
* Sequential Thinking MCP: For systematic refactoring
* Semgrep MCP: For security checks
* 
* For Frontend Simplification:
* 
* Figma MCP: For UI design patterns
* Sequential Thinking MCP: For component analysis
* GitHub MCP: For removing old components
* 
* For Testing:
* 
* Sequential Thinking MCP: For test case design
* Semgrep MCP: For security testing
* 
* 7\. SESSION SETUP COMMANDS
* bash# Set up working environment
* cd /mnt/c/Users/singa/Desktop/AI\\ app\\ development/Shin2Chin\_bets
* 
* \# Verify we're on main branch
* git checkout main
* 
* \# Start with clean working directory
* git status
* 8\. TASK EXECUTION TEMPLATE
* For today's task, use this MCP-enhanced approach:
* Phase 2-A: Problem Definition
* Sequential Thinking MCP: Analyze the problem:
* 
* Which user story does this serve?
* What acceptance criteria?
* Security considerations?
* 
* Phase 2-B: Solution Design
* MCP Magic AI: Generate creative solutions
* Solana Development MCP: Check best practices
* Phase 2-C: Implementation
* GitHub MCP: Create commits with proper messages
* Semgrep MCP: Check security as you code
* Phase 2-D: Testing
* Run actual tests (no assumptions!)
* Document results in changelog.md

## Task Execution Protocol

When working on any task:
1. Start with `task-execution.md`
2. After implementation, switch to `testing.md`
3. NO task is complete without test evidence
4. NO assumptions - only real output counts

Quick check:
- Is task mapped to user story? 
- Are all tests passing with evidence?
- Is changelog updated with test results?
