#!/usr/bin/env python3
import os
import sys
import subprocess
opts = [
    "buildctl", "build",
    "--frontend", "dockerfile.v0",
    "--local", "context=.",
    "--local", "dockerfile=.",
]

# buildctl は import-cache が指定されたのに中身がないとエラーを吐いて死ぬので、その対処
if os.path.exists("./buildkit-cache/index.json"):
    opts += [
        "--import-cache",
        "type=local,src=./buildkit-cache"
    ]
else:
    print("WARNING: launch without import-cache, because buildkit-cache/index.json is not found", file=sys.stderr)

opts += [
    "--export-cache", "type=local,dest=./buildkit-cache",
    "--output", "type=docker,name=rinsuki/sea",
]

print(opts, file=sys.stderr)
print("-------------", file=sys.stderr)
res = subprocess.run(opts)
exit(res.returncode)