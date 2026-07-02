// src/core/translate/model-map.ts
const DEFAULT = "anthropic/claude-sonnet"
const MAP: Record<string, string> = {
  sonnet: "anthropic/claude-sonnet",
  opus: "anthropic/claude-opus",
  haiku: "anthropic/claude-haiku",
}
export function mapModel(claude?: string): string {
  if (!claude) return DEFAULT
  if (claude.includes("/")) return claude // already an opencode-style id
  return MAP[claude] ?? DEFAULT
}
