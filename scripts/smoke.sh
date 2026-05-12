#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cat > "$tmp_dir/article.html" <<'HTML'
<!doctype html>
<html>
  <head><title>Smoke Article</title></head>
  <body>
    <h1>Smoke Article</h1>
    <p>A <strong>local-first</strong> conversion smoke.</p>
  </body>
</html>
HTML

node src/cli/index.js convert --input "$tmp_dir/article.html" --output "$tmp_dir/article.md"
test -s "$tmp_dir/article.md"
grep -q 'Smoke Article' "$tmp_dir/article.md"
grep -q '\*\*local-first\*\*' "$tmp_dir/article.md"

node src/cli/index.js convert --html '<h1>Inline Smoke</h1><p>A <em>fast</em> local conversion.</p>' > "$tmp_dir/inline.md"
test -s "$tmp_dir/inline.md"
grep -q 'Inline Smoke' "$tmp_dir/inline.md"
grep -q '_fast_' "$tmp_dir/inline.md"

mkdir -p "$tmp_dir/html/nested"
cp "$tmp_dir/article.html" "$tmp_dir/html/nested/article.html"
node src/cli/index.js batch --input "$tmp_dir/html" --output "$tmp_dir/markdown" >/tmp/marksmith-smoke.log
test -s "$tmp_dir/markdown/nested/article.md"
grep -q 'Converted 1 HTML file to Markdown' /tmp/marksmith-smoke.log

printf 'Smoke converted single-file and nested batch HTML fixtures.\n'
