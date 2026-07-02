// test/plugin.test.ts
import { test, expect } from "bun:test"
import MarketplacePlugin from "../src/plugin/index.js"

test("plugin exposes marketplace tools", async () => {
  const hooks = await MarketplacePlugin({
    client: {} as any, project: {} as any, directory: process.cwd(), worktree: process.cwd(),
    experimental_workspace: { register() {} }, serverUrl: new URL("http://localhost"), $: (() => {}) as any,
  })
  expect(Object.keys(hooks.tool ?? {})).toEqual(
    expect.arrayContaining(["marketplace_add", "marketplace_install", "marketplace_list", "marketplace_remove"]))
})
