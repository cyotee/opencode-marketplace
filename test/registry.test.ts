import { test, expect } from "bun:test"
import os from "node:os"; import path from "node:path"; import fs from "node:fs/promises"
import { readRegistry, upsertEntry, removeEntry, findEntry } from "../src/core/registry.js"
import type { RegistryEntry } from "../src/core/types.js"

function entry(): RegistryEntry {
  return { marketplace: "cyotee", plugin: "pm", version: "1.0.0", source: "./p", scope: "global",
    components: { skills: ["pm-x"], commands: [], agents: [], mcp: [] }, installedAt: "t" }
}

test("upsert, find, remove", async () => {
  const file = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "reg-")), "registry.json")
  await upsertEntry(entry(), file)
  expect((await readRegistry(file)).length).toBe(1)
  expect((await findEntry("cyotee", "pm", file))?.version).toBe("1.0.0")
  const e2 = { ...entry(), version: "2.0.0" }; await upsertEntry(e2, file)
  expect((await readRegistry(file)).length).toBe(1) // upsert, not duplicate
  expect((await findEntry("cyotee", "pm", file))?.version).toBe("2.0.0")
  expect((await removeEntry("cyotee", "pm", file))?.plugin).toBe("pm")
  expect((await readRegistry(file)).length).toBe(0)
})
