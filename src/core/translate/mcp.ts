// src/core/translate/mcp.ts
import fs from "node:fs/promises"
import path from "node:path"
import type { PluginManifest } from "../types.js"

function unwrap(obj: Record<string, unknown>): Record<string, unknown> {
  return (obj.mcpServers as Record<string, unknown>) ?? (obj.mcp_servers as Record<string, unknown>) ?? obj
}

export async function collectMcpServers(pluginDir: string, manifest: PluginManifest): Promise<Record<string, unknown>> {
  if (manifest.mcpServers && typeof manifest.mcpServers === "object") return unwrap(manifest.mcpServers as Record<string, unknown>)
  const candidate = typeof manifest.mcpServers === "string"
    ? path.join(pluginDir, manifest.mcpServers)
    : path.join(pluginDir, ".mcp.json")
  try { return unwrap(JSON.parse(await fs.readFile(candidate, "utf-8"))) }
  catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return {}; throw e }
}
