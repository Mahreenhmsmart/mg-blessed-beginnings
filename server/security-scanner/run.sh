#!/usr/bin/env bash
# =============================================================================
# MG Security Scanner Runner Script
# =============================================================================
# Cross-platform runner with dynamic OS and runtime environment detection.
# Adapts Python invocation based on detected platform to ensure compatibility
# across Linux, macOS, Windows (WSL/Git Bash/Cygwin), and container environments.
#
# Usage:
#   ./run.sh --target <value> --scan-id <value> --output <path>
#   ./run.sh <target> <scan_id> <output_dir>  (legacy positional args)
#
# Environment Variables (optional):
#   PYTHON_CMD       Override auto-detected Python command
#   SCANNER_TIMEOUT  Timeout in seconds (default: 300)
#   VERBOSE          Set to "1" for debug output
# =============================================================================

# Exit on error, undefined variables, and pipeline failures
set -euo pipefail

# ── OS & Runtime Detection ─────────────────────────────────────────────────────

detect_os() {
    local os_type="unknown"
    local os_arch="unknown"
    local os_kernel="unknown"
    local python_cmd=""
    local is_container="false"
    local is_wsl="false"

    # Detect kernel type
    os_kernel="$(uname -s 2>/dev/null || echo 'Unknown')"
    os_arch="$(uname -m 2>/dev/null || echo 'unknown')"

    case "$os_kernel" in
        Linux*)
            os_type="linux"
            # Check for WSL
            if grep -qi microsoft /proc/version 2>/dev/null; then
                is_wsl="true"
                os_type="wsl"
            fi
            # Check for container environment
            if [ -f /.dockerenv ] || grep -qE '(docker|lxc|kubepods)' /proc/1/cgroup 2>/dev/null; then
                is_container="true"
            fi
            ;;
        Darwin*)
            os_type="macos"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            os_type="windows"
            ;;
        FreeBSD*)
            os_type="freebsd"
            ;;
        *)
            os_type="unknown"
            ;;
    esac

    # Auto-detect Python command based on OS
    if [ -n "${PYTHON_CMD:-}" ]; then
        python_cmd="$PYTHON_CMD"
    else
        # Try python3 first, then python, then platform-specific paths
        if command -v python3 >/dev/null 2>&1; then
            python_cmd="python3"
        elif command -v python >/dev/null 2>&1; then
            python_cmd="python"
        else
            # Platform-specific fallbacks
            case "$os_type" in
                macos)
                    # macOS may have python3 via Homebrew or Xcode
                    if [ -x /usr/local/bin/python3 ]; then
                        python_cmd="/usr/local/bin/python3"
                    elif [ -x /opt/homebrew/bin/python3 ]; then
                        python_cmd="/opt/homebrew/bin/python3"
                    fi
                    ;;
                linux|wsl)
                    # Common Linux paths
                    for path in /usr/bin/python3 /usr/local/bin/python3; do
                        if [ -x "$path" ]; then
                            python_cmd="$path"
                            break
                        fi
                    done
                    ;;
                windows)
                    # Windows paths (Git Bash/MSYS2)
                    if command -v py >/dev/null 2>&1; then
                        python_cmd="py -3"
                    elif [ -x "/c/Python3*/python.exe" ] 2>/dev/null; then
                        python_cmd="$(ls /c/Python3*/python.exe 2>/dev/null | head -1)"
                    fi
                    ;;
            esac
        fi
    fi

    # Export detected values
    export DETECTED_OS="$os_type"
    export DETECTED_ARCH="$os_arch"
    export DETECTED_KERNEL="$os_kernel"
    export DETECTED_CONTAINER="$is_container"
    export DETECTED_WSL="$is_wsl"
    export PYTHON_COMMAND="${python_cmd:-python3}"

    if [ "${VERBOSE:-0}" = "1" ]; then
        echo "[Runner] Detected OS: $os_type ($os_kernel $os_arch)"
        echo "[Runner] Container: $is_container, WSL: $is_wsl"
        echo "[Runner] Python command: $PYTHON_COMMAND"
    fi
}

# Perform detection
detect_os

# Verify Python is available
if ! command -v "$PYTHON_COMMAND" >/dev/null 2>&1; then
    echo "Error: Python not found. Tried: $PYTHON_COMMAND" >&2
    echo "Please install Python 3.8+ or set PYTHON_CMD environment variable." >&2
    exit 1
fi

# ── Path Resolution ────────────────────────────────────────────────────────────

# Get script directory in a cross-platform way
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
SCANNER="${SCRIPT_DIR}/scanner.py"

# Handle Windows-style paths if needed
case "$DETECTED_OS" in
    windows)
        # Convert to Unix-style paths for Git Bash/MSYS2
        SCANNER="$(cygpath -u "$SCANNER" 2>/dev/null || echo "$SCANNER")"
        ;;
esac

# ── Argument Parsing ───────────────────────────────────────────────────────────

TARGET=""
SCAN_ID=""
OUTPUT_DIR=""

