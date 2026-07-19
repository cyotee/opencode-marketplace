#!/usr/bin/env node
import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
import { globalRoot, targetDirs } from "../core/paths.js"
import { loadCatalog } from "../core/catalog.js"
import { findPlugin } from "../core/manifest.js"
import { installPlugin, uninstallPlugin, skippedNote } from "../core/install.js"
import { readRegistry } from "../core/registry.js"

const VENDOR_NAME = "cyotee-marketplace.js"
const USAGE = "Usage: opencode-marketplace <init|add|install|list|remove> [--project] [--yes]"

function requireArgument(value: string | undefined, usage: string): string {
  if (!value) throw new Error(usage)
  return value
}

function splitTarget(value: string | undefined, usage: string): [string, string] {
  const target = requireArgument(value, usage)
  const separator = target.indexOf("@")
  if (separator < 1 || separator === target.length - 1) throw new Error(usage)
  return [target.slice(0, separator), target.slice(separator + 1)]
}

async function doInit(yes: boolean): Promise<number> {
  const here = path.dirname(url.fileURLToPath(import.meta.url))
  const artifact = path.join(here, "plugin.js") // dist/plugin.js sits beside dist/cli.js
  const dest = path.join(globalRoot(), "plugins", VENDOR_NAME)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  // vendor the bundled plugin for an instant/offline first run
  try { await fs.copyFile(artifact, dest) }
  catch { await fs.writeFile(dest, "export { default } from \"@cyotee/opencode-marketplace\"\n") } // dev fallback
  console.log(`Installed marketplace plugin → ${dest}`)
  if (!yes) console.log("Restart OpenCode to load it.")
  return 0
}

export async function run(argv: string[], opts: {
  confirm?: () => Promise<boolean>
  reportError?: (message: string) => void
} = {}): Promise<number> {
  const flags = new Set(argv.filter((a) => a.startsWith("--")))
  const pos = argv.filter((a) => !a.startsWith("--"))
  const scope = flags.has("--project") ? "project" as const : "global" as const
  const cmd = pos[0]
  const confirmFn = opts.confirm ?? (async () => flags.has("--yes") ? true : (await import("./prompts.js")).confirm("This plugin ships MCP servers (runs code). Trust and install?"))
  const reportError = opts.reportError ?? console.error

  try {
    switch (cmd) {
      case "init": return await doInit(flags.has("--yes"))
      case "add": {
        const repo = requireArgument(pos[1], "Usage: opencode-marketplace add <owner/repo|git-url>")
        const { manifest } = await loadCatalog({ repoUrl: toUrl(repo) })
        console.log(`${manifest.name}: ${manifest.plugins.map((p) => p.name).join(", ")}`); return 0
      }
      case "install": {
        const [plugin, repo] = splitTarget(pos[1], "Usage: opencode-marketplace install <plugin>@<owner/repo|git-url> [--project] [--yes]")
        const { manifest, root } = await loadCatalog({ repoUrl: toUrl(repo) })
        const entry = findPlugin(manifest, plugin)
        if (!entry) { console.error(`Plugin "${plugin}" not found`); return 1 }
        const rec = await installPlugin({ entry, marketplaceName: manifest.name, marketplaceRoot: root, scope, confirmCode: confirmFn })
        console.log(`Installed ${rec.plugin}@${rec.marketplace}.${skippedNote(rec.skipped)} Restart OpenCode to load.`); return 0
      }
      case "list": {
        const reg = await readRegistry()
        console.log(reg.length ? reg.map((e) => `${e.plugin}@${e.marketplace} (${e.version})`).join("\n") : "No marketplace plugins installed.")
        return 0
      }
      case "remove": {
        const [plugin, marketplace] = splitTarget(pos[1], "Usage: opencode-marketplace remove <plugin>@<marketplace>")
        await uninstallPlugin({ marketplace, plugin }); console.log(`Removed ${plugin}@${marketplace}.`); return 0
      }
      default:
        console.log(USAGE); return cmd ? 1 : 0
    }
  } catch (e) { reportError((e as Error).message); return 1 }
}

function toUrl(repo: string): string { return repo.includes("://") ? repo : `https://github.com/${repo}.git` }

if (import.meta.url === url.pathToFileURL(process.argv[1] ?? "").href) {
  run(process.argv.slice(2)).then((c) => process.exit(c))
}
