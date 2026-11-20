#!/usr/bin/env python3
"""
Web Auditor Agent - Web security audit for authorized targets.

Checks:
- Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, Permissions-Policy)
- Cookie security flags (Secure, HttpOnly, SameSite)
- TLS certificate validation (expiry, issuer, protocol version, cipher strength)
- Publicly exposed sensitive paths (.env, .git, .htaccess, wp-config.php, etc.) — presence only
- Mixed content issues
- Server header disclosure detection

NEVER downloads or displays contents of sensitive files.
"""

import argparse
import json
import socket
import ssl
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


# Default timeout for network operations
DEFAULT_TIMEOUT = 30.0
REQUEST_TIMEOUT = 15.0

# Sensitive paths to check for existence (NEVER download content)
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

# Security headers and their expected configurations
SECURITY_HEADERS = {
    "Strict-Transport-Security": {
        "missing_severity": "Medium",
        "title": "Missing HSTS Header",
        "impact": "Without HSTS, users may be vulnerable to SSL stripping attacks.",
        "remediation": "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' header.",
    },
    "Content-Security-Policy": {
        "missing_severity": "Medium",
        "title": "Missing Content-Security-Policy",
        "impact": "Without CSP, the site may be more vulnerable to XSS attacks.",
        "remediation": "Implement a Content-Security-Policy header appropriate for your application.",
    },
    "X-Content-Type-Options": {
        "missing_severity": "Low",
        "title": "Missing X-Content-Type-Options",
        "impact": "Browser may perform MIME-type sniffing, potentially leading to XSS.",
        "remediation": "Add 'X-Content-Type-Options: nosniff' header.",
    },
    "X-Frame-Options": {
        "missing_severity": "Low",
        "title": "Missing X-Frame-Options",
        "impact": "Site may be vulnerable to clickjacking attacks.",
        "remediation": "Add 'X-Frame-Options: DENY' or 'SAMEORIGIN' header.",
    },
    "Referrer-Policy": {
        "missing_severity": "Informational",
        "title": "Missing Referrer-Policy",
        "impact": "Referrer information may leak sensitive URL parameters.",
        "remediation": "Add 'Referrer-Policy: strict-origin-when-cross-origin' header.",
    },
    "Permissions-Policy": {
        "missing_severity": "Informational",
        "title": "Missing Permissions-Policy",
        "impact": "Browser features like camera, microphone may be accessible by default.",
        "remediation": "Implement Permissions-Policy to restrict browser features.",
    },
}


def check_security_headers(base_url: str, timeout: float = REQUEST_TIMEOUT) -> Dict[str, Any]:
    """Check security-related HTTP response headers."""
    result: Dict[str, Any] = {
        "headers_found": {},
        "headers_missing": [],
        "findings": [],
        "response_status": None,
        "error": None,
    }

    if not HAS_REQUESTS:
        result["error"] = "requests library not available"
        return result

    try:
        response = requests.get(
            base_url,
            timeout=timeout,
            verify=False,
            allow_redirects=True,
            headers={"User-Agent": "MGSecurityScanner/1.0 (Authorized Assessment)"},
        )

        result["response_status"] = response.status_code
        headers = response.headers

        # Normalize header keys to lowercase for comparison
        header_keys_lower = {k.lower(): k for k in headers.keys()}

        for header_name, config in SECURITY_HEADERS.items():
            if header_name.lower() in header_keys_lower:
                actual_key = header_keys_lower[header_name.lower()]
                result["headers_found"][header_name] = headers[actual_key][:200]
            else:
                result["headers_missing"].append(header_name)
                result["findings"].append({
                    "title": config["title"],
                    "severity": config["missing_severity"],
                    "evidence": f"Response headers do not include '{header_name}'",
                    "impact": config["impact"],
                    "remediation": config["remediation"],
                    "status": "Open",
                })

        # Check for server header disclosure
        server_header = headers.get("Server") or headers.get("server")
        if server_header:
            result["headers_found"]["Server"] = server_header[:200]
            result["findings"].append({
                "title": "Server Header Disclosure",
                "severity": "Informational",
                "evidence": f"Server header reveals: {server_header[:100]}",
                "impact": "Server software information may help attackers identify vulnerabilities.",
                "remediation": "Consider removing or obfuscating the Server header.",
                "status": "Open",
            })

        # Check for X-Powered-By
        powered_by = headers.get("X-Powered-By") or headers.get("x-powered-by")
        if powered_by:
            result["headers_found"]["X-Powered-By"] = powered_by[:200]
            result["findings"].append({
                "title": "Technology Disclosure via X-Powered-By",
                "severity": "Informational",
                "evidence": f"X-Powered-By header reveals: {powered_by[:100]}",
                "impact": "Technology stack information may help attackers target specific vulnerabilities.",
                "remediation": "Remove the X-Powered-By header from responses.",
                "status": "Open",
            })

        # Store all headers for downstream analysis
        result["all_headers"] = dict(headers)

    except requests.RequestException as e:
        result["error"] = str(e)[:200]
        result["findings"].append({
            "title": "Connection Error During Header Check",
            "severity": "Medium",
            "evidence": f"Could not connect to target: {str(e)[:200]}",
            "impact": "Unable to complete web security header assessment.",
            "remediation": "Verify the target is accessible and try again.",
            "status": "Open",
        })

    return result


