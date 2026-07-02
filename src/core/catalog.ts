// src/core/catalog.ts
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { createHash } from "node:crypto"
import type { MarketplaceManifest } from "./types.js"
import { parseMarketplace } from "./manifest.js"
import type { Runner } from "./fetch.js"

const CANDIDATES = [".claude-plugin/marketplace.json", "marketplace.json", ".github/plugin/marketplace.json"]

async function readFirst(root: string): Promise<MarketplaceManifest> {
  for (const c of CANDIDATES) {
    try { return parseMarketplace(await fs.readFile(path.join(root, c), "utf-8")) }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e }
  }
  throw new Error(`No marketplace.json found in ${root} (tried: ${CANDIDATES.join(", ")})`)
}

export async function loadCatalog(opts: { repoUrl?: string; localRoot?: string; run?: Runner }): Promise<{ manifest: MarketplaceManifest; root: string }> {
  if (opts.localRoot) return { manifest: await readFirst(opts.localRoot), root: opts.localRoot }
  if (!opts.repoUrl) throw new Error("loadCatalog requires localRoot or repoUrl")
  // Hash the full URL so distinct repos get distinct temp dirs (a prefix slice
  // would collide for every "https://…" URL and silently clobber the prior clone).
  const dest = path.join(os.tmpdir(), "ocm-catalog", createHash("sha256").update(opts.repoUrl).digest("hex").slice(0, 32))
  await fs.rm(dest, { recursive: true, force: true })
  await fs.mkdir(path.dirname(dest), { recursive: true })
  const { spawnSync } = await import("node:child_process")
  const r = spawnSync("git", ["clone", "--depth", "1", opts.repoUrl, dest], { stdio: "inherit" })
  if (r.status !== 0) throw new Error(`git clone failed for ${opts.repoUrl}${r.error ? `: ${r.error.message}` : ""}`)
  return { manifest: await readFirst(dest), root: dest }
}
