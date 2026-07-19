# Hermes Tweet Example for OpenCode Marketplace

Hermes Tweet is a Claude-format plugin catalog that includes an X/Twitter skill for Xquik-powered social research, read workflows, and approval-gated actions.

Use this example when an OpenCode workspace needs an agent skill for X/Twitter monitoring, launch research, community audits, or user-approved publishing workflows.

## Install

Install the marketplace bridge first:

```sh
bunx @cyotee/opencode-marketplace init
```

Then install Hermes Tweet from this repository's pinned catalog entry:

```sh
opencode-marketplace install hermes-tweet@cyotee/opencode-marketplace --yes
```

For a project-local install, add `--project`:

```sh
opencode-marketplace install hermes-tweet@cyotee/opencode-marketplace --project --yes
```

## Runtime Notes

- Configure `XQUIK_API_KEY` where the agent runtime executes.
- Keep action workflows gated unless the user explicitly approves the operation.
- Start with read-only X/Twitter research tasks before enabling account-changing actions.
- Restart OpenCode after installation so translated skills are loaded.

Source: [Xquik-dev/hermes-tweet](https://github.com/Xquik-dev/hermes-tweet)

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.
