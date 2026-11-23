"""Smooth movement rule: no place moves up or down more than MAX_MOVE spots
from the previous edition, whatever its score says. Applies to every scored ranking.

Base order = score (total desc; ties keep the current order). Then, position
by position, the best-scored place whose window (prev ± MAX_MOVE) includes the
spot takes it, as long as everyone else can still fit theirs. New places can
go anywhere. Nothing about the cap is stored or shown publicly; the dry run lists
who was held ([tope]). Idempotent.
Usage: python -I smooth.py <worktree> [--dry]"""
import json, os, re, sys

MAX_MOVE = 5
os.chdir(sys.argv[1])
dry = "--dry" in sys.argv

p = "src/rankings.js"
s = open(p, encoding="utf-8").read()
changed = False
for m in re.finditer(r"\n  (\w[\w-]*): (\[.*?\n  \]),\n", s, re.S):
    pass  # (cities are parsed below in one go)

head = "export const RANKINGS = {\n"
start = s.index(head) + len(head)
end = s.index("\n};", start)
body = "{\n" + s[start:end] + "\n}"
# keys are bare identifiers; quote them for json
body_json = re.sub(r"^  (\w[\w-]*): ", r'  "\1": ', body, flags=re.M)
cities = json.loads(re.sub(r",\s*}$", "}", body_json))

for city, cats in cities.items():
    for c in cats:
        items = c["items"]
        if not all("score" in it for it in items):
            continue
        base = sorted(enumerate(items), key=lambda t: (-t[1]["score"]["total"], t[0]))
        base = [it for _, it in base]
        for it in base:
            it["score"].pop("capped", None)
        n = len(base)
        rank = {id(it): i for i, it in enumerate(base)}

        def window(it):
            prev = it["score"].get("prev")
            if not prev:  # new on the list: anywhere
                return 1, n
            return max(1, prev - MAX_MOVE), min(n, prev + MAX_MOVE)

        def feasible(rest, pos):
            # Earliest-deadline-first: can every remaining place still land
            # inside its window, filling pos..n?
            rest = list(rest)
            for p in range(pos, n + 1):
                ready = [it for it in rest if window(it)[0] <= p]
                if not ready:
                    return False
                it = min(ready, key=lambda x: window(x)[1])
                if window(it)[1] < p:
                    return False
                rest.remove(it)
            return True

        remaining = list(base)
        final = []
        for pos in range(1, n + 1):
            # Best score that fits here and still lets everyone else fit.
            for it in sorted(remaining, key=lambda x: rank[id(x)]):
                lo, hi = window(it)
                if lo <= pos <= hi and feasible([x for x in remaining if x is not it], pos + 1):
                    break
            else:
                raise SystemExit(f"no valid order for {c['id']}")
            remaining.remove(it)
            final.append(it)
        capped = set()
        # Capped = its score alone would have moved it more than MAX_MOVE spots.
        for i, it in enumerate(final, 1):
            prev = it["score"].get("prev")
            if not prev:
                continue
            assert abs(i - prev) <= MAX_MOVE, (c["id"], it["name"])
            if abs(rank[id(it)] + 1 - prev) > MAX_MOVE:
                capped.add(id(it))
        moved = [(i, it["name"], it["score"]["prev"], it["score"]["total"])
                 for i, it in enumerate(final, 1) if id(it) in capped]
        before = {it["name"]: i for i, it in enumerate(items, 1)}
        print(f"{city}/{c['id']}:")
        for i, it in enumerate(final, 1):
            b = before[it["name"]]
            if b != i or id(it) in capped:
                print(f"   {b:2} -> {i:2}  {it['score']['total']:5}  prev {it['score'].get('prev')}  {it['name']}"
                      + ("  [tope]" if id(it) in capped else ""))
        if [it["name"] for it in final] != [it["name"] for it in items] or moved:
            changed = True
        c["items"] = final

if not dry:
    out = json.dumps(cities, ensure_ascii=False, indent=2)
    out = re.sub(r'^  "(\w+)": ', r"  \1: ", out, flags=re.M)
    s = s[:start] + out[2:-2] + "," + s[end:]
    open(p, "w", encoding="utf-8", newline="\n").write(s)
    print("written")
