# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml`).

```bash
pnpm dev      # dev server on :3000
pnpm build    # production build
pnpm start    # serve the build
pnpm lint     # eslint (flat config, next core-web-vitals + typescript)
```

No test runner is configured.

## Architecture

Unmodified `create-next-app` scaffold — Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript strict. `app/` holds the only source: `layout.tsx` (Geist fonts via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`) and `page.tsx`. `@/*` maps to the repo root.

Tailwind v4 has no `tailwind.config`: it is loaded through `@tailwindcss/postcss` in `postcss.config.mjs`, and theme tokens live in `app/globals.css` under `@theme inline`.

## Next.js 16 specifics

Read `node_modules/next/dist/docs/` before writing code — this Next version differs from older training data. Two things already visible in the scaffold:

- Route-typed props are **globals**, not imports: `LayoutProps<"/">`, `PageProps<"/route">`. Generated into `.next/types` by `next dev`/`next build`, so run one before typechecking a new route.
- `next dev` regenerates the agent-instructions block in `AGENTS.md` (see `node_modules/next/dist/server/lib/generate-agent-files.js`). Commit it with your work rather than reverting it.
