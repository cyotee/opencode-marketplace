import type { PluginSource, ResolvedSource } from "./types.js"

export const SHA_RE = /^[0-9a-f]{40}$/

export function resolveSource(source: PluginSource): ResolvedSource {
  if (typeof source === "string") {
    if (!source.startsWith("./")) throw new Error(`Relative source must start with "./": ${source}`)
    return { kind: "local", path: source }
  }
  switch (source.source) {
    case "github":
      return { kind: "git", url: `https://github.com/${source.repo}.git`, ref: source.ref, sha: source.sha }
    case "url":
      return { kind: "git", url: source.url, ref: source.ref, sha: source.sha }
    case "git-subdir":
      return { kind: "git", url: source.url, subdir: source.path, ref: source.ref, sha: source.sha }
    case "npm":
      return { kind: "npm", package: source.package, versionSpec: source.version, registry: source.registry }
    default:
      throw new Error(`Unknown source type: ${(source as { source: string }).source}`)
  }
}

export function assertTrusted(resolved: ResolvedSource): void {
  if (resolved.kind !== "git") return
  if (!resolved.sha) throw new Error(`Remote source ${resolved.url} must pin a commit 'sha'. Find it with: git ls-remote ${resolved.url} HEAD`)
  if (!SHA_RE.test(resolved.sha)) throw new Error(`Source 'sha' must be a full 40-char lowercase hex commit: got "${resolved.sha}"`)
}
