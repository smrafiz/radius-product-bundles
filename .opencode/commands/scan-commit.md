---
name: scan-commit
description: "Validate staged changes before committing: regressions, secrets, attribution"
---

# Pre-Commit Scan

Run all validation checks on staged changes before creating a commit.

## Steps

1. **Regression check**: Run `python scripts/regression_check.py --staged`
   - If critical patterns found, HALT and fix before committing

2. **Secret scan**: Check the diff for leaked credentials
   - Run `git diff --cached` and scan for: API keys, tokens, passwords, .env values, connection strings
   - If found, HALT immediately

3. **Commit message validation**:
   - Must follow format: `<type>: <description>` (feat, fix, docs, style, refactor, test, chore)
   - Must include AI attribution: `Co-Authored-By: <agent> <email>`
   - Must be single-focus (one logical change)

4. **Test check**: Confirm relevant tests pass
   - Run tests for modified files if test files exist

## On Failure

- Report which check failed and why
- Provide specific fix instructions
- Do NOT proceed with the commit
