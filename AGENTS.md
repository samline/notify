# AGENTS

## Main Instruction

Before starting any task in this repository, the AI must first read `.agents/agent-index.md`.

That file acts as the master index of the project's internal instructions and defines which other documents in `.agents/` should be reviewed based on the type of work.

## Mandatory Reading Rule

When starting a new conversation or a new task inside this repository, the AI must follow this order strictly:

1. **Graph Query (MCP):** Whenever the agent needs to see files, the directory structure, or any element of the project, it must first use the `codebase-memory-mcp` MCP to get the information from the graph.
2. Read `.agents/agent-index.md`.
3. Determine the type of task.
4. Read the additional internal documents that `.agents/agent-index.md` points to for that context.

---

## Available Internal Documents

The AI must use `.agents/agent-index.md` as the entry point to locate and review, when applicable:

1. `.agents/package-replication-guide.md`
2. `.agents/deploy-and-release-guide.md`
3. `.agents/todo.md`
4. `.agents/lessons.md`
5. `.agents/new-project.md`

---

## Interpretation Rule

The files inside `.agents/` are internal instructions for the AI, not public documentation of the package.

The AI must treat them as operational context of the project.

> **Critical Git Note (updated 2026-07-13):** `AGENTS.md` and `.agents/` **are versioned** and appear in git. They are only excluded from the published npm tarball via `.npmignore`. The old convention of keeping them out of Git is deprecated.

---

## Minimum Cases

### General task

1. Query the graph with `codebase-memory-mcp`.
2. Read `.agents/agent-index.md`.
3. If applicable, review `.agents/todo.md` and `.agents/lessons.md`.

### New package or new scaffold

1. Query the graph with `codebase-memory-mcp`.
2. Read `.agents/agent-index.md`, `.agents/package-replication-guide.md`, `.agents/new-project.md`, `.agents/todo.md` and `.agents/lessons.md`.

### Website (landing, examples and docs)

1. Query the graph with `codebase-memory-mcp`.
2. Read `.agents/agent-index.md` and `site/AGENTS.md` (plus `site/.agents/skills/package-site/SKILL.md`).
3. The website is the private workspace in `site/`. It owns the landing page, the examples gallery and the documentation app. It never ships in the npm tarball.

### Release, deploy, or publish

1. Query the graph with `codebase-memory-mcp`.
2. Read `.agents/agent-index.md`, `.agents/deploy-and-release-guide.md`, `.agents/todo.md` and `.agents/lessons.md`.

---

## Persistence Rule

If the user adds new internal rules, todos, or lessons, the AI must keep the corresponding documents inside `.agents/` updated.

If during a session the AI saves context in the chat session memory and that content corresponds to an internal rule, a todo, a lesson, or an operational preference of the project, it must also persist it in the appropriate file in `.agents/` to keep coherence if the session is cleared.

The AI must also preserve the current convention: `AGENTS.md` and `.agents/` are versioned in git but excluded from the published npm tarball.

---

## Agent skills and memory location

Agents, Claude included, store and read project skills and memory in `.agents/`. Skills are created and edited only in `.agents/skills/`. `.claude/skills` is a tracked relative symlink to `../.agents/skills` because Claude Code loads project skills only from `.claude/skills/`; never keep a second copy there. On Windows, clone with `git config core.symlinks true`. `.claude/` is excluded from the npm tarball through `.npmignore`, like `.agents/`.

## Identity convention — 2026-11-06

README structure follows the canonical template proposal, including TOC/resource
roles, installation blocks, API/guide tables, entrypoints and skill source/download.
Shared site-identity.mjs composes `<subject> — <npm name>` once for document and
social titles. Footer display credit is explicitly samline, independent of npm
author metadata. Keep the identity check in verify/release/CI, and test the real
configured header name before a substituted sibling. The maintained policy is
https://github.com/samline/package-landing-docs/blob/main/.agents/identity.md;
package-specific API content and runtime publication remain separate.
