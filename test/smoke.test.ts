import { test, expect } from "bun:test"
import type { MarketplaceManifest } from "../src/core/types.js"

test("types module is importable and shape compiles", () => {
  const m: MarketplaceManifest = { name: "x", plugins: [] }
  expect(m.name).toBe("x")
})
