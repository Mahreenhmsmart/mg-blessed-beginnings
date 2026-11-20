#!/usr/bin/env python3
"""
MG Security Scanner - Orchestrator

Runs five security assessment agents in sequence:
  Planner -> Recon -> Port Scanner -> Web Auditor -> Reporter

Each agent is a separate module under agents/. The orchestrator handles:
- Sequential execution with error handling
- Status file updates for frontend polling
- Timeout enforcement (5 min total)
- Passing data between agents
- Writing final reports to the output directory

IMPORTANT: Only scan systems you own or have explicit authorization to test.
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Ensure the scanner package root is on sys.path so agent imports work
SCANNER_DIR = Path(__file__).resolve().parent
if str(SCANNER_DIR) not in sys.path:
    sys.path.insert(0, str(SCANNER_DIR))

try:
    import requests
    requests.packages.urllib3.disable_warnings(
        requests.packages.urllib3.exceptions.InsecureRequestWarning
    )
except ImportError:
    print("Error: 'requests' package required. Install: pip install requests", file=sys.stderr)
    sys.exit(1)

from agents.planner import PlannerAgent, create_plan
from agents.recon import ReconAgent
from agents.port_scanner import PortScannerAgent
from agents.web_auditor import WebAuditorAgent
from agents.reporter import ReporterAgent


# ── Constants ───────────────────────────────────────────────────────────────────

TOTAL_TIMEOUT_SECONDS = 300  # 5 minutes
STATUS_POLL_INTERVAL = 2.0


class ScanStatus:
    """Scan status values matching the Node.js backend expectations."""
    PLANNING = "planning"
    RECON = "reconnaissance"
    PORT_SCAN = "port_analysis"
    WEB_AUDIT = "web_security_audit"
    REPORTING = "generating_report"
    COMPLETED = "completed"
    FAILED = "failed"


# ── Status File Writer ─────────────────────────────────────────────────────────

def write_status(output_dir: Path, scan_id: str, status: str, message: str, progress: int):
    """Write status JSON for the Node.js backend to poll."""
    status_data = {
        "scanId": scan_id,
        "status": status,
        "message": message,
        "progress": progress,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    try:
        status_file = output_dir / "status.json"
        with open(status_file, "w") as f:
            json.dump(status_data, f)
    except Exception as e:
        print(f"Warning: Could not write status file: {e}", file=sys.stderr)


# ── Main Orchestrator ──────────────────────────────────────────────────────────

def run_scan(target: str, scan_id: str, output_dir_str: str) -> bool:
    """
    Execute the full five-agent security assessment workflow.

    Returns True on success, False on failure.
    """
    output_dir = Path(output_dir_str)
    output_dir.mkdir(parents=True, exist_ok=True)

    start_time = datetime.now(timezone.utc)

    print(f"\n{'='*60}")
    print(f"MG Security Scanner - Authorized Assessment")
    print(f"Target: {target}")
    print(f"Scan ID: {scan_id}")
    print(f"Output: {output_dir}")
    print(f"{'='*60}\n")

    write_status(output_dir, scan_id, ScanStatus.PLANNING, "Initializing scan...", 0)

    agent_results: List[Dict[str, Any]] = []
    plan_data: Dict[str, Any] = {}

    try:
        # ── Agent 1: Planner ────────────────────────────────────────────────
        write_status(output_dir, scan_id, ScanStatus.PLANNING, "Validating target and creating scan plan...", 5)
        print("[Orchestrator] Running Planner agent...")

        planner = PlannerAgent(target, scan_id)
        plan_data = planner.run()

        # Save plan
        plan_file = output_dir / "plan.json"
        with open(plan_file, "w") as f:
            json.dump(plan_data, f, indent=2)

        hostname = plan_data["target"]
        base_url = plan_data["base_url"]
        port = plan_data["port"]
        scheme = plan_data["scheme"]

        write_status(output_dir, scan_id, ScanStatus.PLANNING, "Scan plan created", 10)
        print(f"[Orchestrator] Plan complete: {plan_data['summary']}")

        # Check timeout
        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
        if elapsed > TOTAL_TIMEOUT_SECONDS:
            raise TimeoutError(f"Planning exceeded timeout ({elapsed:.0f}s)")

        # ── Agent 2: Recon ──────────────────────────────────────────────────
        write_status(output_dir, scan_id, ScanStatus.RECON, "Gathering target information...", 15)
        print("\n[Orchestrator] Running Recon agent...")

        recon = ReconAgent(hostname, base_url, scan_id)
        recon_result = recon.run()
        agent_results.append(recon_result)

        # Save recon results
        recon_file = output_dir / "recon_result.json"
        with open(recon_file, "w") as f:
            json.dump(recon_result, f, indent=2, default=str)

        # Also save legacy format for backward compatibility
        recon_legacy = {
            "hostname": hostname,
            "timestamp": recon_result.get("timestamp"),
            "ip_address": recon_result.get("data", {}).get("dns", {}).get("records", {}).get("A", ["unresolved"])[0] if recon_result.get("data", {}).get("dns", {}).get("records", {}).get("A") else "unresolved",
        }
        recon_legacy_file = output_dir / "recon.json"
        with open(recon_legacy_file, "w") as f:
            json.dump(recon_legacy, f, indent=2)

        write_status(output_dir, scan_id, ScanStatus.RECON, "Reconnaissance complete", 25)

        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
        if elapsed > TOTAL_TIMEOUT_SECONDS:
            raise TimeoutError(f"Recon exceeded timeout ({elapsed:.0f}s)")

        # ── Agent 3: Port Scanner ───────────────────────────────────────────
        write_status(output_dir, scan_id, ScanStatus.PORT_SCAN, "Analyzing service ports...", 30)
        print("\n[Orchestrator] Running Port Scanner agent...")

        remaining_time = max(10, TOTAL_TIMEOUT_SECONDS - elapsed)
        port_scanner = PortScannerAgent(hostname, scan_id, total_timeout=min(remaining_time, 60))
        port_result = port_scanner.run()
        agent_results.append(port_result)

        # Save port results
        port_file = output_dir / "port_scan_result.json"
        with open(port_file, "w") as f:
            json.dump(port_result, f, indent=2)

        # Legacy format
        port_legacy = {
            "hostname": hostname,
            "timestamp": port_result.get("timestamp"),
            "open_ports": port_result.get("data", {}).get("open_ports", []),
            "closed_ports_count": port_result.get("data", {}).get("closed_count", 0),
            "total_checked": port_result.get("data", {}).get("total_checked", 0),
        }
        port_legacy_file = output_dir / "ports.json"
        with open(port_legacy_file, "w") as f:
            json.dump(port_legacy, f, indent=2)

        open_count = len(port_result.get("data", {}).get("open_ports", []))
        write_status(
            output_dir, scan_id, ScanStatus.PORT_SCAN,
            f"Port analysis complete: {open_count} open ports found",
            50,
        )

        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
        if elapsed > TOTAL_TIMEOUT_SECONDS:
            raise TimeoutError(f"Port scan exceeded timeout ({elapsed:.0f}s)")

        # ── Agent 4: Web Auditor ────────────────────────────────────────────
        write_status(output_dir, scan_id, ScanStatus.WEB_AUDIT, "Performing web security audit...", 55)
        print("\n[Orchestrator] Running Web Auditor agent...")

        remaining_time = max(10, TOTAL_TIMEOUT_SECONDS - elapsed)
        web_auditor = WebAuditorAgent(hostname, base_url, port, scan_id, timeout=min(remaining_time, 120))
        web_result = web_auditor.run()
        agent_results.append(web_result)

        # Save web audit results
        web_file = output_dir / "web_audit_result.json"
        with open(web_file, "w") as f:
            json.dump(web_result, f, indent=2, default=str)

        # Legacy format files
        header_data = web_result.get("data", {}).get("headers", {})
        headers_legacy = {
            "url": base_url,
            "status_code": header_data.get("response_status"),
            "headers": header_data.get("all_headers", {}),
            "timestamp": web_result.get("timestamp"),
        }
        headers_file = output_dir / "headers.json"
        with open(headers_file, "w") as f:
            json.dump(headers_legacy, f, indent=2, default=str)

        tls_data = web_result.get("data", {}).get("tls", {})
        tls_legacy = {
            "hostname": hostname,
            "certificate": tls_data.get("certificate"),
            "cipher": tls_data.get("cipher"),
            "timestamp": web_result.get("timestamp"),
        }
        tls_file = output_dir / "tls.json"
        with open(tls_file, "w") as f:
            json.dump(tls_legacy, f, indent=2, default=str)

        resource_data = web_result.get("data", {}).get("resources", {})
        resources_legacy = {
            "checked_paths": resource_data.get("checked_count", 0),
            "exposed_resources": resource_data.get("exposed_resources", []),
            "timestamp": web_result.get("timestamp"),
        }
        resources_file = output_dir / "resources.json"
        with open(resources_file, "w") as f:
            json.dump(resources_legacy, f, indent=2)

        finding_count = len(web_result.get("findings", []))
        write_status(
            output_dir, scan_id, ScanStatus.WEB_AUDIT,
            f"Web audit complete: {finding_count} finding(s)",
            80,
        )

        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
        if elapsed > TOTAL_TIMEOUT_SECONDS:
            raise TimeoutError(f"Web audit exceeded timeout ({elapsed:.0f}s)")

        # ── Agent 5: Reporter ───────────────────────────────────────────────
        write_status(output_dir, scan_id, ScanStatus.REPORTING, "Generating security report...", 85)
        print("\n[Orchestrator] Running Reporter agent...")

        reporter = ReporterAgent(
            scan_id=scan_id,
            target=hostname,
            base_url=base_url,
            plan_data=plan_data,
            agent_results=agent_results,
            start_time=start_time,
            output_dir=str(output_dir),
        )
        report = reporter.run()

        write_status(output_dir, scan_id, ScanStatus.COMPLETED, "Report generated successfully", 100)

        print(f"\n{'='*60}")
        print("Scan completed successfully!")
        print(f"Score: {report['score']}/100")
        print(f"Findings: {report['findings_count']}")
        sc = report.get('severity_counts', {})
        print(f"  Critical: {sc.get('Critical', 0)}, High: {sc.get('High', 0)}, "
              f"Medium: {sc.get('Medium', 0)}, Low: {sc.get('Low', 0)}, "
              f"Info: {sc.get('Informational', 0)}")
        print(f"{'='*60}\n")

        return True

    except TimeoutError as e:
        error_msg = f"Scan timed out: {str(e)}"
        print(f"\n[Orchestrator] ERROR: {error_msg}", file=sys.stderr)
        write_status(output_dir, scan_id, ScanStatus.FAILED, error_msg, -1)

        # Write partial summary if we got any results
        _write_failure_summary(output_dir, scan_id, target, start_time, agent_results, error_msg)
        return False

    except ValueError as e:
        error_msg = f"Validation error: {str(e)}"
        print(f"\n[Orchestrator] ERROR: {error_msg}", file=sys.stderr)
        write_status(output_dir, scan_id, ScanStatus.FAILED, error_msg, -1)
        _write_failure_summary(output_dir, scan_id, target, start_time, [], error_msg)
        return False

    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"\n[Orchestrator] ERROR: {error_msg}", file=sys.stderr)
        write_status(output_dir, scan_id, ScanStatus.FAILED, error_msg, -1)
        _write_failure_summary(output_dir, scan_id, target, start_time, agent_results, error_msg)
        return False


def _write_failure_summary(
    output_dir: Path,
    scan_id: str,
    target: str,
    start_time: datetime,
    agent_results: List[Dict[str, Any]],
    error_message: str,
):
    """Write a minimal summary.json on failure so the backend can parse it."""
    end_time = datetime.now(timezone.utc)
    duration = (end_time - start_time).total_seconds()

    # Collect any findings from completed agents
    all_findings = []
    for result in agent_results:
        all_findings.extend(result.get("findings", []))

    severity_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Informational": 0}
    for f in all_findings:
        sev = f.get("severity", "Informational")
        if sev in severity_counts:
            severity_counts[sev] += 1

    summary = {
        "scan_id": scan_id,
        "target": target,
        "status": "failed",
        "error": error_message,
        "score": None,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_seconds": round(duration, 2),
        "findings_count": len(all_findings),
        "severity_counts": severity_counts,
        "findings": all_findings,
    }

    try:
        summary_file = output_dir / "summary.json"
        with open(summary_file, "w") as f:
            json.dump(summary, f, indent=2, default=str)
    except Exception as e:
        print(f"Warning: Could not write failure summary: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="MG Security Scanner - Authorized Defensive Security Assessment"
    )
    parser.add_argument("--target", required=True, help="Target hostname, IP, or URL")
    parser.add_argument("--scan-id", required=True, help="Unique scan identifier")
    parser.add_argument("--output-dir", required=True, help="Directory for scan output")

    args = parser.parse_args()

    success = run_scan(args.target, args.scan_id, args.output_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
