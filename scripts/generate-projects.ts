import {
  statSync,
  accessSync,
  constants,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(__dirname, "..");

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

function isGitAvailable(): boolean {
  try {
    execSync("git --version", { encoding: "utf8" }).trim();
    return true;
  } catch {
    return false;
  }
}

function isInsideGitRepo(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      encoding: "utf8",
    }).trim();
    return true;
  } catch {
    return false;
  }
}

function gitOutputOrNull(cmd: string): string | null {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function fsFallback(absDir: string) {
  const stats = statSync(absDir);
  const mtime = new Date(stats.mtimeMs).toISOString();
  return { first: mtime, latest: mtime };
}

function getGitTimesOrFsFallback(dir: string) {
  if (!isGitAvailable() || !isInsideGitRepo()) return fsFallback(dir);

  //latest commit time for this directory
  const latest = gitOutputOrNull(`git log -1 --format=%cI -- ${dir}`);
  //first commit time for this directory
  const firstHash = gitOutputOrNull(
    `git rev-list --max-count=1 --reverse HEAD -- ${dir}`
  );
  const first = firstHash
    ? gitOutputOrNull(`git show -s --format=%cI ${firstHash}`)
    : null;

  if (!latest || !first) {
    return fsFallback(path.join(ROOT, dir));
  }
  return { first, latest };
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
  updatedAt: string;
  createdAt: string;
}

function collectProjects() {
  const entries = readdirSync(ROOT);
  const projects: CollectedProject[] = [];
  const metaTagsJson = readMetaTags();

  for (const entry of entries) {
    if (!entry.endsWith("-main")) continue;
    const abs = path.join(ROOT, entry);
    if (!isDirectory(abs)) continue;

    const indexHtml = path.join(abs, "index.html");
    if (!exists(indexHtml)) continue; // consider it a project only if it has an index.html

    const { latest, first } = getGitTimesOrFsFallback(entry);

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

    projects.push({
      dir: entry,
      name: toTitleCase(entry),
      projectSrc: `${entry}/index.html`,
      imgSrc,
      tags,
      updatedAt: latest,
      createdAt: first,
    });
  }

  // Sort by directory creation time (newest first)
  return projects.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function writeJson(projects: CollectedProject[]) {
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
