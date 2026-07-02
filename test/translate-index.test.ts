// test/translate-index.test.ts
import { test, expect } from "bun:test"
import os from "node:os"; import path from "node:path"; import fs from "node:fs/promises"
import { translatePlugin } from "../src/core/translate/index.js"
import { parsePluginManifest } from "../src/core/manifest.js"

test("translates the pm fixture into namespaced opencode components and skips hooks", async () => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "proj-"))
  const pluginDir = path.join(import.meta.dir, "fixtures", "plugin-pm")
  const manifest = parsePluginManifest(await fs.readFile(path.join(pluginDir, ".claude-plugin", "plugin.json"), "utf-8"))
  const res = await translatePlugin({ pluginDir, manifest, scope: "project", cwd })

  expect(res.components.skills).toContain("pm-code-reviewer")
  expect(res.components.commands).toContain("pm-work")
  expect(res.components.agents).toContain("pm-code-reviewer")
  expect(res.skipped.hooks).toBe(true)

  const skill = await fs.readFile(path.join(cwd, ".opencode", "skills", "pm-code-reviewer", "SKILL.md"), "utf-8")
  expect(skill).toContain("name: pm-code-reviewer")
  const agent = await fs.readFile(path.join(cwd, ".opencode", "agents", "pm-code-reviewer.md"), "utf-8")
  expect(agent).toContain("mode: subagent")
})
