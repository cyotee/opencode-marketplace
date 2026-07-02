import type { MarketplaceManifest, PluginEntry, PluginManifest } from "./types.js"

function asObject(json: string): Record<string, unknown> {
  let v: unknown
  try { v = JSON.parse(json) } catch (e) { throw new Error(`Invalid JSON: ${(e as Error).message}`) }
  if (typeof v !== "object" || v === null) throw new Error("Manifest must be a JSON object")
  return v as Record<string, unknown>
}

export function parseMarketplace(json: string): MarketplaceManifest {
  const o = asObject(json)
  if (typeof o.name !== "string" || !o.name) throw new Error("marketplace.json: 'name' is required")
  if (!Array.isArray(o.plugins)) throw new Error("marketplace.json: 'plugins' must be an array")
  const plugins = o.plugins.map((p, i) => {
    const e = p as Record<string, unknown>
    if (typeof e.name !== "string" || !e.name) throw new Error(`marketplace.json: plugins[${i}].name is required`)
    if (e.source === undefined) throw new Error(`marketplace.json: plugins[${i}].source is required`)
    return e as unknown as PluginEntry
  })
  return { ...(o as object), plugins } as MarketplaceManifest
}

export function parsePluginManifest(json: string): PluginManifest {
  const o = asObject(json)
  if (typeof o.name !== "string" || !o.name) throw new Error("plugin.json: 'name' is required")
  return o as unknown as PluginManifest
}

export function findPlugin(m: MarketplaceManifest, name: string): PluginEntry | undefined {
  return m.plugins.find((p) => p.name === name)
}