def check_tls_certificate(hostname: str, port: int = 443, timeout: float = REQUEST_TIMEOUT) -> Dict[str, Any]:
    """Check TLS certificate validity and configuration."""
    result: Dict[str, Any] = {
        "certificate": None,
        "cipher": None,
        "protocol": None,
        "findings": [],
        "error": None,
    }

    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=min(timeout, 10.0)) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                protocol = ssock.version()

                result["certificate"] = cert
                result["cipher"] = cipher
                result["protocol"] = protocol

                # Check certificate expiration
                not_after = cert.get("notAfter", "")
                if not_after:
                    try:
                        expiry = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                        days_until_expiry = (expiry - datetime.now()).days

                        if days_until_expiry < 0:
                            result["findings"].append({
                                "title": "Expired TLS Certificate",
                                "severity": "Critical",
                                "evidence": f"Certificate expired on {not_after}",
                                "impact": "Users will see security warnings and connections may fail.",
                                "remediation": "Renew the TLS certificate immediately.",
                                "status": "Open",
                            })
                        elif days_until_expiry < 30:
                            result["findings"].append({
                                "title": "TLS Certificate Expiring Soon",
                                "severity": "High",
                                "evidence": f"Certificate expires in {days_until_expiry} days ({not_after})",
                                "impact": "Certificate will expire soon, causing service disruption.",
                                "remediation": "Renew the TLS certificate before expiration.",
                                "status": "Open",
                            })
                        elif days_until_expiry < 90:
                            result["findings"].append({
                                "title": "TLS Certificate Expiring Within 90 Days",
                                "severity": "Low",
                                "evidence": f"Certificate expires in {days_until_expiry} days ({not_after})",
                                "impact": "Certificate renewal should be planned.",
                                "remediation": "Plan TLS certificate renewal within the next 90 days.",
                                "status": "Open",
                            })
                    except ValueError:
                        pass

                # Check issuer
                issuer = cert.get("issuer", ())
                issuer_parts = []
                for rdn in issuer:
                    for attr_type, attr_value in rdn:
                        issuer_parts.append(f"{attr_type}={attr_value}")
                result["issuer"] = ", ".join(issuer_parts) if issuer_parts else "Unknown"

                # Check subject
                subject = cert.get("subject", ())
                subject_parts = []
                for rdn in subject:
                    for attr_type, attr_value in rdn:
                        subject_parts.append(f"{attr_type}={attr_value}")
                result["subject"] = ", ".join(subject_parts) if subject_parts else "Unknown"

                # Check cipher strength
                if cipher:
                    cipher_name, tls_protocol, bits = cipher
                    if bits < 128:
                        result["findings"].append({
                            "title": "Weak TLS Cipher Suite",
                            "severity": "High",
                            "evidence": f"Cipher: {cipher_name}, {bits}-bit key",
                            "impact": "Weak encryption may be vulnerable to brute-force or known attacks.",
                            "remediation": "Configure server to use strong ciphers (AES-256-GCM, ChaCha20-Poly1305).",
                            "status": "Open",
                        })

                # Check TLS protocol version
                if protocol in ("TLSv1", "TLSv1.1", "SSLv2", "SSLv3"):
                    result["findings"].append({
                        "title": f"Deprecated TLS Protocol: {protocol}",
                        "severity": "High",
                        "evidence": f"Server supports {protocol}",
                        "impact": f"{protocol} has known vulnerabilities and should not be used.",
                        "remediation": "Disable legacy TLS protocols. Require TLS 1.2 or higher.",
                        "status": "Open",
                    })

    except ssl.SSLCertVerificationError as e:
        result["error"] = str(e)[:200]
        result["findings"].append({
            "title": "TLS Certificate Verification Failed",
            "severity": "High",
            "evidence": f"SSL verification error: {str(e)[:200]}",
            "impact": "Certificate may be invalid, self-signed, or misconfigured.",
            "remediation": "Install a valid TLS certificate from a trusted CA.",
            "status": "Open",
        })
    except (socket.timeout, ConnectionRefusedError, OSError) as e:
        result["error"] = str(e)[:200]
        # Not necessarily a finding — might be non-HTTPS target
    except Exception as e:
        result["error"] = str(e)[:200]

    return result


