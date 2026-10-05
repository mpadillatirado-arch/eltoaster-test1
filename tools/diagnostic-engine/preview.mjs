/**
 * Renders a diagnostic payload to an HTML file you can open in a browser, and
 * exercises the validation gate so a regression in it is obvious.
 *
 *   node tools/diagnostic-engine/preview.mjs
 *   node tools/diagnostic-engine/preview.mjs path/to/payload.json
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { renderDiagnosticEmail, validate } from "./render-email.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const input = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : resolve(here, "sample-tortas-paquime.json");

const payload = JSON.parse(readFileSync(input, "utf8"));

const { subject, html, bytes } = renderDiagnosticEmail(payload, {
  unsubscribeUrl: "https://example.supabase.co/functions/v1/unsubscribe?id=preview",
});

const out = resolve(here, "preview-output.html");
writeFileSync(out, html, "utf8");

console.log(`Subject: ${subject}`);
console.log(`Size:    ${(bytes / 1024).toFixed(1)}KB  (Gmail clips over ~102KB)`);
console.log(`Written: ${out}`);

/* ---- the gate is the whole point of this engine, so prove it still bites --- */

console.log("\nValidation gate:");

const cases = [
  [
    "a finding with no quote",
    (p) => {
      p.research.findings[0].quotes = [];
    },
  ],
  [
    "a quote pinned to a location that was never researched",
    (p) => {
      p.research.findings[0].quotes[0].location = "Some Other Restaurant, Tucson";
    },
  ],
  [
    "a truncated quote not labeled as partial",
    (p) => {
      delete p.research.findings[0].quotes[0].partial;
    },
  ],
  [
    "a location with no platform data at all",
    (p) => {
      delete p.research.locations[0].google;
      delete p.research.locations[0].yelp;
    },
  ],
  [
    "no research at all",
    (p) => {
      p.research.locations = [];
    },
  ],
];

let allBit = true;
for (const [name, mutate] of cases) {
  const broken = JSON.parse(JSON.stringify(payload));
  mutate(broken);
  const problems = validate(broken);
  const bit = problems.length > 0;
  allBit = allBit && bit;
  console.log(`  ${bit ? "blocked" : "LET THROUGH"}  ${name}`);
  if (bit) console.log(`             -> ${problems[0]}`);
}

const clean = validate(payload);
console.log(`  ${clean.length === 0 ? "passes " : "FAILS  "}  the real Tortas Paquime payload`);

if (!allBit || clean.length) {
  console.error("\nGate is not behaving as expected.");
  process.exit(1);
}
