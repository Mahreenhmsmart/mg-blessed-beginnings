# MG Security Scanner

Authorized security assessment tool for websites and systems you own or have explicit permission to test.

## ⚠️ IMPORTANT AUTHORIZATION NOTICE

**This scanner must ONLY be used for:**
- Websites and domains you own
- Systems you have explicit written authorization to test
- IP addresses and infrastructure under your control

**Unauthorized scanning is illegal and unethical.** Always obtain proper authorization before conducting any security assessment.

## Overview

The MG Security Scanner performs authorized defensive security assessments through a five-agent workflow:

1. **Planner** - Validates target scope and creates scan plan
2. **Recon** - Gathers public information about the target
3. **Port Scanner** - Analyzes common service ports (authorized only)
4. **Web Auditor** - Checks security headers, TLS, cookies, exposed resources
5. **Reporter** - Generates comprehensive security report with findings

## Cross-Platform Compatibility

The scanner includes automatic OS and runtime environment detection for maximum compatibility:

### Supported Platforms

| Platform | Python Detection | Notes |
|----------|------------------|-------|
| Linux | `python3` → `python` | Standard paths checked |
| macOS | `python3` → Homebrew paths | `/usr/local/bin`, `/opt/homebrew/bin` |
| Windows (WSL) | WSL-aware detection | Uses Linux Python in WSL context |
| Windows (Git Bash) | `py -3` → path search | MSYS2/Cygwin compatible |
| FreeBSD | `python3` → `python` | Standard BSD paths |
| Docker/Kubernetes | Container-aware | Detects containerized environments |

### Environment Variables

Override auto-detection with these optional variables:

```bash
PYTHON_CMD=python3.11      # Force specific Python command
SCANNER_TIMEOUT=600        # Custom timeout (default: 300s)
VERBOSE=1                  # Enable debug output
```

### Usage Examples

```bash
# Standard usage (auto-detects environment)
./run.sh --target example.com --scan-id abc123 --output ./reports/abc123

# With custom Python version
PYTHON_CMD=python3.11 ./run.sh --target example.com --scan-id abc123 --output ./reports/abc123

# Verbose mode for debugging
VERBOSE=1 ./run.sh --target example.com --scan-id abc123 --output ./reports/abc123

# Legacy positional arguments
./run.sh example.com abc123 ./reports/abc123
```

## Output

Reports are generated in Markdown format containing:
- Executive Summary
- Scope and Authorization confirmation
- Findings with severity (Critical, High, Medium, Low, Informational)
- Evidence and remediation guidance
- Scan methodology and limitations

## Safety Controls

- Target validation prevents malformed input
- Shell injection protection via safe argument handling
- No credential attacks, exploitation, or destructive testing
- No stealth/evasion techniques
- Rate limiting enforced at API level
- Per-user scan isolation
- Automatic timeout enforcement (5 minutes default)

## Requirements

- Python 3.8+
- Required packages: `requests`, `dnspython` (optional but recommended)

Install dependencies:
```bash
pip install requests dnspython
```

## Architecture

The scanner operates as an isolated module within the MG Business Intelligence Platform platform:

```
Website Intelligence Center
        ↓
🔎 SEO & AEO Audit
        ↓
🛡️ Security Audit ← This scanner (isolated)
        ↓
🔗 Backlink Intelligence
        ↓
👀 Competitor Intelligence
        ↓
📊 Unified Website Report
```

Security functionality remains properly isolated from other audit components, maintaining zero external dependencies beyond the Python standard library and optional `requests`/`dnspython` packages.
