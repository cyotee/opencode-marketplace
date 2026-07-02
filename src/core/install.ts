// src/core/install.ts
import fs from "node:fs/promises"
import path from "node:path"
import type { InstallScope, PluginEntry, RegistryEntry, TranslationResult } from "./types.js"
import { resolveSource } from "./source.js"
import { fetchSource, type Runner } from "./fetch.js"
import { parsePluginManifest } from "./manifest.js"
import { translatePlugin } from "./translate/index.js"
import { targetDirs } from "./paths.js"
import { readConfig, mergeMcp, removeMcp, writeConfig } from "./opencode-config.js"
import { upsertEntry, findEntry, removeEntry } from "./registry.js"

async function readManifest(pluginDir: string, name: string) {
  try { return parsePluginManifest(await fs.readFile(path.join(pluginDir, ".claude-plugin", "plugin.json"), "utf-8")) }
  catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return { name }; throw e }
}

async function removeComponents(
  dirs: ReturnType<typeof targetDirs>,
  components: { skills: string[]; commands: string[]; agents: string[] },
): Promise<void> {
  for (const s of components.skills) await fs.rm(path.join(dirs.skills, s), { recursive: true, force: true })
  for (const c of components.commands) await fs.rm(path.join(dirs.commands, `${c}.md`), { force: true })
  for (const a of components.agents) await fs.rm(path.join(dirs.agents, `${a}.md`), { force: true })
}

/** Human-readable note for detected-but-skipped component types (hooks/LSP). Empty when nothing skipped. */
export function skippedNote(skipped: TranslationResult["skipped"]): string {
  const kinds = [skipped.hooks && "hooks", skipped.lsp && "lsp"].filter(Boolean)
  return kinds.length ? ` Skipped (not translated): ${kinds.join(", ")}.` : ""
}

export async function installPlugin(opts: {
  entry: PluginEntry; marketplaceName: string; marketplaceRoot?: string
  scope: InstallScope; cwd?: string; confirmCode?: () => Promise<boolean>
  run?: Runner; registryFile?: string
}): Promise<RegistryEntry & { skipped: TranslationResult["skipped"] }> {
  const { entry, marketplaceName, marketplaceRoot, scope, cwd, confirmCode, run, registryFile } = opts
  const resolved = resolveSource(entry.source)
  const version = entry.version ?? resolved.sha ?? "unknown"
  const pluginDir = await fetchSource({ resolved, marketplace: marketplaceName, plugin: entry.name, version, marketplaceRoot, run })
  const manifest = await readManifest(pluginDir, entry.name)

  const result = await translatePlugin({ pluginDir, manifest, scope, cwd })
  const dirs = targetDirs(scope, cwd)

  if (Object.keys(result.mcpServers).length > 0) {
    const ok = confirmCode ? await confirmCode() : false
    if (!ok) {
      // Aborted trust: roll back the files translatePlugin already wrote so a
      // declined install leaves nothing behind (nothing was registered either).
      await removeComponents(dirs, result.components)
      throw new Error(`Plugin "${entry.name}" ships MCP servers (runs code); trust declined — install aborted`)
    }
    const cfg = await readConfig(dirs.configPath)
    await writeConfig(dirs.configPath, mergeMcp(cfg, result.mcpServers))
  }

  const record: RegistryEntry = {
    marketplace: marketplaceName, plugin: entry.name, version, source: entry.source,
    sha: resolved.sha, scope,
    ...(scope === "project" ? { projectRoot: cwd ?? process.cwd() } : {}),
    components: result.components, installedAt: new Date().toISOString(),
  }
  await upsertEntry(record, registryFile)
  return { ...record, skipped: result.skipped }
}

export async function uninstallPlugin(opts: {
  marketplace: string; plugin: string; registryFile?: string
}): Promise<void> {
  const { marketplace, plugin, registryFile } = opts
  const rec = await findEntry(marketplace, plugin, registryFile)
  if (!rec) throw new Error(`Not installed: ${plugin}@${marketplace}`)
  // Resolve target dirs from the RECORD's own scope, not the caller's — so a plugin
  // installed with --project is removed from its project root regardless of how/where
  // uninstall is invoked (otherwise files + opencode.json mcp entries orphan).
  const dirs = targetDirs(rec.scope, rec.scope === "project" ? rec.projectRoot : undefined)
  await removeComponents(dirs, rec.components)
  if (rec.components.mcp.length) {
    const cfg = await readConfig(dirs.configPath)
    await writeConfig(dirs.configPath, removeMcp(cfg, rec.components.mcp))
  }
  await removeEntry(marketplace, plugin, registryFile)
}
