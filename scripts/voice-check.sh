#!/usr/bin/env bash
# voice-check.sh — pre-commit gate against AI tropes, marketing-speak,
# Americanisms, and trade non-tells.
# Run from repo root. Greps body content only; ignores .git/, scripts/,
# CSS, and HTML attribute names (theme-color, text-center, etc.).
#
# Usage:  ./scripts/voice-check.sh
# Exit:   0 = pass, 1 = banned phrase found

set -u

# Files to scan: all HTML + Markdown + plain-text content
SCAN_TARGETS=()
while IFS= read -r -d $'\0' f; do SCAN_TARGETS+=("$f"); done < <(
  find . -type f \( -name "*.html" -o -name "*.md" -o -name "llms.txt" \) \
       -not -path "./.git/*" \
       -not -path "./scripts/*" \
       -not -path "./node_modules/*" \
       -print0
)

if [ ${#SCAN_TARGETS[@]} -eq 0 ]; then
  echo "No files to scan."; exit 0
fi

RED=$(tput setaf 1 2>/dev/null || echo "")
GRN=$(tput setaf 2 2>/dev/null || echo "")
YLW=$(tput setaf 3 2>/dev/null || echo "")
RST=$(tput sgr0 2>/dev/null || echo "")

FAIL=0
WARN=0

# ---------- Helper ----------
# Scan body text only — strips contents of <style>, <script>, and HTML attributes.
# Greps with -F (fixed string) and -w/-i variants as appropriate.
scan_text() {
  local label="$1"; shift
  local severity="$1"; shift  # FAIL or WARN
  local phrases=("$@")
  local hits=""

  for p in "${phrases[@]}"; do
    for f in "${SCAN_TARGETS[@]}"; do
      # Strip <style>...</style>, <script>...</script>, and HTML tag attributes,
      # then grep. This catches text users will read, ignores code.
      local body
      body=$(sed -E \
        -e 's|<style[^>]*>.*</style>||gI' \
        -e 's|<script[^>]*>.*</script>||gI' \
        -e 's|<[^>]+>||g' \
        "$f" 2>/dev/null | tr '[:upper:]' '[:lower:]')
      if echo "$body" | grep -F -q -- "$p"; then
        local lineno
        lineno=$(grep -niF -- "$p" "$f" 2>/dev/null | head -1 | cut -d: -f1 || echo "?")
        hits+="    $f:$lineno: '$p'"$'\n'
      fi
    done
  done

  if [ -n "$hits" ]; then
    if [ "$severity" = "FAIL" ]; then
      echo "${RED}✗ ${label}${RST}"; echo "$hits"; FAIL=1
    else
      echo "${YLW}⚠ ${label}${RST}"; echo "$hits"; WARN=1
    fi
  else
    echo "${GRN}✓ ${label}${RST}"
  fi
}

echo "Voice check — yvrgaragedoorsprings.ca"
echo "Scanning ${#SCAN_TARGETS[@]} files..."
echo ""

# ---------- AI tropes (immediate fail) ----------
scan_text "AI tropes" FAIL \
  "dive in" "dive deep" "leverage" "delve into" "delve" \
  "unlock" "game-changer" "game changer" "seamless" "robust" "cutting-edge" \
  "world-class" "best-in-class" "synergy" "holistic" "ecosystem" \
  "elevate your" "empower" "embark" "foster a " "unleash" "harness the" \
  "let's dive"

# ---------- Marketing-speak ----------
scan_text "Marketing-speak" FAIL \
  "solutions provider" "trusted partner" "customer-centric" "one-stop shop" \
  "peace of mind" "state-of-the-art" "top-of-the-line" "top-notch" \
  "exceeding expectations" "going the extra mile" "white-glove" "boutique"

# ---------- Conclusions / filler ----------
scan_text "Conclusions / filler" FAIL \
  "in conclusion" "to summarize" "to wrap up" "in summary" \
  "moreover" "furthermore" "ultimately" \
  "here's the thing" "at the end of the day" \
  "simply put" "needless to say"

# ---------- Trade non-tells ----------
scan_text "Trade non-tells" FAIL \
  "garage door system" "skilled craftsmen" "service professional" \
  "facilitate" "perform a repair" "your unit"

# ---------- Americanisms (warn — CSS keywords are exempt via stripping) ----------
scan_text "Americanisms (Canadian English check)" WARN \
  " color " " color." " color," " color;" " color:" \
  " neighborhood" " neighborhoods" \
  " center " " centers" \
  " behavior" " behaviors" \
  " organized" " organize " \
  "zip code"

# ---------- Placeholders that shouldn't ship ----------
scan_text "Unshippable placeholders" FAIL \
  "lorem ipsum" "todo:" "[placeholder]" "{placeholder}" "tk:"

# ---------- 555 test phone numbers ----------
PHONE_HITS=""
for f in "${SCAN_TARGETS[@]}"; do
  # Catch (604) 555-xxxx or 604-555-xxxx or 604.555.xxxx
  if grep -E -q '\(?604\)?[ .-]?555[ .-]?[0-9]{4}' "$f"; then
    PHONE_HITS+="    $f"$'\n'
  fi
done
if [ -n "$PHONE_HITS" ]; then
  echo "${RED}✗ 555 test phone numbers${RST}"
  echo "$PHONE_HITS"
  FAIL=1
else
  echo "${GRN}✓ 555 test phone numbers${RST}"
fi

# ---------- Summary ----------
echo ""
if [ $FAIL -ne 0 ]; then
  echo "${RED}Voice check FAILED.${RST} Fix the items above before committing."
  exit 1
elif [ $WARN -ne 0 ]; then
  echo "${YLW}Voice check passed with warnings.${RST} Review the items above."
  exit 0
else
  echo "${GRN}Voice check passed.${RST}"
  exit 0
fi
