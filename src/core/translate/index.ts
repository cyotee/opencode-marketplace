// src/core/translate/index.ts
import fs from "node:fs/promises"
import path from "node:path"
import type { InstallScope, PluginManifest, TranslationResult } from "../types.js"
import { targetDirs } from "../paths.js"
import { translateAgent } from "./agents.js"
import { translateCommand } from "./commands.js"
import { normalizeSkillName, translateSkillMd } from "./skills.js"
import { collectMcpServers } from "./mcp.js"

async function listDirs(dir: string): Promise<string[]> {
  try { return (await fs.readdir(dir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name) }
  catch { return [] }
}
async function listMd(dir: string): Promise<string[]> {
  try { return (await fs.readdir(dir)).filter((f) => f.endsWith(".md")) }
  catch { return [] }
}
async function exists(p: string): Promise<boolean> { try { await fs.access(p); return true } catch { return false } }

export async function translatePlugin(opts: {
  pluginDir: string; manifest: PluginManifest; scope: InstallScope; cwd?: string
}): Promise<TranslationResult> {
  const { pluginDir, manifest, scope, cwd } = opts
  const dirs = targetDirs(scope, cwd)
  const pluginName = manifest.name
  const components = { skills: [] as string[], commands: [] as string[], agents: [] as string[], mcp: [] as string[] }

  // Skills: copy dir + normalize SKILL.md
  for (const skillName of await listDirs(path.join(pluginDir, "skills"))) {
    const srcDir = path.join(pluginDir, "skills", skillName)
    const ns = normalizeSkillName(pluginName, skillName)
    const destDir = path.join(dirs.skills, ns)
    await fs.cp(srcDir, destDir, { recursive: true })
    const md = await fs.readFile(path.join(srcDir, "SKILL.md"), "utf-8")
    await fs.writeFile(path.join(destDir, "SKILL.md"), translateSkillMd(md, ns), "utf-8")
    components.skills.push(ns)
  }
  // Commands
  for (const file of await listMd(path.join(pluginDir, "commands"))) {
    const stem = file.replace(/\.md$/, "")
    const out = translateCommand(await fs.readFile(path.join(pluginDir, "commands", file), "utf-8"), pluginName, stem)
    await fs.mkdir(dirs.commands, { recursive: true })
    await fs.writeFile(path.join(dirs.commands, `${out.name}.md`), out.content, "utf-8")
    components.commands.push(out.name)
  }
  // Agents
  for (const file of await listMd(path.join(pluginDir, "agents"))) {
    const out = translateAgent(await fs.readFile(path.join(pluginDir, "agents", file), "utf-8"), pluginName)
    await fs.mkdir(dirs.agents, { recursive: true })
    await fs.writeFile(path.join(dirs.agents, `${out.name}.md`), out.content, "utf-8")
    components.agents.push(out.name)
  }
  // MCP (collected; merged by the install step)
  const mcpServers = await collectMcpServers(pluginDir, manifest)
  components.mcp = Object.keys(mcpServers)

  const skipped = {
    hooks: (await exists(path.join(pluginDir, "hooks", "hooks.json"))) || (manifest as unknown as Record<string, unknown>).hooks !== undefined,
    lsp: await exists(path.join(pluginDir, ".lsp.json")),
  }
  return { components, skipped, mcpServers }
}
