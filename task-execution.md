# Task Execution Protocol

## ⚠️ GOLDEN RULE
NO TASK IS COMPLETE WITHOUT PASSING TESTS WITH EVIDENCE

## PHASE 2A: Problem Definition
**Sequential Thinking MCP**: Systematic analysis
1. Which user story does this task serve?
2. What are the exact acceptance criteria?
3. What are potential failure points?
4. Security considerations?

Document in changelog:
- Task name
- User story reference
- Start time

## PHASE 2B: Solution Design
**Solana Development MCP**: Technical approach
1. Write pseudocode/algorithm first
2. Identify all edge cases
3. Design error handling strategy
4. Plan test cases upfront

**MCP Magic AI**: Consider alternatives
- Is there a simpler approach?
- What patterns exist for this?

## PHASE 2C: Implementation
**GitHub MCP**: Version control
1. Create feature branch (optional for solo dev)
2. Write the actual code
3. Add comprehensive error handling
4. Include detailed inline comments
5. Follow project conventions

**Semgrep MCP**: Security check during coding
- Run security scan after implementation
- Fix issues before testing

## PHASE 2D: Testing Phase
**STOP** - Switch to testing.md
- DO NOT mark task complete
- DO NOT update plan.md yet
- MUST follow testing.md protocol

## PHASE 2E: Documentation
**Only after ALL tests pass**:
1. Update changelog.md with:
   - Implementation details
   - Test results summary
   - Any decisions made
2. Check off task in plan.md
3. Commit with descriptive message including test status

## Task Checklist Template
Before marking complete:
- [ ] Problem properly analyzed
- [ ] Solution designed and reviewed
- [ ] Code implemented with error handling
- [ ] ALL tests passed (see testing.md)
- [ ] Documentation updated
- [ ] Changes committed

## Red Flags - Stop if:
- Cannot map to user story
- No clear acceptance criteria
- Tests not passing
- Security issues found