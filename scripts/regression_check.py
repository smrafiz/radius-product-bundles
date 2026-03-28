#!/usr/bin/env python3
"""Regression checker — scans staged/unstaged changes against failure-registry.jsonl patterns."""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

REGISTRY = Path(__file__).parent.parent / ".guardrails" / "failure-registry.jsonl"
PATTERN_RULES = Path(__file__).parent.parent / ".guardrails" / "prevention-rules" / "pattern-rules.json"

RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
RESET = "\033[0m"
BOLD = "\033[1m"


def load_registry():
    entries = []
    if not REGISTRY.exists():
        return entries
    for line in REGISTRY.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return entries


def load_pattern_rules():
    if not PATTERN_RULES.exists():
        return []
    data = json.loads(PATTERN_RULES.read_text())
    return [r for r in data.get("rules", []) if r.get("enabled", True)]


def get_diff(staged=True, files=None):
    cmd = ["git", "diff", "--unified=0"]
    if staged:
        cmd.append("--cached")
    if files:
        cmd.extend(["--", *files])
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent.parent)
        return result.stdout
    except Exception:
        return ""


def parse_diff(diff_text):
    """Returns list of (file, line_no, content) for added lines."""
    changes = []
    current_file = None
    line_no = 0
    for line in diff_text.splitlines():
        if line.startswith("+++ b/"):
            current_file = line[6:]
        elif line.startswith("@@ "):
            match = re.search(r"\+(\d+)", line)
            if match:
                line_no = int(match.group(1)) - 1
        elif line.startswith("+") and not line.startswith("+++"):
            line_no += 1
            if current_file:
                changes.append((current_file, line_no, line[1:]))
        elif not line.startswith("-"):
            line_no += 1
    return changes


def check_registry(changes, entries, verbose=False):
    hits = []
    for entry in entries:
        pattern = entry.get("regression_pattern")
        if not pattern:
            continue
        try:
            regex = re.compile(pattern, re.IGNORECASE)
        except re.error:
            continue
        affected = set(entry.get("affected_files", []))
        for filepath, line_no, content in changes:
            file_match = not affected or filepath in affected
            if file_match and regex.search(content):
                hits.append({
                    "failure_id": entry.get("failure_id"),
                    "severity": entry.get("severity", "unknown"),
                    "file": filepath,
                    "line": line_no,
                    "content": content.strip(),
                    "rule": entry.get("prevention_rule", ""),
                    "status": entry.get("status", ""),
                })
    return hits


def check_pattern_rules(changes):
    rules = load_pattern_rules()
    hits = []
    for rule in rules:
        try:
            regex = re.compile(rule["pattern"])
        except re.error:
            continue
        globs = rule.get("file_glob", ["*"])
        for filepath, line_no, content in changes:
            if not any(Path(filepath).match(g) for g in globs):
                continue
            if regex.search(content):
                forbidden = rule.get("forbidden_context")
                if forbidden and re.search(forbidden, content, re.IGNORECASE):
                    continue
                hits.append({
                    "rule_id": rule["rule_id"],
                    "severity": rule.get("severity", "warning"),
                    "file": filepath,
                    "line": line_no,
                    "content": content.strip(),
                    "message": rule.get("message", ""),
                    "suggestion": rule.get("suggestion", ""),
                })
    return hits


def print_hits(registry_hits, rule_hits):
    total = len(registry_hits) + len(rule_hits)
    if total == 0:
        print(f"{GREEN}{BOLD}No regression patterns detected.{RESET}")
        return 0

    severity_color = {"critical": RED, "high": RED, "error": RED, "medium": YELLOW, "warning": YELLOW}

    if registry_hits:
        print(f"\n{BOLD}Failure Registry Matches ({len(registry_hits)}):{RESET}")
        for h in registry_hits:
            color = severity_color.get(h["severity"], YELLOW)
            print(f"  {color}[{h['severity'].upper()}]{RESET} {h['failure_id']} — {h['file']}:{h['line']}")
            print(f"    Content: {h['content'][:120]}")
            print(f"    Rule: {h['rule']}")
            print()

    if rule_hits:
        print(f"\n{BOLD}Pattern Rule Matches ({len(rule_hits)}):{RESET}")
        for h in rule_hits:
            color = severity_color.get(h["severity"], YELLOW)
            print(f"  {color}[{h['severity'].upper()}]{RESET} {h['rule_id']} — {h['file']}:{h['line']}")
            print(f"    {h['message']}")
            if h["suggestion"]:
                print(f"    Fix: {h['suggestion']}")
            print()

    criticals = sum(1 for h in registry_hits + rule_hits if h.get("severity") in ("critical", "error"))
    print(f"{BOLD}Total: {total} match(es), {criticals} critical{RESET}")
    return 1 if criticals > 0 else 0


def list_entries(entries):
    for e in entries:
        status_icon = "+" if e.get("status") == "resolved" else "!"
        print(f"  [{status_icon}] {e['failure_id']} [{e['severity']}] {e['error_message'][:80]}")


def main():
    parser = argparse.ArgumentParser(description="Check for regression patterns in git changes")
    parser.add_argument("--staged", action="store_true", default=True, help="Check staged changes (default)")
    parser.add_argument("--unstaged", action="store_true", help="Check unstaged changes")
    parser.add_argument("--all", action="store_true", help="Check both staged and unstaged")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output")
    parser.add_argument("--list", action="store_true", help="List all registry entries")
    parser.add_argument("files", nargs="*", help="Specific files to check")
    args = parser.parse_args()

    entries = load_registry()

    if args.list:
        print(f"{BOLD}Failure Registry ({len(entries)} entries):{RESET}")
        list_entries(entries)
        return 0

    if args.all:
        diff = get_diff(staged=True, files=args.files) + "\n" + get_diff(staged=False, files=args.files)
    elif args.unstaged:
        diff = get_diff(staged=False, files=args.files)
    else:
        diff = get_diff(staged=True, files=args.files)

    if not diff.strip():
        print(f"{GREEN}No changes to check.{RESET}")
        return 0

    changes = parse_diff(diff)
    if not changes:
        print(f"{GREEN}No added lines to check.{RESET}")
        return 0

    if args.verbose:
        print(f"Checking {len(changes)} changed lines against {len(entries)} registry entries...")

    registry_hits = check_registry(changes, entries, args.verbose)
    rule_hits = check_pattern_rules(changes)
    return print_hits(registry_hits, rule_hits)


if __name__ == "__main__":
    sys.exit(main())