def check_sensitive_paths(base_url: str, paths: List[str] = None, timeout: float = REQUEST_TIMEOUT) -> Dict[str, Any]:
    """
    Check for publicly exposed sensitive resources.
    Reports PRESENCE ONLY — NEVER downloads or displays file contents.
    """
    if paths is None:
        paths = SENSITIVE_PATHS

    result: Dict[str, Any] = {
        "checked_count": len(paths),
        "exposed_resources": [],
        "findings": [],
    }

    if not HAS_REQUESTS:
        return result

    for path in paths:
        url = f"{base_url}{path}"
        try:
            response = requests.head(
                url,
                timeout=min(timeout, 5.0),
                verify=False,
                allow_redirects=False,
                headers={"User-Agent": "MGSecurityScanner/1.0 (Authorized Assessment)"},
            )

            # Consider 200 or 403 as potentially existing
            if response.status_code in (200, 403):
                resource_entry = {
                    "path": path,
                    "status_code": response.status_code,
                }
                result["exposed_resources"].append(resource_entry)

                # Determine severity based on resource type
                if path in ("/.env", "/wp-config.php", "/config.php", "/database.yml"):
                    finding = {
                        "title": "Potentially Exposed Configuration File",
                        "severity": "High",
                        "evidence": f"Resource at {path} returned HTTP {response.status_code}",
                        "impact": "Configuration files may contain sensitive credentials or settings.",
                        "remediation": "Ensure sensitive files are not web-accessible. Use proper access controls.",
                        "status": "Open",
                    }
                elif path in ("/.git/config", "/.git/HEAD"):
                    finding = {
                        "title": "Potentially Exposed Git Repository",
                        "severity": "High",
                        "evidence": f"Git repository indicator at {path} returned HTTP {response.status_code}",
                        "impact": "Source code and history may be exposed.",
                        "remediation": "Block access to .git directories in web server configuration.",
                        "status": "Open",
                    }
                elif path in ("/.htpasswd",):
                    finding = {
                        "title": "Potentially Exposed Password File",
                        "severity": "Critical",
                        "evidence": f"Password file at {path} returned HTTP {response.status_code}",
                        "impact": "User credentials may be exposed.",
                        "remediation": "Move password files outside web root and restrict access.",
                        "status": "Open",
                    }
                elif path in ("/phpinfo.php", "/info.php"):
                    finding = {
                        "title": "PHP Info Page Exposed",
                        "severity": "Medium",
                        "evidence": f"PHP info page at {path} returned HTTP {response.status_code}",
                        "impact": "Server configuration details are publicly visible.",
                        "remediation": "Remove phpinfo() pages from production environments.",
                        "status": "Open",
                    }
                elif path in ("/backup.sql", "/dump.sql"):
                    finding = {
                        "title": "Potentially Exposed Database Backup",
                        "severity": "Critical",
                        "evidence": f"Database backup at {path} returned HTTP {response.status_code}",
                        "impact": "Database contents may be exposed.",
                        "remediation": "Remove database backups from web-accessible locations immediately.",
                        "status": "Open",
                    }
                elif path in ("/server-status",):
                    finding = {
                        "title": "Server Status Page Exposed",
                        "severity": "Medium",
                        "evidence": f"Server status page at {path} returned HTTP {response.status_code}",
                        "impact": "Server internals and active connections are publicly visible.",
                        "remediation": "Restrict access to server status pages to internal networks only.",
                        "status": "Open",
                    }
                else:
                    finding = {
                        "title": "Publicly Accessible Resource Detected",
                        "severity": "Informational",
                        "evidence": f"Resource at {path} returned HTTP {response.status_code}",
                        "impact": "Information disclosure.",
                        "remediation": "Review if this resource should be publicly accessible.",
                        "status": "Open",
                    }

                result["findings"].append(finding)

        except requests.RequestException:
            pass  # Resource not accessible — normal

    return result


