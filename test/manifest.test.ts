import { test, expect } from "bun:test"
import { parseMarketplace, findPlugin, parsePluginManifest } from "../src/core/manifest.js"

test("parses a valid marketplace and finds a plugin", () => {
  const m = parseMarketplace(JSON.stringify({
    name: "cyotee", owner: { name: "cyotee" },
    plugins: [{ name: "pm", source: "./plugins/pm" }],
  }))
  expect(m.name).toBe("cyotee")
  expect(findPlugin(m, "pm")?.source).toBe("./plugins/pm")
})

test("rejects a marketplace missing name", () => {
  expect(() => parseMarketplace(JSON.stringify({ plugins: [] }))).toThrow(/name/)
})

test("rejects a plugin entry missing source", () => {
  expect(() => parseMarketplace(JSON.stringify({ name: "x", plugins: [{ name: "a" }] }))).toThrow(/source/)
})

test("parses a plugin manifest with only name", () => {
  expect(parsePluginManifest(JSON.stringify({ name: "pm" })).name).toBe("pm")
})
