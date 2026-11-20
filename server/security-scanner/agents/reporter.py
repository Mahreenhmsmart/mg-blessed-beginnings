#!/usr/bin/env python3
"""
Reporter Agent - Aggregates findings and generates security reports.

Responsibilities:
- Aggregate findings from all other agents
- Assign severity (Critical, High, Medium, Low, Informational)
- Generate executive summary
- Produce structured JSON report and Markdown report
- Include: scope, authorization timestamp, findings with evidence/impact/remediation, limitations, methodology

NEVER includes credentials, API keys, cookies, session tokens, or secret values in reports.
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# Severity ordering for sorting and scoring
SEVERITY_ORDER = {
    "Critical": 0,
    "High": 1,
    "Medium": 2,
    "Low": 3,
    "Informational": 4,
}

# Score deductions per severity
SEVERITY_DEDUCTIONS = {
    "Critical": 25,
    "High": 15,
    "Medium": 8,
    "Low": 3,
    "Informational": 0,
}


def sanitize_value(value: str) -> str:
    """
    Sanitize a string to remove potential sensitive data.
    Strips patterns that look like API keys, tokens, passwords, etc.
    """
    if not isinstance(value, str):
        return str(value)

    # Patterns to redact
    sensitive_patterns = [
        r'(?:api[_-]?key|apikey)\s*[:=]\s*\S+',
        r'(?:token|auth|bearer)\s*[:=]\s*\S+',
        r'(?:password|passwd|pwd|secret)\s*[:=]\s*\S+',
        r'(?:access_key|secret_key|private_key)\s*[:=]\s*\S+',
        r'Bearer\s+[A-Za-z0-9\-._~+/]+=*',
        r'[A-Za-z0-9+/]{40,}={0,2}',  # Base64-like long strings
    ]

    sanitized = value
    for pattern in sensitive_patterns:
        sanitized = re.sub(pattern, '[REDACTED]', sanitized, flags=re.IGNORECASE)

    return sanitized


def aggregate_findings(agent_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Aggregate findings from multiple agent results.
    Deduplicates by title+target combination and sorts by severity.
    """
    seen_keys = set()
    aggregated: List[Dict[str, Any]] = []

    for result in agent_results:
        findings = result.get("findings", [])
        for finding in findings:
            # Create dedup key
            title = finding.get("title", "").strip()
            target = finding.get("target", "").strip()
            key = f"{title}|{target}"

            if key not in seen_keys:
                seen_keys.add(key)

                # Sanitize all text fields
                sanitized_finding = {
                    "title": sanitize_value(title),
                    "severity": finding.get("severity", "Informational"),
                    "target": sanitize_value(target),
                    "evidence": sanitize_value(finding.get("evidence", "")),
                    "impact": sanitize_value(finding.get("impact", "")),
                    "remediation": sanitize_value(finding.get("remediation", "")),
                    "status": finding.get("status", "Open"),
                }

                # Validate severity
                if sanitized_finding["severity"] not in SEVERITY_ORDER:
                    sanitized_finding["severity"] = "Informational"

                aggregated.append(sanitized_finding)

    # Sort by severity (Critical first), then alphabetically
    aggregated.sort(key=lambda f: (SEVERITY_ORDER.get(f["severity"], 4), f["title"]))

    return aggregated


def calculate_score(findings: List[Dict[str, Any]]) -> int:
    """Calculate security score based on findings."""
    score = 100
    for finding in findings:
        severity = finding.get("severity", "Informational")
        deduction = SEVERITY_DEDUCTIONS.get(severity, 0)
        score -= deduction
    return max(0, score)


def count_by_severity(findings: List[Dict[str, Any]]) -> Dict[str, int]:
    """Count findings by severity level."""
    counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Informational": 0}
    for finding in findings:
        severity = finding.get("severity", "Informational")
        if severity in counts:
            counts[severity] += 1
    return counts


