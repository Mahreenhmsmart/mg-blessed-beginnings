# Security Scanner Reports

This directory stores generated security assessment reports.

## Report Structure

Each scan creates a subdirectory named by scan ID containing:
- `status.json` - Real-time scan status for frontend polling
- `plan.json` - Scan plan from Planner agent
- `recon.json` - Reconnaissance data
- `ports.json` - Port analysis results
- `headers.json` - HTTP header analysis
- `tls.json` - TLS certificate information
- `resources.json` - Exposed resource check results
- `summary.json` - JSON summary with score and findings
- `report.md` - Full Markdown report

## Report Contents

Reports include:
- Executive Summary
- Authorization confirmation
- Scope definition
- Findings with severity (Critical, High, Medium, Low, Informational)
- Evidence and remediation guidance
- Methodology description
- Limitations disclaimer

## Security

- Reports never contain credentials, API keys, or secret values
- Sensitive file contents are never included
- User isolation enforced at API level
