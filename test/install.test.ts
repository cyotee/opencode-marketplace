// test/install.test.ts
import { test, expect } from "bun:test"
import os from "node:os"; import path from "node:path"; import fs from "node:fs/promises"
import { installPlugin, uninstallPlugin } from "../src/core/install.js"

async function fixtureMarketplace(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "mkt-"))
  const pdir = path.join(root, "plugins", "pm")
  await fs.mkdir(path.join(pdir, ".claude-plugin"), { recursive: true })
  await fs.writeFile(path.join(pdir, ".claude-plugin", "plugin.json"), JSON.stringify({ name: "pm", version: "1.0.0" }))
  await fs.mkdir(path.join(pdir, "agents"), { recursive: true })
  await fs.writeFile(path.join(pdir, "agents", "code-reviewer.md"),
    "---\nname: code-reviewer\ndescription: d\ntools: Read\nmodel: sonnet\n---\nbody")
  return root
}

test("installs a local plugin, registers it, and uninstall removes files", async () => {
  const root = await fixtureMarketplace()
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "proj-"))
  const registryFile = path.join(cwd, "registry.json")
  const rec = await installPlugin({
    entry: { name: "pm", source: "./plugins/pm" }, marketplaceName: "cyotee",
    marketplaceRoot: root, scope: "project", cwd, registryFile,
  })
  expect(rec.components.agents).toContain("pm-code-reviewer")
  expect(rec.scope).toBe("project")
  expect(await fs.exists(path.join(cwd, ".opencode", "agents", "pm-code-reviewer.md"))).toBe(true)

  // Uninstall is given NO scope/cwd — it must derive the project root from the record.
  await uninstallPlugin({ marketplace: "cyotee", plugin: "pm", registryFile })
  expect(await fs.exists(path.join(cwd, ".opencode", "agents", "pm-code-reviewer.md"))).toBe(false)
})

test("aborts when MCP present and confirmCode returns false", async () => {
  const root = await fixtureMarketplace()
  await fs.writeFile(path.join(root, "plugins", "pm", ".mcp.json"), JSON.stringify({ mcpServers: { db: { command: "d" } } }))
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "proj-"))
  await expect(installPlugin({
    entry: { name: "pm", source: "./plugins/pm" }, marketplaceName: "cyotee", marketplaceRoot: root,
    scope: "project", cwd, registryFile: path.join(cwd, "r.json"), confirmCode: async () => false,
  })).rejects.toThrow(/declined|trust/i)

  // A declined install must be atomic: translated files are rolled back, not orphaned.
  expect(await fs.exists(path.join(cwd, ".opencode", "agents", "pm-code-reviewer.md"))).toBe(false)
})
