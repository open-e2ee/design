#!/usr/bin/env bash
#
# The design contract verifier for the UI redesign plan.
# Eighteen conditions, DC-V01 through DC-V18. Each one names its owning task.
# The schedule is docs/plans/proof/ui-redesign/verifier-schedule.md in the
# workspace. This script is the executable copy: add and drop nothing here
# without changing the schedule in the same pull request.
#
# Every condition guards on the artifact its owning task produces, so the whole
# set is red until that task lands. A condition that could pass before its task
# ran would prove nothing.
#
# Two modes. With no argument the script exits non-zero while any condition
# fails, which is what a task uses to capture its fail-before evidence and to
# prove its own conditions green. With --ratchet it compares the pass count
# against the number recorded in scripts/redesign-baseline/passing.txt and
# fails on any difference. CI runs the second mode, so a red condition set does
# not block unrelated work, and a task that turns conditions green must record
# the new count in the same commit. The count only ever rises.

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

passed=0
failed=0

check() {
  local id="$1" description="$2" fn="$3"
  if "$fn" >/dev/null 2>&1; then
    passed=$((passed + 1))
    printf 'PASS %s  %s\n' "$id" "$description"
  else
    failed=$((failed + 1))
    printf 'FAIL %s  %s\n' "$id" "$description"
  fi
}

DESIGN=DESIGN.md
ROLES=packages/design/dist/css/roles.css
BASELINE=scripts/redesign-baseline

part_two_exists() { grep -qE '^## Part II' "$DESIGN"; }
roles_exist() { test -f "$ROLES"; }

# --- UIR1.1, DESIGN.md Part II ------------------------------------------------

dc_v01() {
  grep -qE '^## Part I\b' "$DESIGN" && grep -qE '^## Part II\b' "$DESIGN"
}

dc_v02() {
  part_two_exists || return 1
  local body; body="$(sed -n '/^## Part II/,$p' "$DESIGN")"
  grep -q 'sidebar width' <<<"$body" &&
    grep -q 'collapsed rail' <<<"$body" &&
    grep -q 'sheet breakpoint' <<<"$body"
}

dc_v03() {
  part_two_exists || return 1
  local body; body="$(sed -n '/^## Part II/,$p' "$DESIGN")"
  grep -qE 'comfortable' <<<"$body" &&
    grep -qE 'compact' <<<"$body" &&
    grep -qE 'density' <<<"$body"
}

dc_v04() {
  part_two_exists || return 1
  local body term; body="$(sed -n '/^## Part II/,$p' "$DESIGN")"
  for term in identifier secret price count latency timestamp; do
    grep -qi "$term" <<<"$body" || return 1
  done
}

# The five states are the ones UIR1.1 defines, not a proxy word list. An
# earlier draft grepped 'error', 'partial', and 'success', none of which is a
# state name, so the condition could have passed on prose that named none of
# the five.
dc_v05() {
  part_two_exists || return 1
  local body state; body="$(sed -n '/^## Part II/,$p' "$DESIGN")"
  for state in 'loading' 'failed read' 'empty result' 'precondition unmet' \
    'filtered to nothing'; do
    grep -qi "$state" <<<"$body" || return 1
  done
}

dc_v06() {
  part_two_exists || return 1
  local body; body="$(sed -n '/^## Part II/,$p' "$DESIGN")"
  grep -q 'D4' <<<"$body" && grep -qi 'voice' <<<"$body"
}

dc_v07() {
  part_two_exists || return 1
  local body; body="$(sed -n '/^## Part II/,$p' "$DESIGN")"
  grep -q '44' <<<"$body" && grep -qi 'row' <<<"$body"
}

dc_v08() {
  part_two_exists || return 1
  local before
  before="$(sed -n '1,/^## Part II/p' "$DESIGN" | grep -E '^## ' | grep -vE '^## Part (I|II)\b')"
  diff <(printf '%s\n' "$before") "$BASELINE/design-headings.txt"
}

# --- UIR1.2, the role token layer ---------------------------------------------

dc_v09() {
  roles_exist || return 1
  local n
  n="$(grep -cE '^\s*--oe-ground-[a-z0-9-]+:' "$ROLES")"; [ "$n" -eq 4 ] || return 1
  n="$(grep -cE '^\s*--oe-border-[a-z0-9-]+:' "$ROLES")"; [ "$n" -eq 3 ] || return 1
  n="$(grep -cE '^\s*--oe-text-[a-z0-9-]+:' "$ROLES")"; [ "$n" -eq 4 ]
}

dc_v10() {
  roles_exist || return 1
  grep -qE '^\s*--oe-accent:' "$ROLES" &&
    grep -qE '^\s*--oe-accent-hover:' "$ROLES" &&
    grep -qE '^\s*--oe-accent-ink:' "$ROLES" &&
    grep -qE '^\s*--oe-accent-link:' "$ROLES"
}

