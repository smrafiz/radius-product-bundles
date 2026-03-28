#!/usr/bin/env python3
"""Log, list, show, and resolve failures in the guardrails failure registry."""

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

REGISTRY = Path(__file__).parent.parent / ".guardrails" / "failure-registry.jsonl"

RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"

CATEGORIES = ["security", "runtime", "config", "build", "test", "type"]
SEVERITIES = ["critical", "high", "medium", "low"]


def load_entries():
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


def save_entries(entries, header_lines=None):
    if header_lines is None:
        header_lines = []
        if REGISTRY.exists():
            for line in REGISTRY.read_text().splitlines():
                if line.startswith("#"):
                    header_lines.append(line)
                else:
                    break
    lines = header_lines + [json.dumps(e, separators=(",", ":")) for e in entries]
    REGISTRY.write_text("\n".join(lines) + "\n")


def generate_id(category, msg):
    short = category[:3]
    h = hashlib.sha1(f"{msg}{datetime.now(timezone.utc).isoformat()}".encode()).hexdigest()[:5]
    return f"FAIL-{short}-{h}"


def list_entries(entries, status_filter=None):
    filtered = entries
    if status_filter:
        filtered = [e for e in entries if e.get("status") == status_filter]
    if not filtered:
        print(f"{GREEN}No entries found.{RESET}")
        return

    print(f"{BOLD}Failure Registry ({len(filtered)}/{len(entries)} entries):{RESET}\n")
    for e in filtered:
        icon = f"{GREEN}+{RESET}" if e.get("status") == "resolved" else f"{RED}!{RESET}"
        sev_color = RED if e.get("severity") in ("critical", "high") else YELLOW
        print(f"  [{icon}] {CYAN}{e['failure_id']}{RESET} [{sev_color}{e['severity']}{RESET}] {e['error_message'][:80]}")
        if e.get("affected_files"):
            print(f"      Files: {', '.join(e['affected_files'][:3])}")


def show_entry(entries, failure_id):
    match = next((e for e in entries if e["failure_id"] == failure_id), None)
    if not match:
        print(f"{RED}Not found: {failure_id}{RESET}")
        return 1
    print(f"\n{BOLD}{match['failure_id']}{RESET}")
    print(f"  Status:     {match.get('status', 'unknown')}")
    print(f"  Severity:   {match.get('severity', 'unknown')}")
    print(f"  Category:   {match.get('category', 'unknown')}")
    print(f"  Timestamp:  {match.get('timestamp', 'unknown')}")
    print(f"  Error:      {match.get('error_message', '')}")
    print(f"  Root Cause: {match.get('root_cause', '')}")
    print(f"  Files:      {', '.join(match.get('affected_files', []))}")
    print(f"  Pattern:    {match.get('regression_pattern', '')}")
    print(f"  Prevention: {match.get('prevention_rule', '')}")
    return 0


def resolve_entry(entries, failure_id):
    for e in entries:
        if e["failure_id"] == failure_id:
            if e.get("status") == "resolved":
                print(f"{YELLOW}Already resolved: {failure_id}{RESET}")
                return 0
            e["status"] = "resolved"
            e["resolved_at"] = datetime.now(timezone.utc).isoformat()
            save_entries(entries)
            print(f"{GREEN}Resolved: {failure_id}{RESET}")
            return 0
    print(f"{RED}Not found: {failure_id}{RESET}")
    return 1


def prompt_input(label, required=True, options=None):
    while True:
        suffix = f" ({'/'.join(options)})" if options else ""
        val = input(f"  {label}{suffix}: ").strip()
        if val or not required:
            if options and val and val not in options:
                print(f"    Must be one of: {', '.join(options)}")
                continue
            return val
        print(f"    Required.")


def interactive_log(entries):
    print(f"\n{BOLD}Log New Failure{RESET}\n")
    error_msg = prompt_input("Error message")
    category = prompt_input("Category", options=CATEGORIES)
    severity = prompt_input("Severity", options=SEVERITIES)
    root_cause = prompt_input("Root cause")
    files_raw = prompt_input("Affected files (comma-separated)")
    affected_files = [f.strip() for f in files_raw.split(",") if f.strip()]
    pattern = prompt_input("Regression pattern (regex)", required=False)
    rule = prompt_input("Prevention rule", required=False)

    failure_id = generate_id(category, error_msg)
    entry = {
        "failure_id": failure_id,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "category": category,
        "severity": severity,
        "error_message": error_msg,
        "root_cause": root_cause,
        "affected_files": affected_files,
        "regression_pattern": pattern or None,
        "prevention_rule": rule or None,
        "status": "active",
    }

    entries.append(entry)
    save_entries(entries)
    print(f"\n{GREEN}Logged: {failure_id}{RESET}")
    return 0


def add_entry(entries, error_msg, category, severity, root_cause, files, pattern=None, rule=None):
    failure_id = generate_id(category, error_msg)
    entry = {
        "failure_id": failure_id,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "category": category,
        "severity": severity,
        "error_message": error_msg,
        "root_cause": root_cause,
        "affected_files": [f.strip() for f in files.split(",") if f.strip()],
        "regression_pattern": pattern,
        "prevention_rule": rule,
        "status": "active",
    }
    entries.append(entry)
    save_entries(entries)
    print(f"{GREEN}Logged: {failure_id}{RESET}")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Manage the failure registry")
    parser.add_argument("--list", action="store_true", help="List all failures")
    parser.add_argument("--active", action="store_true", help="List active failures only")
    parser.add_argument("--show", metavar="ID", help="Show details of a failure")
    parser.add_argument("--resolve", metavar="ID", help="Mark a failure as resolved")
    parser.add_argument("--interactive", action="store_true", help="Log a new failure interactively")
    parser.add_argument("--add", metavar="MSG", help="Log a failure non-interactively")
    parser.add_argument("--category", default="runtime")
    parser.add_argument("--severity", default="medium")
    parser.add_argument("--root-cause", default="")
    parser.add_argument("--files", default="")
    parser.add_argument("--pattern", default=None)
    parser.add_argument("--rule", default=None)
    args = parser.parse_args()

    entries = load_entries()

    if args.list:
        list_entries(entries)
        return 0
    if args.active:
        list_entries(entries, status_filter="active")
        return 0
    if args.show:
        return show_entry(entries, args.show)
    if args.resolve:
        return resolve_entry(entries, args.resolve)
    if args.interactive:
        return interactive_log(entries)
    if args.add:
        return add_entry(entries, args.add, args.category, args.severity, args.root_cause, args.files, args.pattern, args.rule)

    parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())