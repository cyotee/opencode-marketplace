// src/core/paths.ts
import os from "node:os"
import path from "node:path"
import type { InstallScope } from "./types.js"

// Prefer $HOME over os.homedir(): Bun caches os.homedir() at startup and ignores
// runtime $HOME changes, which breaks test isolation. Both agree on a normal system,
// so every command (init/install/list/remove) resolves ONE consistent global root.
function homeDir(): string { return process.env.HOME || os.homedir() }

export function globalRoot(): string { return path.join(homeDir(), ".config", "opencode") }

export function targetDirs(scope: InstallScope, cwd: string = process.cwd()) {
  const root = scope === "global" ? globalRoot() : path.join(cwd, ".opencode")
  return {
    root,
    skills: path.join(root, "skills"),
    commands: path.join(root, "commands"),
    agents: path.join(root, "agents"),
    pluginsDir: path.join(root, "plugins"),
    configPath: path.join(root, "opencode.json"),
  }
}

export function registryPath(): string {
  return path.join(globalRoot(), "marketplace", "registry.json")
}

export function cacheDir(marketplace: string, plugin: string, version: string): string {
  return path.join(os.homedir(), ".cache", "opencode-marketplace", "cache", marketplace, plugin, version)
}
