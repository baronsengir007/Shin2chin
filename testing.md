# Testing Protocol - MANDATORY

## ⚠️ ABSOLUTE REQUIREMENTS
- NO assumptions - only real output
- ALL tests must pass before task completion
- Evidence MUST be provided
- Exit codes MUST be checked

## TEST SUITE OVERVIEW

### 1. COMPILATION TEST (Always Required)
```bash
# For Rust/Solana projects
cd shin2chin-solana
cargo build --release 2>&1 | tee build.log
echo "EXIT CODE: $?"

# For Frontend/TypeScript
cd frontend
npm run build 2>&1 | tee build.log
echo "EXIT CODE: $?"
```

**Evidence Required:**
- Full compiler output (not summary)
- Exit code (MUST be 0)
- List of any warnings
- Build time

**Pass Criteria:**
- Exit code = 0
- No errors in output
- Warnings documented if any

### 2. UNIT TESTS (Always Required)
```bash
# For Rust/Solana
cargo test -- --nocapture 2>&1 | tee test.log
echo "EXIT CODE: $?"

# For Frontend
npm test -- --watchAll=false 2>&1 | tee test.log
echo "EXIT CODE: $?"
```

**Evidence Required:**
- Exact number of tests run
- Exact number of tests passed
- Full output of any failures
- Exit code

**Pass Criteria:**
- All tests pass
- Exit code = 0
- No skipped tests without justification

### 3. SECURITY SCAN (Always Required)
```bash
# Using Semgrep
semgrep --config=auto . --json > security.json 2>&1
cat security.json | jq '.results | length'
echo "EXIT CODE: $?"

# Show critical issues
cat security.json | jq '.results[] | select(.severity == "ERROR")'
```

**Evidence Required:**
- Total number of findings
- Breakdown by severity
- Details of any HIGH/CRITICAL issues
- Exit code

**Pass Criteria:**
- No CRITICAL issues
- No HIGH issues (or documented exceptions)
- All MEDIUM issues reviewed

### 4. INTEGRATION TESTS (For Smart Contracts)
```bash
# Anchor projects
anchor test 2>&1 | tee anchor-test.log
echo "EXIT CODE: $?"

# Look for deployment
anchor idl fetch <program-id>
```

**Evidence Required:**
- Transaction signatures
- Program deployment ID
- Test scenario results
- Gas usage

**Pass Criteria:**
- All scenarios pass
- Deployment successful
- No runtime errors

### 5. TYPE CHECKING (For TypeScript)
```bash
# TypeScript projects
npx tsc --noEmit 2>&1 | tee typecheck.log
echo "EXIT CODE: $?"
```

**Evidence Required:**
- Type errors count
- Specific error messages
- Exit code

**Pass Criteria:**
- Zero type errors
- Exit code = 0

## FAILURE PROTOCOL
If ANY test fails:
1. **STOP** all work immediately
2. Document in changelog:
```markdown
### Test Failure - [DATE TIME]
Test Type: [Compilation/Unit/Security/Integration]
Command: [exact command run]
Error: [paste exact error]
Exit Code: [number]
```
3. Fix the issue
4. Re-run ALL tests (not just the failed one)
5. Document the fix
6. Only proceed when ALL tests pass

## SUCCESS PROTOCOL
When ALL tests pass:
1. Create test summary in changelog
2. Save all log files
3. Update plan.md task status
4. Commit with message including test status

## TEST EVIDENCE TEMPLATE
```markdown
## Test Results - [TASK NAME] - [DATE TIME]

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
```

## ANTI-PATTERNS TO AVOID
❌ "Tests should pass" - Run them!  
❌ "Compilation successful" without output  
❌ "No security issues" without scan proof  
❌ "All tests green" without numbers  
❌ Skipping tests because "code is simple"  
❌ Marking task done with failing tests  

## VERIFICATION CHECKLIST
Before saying "tests passed":
- [ ] Can you show the exact command?
- [ ] Can you show the exit code?
- [ ] Can you show the actual output?
- [ ] Did you run ALL test types?
- [ ] Are log files saved?
- [ ] Is evidence in changelog?