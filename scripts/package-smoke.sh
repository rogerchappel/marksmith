#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

cd "$ROOT_DIR"
npm pack --pack-destination "$TMP_DIR" >/dev/null
PACKAGE_TGZ="$(find "$TMP_DIR" -maxdepth 1 -name 'marksmith-*.tgz' -print -quit)"
test -n "$PACKAGE_TGZ"

mkdir -p "$TMP_DIR/app"
cd "$TMP_DIR/app"
npm init -y >/dev/null
npm install "$PACKAGE_TGZ" >/dev/null

npx marksmith --help >/dev/null
npx marksmith convert --html '<h1>Pack Smoke</h1><p>A <strong>packaged</strong> conversion.</p>' > "$TMP_DIR/output.md"
grep -q 'Pack Smoke' "$TMP_DIR/output.md"
grep -q '\*\*packaged\*\*' "$TMP_DIR/output.md"
