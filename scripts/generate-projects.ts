import {
  statSync,
  accessSync,
  constants,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

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

type MetaFile = {
  tags?: Record<string, unknown>;
  externalProjects?: Partial<CollectedProject>[];
};

type ParsedMeta = {
  tags: Record<string, string[]>;
  externalProjects: CollectedProject[];
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((t) => typeof t === "string");
}

function coerceDates(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : value;
}

function parseTags(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object") return {};
  const meta = raw as MetaFile;
  if (!meta.tags || typeof meta.tags !== "object") return {};

  return Object.entries(meta.tags as Record<string, []>).reduce<
    Record<string, string[]>
  >((acc, [dir, value]) => {
    if (isStringArray(value)) acc[dir] = value;
    return acc;
  }, {});
}

function parseExternalProjects(
  raw: unknown,
  nowIso: string
): CollectedProject[] {
  if (!raw || typeof raw !== "object") return [];
  const meta = raw as MetaFile;
  if (!Array.isArray(meta.externalProjects)) return [];

  return meta.externalProjects
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const { dir, name, projectSrc } = entry;
      if (typeof name !== "string" || typeof projectSrc !== "string")
        return null;

      const imgSrc = typeof entry.imgSrc === "string" ? entry.imgSrc : "";
      const tags =
        isStringArray(entry.tags) && entry.tags.length > 0 ? entry.tags : [];
      const createdAt = coerceDates(entry.createdAt, nowIso);
      const updatedAt = coerceDates(entry.updatedAt, createdAt);

      return {
        dir: typeof dir === "string" ? dir : "",
        name,
        projectSrc,
        imgSrc,
        tags,
        createdAt,
        updatedAt,
      };
    })
    .filter(
      (p): p is CollectedProject =>
        !!p && typeof p.dir === "string" && typeof p.name === "string"
    );
}

function readMeta(): ParsedMeta {
  const metaPath = path.join(ROOT, "meta.json");
  const defaultMeta: ParsedMeta = { tags: {}, externalProjects: [] };
  if (!exists(metaPath)) return defaultMeta;

  try {
    const raw = readFileSync(metaPath, "utf8");
    const json = JSON.parse(raw);
    const nowIso = new Date().toISOString();
    return {
      tags: parseTags(json),
      externalProjects: parseExternalProjects(json, nowIso),
    };
  } catch {
    return defaultMeta;
  }
}

function fsDates(absDir: string) {
  const stats = statSync(absDir);
  const createdMs = Number.isFinite(stats.birthtimeMs)
    ? stats.birthtimeMs
    : stats.ctimeMs;
  return {
    first: new Date(createdMs).toISOString(),
    latest: new Date(stats.mtimeMs).toISOString(),
  };
}

// Use local file timestamps (creation + last modified)
function getLocalTimes(dir: string) {
  const absDir = path.join(ROOT, dir);
  return fsDates(absDir);
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

function collectProjects(tagsByDir: Record<string, string[]>) {
  const entries = readdirSync(ROOT);
  const projects: CollectedProject[] = [];

  for (const entry of entries) {
    if (!entry.endsWith("-main")) continue;
    const abs = path.join(ROOT, entry);
    if (!isDirectory(abs)) continue;

    const indexHtml = path.join(abs, "index.html");
    if (!exists(indexHtml)) continue; // consider it a project only if it has an index.html

    const { latest, first } = getLocalTimes(entry);

    const previewJpg = path.join(abs, "preview.jpg");
    const previewPng = path.join(abs, "preview.png");
    const previewWebp = path.join(abs, "preview.webp");

    let imgSrc = "";
    if (exists(previewJpg)) imgSrc = path.relative(ROOT, previewJpg);
    else if (exists(previewPng)) imgSrc = path.relative(ROOT, previewPng);
    else if (exists(previewWebp)) imgSrc = path.relative(ROOT, previewWebp);

    const tags = isStringArray(tagsByDir[entry]) ? tagsByDir[entry] : ["HTML"];

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

function mergeProjects(
  internal: CollectedProject[],
  external: CollectedProject[]
) {
  const map = new Map<string, CollectedProject>();
  internal.forEach((p) => map.set(p.dir, p));
  external.forEach((p) => map.set(p.dir, p)); // allow external to override local if dir matches
  return Array.from(map.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

function writeJson(projects: CollectedProject[]) {
  const outPath = path.join(ROOT, "data.json");
  writeFileSync(outPath, JSON.stringify({ projects }, null, 2) + "\n", "utf8");
  console.log(
    `Wrote ${projects.length} projects to ${path.relative(ROOT, outPath)}`
  );
}

(function main() {
  const meta = readMeta();
  const internal = collectProjects(meta.tags);
  const projects = mergeProjects(internal, meta.externalProjects);
  writeJson(projects);
})();
