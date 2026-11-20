"""
MG Security Scanner - Agent Modules

Each agent is importable as a module and runnable standalone.
Agents communicate via structured JSON output.
"""

from .planner import PlannerAgent
from .recon import ReconAgent
from .port_scanner import PortScannerAgent
from .web_auditor import WebAuditorAgent
from .reporter import ReporterAgent

__all__ = [
    "PlannerAgent",
    "ReconAgent",
    "PortScannerAgent",
    "WebAuditorAgent",
    "ReporterAgent",
]
