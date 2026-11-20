#!/usr/bin/env python3
"""
Reconnaissance Agent - Passive information gathering on authorized targets.

Performs:
- DNS resolution (A, AAAA, MX, TXT, NS records)
- Subdomain enumeration from publicly available sources
- Technology fingerprinting from HTTP headers
- WHOIS-style registration data where available
- Reverse DNS lookup

All operations are passive and non-intrusive.
"""

import argparse
import json
import socket
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

try:
    import dns.resolver
    HAS_DNSPYTHON = True
except ImportError:
    HAS_DNSPYTHON = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


# Default timeout for all network operations
DEFAULT_TIMEOUT = 30.0


def resolve_dns_records(hostname: str, timeout: float = DEFAULT_TIMEOUT) -> Dict[str, Any]:
    """
    Resolve DNS records for a hostname.
    Uses dnspython if available, falls back to socket.gethostbyname.
    """
    results: Dict[str, Any] = {
        "hostname": hostname,
        "records": {},
        "errors": [],
    }

    if HAS_DNSPYTHON:
        resolver = dns.resolver.Resolver()
        resolver.timeout = min(timeout, 10.0)
        resolver.lifetime = min(timeout, 10.0)

        record_types = ["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA"]
        for rtype in record_types:
            try:
                answers = resolver.resolve(hostname, rtype)
                records = []
                for rdata in answers:
                    records.append(str(rdata))
                results["records"][rtype] = records
            except dns.resolver.NoAnswer:
                pass
            except dns.resolver.NXDOMAIN:
                results["errors"].append(f"NXDOMAIN for {rtype}")
            except dns.resolver.NoNameservers:
                results["errors"].append(f"No nameservers for {rtype}")
            except dns.exception.Timeout:
                results["errors"].append(f"Timeout resolving {rtype}")
            except Exception as e:
                results["errors"].append(f"{rtype}: {str(e)[:100]}")
    else:
        # Fallback: basic A record via socket
        try:
            ip = socket.gethostbyname(hostname)
            results["records"]["A"] = [ip]
        except socket.gaierror as e:
            results["errors"].append(f"A record resolution failed: {str(e)[:100]}")

    return results


def reverse_dns_lookup(ip_address: str, timeout: float = DEFAULT_TIMEOUT) -> Optional[str]:
    """Perform reverse DNS lookup on an IP address."""
    try:
        old_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(min(timeout, 10.0))
        result = socket.gethostbyaddr(ip_address)
        socket.setdefaulttimeout(old_timeout)
        return result[0]
    except (socket.herror, socket.gaierror, socket.timeout, OSError):
        return None


def fingerprint_technology(base_url: str, timeout: float = DEFAULT_TIMEOUT) -> Dict[str, Any]:
    """
    Fingerprint web technologies from HTTP response headers.
    Does NOT download page content — only inspects headers.
    """
    tech_info: Dict[str, Any] = {
        "headers": {},
        "technologies": [],
        "server_info": None,
    }

    if not HAS_REQUESTS:
        return tech_info

    try:
        response = requests.get(
            base_url,
            timeout=min(timeout, 15.0),
            verify=False,
            allow_redirects=True,
            headers={"User-Agent": "MGSecurityScanner/1.0 (Authorized Assessment)"},
        )

        headers = dict(response.headers)
        tech_info["headers"] = headers
        tech_info["status_code"] = response.status_code

        # Server header
        server = headers.get("Server", headers.get("server"))
        if server:
            tech_info["server_info"] = server[:200]

        # X-Powered-By
        powered_by = headers.get("X-Powered-By", headers.get("x-powered-by"))
        if powered_by:
            tech_info["technologies"].append({
                "name": powered_by[:100],
                "source": "X-Powered-By header",
            })

        # Common technology indicators from headers
        header_indicators = {
            "X-AspNet-Version": "ASP.NET",
            "X-AspNetMvc-Version": "ASP.NET MVC",
            "X-Generator": "CMS/Framework",
            "X-Drupal-Cache": "Drupal",
            "X-Joomla-Version": "Joomla",
            "X-WP-Total": "WordPress",
            "Via": "Proxy/CDN",
            "X-Varnish": "Varnish Cache",
            "CF-RAY": "Cloudflare",
            "X-Served-By": "Fastly/CDN",
            "X-Amz-Cf-Id": "Amazon CloudFront",
            "X-Azure-Ref": "Azure CDN",
        }

        for header_key, tech_name in header_indicators.items():
            if header_key in headers or header_key.lower() in [h.lower() for h in headers.keys()]:
                value = headers.get(header_key, "")
                tech_info["technologies"].append({
                    "name": tech_name,
                    "source": f"{header_key} header",
                    "value": str(value)[:100] if value else None,
                })

    except requests.RequestException as e:
        tech_info["error"] = str(e)[:200]

    return tech_info


def enumerate_subdomains_ct(hostname: str, timeout: float = DEFAULT_TIMEOUT) -> List[str]:
    """
    Enumerate subdomains using Certificate Transparency logs (crt.sh).
    This is a passive, public-source lookup.
    """
    subdomains: List[str] = []

    if not HAS_REQUESTS:
        return subdomains

    try:
        url = f"https://crt.sh/?q=%.{hostname}&output=json"
        response = requests.get(url, timeout=min(timeout, 20.0))

        if response.status_code == 200:
            entries = response.json()
            seen = set()
            for entry in entries:
                name_value = entry.get("name_value", "")
                for name in name_value.split("\n"):
                    name = name.strip().lower()
                    if name and name.endswith(f".{hostname}") and name not in seen:
                        seen.add(name)
                        subdomains.append(name)

            # Sort and limit
            subdomains.sort()
            subdomains = subdomains[:100]  # Limit to prevent excessive output

    except (requests.RequestException, json.JSONDecodeError, KeyError):
        pass

    return subdomains


