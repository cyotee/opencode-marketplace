// src/cli/prompts.ts
export async function confirm(message: string): Promise<boolean> {
  const rl = (await import("node:readline/promises")).createInterface({ input: process.stdin, output: process.stdout })
  try { const a = (await rl.question(`${message} [y/N] `)).trim().toLowerCase(); return a === "y" || a === "yes" }
  finally { rl.close() }
}