def generate_executive_summary(
    target: str,
    findings: List[Dict[str, Any]],
    score: int,
    severity_counts: Dict[str, int],
    duration_seconds: float,
) -> str:
    """Generate an executive summary paragraph."""
    total = len(findings)

    if total == 0:
        return (
            f"The security assessment of {target} found no issues within the scope "
            f"of checks performed. Security score: {score}/100. Assessment completed "
            f"in {duration_seconds:.1f} seconds."
        )

    critical_high = severity_counts.get("Critical", 0) + severity_counts.get("High", 0)

    if critical_high > 0:
        urgency = "Immediate attention is recommended."
    elif severity_counts.get("Medium", 0) > 0:
        urgency = "Address medium-severity findings in a timely manner."
    else:
        urgency = "No urgent issues identified. Review informational findings as part of ongoing hardening."

    return (
        f"The security assessment of {target} identified {total} finding(s): "
        f"{severity_counts.get('Critical', 0)} critical, "
        f"{severity_counts.get('High', 0)} high, "
        f"{severity_counts.get('Medium', 0)} medium, "
        f"{severity_counts.get('Low', 0)} low, "
        f"{severity_counts.get('Informational', 0)} informational. "
        f"Security score: {score}/100. {urgency} "
        f"Assessment completed in {duration_seconds:.1f} seconds."
    )


def generate_json_report(
    scan_id: str,
    target: str,
    base_url: str,
    plan_data: Dict[str, Any],
    agent_results: List[Dict[str, Any]],
    start_time: datetime,
    end_time: datetime,
) -> Dict[str, Any]:
    """Generate the structured JSON report."""
    duration = (end_time - start_time).total_seconds()

    # Aggregate all findings
    all_findings = aggregate_findings(agent_results)
    score = calculate_score(all_findings)
    severity_counts = count_by_severity(all_findings)

    report = {
        "scan_id": scan_id,
        "target": target,
        "base_url": base_url,
        "status": "completed",
        "score": score,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_seconds": round(duration, 2),
        "authorization_timestamp": plan_data.get("timestamp", start_time.isoformat()),
        "executive_summary": generate_executive_summary(target, all_findings, score, severity_counts, duration),
        "findings_count": len(all_findings),
        "severity_counts": severity_counts,
        "scope": {
            "ports_checked": plan_data.get("scope", {}).get("total_port_checks", 0),
            "paths_checked": plan_data.get("scope", {}).get("total_path_checks", 0),
            "web_checks": plan_data.get("scope", {}).get("web_checks", []),
        },
        "agent_summaries": [],
        "findings": all_findings,
        "methodology": [
            "Planning: Target validation and scope definition",
            "Reconnaissance: Passive information gathering (DNS, technology fingerprinting, subdomain enumeration)",
            "Port Analysis: Checking common service ports for exposure",
            "Web Security Audit: Analyzing security headers, TLS configuration, cookie security, and checking for exposed sensitive resources",
            "Reporting: Compiling findings with severity ratings and remediation guidance",
        ],
        "limitations": [
            "This is a non-intrusive assessment and does not perform vulnerability exploitation",
            "Port scanning is limited to common service ports only",
            "Web checks are limited to publicly accessible endpoints",
            "No credential-based or authenticated testing was performed",
            "Results represent a point-in-time assessment",
            "Subdomain enumeration uses passive certificate transparency logs only",
        ],
    }

    # Add agent summaries
    for result in agent_results:
        report["agent_summaries"].append({
            "agent": result.get("agent", "unknown"),
            "summary": result.get("summary", ""),
            "finding_count": len(result.get("findings", [])),
        })

    return report


