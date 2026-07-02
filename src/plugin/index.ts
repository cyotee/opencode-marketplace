// src/plugin/index.ts
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { loadCatalog } from "../core/catalog.js"
import { findPlugin } from "../core/manifest.js"
import { installPlugin, uninstallPlugin, skippedNote } from "../core/install.js"
import { readRegistry } from "../core/registry.js"

const MarketplacePlugin: Plugin = async () => {
  return {
    tool: {
      marketplace_add: tool({
        description: "Register and inspect a Claude-format marketplace from a GitHub repo or git URL.",
        args: { repo: tool.schema.string().describe("owner/repo or git URL") },
        async execute(args) {
          const repoUrl = args.repo.includes("://") ? args.repo : `https://github.com/${args.repo}.git`
          const { manifest } = await loadCatalog({ repoUrl })
          return `Marketplace "${manifest.name}" — plugins: ${manifest.plugins.map((p) => p.name).join(", ")}`
        },
      }),
      marketplace_install: tool({
        description: "Install a plugin from a marketplace into OpenCode (global by default). Set confirm:true to allow plugins that ship MCP servers.",
        args: {
          repo: tool.schema.string(), plugin: tool.schema.string(),
          confirm: tool.schema.boolean().optional(),
          project: tool.schema.boolean().optional(),
        },
        async execute(args) {
          const repoUrl = args.repo.includes("://") ? args.repo : `https://github.com/${args.repo}.git`
          const { manifest, root } = await loadCatalog({ repoUrl })
          const entry = findPlugin(manifest, args.plugin)
          if (!entry) return `Plugin "${args.plugin}" not found in "${manifest.name}"`
          const rec = await installPlugin({
            entry, marketplaceName: manifest.name, marketplaceRoot: root,
            scope: args.project ? "project" : "global",
            confirmCode: async () => args.confirm === true,
          })
          const c = rec.components
          return `Installed ${rec.plugin}@${rec.marketplace}: ${c.skills.length} skills, ${c.commands.length} commands, ${c.agents.length} agents, ${c.mcp.length} MCP.${skippedNote(rec.skipped)} Restart OpenCode to load.`
        },
      }),
      marketplace_list: tool({
        description: "List plugins installed via the marketplace.",
        args: {},
        async execute() {
          const reg = await readRegistry()
          if (!reg.length) return "No marketplace plugins installed."
          return reg.map((e) => `${e.plugin}@${e.marketplace} (${e.version})`).join("\n")
        },
      }),
      marketplace_remove: tool({
        description: "Uninstall a previously installed marketplace plugin. Scope is taken from the install record.",
        args: { marketplace: tool.schema.string(), plugin: tool.schema.string() },
        async execute(args) {
          await uninstallPlugin({ marketplace: args.marketplace, plugin: args.plugin })
          return `Removed ${args.plugin}@${args.marketplace}. Restart OpenCode to apply.`
        },
      }),
    },
  }
}

export default MarketplacePlugin