def run_recon(target: str, base_url: str, scan_id: str, timeout: float = DEFAULT_TIMEOUT) -> Dict[str, Any]:
    """
    Execute full reconnaissance on the target.

    Returns structured findings as JSON-compatible dict.
    """
    print(f"[Recon] Gathering information about {target}")

    result: Dict[str, Any] = {
        "agent": "recon",
        "target": target,
        "scan_id": scan_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "findings": [],
        "data": {},
        "summary": "",
    }

    # 1. DNS Resolution
    print("[Recon] Resolving DNS records...")
    dns_data = resolve_dns_records(target, timeout)
    result["data"]["dns"] = dns_data

    resolved_ip = None
    a_records = dns_data.get("records", {}).get("A", [])
    if a_records:
        resolved_ip = a_records[0]
        print(f"[Recon] Resolved IP: {resolved_ip}")
    else:
        print("[Recon] Could not resolve A record")

    # 2. Reverse DNS
    if resolved_ip:
        print("[Recon] Performing reverse DNS lookup...")
        reverse = reverse_dns_lookup(resolved_ip, timeout)
        result["data"]["reverse_dns"] = reverse
        if reverse and reverse != target:
            print(f"[Recon] Reverse DNS: {reverse}")

    # 3. Technology Fingerprinting
    print("[Recon] Fingerprinting web technologies...")
    tech_data = fingerprint_technology(base_url, timeout)
    result["data"]["technology"] = tech_data

    if tech_data.get("server_info"):
        result["findings"].append({
            "title": "Server Software Identified",
            "severity": "Informational",
            "target": base_url,
            "evidence": f"Server header: {tech_data['server_info']}",
            "impact": "Server software disclosure may help attackers identify known vulnerabilities.",
            "remediation": "Consider removing or obfuscating the Server header.",
            "status": "Open",
        })

    if tech_data.get("technologies"):
        for tech in tech_data["technologies"]:
            result["findings"].append({
                "title": f"Technology Detected: {tech['name']}",
                "severity": "Informational",
                "target": base_url,
                "evidence": f"Detected via {tech['source']}" + (f": {tech.get('value', '')}" if tech.get('value') else ""),
                "impact": "Technology stack information aids attacker reconnaissance.",
                "remediation": "Remove unnecessary technology disclosure headers.",
                "status": "Open",
            })

    # 4. Subdomain Enumeration (passive CT logs)
    print("[Recon] Enumerating subdomains from certificate transparency logs...")
    subdomains = enumerate_subdomains_ct(target, timeout)
    result["data"]["subdomains"] = subdomains
    if subdomains:
        print(f"[Recon] Found {len(subdomains)} subdomain(s)")
        result["findings"].append({
            "title": "Subdomains Discovered",
            "severity": "Informational",
            "target": target,
            "evidence": f"Found {len(subdomains)} subdomain(s) via certificate transparency logs: {', '.join(subdomains[:10])}" + ("..." if len(subdomains) > 10 else ""),
            "impact": "Additional attack surface may exist on discovered subdomains.",
            "remediation": "Review all subdomains for proper security controls and decommission unused ones.",
            "status": "Open",
        })

    # 5. DNS error analysis
    if dns_data.get("errors"):
        for error in dns_data["errors"]:
            if "NXDOMAIN" not in error and "NoAnswer" not in error:
                result["findings"].append({
                    "title": "DNS Resolution Issue",
                    "severity": "Low",
                    "target": target,
                    "evidence": error,
                    "impact": "DNS misconfiguration may affect service availability.",
                    "remediation": "Review DNS configuration and ensure all required records are properly configured.",
                    "status": "Open",
                })

    result["summary"] = (
        f"Reconnaissance complete for {target}. "
        f"IP: {resolved_ip or 'unresolved'}, "
        f"{len(subdomains)} subdomain(s), "
        f"{len(tech_data.get('technologies', []))} technologie(s) detected."
    )
    print(f"[Recon] Complete: {result['summary']}")

    return result


class ReconAgent:
    """Reconnaissance agent for passive information gathering."""

    def __init__(self, target: str, base_url: str, scan_id: str, timeout: float = DEFAULT_TIMEOUT):
        self.target = target
        self.base_url = base_url
        self.scan_id = scan_id
        self.timeout = timeout

    def run(self) -> Dict[str, Any]:
        """Execute reconnaissance and return structured findings."""
        return run_recon(self.target, self.base_url, self.scan_id, self.timeout)


def main():
    parser = argparse.ArgumentParser(description="Recon Agent - Passive information gathering")
    parser.add_argument("--target", required=True, help="Target hostname")
    parser.add_argument("--base-url", required=True, help="Base URL for web checks")
    parser.add_argument("--scan-id", required=True, help="Unique scan identifier")
    parser.add_argument("--output", help="Output file path (default: stdout)")
    parser.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT, help="Timeout per operation in seconds")
    args = parser.parse_args()

    try:
        agent = ReconAgent(args.target, args.base_url, args.scan_id, args.timeout)
        result = agent.run()
        output = json.dumps(result, indent=2)

        if args.output:
            with open(args.output, "w") as f:
                f.write(output)
            print(f"[Recon] Results written to {args.output}")
        else:
            print(output)
    except Exception as e:
        error_result = {
            "agent": "recon",
            "target": args.target,
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "findings": [],
            "summary": f"Recon failed: {str(e)}",
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