def generate_markdown_report(report_data: Dict[str, Any]) -> str:
    """Generate comprehensive Markdown report from JSON report data."""
    lines = [
        "# Security Assessment Report",
        "",
        f"**Scan ID:** {report_data['scan_id']}",
        f"**Target:** {report_data['target']}",
        f"**Date:** {report_data['start_time']}",
        f"**Duration:** {report_data['duration_seconds']} seconds",
        "",
        "---",
        "",
        "## Authorization",
        "",
        "This security assessment was conducted with proper authorization.",
        "**Only scan systems you own or have explicit permission to test.**",
        "",
        f"**Authorization Timestamp:** {report_data.get('authorization_timestamp', 'N/A')}",
        "",
        "---",
        "",
        "## Executive Summary",
        "",
        report_data.get("executive_summary", "No summary available."),
        "",
        f"**Security Score: {report_data['score']}/100**",
        "",
        "---",
        "",
        "## Scope",
        "",
        f"- **Target Hostname:** {report_data['target']}",
        f"- **Base URL:** {report_data.get('base_url', 'N/A')}",
        f"- **Ports Checked:** {report_data.get('scope', {}).get('ports_checked', 0)} common service ports",
        f"- **Paths Checked:** {report_data.get('scope', {}).get('paths_checked', 0)} sensitive paths",
        f"- **Web Checks:** {', '.join(report_data.get('scope', {}).get('web_checks', []))}",
        "",
        "---",
        "",
        "## Findings Summary",
        "",
    ]

    sc = report_data.get("severity_counts", {})
    lines.extend([
        f"| Severity | Count |",
        f"|----------|-------|",
        f"| Critical | {sc.get('Critical', 0)} |",
        f"| High | {sc.get('High', 0)} |",
        f"| Medium | {sc.get('Medium', 0)} |",
        f"| Low | {sc.get('Low', 0)} |",
        f"| Informational | {sc.get('Informational', 0)} |",
        f"| **Total** | **{report_data.get('findings_count', 0)}** |",
        "",
        "---",
        "",
        "## Detailed Findings",
        "",
    ])

    findings = report_data.get("findings", [])
    if not findings:
        lines.append("No security issues were detected by the checks performed.")
    else:
        current_severity = None
        counter = 0
        for finding in findings:
            severity = finding.get("severity", "Informational")
            if severity != current_severity:
                current_severity = severity
                lines.extend([
                    f"### {severity} Severity",
                    "",
                ])

            counter += 1
            lines.extend([
                f"#### {counter}. {finding['title']}",
                "",
                f"- **Severity:** {finding['severity']}",
                f"- **Evidence:** {finding['evidence']}",
                f"- **Impact:** {finding['impact']}",
                f"- **Remediation:** {finding['remediation']}",
                f"- **Status:** {finding.get('status', 'Open')}",
                "",
            ])

    # Agent summaries
    agent_summaries = report_data.get("agent_summaries", [])
    if agent_summaries:
        lines.extend([
            "---",
            "",
            "## Agent Results",
            "",
        ])
        for agent in agent_summaries:
            lines.extend([
                f"### {agent['agent'].replace('_', ' ').title()}",
                "",
                agent.get("summary", "No summary."),
                f"*Findings: {agent.get('finding_count', 0)}*",
                "",
            ])

    # Methodology
    lines.extend([
        "---",
        "",
        "## Methodology",
        "",
    ])
    for i, step in enumerate(report_data.get("methodology", []), 1):
        lines.append(f"{i}. {step}")
    lines.append("")

    # Limitations
    lines.extend([
        "---",
        "",
        "## Limitations",
        "",
    ])
    for limitation in report_data.get("limitations", []):
        lines.append(f"- {limitation}")
    lines.append("")

    # Disclaimer
    lines.extend([
        "---",
        "",
        "## Disclaimer",
        "",
        "This report is provided for informational purposes only. Security is an ongoing process.",
        "Regular assessments and updates are recommended to maintain security posture.",
        "This assessment does not guarantee the absence of all vulnerabilities.",
        "",
        "*Report generated by MG Security Scanner*",
    ])

    return "\n".join(lines)


