"""Smooth movement rule: no place drops more than MAX_DROP spots from the
previous edition, whatever its score says. Applies to every scored ranking.

Base order = score (total desc; ties keep the current order). Then, position
by position: if a place would otherwise fall past its floor (prev + MAX_DROP),
it takes the spot (earliest floor first); otherwise the best remaining score
goes. Places held up by the rule get score.capped = true. Idempotent.
Usage: python -I smooth.py <worktree> [--dry]"""
import json, os, re, sys

MAX_DROP = 5
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
        remaining = list(base)
        final = []
        for pos in range(1, n + 1):
            due = [it for it in remaining
                   if it["score"].get("prev") and it["score"]["prev"] + MAX_DROP <= pos]
            if due:
                pick = min(due, key=lambda it: (it["score"]["prev"], remaining.index(it)))
            else:
                pick = remaining[0]
            remaining.remove(pick)
            final.append(pick)
        # Held up by the rule = sits higher than its score alone would put it.
        base_pos = {id(it): i for i, it in enumerate(base, 1)}
        for i, it in enumerate(final, 1):
            if i < base_pos[id(it)]:
                it["score"]["capped"] = True
        for i, it in enumerate(final, 1):
            prev = it["score"].get("prev")
            assert not prev or i <= prev + MAX_DROP, (c["id"], it["name"])
        moved = [(i, it["name"], it["score"]["prev"], it["score"]["total"])
                 for i, it in enumerate(final, 1) if it["score"].get("capped")]
        before = {it["name"]: i for i, it in enumerate(items, 1)}
        print(f"{city}/{c['id']}:")
        for i, it in enumerate(final, 1):
            b = before[it["name"]]
            if b != i or it["score"].get("capped"):
                print(f"   {b:2} -> {i:2}  {it['score']['total']:5}  prev {it['score'].get('prev')}  {it['name']}"
                      + ("  [tope]" if it["score"].get("capped") else ""))
        if [it["name"] for it in final] != [it["name"] for it in items] or moved:
            changed = True
        c["items"] = final

if not dry:
    out = json.dumps(cities, ensure_ascii=False, indent=2)
    out = re.sub(r'^  "(\w+)": ', r"  \1: ", out, flags=re.M)
    s = s[:start] + out[2:-2] + "," + s[end:]
    open(p, "w", encoding="utf-8", newline="\n").write(s)
    print("written")
