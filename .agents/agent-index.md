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

- Follow `example/AGENTS.md` when changing the Starlight documentation.
- Run `npm run check` and `npm run build` from `example/`.

## Release Or Publish

- Read `.agents/deploy-and-release-guide.md` when it exists.
- Never publish, tag, push, or create a release without an explicit user request.