dc_v11() {
  roles_exist || return 1
  local semantic
  for semantic in success warning danger info; do
    grep -qE "^\s*--oe-${semantic}:" "$ROLES" || return 1
    grep -qE "^\s*--oe-${semantic}-tint:" "$ROLES" || return 1
    grep -qE "^\s*--oe-${semantic}-ink:" "$ROLES" || return 1
  done
}

dc_v12() {
  roles_exist || return 1
  grep -qE '^\s*--color-\*:\s*initial;' "$ROLES" &&
    grep -qE '^\s*--radius-\*:\s*initial;' "$ROLES" &&
    grep -qE '^\s*--color-white:' "$ROLES" &&
    grep -qE '^\s*--color-black:' "$ROLES" &&
    grep -qE '^\s*--color-transparent:' "$ROLES" &&
    grep -qE '^\s*--color-current:' "$ROLES"
}

dc_v13() {
  roles_exist || return 1
  grep -qE '^@theme inline' "$ROLES"
}

dc_v14() {
  roles_exist || return 1
  local n
  n="$(grep -c ':focus-visible' "$ROLES")"
  [ "$n" -eq 1 ]
}

# --- UIR1.3, the measured hue map ---------------------------------------------

dc_v15() {
  test -x scripts/measure-role-hues.mjs || test -f scripts/measure-role-hues.mjs || return 1
  node scripts/measure-role-hues.mjs --assert-separation 25
}

dc_v16() {
  test -f scripts/measure-role-hues.mjs || return 1
  node scripts/measure-role-hues.mjs --assert-tint-offset
}

# --- UIR1.4, diagram token contrast -------------------------------------------

dc_v17() {
  test -f scripts/measure-diagram-contrast.mjs || return 1
  node scripts/measure-diagram-contrast.mjs --assert-minimum 3
}

# --- UIR1.5, the release --------------------------------------------------------

dc_v18() {
  roles_exist || return 1
  git describe --tags --exact-match HEAD >/dev/null 2>&1 || return 1
  npm run check
}

# --- self-assertions -----------------------------------------------------------
#
# A verifier nothing runs is not a verifier. These two say so out loud, and they
# are not among the eighteen conditions.

self_ci() { grep -q 'verify-design-contract.sh' .github/workflows/ci.yml; }
self_readme() { grep -q 'verify-design-contract.sh' README.md; }

if ! self_ci; then
  echo 'FAIL self  .github/workflows/ci.yml does not run this script' >&2
  exit 2
fi
if ! self_readme; then
  echo 'FAIL self  README.md does not name this script' >&2
  exit 2
fi

check DC-V01 'UIR1.1  DESIGN.md carries a Part I heading and a Part II heading' dc_v01
check DC-V02 'UIR1.1  Part II states the sidebar, rail, and sheet measures' dc_v02
check DC-V03 'UIR1.1  Part II names two density modes and their surfaces' dc_v03
check DC-V04 'UIR1.1  Part II states the display grammar for six value kinds' dc_v04
check DC-V05 'UIR1.1  Part II names the five interface states' dc_v05
check DC-V06 'UIR1.1  Part II states the voice rule and cites D4' dc_v06
check DC-V07 'UIR1.1  Part II reconciles the 44 px minimum with dense rows' dc_v07
check DC-V08 'UIR1.1  Part I keeps its heading set' dc_v08
check DC-V09 'UIR1.2  Four grounds, three border weights, four text steps' dc_v09
check DC-V10 'UIR1.2  The accent carries hover, ink, and link companions' dc_v10
check DC-V11 'UIR1.2  Four semantics, each with a solid, a tint, and an ink' dc_v11
check DC-V12 'UIR1.2  The palette is wiped and only the roles are re-added' dc_v12
check DC-V13 'UIR1.2  The roles emit through @theme inline' dc_v13
check DC-V14 'UIR1.2  Exactly one global :focus-visible rule' dc_v14
check DC-V15 'UIR1.3  Information and warning clear their neighbors by 25 degrees' dc_v15
check DC-V16 'UIR1.3  Every semantic tint sits at one lightness offset' dc_v16
check DC-V17 'UIR1.4  Every diagram token measures 3:1 or better' dc_v17
check DC-V18 'UIR1.5  The release tag exists and the build is clean' dc_v18

printf 'Summary: %d passed, %d failed\n' "$passed" "$failed"

if [ "${1:-}" = '--ratchet' ]; then
  recorded="$(cat "$BASELINE/passing.txt")"
  if [ "$passed" -ne "$recorded" ]; then
    printf 'Ratchet: %s records %s passed, this run reports %d.\n' \
      "$BASELINE/passing.txt" "$recorded" "$passed" >&2
    printf 'A task that changes the count records it in the same commit.\n' >&2
    exit 1
  fi
  exit 0
fi

[ "$failed" -eq 0 ]
