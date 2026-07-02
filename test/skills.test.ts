// test/skills.test.ts
import { test, expect } from "bun:test"
import { normalizeSkillName, translateSkillMd } from "../src/core/translate/skills.js"
import { splitFrontmatter } from "../src/core/translate/frontmatter.js"

test("namespaces and validates skill names", () => {
  expect(normalizeSkillName("pm", "code-reviewer")).toBe("pm-code-reviewer")
  expect(() => normalizeSkillName("pm", "Bad_Name")).toThrow(/lowercase/)
})

test("keeps only recognized frontmatter and rewrites name", () => {
  const input = "---\nname: code-reviewer\ndescription: Review code\ndisable-model-invocation: true\n---\n\nBody\n"
  const { frontmatter } = splitFrontmatter(translateSkillMd(input, "pm-code-reviewer"))
  expect(frontmatter.name).toBe("pm-code-reviewer")
  expect(frontmatter.description).toBe("Review code")
  expect(frontmatter["disable-model-invocation"]).toBeUndefined()
})
