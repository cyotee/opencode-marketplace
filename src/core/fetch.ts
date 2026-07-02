// src/core/fetch.ts
import fs from "node:fs/promises"
import path from "node:path"
import { spawn } from "node:child_process"
import type { ResolvedSource } from "./types.js"
import { cacheDir } from "./paths.js"
import { assertTrusted } from "./source.js"

export type Runner = (cmd: string[], cwd?: string) => Promise<void>

const defaultRun: Runner = (cmd, cwd) => new Promise((resolve, reject) => {
  const p = spawn(cmd[0]!, cmd.slice(1), { cwd, stdio: "inherit" })
  p.on("error", reject)
  p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd.join(" ")} exited ${code}`))))
})

export async function fetchSource(opts: {
  resolved: ResolvedSource; marketplace: string; plugin: string; version: string
  marketplaceRoot?: string; run?: Runner
}): Promise<string> {
  const { resolved, marketplace, plugin, version, marketplaceRoot, run = defaultRun } = opts

  if (resolved.kind === "local") {
    if (!marketplaceRoot) throw new Error("local source requires marketplaceRoot")
    return path.resolve(marketplaceRoot, resolved.path!)
  }
  if (resolved.kind === "npm") throw new Error("npm sources are not supported in v1")

  assertTrusted(resolved)
  const dest = cacheDir(marketplace, plugin, version)
  await fs.rm(dest, { recursive: true, force: true })
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await run(["git", "clone", "--no-checkout", resolved.url!, dest])
  await run(["git", "fetch", "--depth", "1", "origin", resolved.sha!], dest)
  await run(["git", "checkout", resolved.sha!], dest)
  return resolved.subdir ? path.join(dest, resolved.subdir) : dest
}