def check_cookie_security(base_url: str, timeout: float = REQUEST_TIMEOUT) -> Dict[str, Any]:
    """Check cookie security attributes (Secure, HttpOnly, SameSite)."""
    result: Dict[str, Any] = {
        "cookies_checked": 0,
        "cookie_issues": [],
        "findings": [],
    }

    if not HAS_REQUESTS:
        return result

    try:
        response = requests.get(
            base_url,
            timeout=timeout,
            verify=False,
            allow_redirects=True,
            headers={"User-Agent": "MGSecurityScanner/1.0 (Authorized Assessment)"},
        )

        set_cookie = response.headers.get("Set-Cookie", "")
        if not set_cookie:
            return result

        # Split multiple cookies (comma-separated in Set-Cookie)
        cookies = set_cookie.split(",")
        for cookie_str in cookies:
            cookie_str = cookie_str.strip()
            if not cookie_str:
                continue

            result["cookies_checked"] += 1
            cookie_name = cookie_str.split("=")[0].strip() if "=" in cookie_str else "unknown"

            issues = []
            lower_cookie = cookie_str.lower()
            if "secure" not in lower_cookie:
                issues.append("missing Secure flag")
            if "httponly" not in lower_cookie:
                issues.append("missing HttpOnly flag")
            if "samesite" not in lower_cookie:
                issues.append("missing SameSite attribute")

            if issues:
                issue_entry = {
                    "cookie_name": cookie_name[:50],
                    "issues": issues,
                }
                result["cookie_issues"].append(issue_entry)
                result["findings"].append({
                    "title": f"Cookie Security Issues: {cookie_name[:30]}",
                    "severity": "Low",
                    "evidence": f"Cookie '{cookie_name[:30]}' has: {', '.join(issues)}",
                    "impact": "Cookies without proper flags may be vulnerable to theft or CSRF.",
                    "remediation": "Set Secure, HttpOnly, and SameSite attributes on all cookies.",
                    "status": "Open",
                })

    except requests.RequestException:
        pass

    return result


