// src/core/translate/commands.ts
import { splitFrontmatter, withFrontmatter } from "./frontmatter.js"

const ALLOWED = new Set(["description", "agent", "model", "subtask"])

export function translateCommand(content: string, pluginName: string, fileStem: string): { name: string; content: string } {
  const { frontmatter, body } = splitFrontmatter(content)
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(frontmatter)) if (ALLOWED.has(k)) out[k] = v
  return { name: `${pluginName}-${fileStem}`, content: withFrontmatter(out, body) }
}
