// test/catalog.test.ts
import { test, expect } from "bun:test"
import os from "node:os"; import path from "node:path"; import fs from "node:fs/promises"
import { loadCatalog } from "../src/core/catalog.js"

test("loads a local marketplace from .claude-plugin/marketplace.json", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "mkt-"))
  await fs.mkdir(path.join(root, ".claude-plugin"), { recursive: true })
  await fs.writeFile(path.join(root, ".claude-plugin", "marketplace.json"),
    JSON.stringify({ name: "cyotee", plugins: [{ name: "pm", source: "./plugins/pm" }] }))
  const { manifest, root: r } = await loadCatalog({ localRoot: root })
  expect(manifest.name).toBe("cyotee")
  expect(r).toBe(root)
})
