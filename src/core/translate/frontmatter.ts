type FM = Record<string, unknown>

function coerce(raw: string): unknown {
  if (raw === "true" || raw === "false") return raw === "true"
  if (raw !== "" && !Number.isNaN(Number(raw)) && /^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return raw.replace(/^["']|["']$/g, "")
}

export function splitFrontmatter(md: string): { frontmatter: FM; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md)
  if (!m) return { frontmatter: {}, body: md }
  const fm: FM = {}
  const lines = m[1]!.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]!)
    if (!kv) continue
    const key = kv[1]!
    const raw = kv[2]!.trim()
    if (raw === "") {
      const nested: Record<string, unknown> = {}
      let j = i + 1
      for (; j < lines.length; j++) {
        const child = /^[ \t]+([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[j]!)
        if (!child) break
        nested[child[1]!] = coerce(child[2]!.trim())
      }
      if (j > i + 1) { fm[key] = nested; i = j - 1; continue }
      fm[key] = ""
    } else {
      fm[key] = coerce(raw)
    }
  }
  return { frontmatter: fm, body: md.slice(m[0].length) }
}

export function withFrontmatter(frontmatter: FM, body: string): string {
  const lines: string[] = []
  for (const [k, v] of Object.entries(frontmatter)) {
    if (v === undefined) continue
    if (v !== null && typeof v === "object") {
      lines.push(`${k}:`)
      for (const [ck, cv] of Object.entries(v as Record<string, unknown>)) lines.push(`  ${ck}: ${cv}`)
    } else {
      lines.push(`${k}: ${v}`)
    }
  }
  return `---\n${lines.join("\n")}\n---\n\n${body.replace(/^\s+/, "")}`
}
