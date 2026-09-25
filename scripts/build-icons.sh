#!/bin/sh
# Rebuilds every app icon from assets/logo.svg. Needs `rsvg-convert` (brew install librsvg) and Pillow.
set -e
cd "$(dirname "$0")/.."

rsvg-convert -w 192 assets/logo.svg -o public/icon-192.png
rsvg-convert -w 512 assets/logo.svg -o public/icon-512.png
rsvg-convert -w 180 assets/logo.svg -o public/apple-icon.png
rsvg-convert -w 256 assets/logo.svg -o /tmp/logo-256.png

python3 - <<'PY'
from PIL import Image

# iOS masks apple-touch-icon with its own squircle; flattening onto the tile colour
# keeps the transparent corners from rendering as black.
apple = Image.open("public/apple-icon.png").convert("RGBA")
Image.alpha_composite(Image.new("RGBA", apple.size, "#4a7c59"), apple).convert("RGB").save("public/apple-icon.png")

Image.open("/tmp/logo-256.png").save("app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
PY
