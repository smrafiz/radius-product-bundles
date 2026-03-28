---
name: guardrails
description: "Display the Four Laws and safety checklist as a quick reference"
---

# Agent Guardrails Quick Reference

## The Four Laws of Agent Safety

1. **Read Before Editing** — Never modify code without reading it first
2. **Stay in Scope** — Only touch files explicitly authorized
3. **Verify Before Committing** — Test all changes
4. **Halt When Uncertain** — Ask instead of guessing

## Pre-Execution Checklist

- [ ] Read the target file(s) completely
- [ ] Verify the operation is within authorized scope
- [ ] Identify the rollback procedure (`git checkout HEAD -- <file>`)
- [ ] Check for test/production separation requirements
- [ ] Check failure registry for affected files

## Forbidden Actions

- No force push, no amend others' commits, no push without permission
- No modifying files outside scope, no deleting without permission
- No secrets in commits, no production DB for tests
- No "improvements" to unrelated code

## Halt Conditions

Stop and ask the user if: file doesn't exist, line numbers don't match, any test fails, merge conflicts, uncertain about anything, 3 failures on same task.

## Full Reference

Read `docs/AGENT_GUARDRAILS.md` for complete protocols.
