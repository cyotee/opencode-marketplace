import fs from "node:fs/promises"
import path from "node:path"
import type { RegistryEntry } from "./types.js"
import { registryPath } from "./paths.js"

const key = (m: string, p: string) => `${m}/${p}`

export async function readRegistry(file: string = registryPath()): Promise<RegistryEntry[]> {
  try { return JSON.parse(await fs.readFile(file, "utf-8")) }
  catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return []; throw e }
}

async function write(file: string, entries: RegistryEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(entries, null, 2) + "\n", "utf-8")
}

export async function upsertEntry(entry: RegistryEntry, file: string = registryPath()): Promise<void> {
  const all = (await readRegistry(file)).filter((e) => key(e.marketplace, e.plugin) !== key(entry.marketplace, entry.plugin))
  all.push(entry)
  await write(file, all)
}

export async function findEntry(marketplace: string, plugin: string, file: string = registryPath()): Promise<RegistryEntry | undefined> {
  return (await readRegistry(file)).find((e) => key(e.marketplace, e.plugin) === key(marketplace, plugin))
}

export async function removeEntry(marketplace: string, plugin: string, file: string = registryPath()): Promise<RegistryEntry | undefined> {
  const all = await readRegistry(file)
  const found = all.find((e) => key(e.marketplace, e.plugin) === key(marketplace, plugin))
  if (found) await write(file, all.filter((e) => e !== found))
  return found
}
