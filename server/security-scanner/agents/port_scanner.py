#!/usr/bin/env python3
"""
Port Scanner Agent - Checks common ports on authorized targets.

Performs defensive port analysis on a configurable list of common service ports.
Captures service banners where available and flags sensitive services as
informational findings. Does NOT perform aggressive or high-volume scanning.

An open port = exposed service, NOT automatically a vulnerability.
"""

import argparse
import json
import socket
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple


# Common ports for defensive analysis — not exhaustive
DEFAULT_PORTS: List[Tuple[int, str, str]] = [
    (21, "FTP", "File Transfer Protocol - potentially sensitive if exposed"),
    (22, "SSH", "Secure Shell - remote administration service"),
    (23, "Telnet", "Telnet - INSECURE unencrypted remote access"),
    (25, "SMTP", "Simple Mail Transfer Protocol"),
    (53, "DNS", "Domain Name System"),
    (80, "HTTP", "Web Server"),
    (443, "HTTPS", "Secure Web Server"),
    (993, "IMAPS", "Secure IMAP"),
    (995, "POP3S", "Secure POP3"),
    (1433, "MSSQL", "Microsoft SQL Server - database service"),
    (1521, "Oracle", "Oracle Database - database service"),
    (3306, "MySQL", "MySQL Database - database service"),
    (3389, "RDP", "Remote Desktop Protocol - remote administration"),
    (5432, "PostgreSQL", "PostgreSQL Database - database service"),
    (5900, "VNC", "VNC Remote Access - remote administration"),
    (6379, "Redis", "Redis Cache - cache service"),
    (8080, "HTTP-Alt", "Alternative HTTP port"),
    (8443, "HTTPS-Alt", "Alternative HTTPS port"),
    (27017, "MongoDB", "MongoDB Database - database service"),
]

# Services that should typically NOT be publicly exposed
SENSITIVE_SERVICES = {"MySQL", "PostgreSQL", "MongoDB", "Redis", "MSSQL", "Oracle", "RDP", "VNC", "Telnet"}

# Default timeouts
CONNECT_TIMEOUT = 3.0
BANNER_TIMEOUT = 2.0
DEFAULT_TOTAL_TIMEOUT = 30.0


def check_port(
    hostname: str,
    port: int,
    connect_timeout: float = CONNECT_TIMEOUT,
    banner_timeout: float = BANNER_TIMEOUT,
) -> Dict[str, Any]:
    """
    Check a single port on the target host.

    Returns dict with port status, optional banner, and timing info.
    Never raises — errors are captured in the result.
    """
    result: Dict[str, Any] = {
        "port": port,
        "status": "closed",
        "banner": None,
        "error": None,
    }

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(connect_timeout)

        start_time = datetime.now(timezone.utc)
        connect_result = sock.connect_ex((hostname, port))
        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()

        if connect_result == 0:
            result["status"] = "open"
            result["connect_time_ms"] = round(elapsed * 1000, 2)

            # Attempt banner grab
            try:
                sock.settimeout(banner_timeout)
                sock.send(b"\r\n")
                banner_data = sock.recv(1024)
                banner = banner_data.decode("utf-8", errors="ignore").strip()[:200]
                if banner:
                    result["banner"] = banner
            except Exception:
                pass  # Banner grab is best-effort
        else:
            result["status"] = "closed"

        sock.close()

    except socket.timeout:
        result["status"] = "filtered"
        result["error"] = "timeout"
    except ConnectionRefusedError:
        result["status"] = "closed"
    except OSError as e:
        result["status"] = "error"
        result["error"] = str(e)[:100]
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)[:100]

    return result


