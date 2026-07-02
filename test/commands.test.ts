// test/commands.test.ts
import { test, expect } from "bun:test"
import { translateCommand } from "../src/core/translate/commands.js"
import { splitFrontmatter } from "../src/core/translate/frontmatter.js"

test("keeps description, drops claude-only keys, namespaces, preserves $ARGUMENTS", () => {
  const input = "---\ndescription: Start a task\nargument-hint: <id>\nallowed-tools: Read, Bash\n---\n\nRun $ARGUMENTS now\n"
  const out = translateCommand(input, "pm", "work")
  expect(out.name).toBe("pm-work")
  const { frontmatter, body } = splitFrontmatter(out.content)
  expect(frontmatter.description).toBe("Start a task")
  expect(frontmatter["argument-hint"]).toBeUndefined()
  expect(frontmatter["allowed-tools"]).toBeUndefined()
  expect(body).toContain("$ARGUMENTS")
})
