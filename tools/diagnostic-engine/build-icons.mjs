#!/usr/bin/env node
/**
 * Builds the diagnostic email's icon set and uploads it to Supabase storage.
 *
 *   node --env-file=tools/diagnostic-engine/.env.engine tools/diagnostic-engine/build-icons.mjs
 *
 * The icons are authored here as SVG but shipped as PNG. Email clients do not
 * render inline SVG — Gmail strips the element outright and Outlook never
 * supported it — so an <svg> icon is simply invisible to most recipients. They
 * go to the public `brand` bucket because an emailed image has to be fetchable
 * anonymously, and because a bucket URL carries no build hash and so cannot
 * break in mail that has already been delivered.
 *
 * Rendered at 2x (48px for a 24px slot) so they stay crisp on phones, with a
 * transparent background so the same file sits correctly on white and on the
 * tinted panels.
 *
 * Icons are decorative. Many inboxes block images until the reader asks for
 * them, so every heading they accompany must still read on its own.
 */

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(here, "icons");
const SIZE = 48;

const INK = {
  orange: "#FF4C00",
  green: "#1e7a46",
  red: "#c0392b",
  blue: "#1a5f9c",
  gray: "#8f8880",
};

/** Single-stroke line icons on a 24x24 grid, Feather-ish proportions. */
const ICONS = {
  star: [INK.orange, ["M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.6l6.5-.9L12 2.8z"]],
  pin: [INK.orange, [
    "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z",
    "M12 10.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z",
  ]],
  heart: [INK.green, [
    "M12 20.3l-1.5-1.4C5.4 14.3 2.5 11.6 2.5 8.3 2.5 5.7 4.6 3.7 7.2 3.7c1.5 0 2.9.7 3.8 1.8l1 1.2 1-1.2a4.9 4.9 0 0 1 3.8-1.8c2.6 0 4.7 2 4.7 4.6 0 3.3-2.9 6-8 10.6l-1.5 1.4z",
  ]],
  target: [INK.blue, [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    "M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z",
    "M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z",
  ]],
  alert: [INK.red, ["M12 3.2L1.6 20.8h20.8L12 3.2z", "M12 9.4v5.2", "M12 17.5v.3"]],
  info: [INK.orange, [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    "M12 16.2v-4.8",
    "M12 8v.3",
  ]],
  chart: [INK.orange, ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"]],
  dollar: [INK.orange, [
    "M12 2.5v19",
    "M16.8 6.6H9.9a3.2 3.2 0 0 0 0 6.4h4.2a3.2 3.2 0 0 1 0 6.4H6.6",
  ]],
  chat: [INK.orange, [
    "M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4-.9L3 20.5l1.5-4.6a8.4 8.4 0 0 1-.9-4 8.4 8.4 0 0 1 8.4-8.4h.5a8.4 8.4 0 0 1 8.5 8.5z",
  ]],
};

const svg = (color, paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24" ` +
  `fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
  paths.map((d) => `<path d="${d}"/>`).join("") +
  `</svg>`;

const BUCKET = "brand";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const results = [];

  for (const [name, [color, paths]] of Object.entries(ICONS)) {
    const png = await sharp(Buffer.from(svg(color, paths))).png({ compressionLevel: 9 }).toBuffer();
    const file = resolve(OUT_DIR, `${name}.png`);
    writeFileSync(file, png);

    let uploaded = "skipped (no credentials)";
    if (url && key) {
      const res = await fetch(`${url}/storage/v1/object/${BUCKET}/icons/${name}.png`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "image/png",
          "x-upsert": "true",
        },
        body: png,
      });
      uploaded = res.ok ? "uploaded" : `FAILED ${res.status} ${await res.text()}`;
    }
    results.push({ name, bytes: png.length, uploaded });
  }

  for (const r of results) {
    console.log(`${r.name.padEnd(8)} ${String(r.bytes).padStart(5)}B  ${r.uploaded}`);
  }
  if (url) {
    console.log(`\nBase URL: ${url}/storage/v1/object/public/${BUCKET}/icons/<name>.png`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