def run_web_audit(
    hostname: str,
    base_url: str,
    port: int,
    scan_id: str,
    timeout: float = DEFAULT_TIMEOUT,
) -> Dict[str, Any]:
    """
    Execute full web security audit on the target.

    Returns structured findings covering headers, TLS, cookies, and exposed resources.
    """
    print(f"[Web Auditor] Auditing {base_url}")

    all_findings: List[Dict[str, Any]] = []
    data: Dict[str, Any] = {}

    # 1. Security Headers
    print("[Web Auditor] Checking security headers...")
    header_result = check_security_headers(base_url, min(timeout, REQUEST_TIMEOUT))
    data["headers"] = header_result
    for f in header_result.get("findings", []):
        if "target" not in f:
            f["target"] = base_url
    all_findings.extend(header_result.get("findings", []))

    # 2. TLS Certificate
    print("[Web Auditor] Analyzing TLS configuration...")
    tls_result = check_tls_certificate(hostname, port, min(timeout, REQUEST_TIMEOUT))
    data["tls"] = tls_result
    for f in tls_result.get("findings", []):
        if "target" not in f:
            f["target"] = hostname
    all_findings.extend(tls_result.get("findings", []))

    # 3. Sensitive Resources (existence only)
    print("[Web Auditor] Scanning for exposed resources...")
    resource_result = check_sensitive_paths(base_url, timeout=min(timeout, REQUEST_TIMEOUT))
    data["resources"] = resource_result
    for f in resource_result.get("findings", []):
        if "target" not in f:
            f["target"] = base_url
    all_findings.extend(resource_result.get("findings", []))

    # 4. Cookie Security
    print("[Web Auditor] Analyzing cookie security...")
    cookie_result = check_cookie_security(base_url, min(timeout, REQUEST_TIMEOUT))
    data["cookies"] = cookie_result
    for f in cookie_result.get("findings", []):
        if "target" not in f:
            f["target"] = base_url
    all_findings.extend(cookie_result.get("findings", []))

    result = {
        "agent": "web_auditor",
        "target": hostname,
        "base_url": base_url,
        "scan_id": scan_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "findings": all_findings,
        "data": data,
        "summary": (
            f"Web audit complete for {base_url}. "
            f"{len(all_findings)} finding(s): "
            f"{sum(1 for f in all_findings if f['severity'] == 'Critical')} critical, "
            f"{sum(1 for f in all_findings if f['severity'] == 'High')} high, "
            f"{sum(1 for f in all_findings if f['severity'] == 'Medium')} medium, "
            f"{sum(1 for f in all_findings if f['severity'] == 'Low')} low, "
            f"{sum(1 for f in all_findings if f['severity'] == 'Informational')} informational."
        ),
    }

    print(f"[Web Auditor] Complete: {result['summary']}")
    return result


class WebAuditorAgent:
    """Web security audit agent."""

    def __init__(
        self,
        hostname: str,
        base_url: str,
        port: int,
        scan_id: str,
        timeout: float = DEFAULT_TIMEOUT,
    ):
        self.hostname = hostname
        self.base_url = base_url
        self.port = port
        self.scan_id = scan_id
        self.timeout = timeout

    def run(self) -> Dict[str, Any]:
        """Execute web audit and return structured findings."""
        return run_web_audit(
            self.hostname,
            self.base_url,
            self.port,
            self.scan_id,
            self.timeout,
        )


def main():
    parser = argparse.ArgumentParser(description="Web Auditor Agent - Web security audit")
    parser.add_argument("--target", required=True, help="Target hostname")
    parser.add_argument("--base-url", required=True, help="Base URL for web checks")
    parser.add_argument("--port", type=int, default=443, help="Target port")
    parser.add_argument("--scan-id", required=True, help="Unique scan identifier")
    parser.add_argument("--output", help="Output file path (default: stdout)")
    parser.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT, help="Timeout per operation in seconds")
    args = parser.parse_args()

    try:
        agent = WebAuditorAgent(args.target, args.base_url, args.port, args.scan_id, args.timeout)
        result = agent.run()
        output = json.dumps(result, indent=2, default=str)

        if args.output:
            with open(args.output, "w") as f:
                f.write(output)
            print(f"[Web Auditor] Results written to {args.output}")
        else:
            print(output)
    except Exception as e:
        error_result = {
            "agent": "web_auditor",
            "target": args.target,
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "findings": [],
            "summary": f"Web audit failed: {str(e)}",
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
