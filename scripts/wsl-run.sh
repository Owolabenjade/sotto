#!/usr/bin/env bash
# Runs a command inside WSL Ubuntu from the repository root, with the pinned
# Node 22 and the Compact CLI on PATH. Used from Windows:
#   wsl.exe -d Ubuntu -- bash /mnt/c/Users/PAB-NETWORK/sotto/scripts/wsl-run.sh "npm test"
set -eo pipefail
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin"
cd "$(dirname "$0")/.."
exec bash -c "$*"
