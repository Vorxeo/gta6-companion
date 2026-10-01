"""Fetch the animation-bearing source locally; never redistribute it as a raw asset.

Geometry: CC0. Animations: Adobe Mixamo terms. See assets/ATTRIBUTION.md.
Only the compiled game is published, not this animation library.
"""
import hashlib
from pathlib import Path
from urllib.request import urlopen

REVISION = "bdecdcd537b4031fdd0fb299b7e4f93f084fffa0"
URL = f"https://raw.githubusercontent.com/ibrews/VitruvianGodot/{REVISION}/godot_project/vitruvian_body.glb"
SHA256 = "e9e002e2443672285c2d4306804addbba654c41953022865e4342b1bfad05b2a"
target = Path(__file__).parent / "assets" / "vitruvian_body.glb"
if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == SHA256:
    print("Character source already present; checksum verified.")
else:
    with urlopen(URL, timeout=60) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != SHA256:
        raise SystemExit("Character checksum mismatch; existing file was not changed.")
    target.write_bytes(data)
    print("Character source downloaded and checksum verified.")
