#!/usr/bin/env node
// Finds Unsplash photos for a blog post or newsletter section.
//
//   node unsplash-pick.mjs "<what the photo should show>" [--n 8] [--exclude photo-123-abc,...] [--preview <dir>]
//   node unsplash-pick.mjs --use <download_location>
//
// Search mode prints JSON: wide landscape photos that are not in --exclude, each
// with what the blog needs (image_url, credit text and link, download_location).
// With --preview it also saves a small copy of every candidate in <dir>, so the
// pictures can be looked at before one is chosen.
//
// --exclude takes the photo keys already on the blog (the "photo-…" part of the
// image address), plus the ones picked earlier in the same run. Ask the database:
//   select distinct substring(image_url from 'unsplash\.com/(photo-[A-Za-z0-9_-]+)')
//     from blog_posts where image_url like 'https://images.unsplash.com/photo-%';
//
// --use <download_location> tells Unsplash a photo was picked (their guidelines
// ask for this when a photo is chosen for a post). Run it once per photo kept.
//
// The Access Key is read from UNSPLASH_ACCESS_KEY or from the file
// ~/.claude/secrets/unsplash.key (just the key, one line). Create a free app at
// https://unsplash.com/developers to get it.

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const APP = "eltoaster";
const API = "https://api.unsplash.com";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

function readKey() {
  if (process.env.UNSPLASH_ACCESS_KEY?.trim()) return process.env.UNSPLASH_ACCESS_KEY.trim();
  try {
    return readFileSync(join(homedir(), ".claude", "secrets", "unsplash.key"), "utf8").trim();
  } catch {
    return "";
  }
}

const useUrl = arg("use", "");
const query = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "";
if (!query && !useUrl) {
  console.error('Usage: node unsplash-pick.mjs "<query>" [--n 8] [--exclude a,b] [--preview <dir>]  |  --use <download_location>');
  process.exit(2);
}

const key = readKey();
if (!key) {
  console.error("NO_UNSPLASH_KEY: set UNSPLASH_ACCESS_KEY or put the Access Key in ~/.claude/secrets/unsplash.key");
  process.exit(3);
}

const headers = { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" };
// The part of the address that identifies the photo, whatever size parameters follow.
const photoKey = (u) => /images\.unsplash\.com\/(photo-[A-Za-z0-9_-]+)/.exec(u)?.[1] || "";

// Not process.exit() after a request: on Windows it can crash Node while the connection closes.
async function main() {
  if (useUrl) {
    if (!useUrl.startsWith(`${API}/`)) {
      console.error("--use needs the download_location address from a search result");
      process.exitCode = 2;
      return;
    }
    const r = await fetch(useUrl, { headers });
    console.log(JSON.stringify({ registered: r.ok, status: r.status }));
    if (!r.ok) process.exitCode = 5;
    return;
  }

  const want = Math.max(1, Math.min(20, Number(arg("n", "8"))));
  const exclude = new Set(String(arg("exclude", "")).split(",").map((s) => s.trim()).filter(Boolean));
  const previewDir = arg("preview", "");

  const url = new URL(`${API}/search/photos`);
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("per_page", "30");

  const res = await fetch(url, { headers });
  if (res.status === 401) {
    console.error("UNSPLASH_KEY_REJECTED: Unsplash says the Access Key is not valid");
    process.exitCode = 4;
    return;
  }
  if (res.status === 403) {
    console.error("UNSPLASH_RATE_LIMIT: the hourly limit (50 searches in demo mode) is used up; try again later");
    process.exitCode = 6;
    return;
  }
  if (!res.ok) {
    console.error(`UNSPLASH_ERROR ${res.status}: ${await res.text()}`);
    process.exitCode = 5;
    return;
  }
  const data = await res.json();
  const left = res.headers.get("x-ratelimit-remaining");

  const picks = (data.results || [])
    .filter((p) => photoKey(p.urls?.regular) && !exclude.has(photoKey(p.urls.regular)) && p.width >= 1600)
    .slice(0, want)
    .map((p) => ({
      id: p.id,
      photo_key: photoKey(p.urls.regular),
      alt: p.alt_description || p.description || "",
      width: p.width,
      height: p.height,
      photographer: p.user?.name,
      image_url: p.urls.regular,
      image_credit: { es: `Foto: ${p.user?.name} / Unsplash`, en: `Photo: ${p.user?.name} / Unsplash` },
      // The photographer's Unsplash profile, tagged as Unsplash asks.
      image_credit_url: `${p.user?.links?.html}?utm_source=${APP}&utm_medium=referral`,
      unsplash_url: `${p.links?.html}?utm_source=${APP}&utm_medium=referral`,
      download_location: p.links?.download_location,
      _small: p.urls.small,
    }));

  if (previewDir) {
    mkdirSync(previewDir, { recursive: true });
    for (const p of picks) {
      const img = await fetch(p._small);
      if (img.ok) {
        p.preview_file = join(previewDir, `unsplash-${p.id}.jpg`);
        writeFileSync(p.preview_file, Buffer.from(await img.arrayBuffer()));
      }
    }
  }
  for (const p of picks) delete p._small;

  console.error(`${picks.length} usable of ${(data.results || []).length} found for "${query}"${left ? ` (${left} requests left this hour)` : ""}`);
  console.log(JSON.stringify(picks, null, 2));
}

await main();
