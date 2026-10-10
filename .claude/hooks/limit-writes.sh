#!/usr/bin/env bash
# Blocks a write outside the directory that the first argument names.
# Claude Code runs it as a PreToolUse hook for Edit and Write.
set -uo pipefail

allowed="${1:?limit-writes.sh: the allowed directory is missing}"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
path="$(jq -r '.tool_input.file_path // empty' 2>/dev/null)"

if [[ -z "$path" ]]; then
  echo "limit-writes.sh: the tool input has no file_path." >&2
  exit 2
fi

[[ "$path" != /* ]] && path="$root/$path"

# A ".." segment can leave the directory, so the hook does not resolve it.
if [[ "/$path/" == */../* ]]; then
  echo "Write only in $allowed/. Do not use '..' in the path: $path" >&2
  exit 2
fi

case "$path" in
  "$root/${allowed%/}"/*) exit 0 ;;
esac

echo "Write only in $allowed/. Blocked: $path" >&2
exit 2
