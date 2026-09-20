# Development Guide

This document describes how to develop, test, and extend Graph Enhance. The user-facing documentation is available in [README.md](README.md) and [README.zh-CN.md](README.zh-CN.md).

## Prerequisites

- Node.js
- pnpm
- A Siyuan development environment for manual plugin verification

Install dependencies from the repository root:

```bash
pnpm install
```

## Development Commands

| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Run the development webpack build in watch mode. |
| `pnpm run build` | Create the production plugin bundle. |
| `pnpm test` | Run the Vitest test suite once. |
| `pnpm run test:watch` | Run Vitest in watch mode. |
| `pnpm run lint` | Run ESLint with automatic fixes. |

## Persisted State

The plugin uses two storage areas:

- `graph-enhance-config` stores user settings.
- `graph-enhance-graph-state` stores graph view runtime state, including dock toggles.

```typescript
interface GraphPersistedState {
    version: 1;
    view: {
        mode: GraphType;
    };
    filters: {
        hideDailyNotes: boolean;
        autoFollow: boolean;
    };
    layout: {
        rankdir: GraphRankDir;
        lastVertical: VerticalRankDir;
        lastHorizontal: HorizontalRankDir;
    };
}
```
