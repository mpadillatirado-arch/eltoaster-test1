#!/usr/bin/env node
// Finds Pexels photos for a blog post or newsletter section.
//
//   node pexels-pick.mjs "<what the photo should show>" [--n 8] [--exclude 123,456] [--preview <dir>]
//
// Prints JSON: a list of photos that are wide enough and not in --exclude, each
// with what the blog needs (image_url, credit text and link). With --preview it
// also saves a small copy of every candidate in <dir> so the pictures can be
// looked at before one is chosen.
//
// --exclude takes Pexels photo ids that must not be used again: every photo
// already on the blog, plus the ones picked earlier in the same run. Ask the
// database for them:
//   select distinct substring(image_url from '/photos/([0-9]+)/')
//     from blog_posts where image_url like '%pexels.com/photos/%';
//
// The API key is read from the PEXELS_API_KEY environment variable, or from the
// file ~/.claude/secrets/pexels.key (just the key on one line). Get a free key
// at https://www.pexels.com/api/ . Pexels asks that every photo is credited to
// its photographer and linked to Pexels; the output carries both.

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const query = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "";
if (!query) {
  console.error('Usage: node pexels-pick.mjs "<query>" [--n 8] [--exclude 1,2,3] [--preview <dir>]');
  process.exit(2);
}

function readKey() {
  if (process.env.PEXELS_API_KEY?.trim()) return process.env.PEXELS_API_KEY.trim();
  try {
    return readFileSync(join(homedir(), ".claude", "secrets", "pexels.key"), "utf8").trim();
  } catch {
    return "";
  }
}

const key = readKey();
if (!key) {
  console.error("NO_PEXELS_KEY: set PEXELS_API_KEY or put the key in ~/.claude/secrets/pexels.key");
  process.exit(3);
}

const want = Math.max(1, Math.min(20, Number(arg("n", "8"))));
const exclude = new Set(String(arg("exclude", "")).split(",").map((s) => s.trim()).filter(Boolean));
const previewDir = arg("preview", "");
const MIN_WIDTH = 1200;

// Not process.exit() after a request: on Windows it can crash Node while the connection closes.
async function main() {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("size", "large");
  url.searchParams.set("per_page", "40");

  const res = await fetch(url, { headers: { Authorization: key } });
  if (res.status === 401) {
    console.error("PEXELS_KEY_REJECTED: Pexels says the key is not valid");
    process.exitCode = 4;
    return;
  }
  if (!res.ok) {
    console.error(`PEXELS_ERROR ${res.status}: ${await res.text()}`);
    process.exitCode = 5;
    return;
  }
  const data = await res.json();
  const left = res.headers.get("x-ratelimit-remaining");

  const picks = (data.photos || [])
    .filter((p) => !exclude.has(String(p.id)) && p.width >= MIN_WIDTH)
    .slice(0, want)
    .map((p) => ({
      id: p.id,
      alt: p.alt || "",
      width: p.width,
      height: p.height,
      photographer: p.photographer,
      photographer_url: p.photographer_url,
      pexels_url: p.url,
      image_url: p.src.large,
      image_credit: { es: `Foto: ${p.photographer} / Pexels`, en: `Photo: ${p.photographer} / Pexels` },
      image_credit_url: p.url,
      _small: p.src.small,
    }));

  if (previewDir) {
    mkdirSync(previewDir, { recursive: true });
    for (const p of picks) {
      const img = await fetch(p._small);
      if (img.ok) {
        p.preview_file = join(previewDir, `pexels-${p.id}.jpg`);
        writeFileSync(p.preview_file, Buffer.from(await img.arrayBuffer()));
      }
    }
  }
  for (const p of picks) delete p._small;

  console.error(`${picks.length} usable of ${(data.photos || []).length} found for "${query}"${left ? ` (${left} requests left this hour)` : ""}`);
  console.log(JSON.stringify(picks, null, 2));
}

await main();