# Parse arguments — support both flag-based and positional usage
while [[ $# -gt 0 ]]; do
    case "$1" in
        --target)
            TARGET="$2"
            shift 2
            ;;
        --scan-id)
            SCAN_ID="$2"
            shift 2
            ;;
        --output|--output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --help|-h)
            echo "MG Security Scanner Runner"
            echo ""
            echo "Usage:"
            echo "  $0 --target <hostname> --scan-id <uuid> --output <directory>"
            echo "  $0 <hostname> <uuid> <directory>  (positional)"
            echo ""
            echo "Options:"
            echo "  --target      Target hostname, IP, or URL to scan"
            echo "  --scan-id     Unique identifier for this scan"
            echo "  --output      Output directory for scan results"
            echo "  --help        Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  PYTHON_CMD       Override Python command (default: auto-detect)"
            echo "  SCANNER_TIMEOUT  Scan timeout in seconds (default: 300)"
            echo "  VERBOSE          Set to '1' for debug output"
            echo ""
            echo "Detected Environment:"
            echo "  OS: $DETECTED_OS ($DETECTED_KERNEL $DETECTED_ARCH)"
            echo "  Python: $PYTHON_COMMAND"
            exit 0
            ;;
        -*)
            echo "Error: Unknown option '$1'" >&2
            echo "Usage: $0 --target <value> --scan-id <value> --output <path>" >&2
            exit 1
            ;;
        *)
            # Positional fallback: target scan_id output_dir
            if [[ -z "$TARGET" ]]; then
                TARGET="$1"
            elif [[ -z "$SCAN_ID" ]]; then
                SCAN_ID="$1"
            elif [[ -z "$OUTPUT_DIR" ]]; then
                OUTPUT_DIR="$1"
            else
                echo "Error: Too many positional arguments" >&2
                exit 1
            fi
            shift
            ;;
    esac
done

# ── Validation ─────────────────────────────────────────────────────────────────

if [[ -z "$TARGET" ]]; then
    echo "Error: --target is required" >&2
    echo "Usage: $0 --target <value> --scan-id <value> --output <path>" >&2
    exit 1
fi

if [[ -z "$SCAN_ID" ]]; then
    echo "Error: --scan-id is required" >&2
    exit 1
fi

if [[ -z "$OUTPUT_DIR" ]]; then
    echo "Error: --output is required" >&2
    exit 1
fi

# Sanitize inputs — reject shell metacharacters
sanitize() {
    local val="$1"
    if [[ "$val" =~ [;\|'\"\$\`\(\)\{\}\\!] ]]; then
        echo "Error: Input contains disallowed characters" >&2
        exit 1
    fi
    echo "$val"
}

TARGET="$(sanitize "$TARGET")"
SCAN_ID="$(sanitize "$SCAN_ID")"
OUTPUT_DIR="$(sanitize "$OUTPUT_DIR")"

# ── Setup ──────────────────────────────────────────────────────────────────────

# Create output directory safely (cross-platform mkdir)
mkdir -p "$OUTPUT_DIR" 2>/dev/null || {
    # Fallback for restricted environments
    if [ ! -d "$OUTPUT_DIR" ]; then
        echo "Error: Cannot create output directory: $OUTPUT_DIR" >&2
        exit 1
    fi
}

# Verify scanner exists
if [[ ! -f "$SCANNER" ]]; then
    echo "Error: Scanner not found at $SCANNER" >&2
    exit 1
fi

# ── Execution ──────────────────────────────────────────────────────────────────

# Set up signal handling for graceful shutdown
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo "[Runner] Scanner exited with code: $exit_code" >&2
    fi
    exit $exit_code
}
trap cleanup EXIT

# Determine timeout command based on OS
TIMEOUT_CMD=""
TIMEOUT_SECONDS="${SCANNER_TIMEOUT:-300}"

case "$DETECTED_OS" in
    linux|wsl)
        if command -v timeout >/dev/null 2>&1; then
            TIMEOUT_CMD="timeout ${TIMEOUT_SECONDS}s"
        fi
        ;;
    macos)
        # macOS may have gtimeout from coreutils
        if command -v gtimeout >/dev/null 2>&1; then
            TIMEOUT_CMD="gtimeout ${TIMEOUT_SECONDS}s"
        elif command -v timeout >/dev/null 2>&1; then
            TIMEOUT_CMD="timeout ${TIMEOUT_SECONDS}s"
        fi
        ;;
    freebsd)
        if command -v timeout >/dev/null 2>&1; then
            TIMEOUT_CMD="timeout ${TIMEOUT_SECONDS}s"
        fi
        ;;
esac

# Build the command
SCANNER_ARGS="--target $TARGET --scan-id $SCAN_ID --output-dir $OUTPUT_DIR"

if [ "${VERBOSE:-0}" = "1" ]; then
    echo "[Runner] Executing: $PYTHON_COMMAND $SCANNER $SCANNER_ARGS"
    echo "[Runner] Timeout: ${TIMEOUT_SECONDS}s"
fi

# Execute with or without timeout wrapper
if [ -n "$TIMEOUT_CMD" ]; then
    exec $TIMEOUT_CMD "$PYTHON_COMMAND" "$SCANNER" $SCANNER_ARGS
else
    exec "$PYTHON_COMMAND" "$SCANNER" $SCANNER_ARGS
fi
