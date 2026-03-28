---
name: pre-check
description: "Run pre-work regression check before starting any task"
---

# Pre-Work Check

Run the regression checker and failure registry scan before starting work.

## Steps

1. Run `python scripts/regression_check.py --all` to check for regression patterns
2. Run `python scripts/log_failure.py --active` to list any active (unresolved) failures
3. Review the output and report any relevant findings to the user
4. If active failures exist in files you plan to modify, warn the user before proceeding

## Context

- Registry: `.guardrails/failure-registry.jsonl`
- Prevention rules: `.guardrails/prevention-rules/`
- Full guardrails: `docs/AGENT_GUARDRAILS.md`
