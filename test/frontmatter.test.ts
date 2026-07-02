import { test, expect } from "bun:test"
import { splitFrontmatter, withFrontmatter } from "../src/core/translate/frontmatter.js"

test("splits frontmatter and body", () => {
  const { frontmatter, body } = splitFrontmatter("---\nname: x\ndescription: hi there\n---\n\nBody line\n")
  expect(frontmatter.name).toBe("x")
  expect(frontmatter.description).toBe("hi there")
  expect(body.trim()).toBe("Body line")
})

test("no frontmatter yields empty object and full body", () => {
  const { frontmatter, body } = splitFrontmatter("# Title\ntext")
  expect(frontmatter).toEqual({})
  expect(body).toBe("# Title\ntext")
})

test("round-trips scalar frontmatter", () => {
  const out = withFrontmatter({ description: "d", mode: "subagent" }, "Body")
  expect(out).toBe("---\ndescription: d\nmode: subagent\n---\n\nBody")
})
