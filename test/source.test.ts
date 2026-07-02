// test/source.test.ts
import { test, expect } from "bun:test"
import { resolveSource, assertTrusted } from "../src/core/source.js"

test("resolves a relative path to a local source", () => {
  expect(resolveSource("./plugins/pm")).toEqual({ kind: "local", path: "./plugins/pm" })
})

test("resolves github shorthand with sha", () => {
  const r = resolveSource({ source: "github", repo: "o/r", sha: "a".repeat(40) })
  expect(r).toEqual({ kind: "git", url: "https://github.com/o/r.git", sha: "a".repeat(40) })
})

test("git-subdir keeps subdir", () => {
  const r = resolveSource({ source: "git-subdir", url: "https://x/y.git", path: "tools/p", sha: "b".repeat(40) })
  expect(r.subdir).toBe("tools/p")
})

test("assertTrusted throws for git source without sha", () => {
  expect(() => assertTrusted(resolveSource({ source: "github", repo: "o/r" }))).toThrow(/sha/)
})

test("assertTrusted throws for short/invalid sha", () => {
  expect(() => assertTrusted({ kind: "git", url: "u", sha: "abc" })).toThrow(/40-char/)
})

test("local sources are always trusted", () => {
  expect(() => assertTrusted({ kind: "local", path: "./x" })).not.toThrow()
})
