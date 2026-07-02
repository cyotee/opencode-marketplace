// src/core/translate/agents.ts
import { splitFrontmatter, withFrontmatter } from "./frontmatter.js"
import { mapModel } from "./model-map.js"

const TOOL_KEYS: Record<string, string> = {
  read: "read", glob: "glob", grep: "grep", bash: "bash", write: "write",
  edit: "edit", webfetch: "webfetch", task: "task", list: "list",
}

function translateTools(csv: unknown): Record<string, boolean> {
  const tools: Record<string, boolean> = {}
  if (typeof csv === "string") {
    for (const t of csv.split(",").map((s) => s.trim()).filter(Boolean)) {
      const key = TOOL_KEYS[t.toLowerCase()] ?? t.toLowerCase()
      tools[key] = true
    }
  }
  if (tools.write === undefined) tools.write = false
  if (tools.edit === undefined) tools.edit = false
  return tools
}

export function translateAgent(content: string, pluginName: string): { name: string; content: string } {
  const { frontmatter, body } = splitFrontmatter(content)
  const origName = typeof frontmatter.name === "string" ? frontmatter.name : "agent"
  const name = `${pluginName}-${origName}`
  const out: Record<string, unknown> = {
    description: frontmatter.description ?? "",
    mode: "subagent",
    model: mapModel(typeof frontmatter.model === "string" ? frontmatter.model : undefined),
    tools: translateTools(frontmatter.tools),
  }
  return { name, content: withFrontmatter(out, body) }
}
