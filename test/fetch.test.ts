// test/fetch.test.ts
import { test, expect } from "bun:test"
import os from "node:os"; import path from "node:path"; import fs from "node:fs/promises"
import { fetchSource } from "../src/core/fetch.js"

test("local source returns the directory inside the marketplace root", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "mkt-"))
  await fs.mkdir(path.join(root, "plugins", "pm"), { recursive: true })
  await fs.writeFile(path.join(root, "plugins", "pm", "x.txt"), "hi")
  const dir = await fetchSource({
    resolved: { kind: "local", path: "./plugins/pm" },
    marketplace: "cyotee", plugin: "pm", version: "1.0.0", marketplaceRoot: root,
  })
  expect(await fs.readFile(path.join(dir, "x.txt"), "utf-8")).toBe("hi")
})

test("git source invokes runner with the pinned sha and returns cache dir", async () => {
  const calls: string[][] = []
  const dir = await fetchSource({
    resolved: { kind: "git", url: "https://x/y.git", sha: "a".repeat(40) },
    marketplace: "cyotee", plugin: "pm", version: "a".repeat(40),
    run: async (cmd) => { calls.push(cmd) },
  })
  expect(calls.some((c) => c.includes("clone"))).toBe(true)
  expect(calls.flat().some((a) => a === "a".repeat(40))).toBe(true)
  expect(dir).toContain(path.join("cyotee", "pm"))
})
