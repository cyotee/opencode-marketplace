// src/core/opencode-config.ts
import fs from "node:fs/promises"
import path from "node:path"

export async function readConfig(configPath: string): Promise<Record<string, any>> {
  try { return JSON.parse(await fs.readFile(configPath, "utf-8")) }
  catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return {}; throw e }
}

export function mergeMcp(config: Record<string, any>, servers: Record<string, unknown>): Record<string, any> {
  config.mcp = { ...(config.mcp ?? {}), ...servers }
  return config
}

export function removeMcp(config: Record<string, any>, keys: string[]): Record<string, any> {
  if (!config.mcp) return config
  for (const k of keys) delete config.mcp[k]
  return config
}

export async function writeConfig(configPath: string, config: Record<string, any>): Promise<void> {
  if (!config.$schema) config.$schema = "https://opencode.ai/config.json"
  await fs.mkdir(path.dirname(configPath), { recursive: true })
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8")
}
