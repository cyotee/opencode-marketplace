// test/agents.test.ts
import { test, expect } from "bun:test"
import { mapModel } from "../src/core/translate/model-map.js"
import { translateAgent } from "../src/core/translate/agents.js"
import { splitFrontmatter } from "../src/core/translate/frontmatter.js"

test("maps known model aliases and defaults to sonnet", () => {
  expect(mapModel("sonnet")).toBe("anthropic/claude-sonnet")
  expect(mapModel("opus")).toBe("anthropic/claude-opus")
  expect(mapModel(undefined)).toBe("anthropic/claude-sonnet")
})

test("translates a claude agent into an opencode subagent", () => {
  const input = "---\nname: code-reviewer\ndescription: Review code\ntools: Read, Glob, Grep, Bash\nmodel: sonnet\n---\n\nYou review code.\n"
  const out = translateAgent(input, "pm")
  expect(out.name).toBe("pm-code-reviewer")
  const { frontmatter, body } = splitFrontmatter(out.content)
  expect(frontmatter.name).toBeUndefined()
  expect(frontmatter.mode).toBe("subagent")
  expect(frontmatter.model).toBe("anthropic/claude-sonnet")
  expect((frontmatter.tools as Record<string, unknown>)).toEqual({
    read: true, glob: true, grep: true, bash: true, write: false, edit: false,
  })
  expect(body.trim()).toBe("You review code.")
})
