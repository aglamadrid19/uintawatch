#!/usr/bin/env python3
"""Generate UI concept images via the local antseed proxy."""
import json, sys, base64, urllib.request

PROXY = "http://localhost:8377/v1/images/generations"
KEY = "antseed"

def generate(model: str, prompt_path: str, out_path: str, size: str = "1024x1536") -> None:
    body = json.dumps({
        "model": model,
        "prompt": open(prompt_path).read(),
        "n": 1,
        "size": size,
    }).encode()
    import time
    last_err = None
    for attempt in range(6):
        req = urllib.request.Request(
            PROXY, data=body, method="POST",
            headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=600) as resp:
                data = json.loads(resp.read())
            break
        except urllib.error.HTTPError as e:
            last_err = e.read().decode()[:200]
            print(f"  attempt {attempt + 1} failed: {last_err}")
            time.sleep(3 * (attempt + 1))
    else:
        raise RuntimeError(f"all attempts failed: {last_err}")
    item = data["data"][0]
    if "b64_json" in item:
        open(out_path, "wb").write(base64.b64decode(item["b64_json"]))
        print(f"saved {out_path}")
    elif "url" in item:
        print(f"url: {item['url']}")
    else:
        print(f"unexpected: {json.dumps(data)[:300]}")

if __name__ == "__main__":
    model, prompt_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    size = sys.argv[4] if len(sys.argv) > 4 else "1024x1536"
    generate(model, prompt_path, out_path, size)
