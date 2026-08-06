# Anotherverse Web Runtime

Last verified: 2026-08-06

| Component  | Version / target                    | Role                                |
| ---------- | ----------------------------------- | ----------------------------------- |
| Browser    | Current evergreen Chromium baseline | Static game runtime                 |
| React      | 19.2.x                              | Presentation and interaction        |
| TypeScript | 7.0.x, strict, ES2022               | Game and application code           |
| Vite       | 8.2.x                               | Development server and static build |
| Zustand    | 5.0.x                               | Application state adapter           |
| Zod        | 4.4.x                               | Runtime boundary validation         |
| Vitest     | 4.1.x                               | Unit and integration tests          |
| Playwright | 1.62.x                              | Browser journey tests               |

Deployment target: GitHub Pages at `/Anotherverse-/`. The build must be a self-contained static bundle. The campaign compiler and simulation must run offline and deterministically in the browser.

Knowledge risk: **Medium**. These package versions are newer than many stable reference examples. Treat the installed type definitions and passing local build/tests as authority; re-verify this file after dependency upgrades.
