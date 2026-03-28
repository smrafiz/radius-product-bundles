---
name: log-failure
description: "Log a new bug/failure to the guardrails registry"
---

# Log Failure

When you discover a bug during development, log it to the failure registry.

## Steps

1. Gather failure details:
   - Error message (what went wrong)
   - Category: security | runtime | config | build | test | type
   - Severity: critical | high | medium | low
   - Root cause (why it happened)
   - Affected files (which files were involved)
   - Regression pattern (regex to detect if reintroduced)
   - Prevention rule (how to avoid in future)

2. Run the logger:
```bash
python scripts/log_failure.py --add "Error message" \
  --category runtime \
  --severity high \
  --root-cause "Description of why" \
  --files "path/to/file.ts" \
  --pattern "regex_pattern" \
  --rule "Prevention guideline"
```

3. Verify it was logged: `python scripts/log_failure.py --list`

## Interactive Mode

For guided entry: `python scripts/log_failure.py --interactive`
