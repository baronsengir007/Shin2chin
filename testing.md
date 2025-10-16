# Testing Protocol - MANDATORY

## ⚠️ ABSOLUTE REQUIREMENTS
- NO assumptions - only real output
- ALL tests must pass before task completion
- Evidence MUST be provided
- Exit codes MUST be checked
- Tests MUST align with user stories

## PHASE 0: TEST PREPARATION & ALIGNMENT

### Step 1: User Story Verification
Before ANY testing, verify alignment with user stories:

```bash
# Check which user story this code serves
cat ../../claude.md | grep -A 5 "User Stories"
Questions to Answer:

Which user story does this code implement?
What are the acceptance criteria?
Do tests exist that verify these criteria?

Step 2: Test Discovery
Check if tests already exist:
bash# For Rust/Solana
find . -name "*.rs" -path "*/tests/*" -o -name "*_test.rs" | head -20
grep -r "#\[test\]" src/ | wc -l

# For Frontend
find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" | head -20
ls src/__tests__/ 2>/dev/null || echo "No test directory"
Step 3: Test Development (If Missing)
IF NO TESTS EXIST - STOP AND CREATE THEM FIRST!
User Story Test Template
rust// For each acceptance criterion, create a test
#[cfg(test)]
mod tests {
    use super::*;
    
    // USER STORY: [Name]
    // ACCEPTANCE CRITERION: [Specific criterion being tested]
    #[test]
    fn test_acceptance_criterion_1() {
        // Given: [Initial state]
        // When: [Action taken]
        // Then: [Expected outcome]
        assert!(true); // Replace with actual test
    }
}
Minimum Required Tests Per Function

Happy Path Test - Normal expected usage
Edge Case Test - Boundary conditions
Error Case Test - Invalid inputs
User Story Test - Validates acceptance criteria

Example Test Creation for Betting Platform
rust// USER STORY: Effortless Betting
// CRITERION: User can bet with max 2 clicks

#[test]
fn test_place_bet_happy_path() {
    // Given: Valid event and user with funds
    let event = create_test_event();
    let user = create_funded_user(100);
    
    // When: User places bet
    let result = place_bet(&event, &user, 50, Team::A);
    
    // Then: Bet is placed successfully
    assert!(result.is_ok());
    assert_eq!(event.team_a_pool, 50);
}

#[test]
fn test_place_bet_insufficient_funds() {
    // Given: User with insufficient funds
    let event = create_test_event();
    let user = create_funded_user(10);
    
    // When: User tries to bet more than balance
    let result = place_bet(&event, &user, 50, Team::A);
    
    // Then: Error is returned
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), PoolError::InsufficientFunds);
}

#[test]
fn test_auto_balance_lifo_refund() {
    // USER STORY: Auto-balancing pool
    // CRITERION: Newest bets refunded first (LIFO)
    
    // Given: Imbalanced pool with timestamps
    let bets = vec![
        create_bet(user1, 100, timestamp1), // Oldest
        create_bet(user2, 100, timestamp2), // Middle
        create_bet(user3, 100, timestamp3), // Newest - should refund first
    ];
    
    // When: Auto-balance triggered
    let refunds = auto_balance(&bets);
    
    // Then: Newest bet refunded first
    assert_eq!(refunds[0].user, user3);
}
Step 4: Test Coverage Check
bash# Check test coverage
cargo tarpaulin --out Html 2>/dev/null || echo "Install cargo-tarpaulin for coverage"

# Minimum coverage requirements:
# - 80% for critical functions (place_bet, auto_balance)
# - 60% for utility functions
# - 100% for error handling paths
PHASE 1: COMPILATION TEST (Always Required)
bash# For Rust/Solana projects
cd shin2chin-solana/programs/shin2chin_pool
cargo build --release 2>&1 | tee build.log
echo "EXIT CODE: $?"

# For Frontend/TypeScript
cd frontend
npm run build 2>&1 | tee build.log
echo "EXIT CODE: $?"
Evidence Required:

Full compiler output (not summary)
Exit code (MUST be 0)
List of any warnings
Build time

Pass Criteria:

Exit code = 0
No errors in output
Warnings documented if any

PHASE 2: UNIT TESTS (Always Required)
Pre-Check: Verify Tests Exist
bash# Count existing tests
echo "Tests found: $(grep -r "#\[test\]" src/ | wc -l)"

# If 0 tests found, STOP and go back to Phase 0 Step 3
Run Unit Tests
bash# For Rust/Solana
cargo test -- --nocapture 2>&1 | tee test.log
echo "EXIT CODE: $?"

# For Frontend
npm test -- --watchAll=false 2>&1 | tee test.log
echo "EXIT CODE: $?"
Evidence Required:

Exact number of tests run
Exact number of tests passed
Full output of any failures
Exit code

Pass Criteria:

All tests pass
Exit code = 0
No skipped tests without justification

PHASE 3: USER STORY VALIDATION TESTS
Run User Story Specific Tests
bash# Run tests with user story filter
cargo test user_story -- --nocapture 2>&1 | tee user_story_tests.log
cargo test acceptance -- --nocapture 2>&1 | tee acceptance_tests.log
Evidence Required:

Each acceptance criterion has at least 1 test
All user story tests pass
Test names clearly map to criteria

PHASE 4: SECURITY SCAN (Always Required)
bash# Using Semgrep
semgrep --config=auto . --json > security.json 2>&1
cat security.json | jq '.results | length'
echo "EXIT CODE: $?"

# Show critical issues
cat security.json | jq '.results[] | select(.severity == "ERROR")'

# Alternative if Semgrep not available - Basic security check
grep -r "unwrap()" src/ | wc -l
grep -r "panic!" src/ | wc -l
grep -r "unsafe" src/ | wc -l
Evidence Required:

Total number of findings
Breakdown by severity
Details of any HIGH/CRITICAL issues
Exit code

Pass Criteria:

No CRITICAL issues
No HIGH issues (or documented exceptions)
All MEDIUM issues reviewed

PHASE 5: INTEGRATION TESTS (For Smart Contracts)
Standard Integration Tests
bash# Anchor projects
anchor test 2>&1 | tee anchor-test.log
echo "EXIT CODE: $?"

# Look for deployment
anchor idl fetch <program-id>
Enhanced with User Journey Tests
typescript// Test complete user journey
describe("User Betting Journey", () => {
    it("should allow 1-click betting as per user story", async () => {
        // Setup
        const user = await createUser();
        const event = await createEvent("Chelsea", "Man United");
        
        // Action - should be max 2 interactions
        const interactions = [
            await selectTeam(event, "Chelsea"),
            await confirmBet(50)
        ];
        
        // Verify
        expect(interactions.length).toBeLessThanOrEqual(2);
        expect(await getBetStatus()).toBe("confirmed");
    });
});
Evidence Required:

Transaction signatures
Program deployment ID
Test scenario results
Gas usage

Pass Criteria:

All scenarios pass
Deployment successful
No runtime errors

PHASE 6: TYPE CHECKING (For TypeScript)
bash# TypeScript projects
npx tsc --noEmit 2>&1 | tee typecheck.log
echo "EXIT CODE: $?"
Evidence Required:

Type errors count
Specific error messages
Exit code

Pass Criteria:

Zero type errors
Exit code = 0

TEST DEVELOPMENT CHECKLIST
Before running tests, verify:

 Tests exist for this function/component
 Tests map to user stories
 Each acceptance criterion has a test
 Happy path, edge cases, and errors covered
 Test names are descriptive

If any checkbox is empty:

STOP testing
Create missing tests
Map tests to user stories
Then proceed with testing

FAILURE PROTOCOL
If ANY test fails:

STOP all work immediately
Document in changelog:

markdown### Test Failure - [DATE TIME]
Test Type: [Compilation/Unit/Security/Integration]
Command: [exact command run]
Error: [paste exact error]
Exit Code: [number]

Fix the issue
Re-run ALL tests (not just the failed one)
Document the fix
Only proceed when ALL tests pass

Test Missing Failure
If no tests exist:
markdown### Test Development Required - [DATE TIME]
Function: [Function name]
User Story: [Which story it serves]
Missing Tests:
- [ ] Happy path test
- [ ] Edge case test  
- [ ] Error handling test
- [ ] User story validation test

Action: Creating tests before proceeding
SUCCESS PROTOCOL
When ALL tests pass:

Create test summary in changelog
Save all log files
Update plan.md task status
Commit with message including test status

TEST EVIDENCE TEMPLATE
markdown## Test Results - [TASK NAME] - [DATE TIME]

### User Story Alignment ✅/❌
User Story: [Name]
Acceptance Criteria Tested: X/Y
- [ ] Criterion 1: test_name_1
- [ ] Criterion 2: test_name_2
Coverage: X%

### Compilation Test ✅/❌
Command: `cargo build --release`
Exit Code: 0
Output: `Finished release [optimized] target(s) in 24.37s`
Warnings: 0

### Unit Tests ✅/❌
Command: `cargo test`
Tests Run: 15
Tests Passed: 15
Exit Code: 0
Output: `test result: ok. 15 passed; 0 failed`

### Security Scan ✅/❌
Tool: Semgrep
Total Findings: 0
Critical: 0
High: 0
Medium: 0
Exit Code: 0

### Type Check ✅/❌
Command: `npx tsc --noEmit`
Errors: 0
Exit Code: 0

### Evidence Files
- build.log (24 lines)
- test.log (142 lines)
- security.json (3 findings documented)

### Conclusion
ALL TESTS PASSED - Task can be marked complete
PRIORITY ORDER

No tests? → Create tests first
Tests don't map to user stories? → Refactor tests
Tests exist and align? → Run full test suite
All pass? → Document and proceed
Any fail? → Fix and re-run ALL

ANTI-PATTERNS TO AVOID
❌ "Tests should pass" - Run them!
❌ "Compilation successful" without output
❌ "No security issues" without scan proof
❌ "All tests green" without numbers
❌ Skipping tests because "code is simple"
❌ Marking task done with failing tests
❌ Testing code without user story alignment
❌ Creating tests that don't verify acceptance criteria
❌ Skipping test creation because "manual testing is enough"
❌ Generic tests that don't validate actual requirements
VERIFICATION CHECKLIST
Before saying "tests passed":

 Can you show the exact command?
 Can you show the exit code?
 Can you show the actual output?
 Did you run ALL test types?
 Are log files saved?
 Is evidence in changelog?
 Do tests map to user stories?
 Are acceptance criteria verified?