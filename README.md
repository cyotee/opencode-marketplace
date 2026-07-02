# @cyotee/opencode-marketplace

Marketplace support for OpenCode. Installs Claude-format plugin catalogs as native OpenCode
skills, commands, agents, and MCP servers.

## Install (pick one)
- `bunx @cyotee/opencode-marketplace init`   # recommended — Bun ships with OpenCode
- `npx @cyotee/opencode-marketplace init`
- `npm i -g @cyotee/opencode-marketplace && opencode-marketplace init`

Then restart OpenCode. In-session, ask the agent to "add marketplace owner/repo" or
"install <plugin> from <repo>".

## CLI
- `opencode-marketplace add <owner/repo|git-url>`
- `opencode-marketplace install <plugin>@<owner/repo|git-url> [--project] [--yes]`
- `opencode-marketplace list`
- `opencode-marketplace remove <plugin>@<marketplace> [--project]`

## Scope & trust
Installs globally (`~/.config/opencode/`) by default; `--project` writes to `./.opencode/`.
Remote plugins must pin a full commit SHA. Plugins shipping MCP servers prompt for confirmation.

## Not yet supported (phase 2)
Hooks and LSP servers are detected and skipped (reported), not translated.