def run_port_scan(
    hostname: str,
    scan_id: str,
    ports: List[Tuple[int, str, str]] = None,
    connect_timeout: float = CONNECT_TIMEOUT,
    total_timeout: float = DEFAULT_TOTAL_TIMEOUT,
) -> Dict[str, Any]:
    """
    Scan common ports on the target hostname.

    Returns structured findings including open ports, banners, and security notes.
    Respects total_timeout to prevent runaway scans.
    """
    if ports is None:
        ports = DEFAULT_PORTS

    print(f"[Port Scanner] Checking {len(ports)} common ports on {hostname}")

    scan_start = datetime.now(timezone.utc)
    open_ports: List[Dict[str, Any]] = []
    closed_count = 0
    filtered_count = 0
    error_count = 0
    findings: List[Dict[str, Any]] = []

    for port_num, service_name, description in ports:
        # Check total timeout
        elapsed = (datetime.now(timezone.utc) - scan_start).total_seconds()
        if elapsed > total_timeout:
            print(f"[Port Scanner] Total timeout reached after {elapsed:.1f}s, stopping early")
            break

        progress_pct = round((elapsed / total_timeout) * 100, 1) if total_timeout > 0 else 0
        print(f"[Port Scanner] Checking port {port_num} ({service_name})... [{progress_pct}%]")

        port_result = check_port(hostname, port_num, connect_timeout)

        if port_result["status"] == "open":
            entry = {
                "port": port_num,
                "service": service_name,
                "description": description,
                "banner": port_result.get("banner"),
                "connect_time_ms": port_result.get("connect_time_ms"),
            }
            open_ports.append(entry)
            print(f"[Port Scanner] Port {port_num} ({service_name}): OPEN")

            # Flag sensitive services
            if service_name in SENSITIVE_SERVICES:
                if service_name == "Telnet":
                    severity = "High"
                    title = f"Insecure Service Exposed: {service_name}"
                    impact = (
                        f"{service_name} transmits data including credentials in plaintext. "
                        f"Attackers can intercept communications."
                    )
                else:
                    severity = "Medium"
                    title = f"Exposed {service_name} Service"
                    impact = (
                        f"The {service_name} service is exposed to the network. "
                        f"Database and remote administration services should typically "
                        f"not be publicly accessible."
                    )

                findings.append({
                    "title": title,
                    "severity": severity,
                    "target": f"{hostname}:{port_num}",
                    "evidence": f"Port {port_num} ({service_name}) is open and accessible. {description}",
                    "impact": impact,
                    "remediation": (
                        f"Restrict access to port {port_num} using firewall rules. "
                        f"Ensure {service_name} is only accessible from trusted networks or via VPN."
                    ),
                    "status": "Open",
                })
            else:
                # Informational for standard services
                findings.append({
                    "title": f"Service Detected: {service_name}",
                    "severity": "Informational",
                    "target": f"{hostname}:{port_num}",
                    "evidence": f"Port {port_num} ({service_name}) is open." + (f" Banner: {port_result['banner'][:80]}" if port_result.get('banner') else ""),
                    "impact": "Identifies running services on the target.",
                    "remediation": "Verify this service is intentionally exposed and properly secured.",
                    "status": "Open",
                })

        elif port_result["status"] == "filtered":
            filtered_count += 1
        elif port_result["status"] == "error":
            error_count += 1
        else:
            closed_count += 1

    scan_end = datetime.now(timezone.utc)
    duration = (scan_end - scan_start).total_seconds()

    result = {
        "agent": "port_scanner",
        "target": hostname,
        "scan_id": scan_id,
        "timestamp": scan_end.isoformat(),
        "duration_seconds": round(duration, 2),
        "findings": findings,
        "data": {
            "open_ports": open_ports,
            "closed_count": closed_count,
            "filtered_count": filtered_count,
            "error_count": error_count,
            "total_checked": len(ports),
            "scan_completed": elapsed <= total_timeout,
        },
        "summary": (
            f"Port analysis complete: {len(open_ports)} open, "
            f"{closed_count} closed, {filtered_count} filtered, "
            f"{error_count} errors out of {len(ports)} ports checked."
        ),
    }

    print(f"[Port Scanner] Complete: {result['summary']}")
    return result


class PortScannerAgent:
    """Port analysis agent for checking common service ports."""

    def __init__(
        self,
        hostname: str,
        scan_id: str,
        ports: List[Tuple[int, str, str]] = None,
        connect_timeout: float = CONNECT_TIMEOUT,
        total_timeout: float = DEFAULT_TOTAL_TIMEOUT,
    ):
        self.hostname = hostname
        self.scan_id = scan_id
        self.ports = ports or DEFAULT_PORTS
        self.connect_timeout = connect_timeout
        self.total_timeout = total_timeout

    def run(self) -> Dict[str, Any]:
        """Execute port scan and return structured findings."""
        return run_port_scan(
            self.hostname,
            self.scan_id,
            self.ports,
            self.connect_timeout,
            self.total_timeout,
        )


def main():
    parser = argparse.ArgumentParser(description="Port Scanner Agent - Common port analysis")
    parser.add_argument("--target", required=True, help="Target hostname or IP")
    parser.add_argument("--scan-id", required=True, help="Unique scan identifier")
    parser.add_argument("--output", help="Output file path (default: stdout)")
    parser.add_argument("--timeout", type=float, default=CONNECT_TIMEOUT, help="Connection timeout per port in seconds")
    parser.add_argument("--total-timeout", type=float, default=DEFAULT_TOTAL_TIMEOUT, help="Total scan timeout in seconds")
    args = parser.parse_args()

    try:
        agent = PortScannerAgent(
            args.target,
            args.scan_id,
            connect_timeout=args.timeout,
            total_timeout=args.total_timeout,
        )
        result = agent.run()
        output = json.dumps(result, indent=2)

        if args.output:
            with open(args.output, "w") as f:
                f.write(output)
            print(f"[Port Scanner] Results written to {args.output}")
        else:
            print(output)
    except Exception as e:
        error_result = {
            "agent": "port_scanner",
            "target": args.target,
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "findings": [],
            "summary": f"Port scan failed: {str(e)}",
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
