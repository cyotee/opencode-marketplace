// test/paths.test.ts
import { test, expect } from "bun:test"
import os from "node:os"
import path from "node:path"
import { targetDirs, registryPath, cacheDir } from "../src/core/paths.js"

test("global scope resolves under ~/.config/opencode", () => {
  const d = targetDirs("global")
  expect(d.root).toBe(path.join(os.homedir(), ".config", "opencode"))
  expect(d.skills).toBe(path.join(d.root, "skills"))
  expect(d.configPath).toBe(path.join(d.root, "opencode.json"))
})

test("project scope resolves under cwd/.opencode", () => {
  const d = targetDirs("project", "/tmp/proj")
  expect(d.root).toBe(path.join("/tmp/proj", ".opencode"))
  expect(d.agents).toBe(path.join("/tmp/proj", ".opencode", "agents"))
})

test("cacheDir is versioned under ~/.cache", () => {
  expect(cacheDir("cyotee", "pm", "1.0.0")).toBe(
    path.join(os.homedir(), ".cache", "opencode-marketplace", "cache", "cyotee", "pm", "1.0.0"))
})

test("registryPath under config/opencode/marketplace", () => {
  expect(registryPath()).toBe(path.join(os.homedir(), ".config", "opencode", "marketplace", "registry.json"))
})
