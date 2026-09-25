#!/bin/zsh
# Usage: ./generate.sh <model> <output.png> <prompt-file>
set -euo pipefail
MODEL="$1"; OUT="$2"; PROMPT_FILE="$3"
PROMPT=$(cat "$PROMPT_FILE")
PAYLOAD=$(python3 -c "
import json, sys
print(json.dumps({
    'model': sys.argv[1],
    'prompt': open(sys.argv[2]).read(),
    'n': 1,
    'size': '1024x1536'
}))" "$MODEL" "$PROMPT_FILE")
RESP=$(curl -s -X POST http://localhost:8377/v1/images/generations \
  -H "Authorization: Bearer antseed" \
  -H "Content-Type: application/json" \
  --data "$PAYLOAD")
echo "$RESP" | python3 -c "
import json, sys, base64
d = json.load(sys.stdin)
item = d['data'][0]
if 'b64_json' in item:
    open(sys.argv[1], 'wb').write(base64.b64decode(item['b64_json']))
    print('saved', sys.argv[1])
elif 'url' in item:
    print('URL:', item['url'])
else:
    print('UNEXPECTED:', json.dumps(d)[:500])
" "$OUT"
