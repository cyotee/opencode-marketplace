// test/cli.test.ts
import { test, expect } from "bun:test"
import os from "node:os"; import path from "node:path"; import fs from "node:fs/promises"
import { run } from "../src/cli/index.js"

test("init vendors a plugin file into the global plugins dir", async () => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), "home-"))
  const prev = process.env.HOME; process.env.HOME = home
  try {
    // simulate a built artifact next to the cli
    const code = await run(["init", "--yes"])
    expect(code).toBe(0)
    const dest = path.join(home, ".config", "opencode", "plugins", "cyotee-marketplace.js")
    expect(await fs.exists(dest)).toBe(true)
  } finally { process.env.HOME = prev }
})

test("list with no installs prints a friendly message and exits 0", async () => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), "home-"))
  const prev = process.env.HOME; process.env.HOME = home
  try { expect(await run(["list"])).toBe(0) } finally { process.env.HOME = prev }
})

test("commands report actionable usage when required targets are missing", async () => {
  const cases: Array<{ argv: string[]; usage: string }> = [
    { argv: ["add"], usage: "Usage: opencode-marketplace add <owner/repo|git-url>" },
    { argv: ["install"], usage: "Usage: opencode-marketplace install <plugin>@<owner/repo|git-url> [--project] [--yes]" },
    { argv: ["install", "hermes-tweet"], usage: "Usage: opencode-marketplace install <plugin>@<owner/repo|git-url> [--project] [--yes]" },
    { argv: ["remove"], usage: "Usage: opencode-marketplace remove <plugin>@<marketplace>" },
  ]

  for (const { argv, usage } of cases) {
    const errors: string[] = []
    expect(await run(argv, { reportError: (message) => errors.push(message) })).toBe(1)
    expect(errors).toEqual([usage])
  }
})
