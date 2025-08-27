import {
  statSync,
  accessSync,
  constants,
  readFileSync,
  readdirSync,
  writeFileSync,
  Stats,
} from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

const SKIP_DIRS = new Set([
  ".git",
  ".github",
  ".vscode",
  "node_modules",
  "dist",
  "scripts",
]);

function isDirectory(absolutePath: string) {
  try {
    return statSync(absolutePath).isDirectory();
  } catch {
    return false;
  }
}

function exists(absolutePath: string) {
  try {
    accessSync(absolutePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function readMetaTags() {
  const metaPath = path.join(ROOT, "meta.json");
  if (!exists(metaPath)) return {};
  try {
    const raw = readFileSync(metaPath, "utf8");
    const json = JSON.parse(raw);
    if (json && typeof json === "object") return json;
  } catch {}
  return {};
}

function safeBirthtimeMs(stats: Stats) {
  // Prefer birthtimeMs; fall back to mtimeMs if not present/reliable
  const birth = Number(stats.birthtimeMs);
  if (Number.isFinite(birth) && birth > 0) return birth;
  const mtime = Number(stats.mtimeMs);
  return Number.isFinite(mtime) ? mtime : 0;
}

function getLastUpdatedTime(stats: Stats) {
  const mtime = Number(stats.mtimeMs);
  return Number.isFinite(mtime) ? mtime : 0;
}

function toTitleCase(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace("main", "")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CollectedProject {
  dir: string;
  name: string;
  projectSrc: string;
  imgSrc: string;
  tags: string[];
  updatedAt: Date;
  _createdAtMs: number;
}

function collectProjects() {
  const entries = readdirSync(ROOT);
  const projects: CollectedProject[] = [];
  const metaTagsJson = readMetaTags();

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const abs = path.join(ROOT, entry);
    if (!isDirectory(abs)) continue;

    const indexHtml = path.join(abs, "index.html");
    if (!exists(indexHtml)) continue; // consider it a project only if it has an index.html

    const stats = statSync(abs);
    const createdAtMs = safeBirthtimeMs(stats);
    const updatedAtMs = getLastUpdatedTime(stats);

    const previewJpg = path.join(abs, "preview.jpg");
    const previewPng = path.join(abs, "preview.png");
    const previewWebp = path.join(abs, "preview.webp");

    let imgSrc = "";
    if (exists(previewJpg)) imgSrc = path.relative(ROOT, previewJpg);
    else if (exists(previewPng)) imgSrc = path.relative(ROOT, previewPng);
    else if (exists(previewWebp)) imgSrc = path.relative(ROOT, previewWebp);

    const tags =
      Array.isArray(metaTagsJson[entry]) &&
      metaTagsJson[entry].every((t) => typeof t === "string")
        ? metaTagsJson[entry]
        : ["HTML"];

    const updatedDate = new Date(updatedAtMs);

    projects.push({
      dir: entry,
      name: toTitleCase(entry),
      projectSrc: `${entry}/index.html`,
      imgSrc,
      tags,
      updatedAt: updatedDate,
      _createdAtMs: createdAtMs,
    });
  }

  // Sort by directory creation time (newest first)
  projects.sort((a, b) => b._createdAtMs - a._createdAtMs);
  // Remove helper field before returning
  return projects.map(({ _createdAtMs, ...rest }) => rest);
}

function writeJson(projects: Omit<CollectedProject, "_createdAtMs">[]) {
  const outPath = path.join(ROOT, "data.json");
  writeFileSync(outPath, JSON.stringify({ projects }, null, 2) + "\n", "utf8");
  console.log(
    `Wrote ${projects.length} projects to ${path.relative(ROOT, outPath)}`
  );
}

(function main() {
  const projects = collectProjects();
  writeJson(projects);
})();
