export type InstallScope = "global" | "project"

export type PluginSource =
  | string
  | { source: "github"; repo: string; ref?: string; sha?: string }
  | { source: "url"; url: string; ref?: string; sha?: string }
  | { source: "git-subdir"; url: string; path: string; ref?: string; sha?: string }
  | { source: "npm"; package: string; version?: string; registry?: string }

export interface PluginEntry {
  name: string
  source: PluginSource
  description?: string
  version?: string
  skills?: string | string[]
  commands?: string | string[]
  agents?: string | string[]
  mcpServers?: string | Record<string, unknown>
}

export interface MarketplaceManifest {
  name: string
  owner?: { name: string; email?: string }
  description?: string
  version?: string
  metadata?: { description?: string; version?: string; pluginRoot?: string }
  plugins: PluginEntry[]
}

export interface PluginManifest {
  name: string
  version?: string
  description?: string
  skills?: string | string[]
  commands?: string | string[]
  agents?: string | string[]
  mcpServers?: string | Record<string, unknown>
}

export interface ResolvedSource {
  kind: "local" | "git" | "npm"
  path?: string                 // local
  url?: string; ref?: string; sha?: string; subdir?: string  // git
  package?: string; versionSpec?: string; registry?: string  // npm
}

export interface InstalledComponents {
  skills: string[]
  commands: string[]
  agents: string[]
  mcp: string[]
}

export interface RegistryEntry {
  marketplace: string
  plugin: string
  version: string
  source: PluginSource
  sha?: string
  scope: InstallScope
  projectRoot?: string            // recorded for "project" scope so uninstall targets the right dir
  components: InstalledComponents
  installedAt: string
}

export interface TranslationResult {
  components: InstalledComponents
  skipped: { hooks: boolean; lsp: boolean }
  mcpServers: Record<string, unknown>
}
