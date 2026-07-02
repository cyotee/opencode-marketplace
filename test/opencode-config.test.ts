// test/opencode-config.test.ts
import { test, expect } from "bun:test"
import os from "node:os"; import path from "node:path"; import fs from "node:fs/promises"
import { readConfig, mergeMcp, removeMcp, writeConfig } from "../src/core/opencode-config.js"

test("read missing config returns empty object", async () => {
  expect(await readConfig(path.join(os.tmpdir(), `nope-${Date.now()}.json`))).toEqual({})
})

test("merge preserves unknown keys and adds mcp; remove drops keys", () => {
  const cfg = { model: "x", mcp: { existing: { command: "e" } } }
  mergeMcp(cfg, { db: { command: "d" } })
  expect((cfg.mcp as Record<string, any>)).toEqual({ existing: { command: "e" }, db: { command: "d" } })
  expect((cfg as any).model).toBe("x")
  removeMcp(cfg, ["existing"])
  expect((cfg.mcp as Record<string, any>)).toEqual({ db: { command: "d" } })
})

test("write then read round-trips and injects $schema", async () => {
  const p = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "occfg-")), "opencode.json")
  await writeConfig(p, { mcp: {} })
  const back = await readConfig(p)
  expect(back.$schema).toBe("https://opencode.ai/config.json")
})
