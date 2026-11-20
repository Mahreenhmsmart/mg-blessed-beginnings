#!/usr/bin/env python3
"""
Planner Agent - Validates target and creates scan plan.

Accepts a normalized target input, determines scan type (domain/IP/URL),
and outputs a structured plan (JSON) consumed by downstream agents.
"""

import argparse
import json
import re
import socket
import sys
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from urllib.parse import urlparse


# Default ports to scan — defensive set only
DEFAULT_PORTS = [21, 22, 23, 25, 53, 80, 443, 993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017]

# Sensitive paths to check (existence only, never download content)
SENSITIVE_PATHS = [
    "/.env",
    "/.git/config",
    "/.git/HEAD",
    "/wp-config.php",
    "/config.php",
    "/database.yml",
    "/.htpasswd",
    "/server-status",
    "/phpinfo.php",
    "/info.php",
    "/.DS_Store",
    "/backup.sql",
    "/dump.sql",
    "/robots.txt",
    "/sitemap.xml",
    "/.well-known/security.txt",
]


def validate_target(target: str) -> Dict[str, Any]:
    """
    Validate and normalize a target string.

    Returns a dict with hostname, port, scheme, is_ip, and original_target.
    Raises ValueError on invalid input.
    """
    if not target or not isinstance(target, str):
        raise ValueError("Target is required and must be a non-empty string")

    target = target.strip()

    # Reject shell injection characters
    if re.search(r'[;&|`$(){}[\]<>\\!#]', target):
        raise ValueError("Invalid target: contains disallowed characters")

    # Parse URL or bare hostname/IP
    if target.startswith(("http://", "https://")):
        parsed = urlparse(target)
        hostname = parsed.hostname or ""
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
        scheme = parsed.scheme
    else:
        hostname = target.split(":")[0]
        try:
            port = int(target.split(":")[1]) if ":" in target else 443
        except (IndexError, ValueError):
            port = 443
        scheme = "https" if port == 443 else "http"

    if not hostname:
        raise ValueError("Invalid target: empty hostname")

    # Validate format
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    domain_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'

    is_ip = bool(re.match(ip_pattern, hostname))
    is_domain = bool(re.match(domain_pattern, hostname))

    if not (is_ip or is_domain):
        raise ValueError(f"Invalid target format: {hostname}")

    # Validate IP octets
    if is_ip:
        octets = hostname.split(".")
        for o in octets:
            val = int(o)
            if val < 0 or val > 255:
                raise ValueError(f"Invalid IP address: octet {val} out of range")

    return {
        "hostname": hostname.lower(),
        "port": port,
        "scheme": scheme,
        "is_ip": is_ip,
        "original_target": target,
    }


def resolve_dns(hostname: str, timeout: float = 5.0) -> Optional[str]:
    """Attempt DNS resolution. Returns IP or None."""
    try:
        old_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(timeout)
        ip = socket.gethostbyname(hostname)
        socket.setdefaulttimeout(old_timeout)
        return ip
    except (socket.gaierror, socket.timeout, OSError):
        return None


def create_plan(
    target: str,
    scan_id: str,
    ports: list = None,
    sensitive_paths: list = None,
    timeout_per_check: float = 30.0,
    total_timeout: float = 300.0,
) -> Dict[str, Any]:
    """
    Create a structured scan plan from a validated target.

    Returns a JSON-serializable dict that downstream agents consume.
    """
    validated = validate_target(target)
    hostname = validated["hostname"]
    port = validated["port"]
    scheme = validated["scheme"]

    base_url = f"{scheme}://{hostname}"
    if port not in (80, 443):
        base_url += f":{port}"

    # Determine scan type
    if validated["is_ip"]:
        scan_type = "ip"
    elif "." in hostname and len(hostname.split(".")) >= 2:
        scan_type = "domain"
    else:
        scan_type = "unknown"

    # DNS pre-check
    resolved_ip = resolve_dns(hostname)

    plan_ports = ports if ports is not None else DEFAULT_PORTS
    plan_paths = sensitive_paths if sensitive_paths is not None else SENSITIVE_PATHS

    plan = {
        "agent": "planner",
        "scan_id": scan_id,
        "target": hostname,
        "original_target": validated["original_target"],
        "base_url": base_url,
        "port": port,
        "scheme": scheme,
        "scan_type": scan_type,
        "resolved_ip": resolved_ip,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "scope": {
            "ports_to_check": plan_ports,
            "sensitive_paths": plan_paths,
            "web_checks": ["security_headers", "tls_certificate", "cookie_security", "exposed_resources", "mixed_content", "server_disclosure"],
            "total_port_checks": len(plan_ports),
            "total_path_checks": len(plan_paths),
        },
        "timeouts": {
            "per_check_seconds": timeout_per_check,
            "total_scan_seconds": total_timeout,
        },
        "agents": ["recon", "port_scanner", "web_auditor", "reporter"],
        "findings": [],
        "summary": f"Plan created for {scan_type} target {hostname}. {len(plan_ports)} ports, {len(plan_paths)} paths to check.",
    }

    return plan


class PlannerAgent:
    """Planning agent that validates targets and produces scan plans."""

    def __init__(self, target: str, scan_id: str, **kwargs):
        self.target = target
        self.scan_id = scan_id
        self.kwargs = kwargs

    def run(self) -> Dict[str, Any]:
        """Execute planning and return the scan plan."""
        print(f"[Planner] Validating target: {self.target}")
        plan = create_plan(self.target, self.scan_id, **self.kwargs)
        print(f"[Planner] Target type: {plan['scan_type']}, Resolved IP: {plan['resolved_ip']}")
        print(f"[Planner] Plan created successfully")
        return plan


def main():
    parser = argparse.ArgumentParser(description="Planner Agent - Target validation and scan planning")
    parser.add_argument("--target", required=True, help="Target hostname, IP, or URL")
    parser.add_argument("--scan-id", required=True, help="Unique scan identifier")
    parser.add_argument("--output", help="Output file path (default: stdout)")
    args = parser.parse_args()

    try:
        agent = PlannerAgent(args.target, args.scan_id)
        plan = agent.run()
        output = json.dumps(plan, indent=2)

        if args.output:
            with open(args.output, "w") as f:
                f.write(output)
            print(f"[Planner] Plan written to {args.output}")
        else:
            print(output)
    except ValueError as e:
        error_result = {
            "agent": "planner",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        error_result = {
            "agent": "planner",
            "error": f"Unexpected error: {str(e)}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
