# Security Scanner Agents

This directory contains documentation for the five-agent security assessment workflow.

## Agent Workflow

1. **Planner** (`scanner.py::run_planner`)
   - Validates target format and scope
   - Creates scan plan with agent sequence
   - Performs initial DNS resolution check

2. **Recon** (`scanner.py::run_recon`)
   - Gathers public information (IP, reverse DNS)
   - Documents target infrastructure
   - No active probing beyond DNS

3. **Port Scanner** (`scanner.py::run_port_scanner`)
   - Checks configured common ports only
   - Identifies exposed services
   - Flags sensitive services (databases, remote admin) as findings
   - Does NOT perform aggressive or stealth scanning

4. **Web Auditor** (`scanner.py::run_web_auditor`)
   - Analyzes security headers (HSTS, CSP, X-Frame-Options, etc.)
   - Checks TLS certificate validity and configuration
   - Verifies cookie security attributes
   - Checks for exposed sensitive resources (existence only, no content download)
   - Reports "Potentially exposed sensitive resource detected" without exposing secrets

5. **Reporter** (`scanner.py::run_reporter`)
   - Generates Markdown report with all findings
   - Calculates security score based on findings
   - Includes executive summary, methodology, limitations
   - Never includes credentials, API keys, or secret values

## Safety Controls

- Target validation prevents shell injection
- No credential attacks or exploitation
- No stealth/evasion techniques
- No destructive testing
- Sensitive file contents never downloaded or displayed
- Rate limiting enforced at API level
