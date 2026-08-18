#!/usr/bin/env bash
# WhatsApp Profile Checker API — curl + jq example. Docs: https://docs.numberchecker.ai/whatsapp-bulk-number-checker-avatar
set -euo pipefail
BASE_URL="https://api.numberchecker.ai"; API_KEY="${NUMBERCHECKER_API_KEY:-}"; if [[ -z "$API_KEY" ]]; then echo "NUMBERCHECKER_API_KEY is required" >&2; exit 2; fi; TASK_TYPE="ws_avatar"; INPUT_FILE="${1:-examples/numbers.txt}"
created=$(curl --fail-with-body -sS "$BASE_URL/v1/tasks" -H "X-API-Key: $API_KEY" -F "file=@$INPUT_FILE" -F "task_type=$TASK_TYPE"); task_id=$(jq -r .task_id <<<"$created"); echo "task_id: $task_id"
while :; do task=$(curl --fail-with-body -sS "$BASE_URL/v1/gettasks" -H "X-API-Key: $API_KEY" -F "task_id=$task_id"); status=$(jq -r .status <<<"$task"); echo "status: $status"; [[ "$status" == exported ]] && break; [[ "$status" == failed ]] && exit 1; sleep 5; done
url=$(jq -r .result_url <<<"$task"); [[ "$url" != null && -n "$url" ]] && curl --fail-with-body -sS -L "$url" -o results.zip
