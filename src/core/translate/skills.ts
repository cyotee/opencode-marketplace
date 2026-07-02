// src/core/translate/skills.ts
import { splitFrontmatter, withFrontmatter } from "./frontmatter.js"

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const ALLOWED = new Set(["name", "description", "license", "compatibility", "metadata"])

export function normalizeSkillName(pluginName: string, skillName: string): string {
  const name = `${pluginName}-${skillName}`
  if (!NAME_RE.test(name)) throw new Error(`Skill name "${name}" must be lowercase alphanumeric with single hyphens`)
  return name
}

export function translateSkillMd(content: string, namespacedName: string): string {
  const { frontmatter, body } = splitFrontmatter(content)
  const out: Record<string, unknown> = { name: namespacedName }
  for (const [k, v] of Object.entries(frontmatter)) if (ALLOWED.has(k) && k !== "name") out[k] = v
  if (out.description === undefined) out.description = ""
  return withFrontmatter(out, body)
}
