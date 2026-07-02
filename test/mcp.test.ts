// test/mcp.test.ts
import { test, expect } from "bun:test"
import os from "node:os"; import path from "node:path"; import fs from "node:fs/promises"
import { collectMcpServers } from "../src/core/translate/mcp.js"

test("reads .mcp.json at plugin root", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-"))
  await fs.writeFile(path.join(dir, ".mcp.json"), JSON.stringify({ mcpServers: { db: { command: "d" } } }))
  expect(await collectMcpServers(dir, { name: "p" })).toEqual({ db: { command: "d" } })
})

test("reads inline mcpServers object from manifest", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-"))
  expect(await collectMcpServers(dir, { name: "p", mcpServers: { api: { command: "a" } } })).toEqual({ api: { command: "a" } })
})

test("returns empty when none present", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-"))
  expect(await collectMcpServers(dir, { name: "p" })).toEqual({})
})
