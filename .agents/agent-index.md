# Agent Index

Read this file first for every repository task, then load only the relevant documents.

## General Work

- Read `.agents/todo.md` for pending project work.
- Read `.agents/lessons.md` for durable implementation and verification lessons.

## Package Changes

- Use Bun for dependency management and package scripts.
- Run `bun run format:check`, `bun run typecheck`, `bun run test:coverage`, `bun run build`, and `bun run test:package`.
- Run `npm pack --dry-run` before release-related work.

## Documentation

- `docs/` holds the source of truth for the package reference. Keep it in sync with `site/docs/src/content/docs/`.
- The public website (landing, examples and docs) lives in `site/`. Follow `site/AGENTS.md` and `site/.agents/skills/package-site/SKILL.md` when changing it.
- Run `npm --prefix site run check` and `npm --prefix site run build` after website changes.
- The site is a private npm workspace with its own lockfile: use `npm` inside `site/`, never Bun. The package itself stays on Bun.

## Release Or Publish

- Read `.agents/deploy-and-release-guide.md` when it exists.
- Never publish, tag, push, or create a release without an explicit user request.