def run_reporter(
    scan_id: str,
    target: str,
    base_url: str,
    plan_data: Dict[str, Any],
    agent_results: List[Dict[str, Any]],
    start_time: datetime,
    output_dir: str,
) -> Dict[str, Any]:
    """
    Generate reports from aggregated agent results.

    Writes both JSON and Markdown reports to output_dir.
    Returns the JSON report data.
    """
    print("[Reporter] Generating report")

    end_time = datetime.now(timezone.utc)

    # Generate JSON report
    json_report = generate_json_report(
        scan_id, target, base_url, plan_data, agent_results, start_time, end_time
    )

    # Write JSON summary
    import os
    os.makedirs(output_dir, exist_ok=True)

    summary_path = os.path.join(output_dir, "summary.json")
    with open(summary_path, "w") as f:
        json.dump(json_report, f, indent=2, default=str)
    print(f"[Reporter] JSON report written to {summary_path}")

    # Generate and write Markdown report
    md_report = generate_markdown_report(json_report)
    md_path = os.path.join(output_dir, "report.md")
    with open(md_path, "w") as f:
        f.write(md_report)
    print(f"[Reporter] Markdown report written to {md_path}")

    score = json_report["score"]
    total_findings = json_report["findings_count"]
    print(f"[Reporter] Score: {score}/100, Findings: {total_findings}")

    json_report["report_files"] = {
        "json": summary_path,
        "markdown": md_path,
    }

    return json_report


class ReporterAgent:
    """Report generation agent."""

    def __init__(
        self,
        scan_id: str,
        target: str,
        base_url: str,
        plan_data: Dict[str, Any],
        agent_results: List[Dict[str, Any]],
        start_time: datetime,
        output_dir: str,
    ):
        self.scan_id = scan_id
        self.target = target
        self.base_url = base_url
        self.plan_data = plan_data
        self.agent_results = agent_results
        self.start_time = start_time
        self.output_dir = output_dir

    def run(self) -> Dict[str, Any]:
        """Generate reports and return JSON report data."""
        return run_reporter(
            self.scan_id,
            self.target,
            self.base_url,
            self.plan_data,
            self.agent_results,
            self.start_time,
            self.output_dir,
        )


def main():
    parser = argparse.ArgumentParser(description="Reporter Agent - Security report generation")
    parser.add_argument("--scan-id", required=True, help="Unique scan identifier")
    parser.add_argument("--target", required=True, help="Target hostname")
    parser.add_argument("--base-url", required=True, help="Base URL")
    parser.add_argument("--plan-file", required=True, help="Path to plan JSON file")
    parser.add_argument("--results-dir", required=True, help="Directory containing agent result files")
    parser.add_argument("--output-dir", required=True, help="Output directory for reports")
    parser.add_argument("--start-time", help="ISO-8601 start time (default: now)")
    args = parser.parse_args()

    try:
        # Load plan data
        with open(args.plan_file, "r") as f:
            plan_data = json.load(f)

        # Load agent results
        agent_results = []
        result_files = ["recon_result.json", "port_scan_result.json", "web_audit_result.json"]
        for rf in result_files:
            path = os.path.join(args.results_dir, rf)
            if os.path.exists(path):
                with open(path, "r") as f:
                    agent_results.append(json.load(f))

        start_time = datetime.fromisoformat(args.start_time) if args.start_time else datetime.now(timezone.utc)

        reporter = ReporterAgent(
            args.scan_id,
            args.target,
            args.base_url,
            plan_data,
            agent_results,
            start_time,
            args.output_dir,
        )
        report = reporter.run()

        # Print summary to stdout
        print(json.dumps({
            "score": report["score"],
            "findings_count": report["findings_count"],
            "severity_counts": report["severity_counts"],
        }, indent=2))

    except Exception as e:
        error_result = {
            "agent": "reporter",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    import os
    main()
