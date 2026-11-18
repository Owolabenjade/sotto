# Sotto: agent guide

For compliance teams at EU companies that must run a whistleblowing channel, Sotto lets a verified current employee file a report and hold a two-way conversation without revealing who they are, by proving membership in the employee registry inside a Compact zero-knowledge circuit on Midnight, while the company's acknowledgements and response deadlines are timestamped on the public ledger, so anyone can check the channel is answered without seeing a single report.

This repository is the project's memory; chat history is not. Every session starts from these files and ends by updating them, so any agent can pick up the work in a fresh session.

## Session protocol

**Boot** (about 5 minutes)
1. Get the real time from the system (`date -u`) and read `ops/CLOCK.md`: time left, current phase, next gate.
2. Read `ops/STATE.md`, the current milestone in `ops/PLAN.md`, and `ops/ISSUES.md`.
3. Check reality: `git status`, `git log --oneline -10`, and the smoke check below. If STATE disagrees with what you observe, sync the docs before building.
4. Take your `doing` issue, or the top `todo` in the current milestone. Before editing, state the issue ID, its done-when, your time budget, and what is out of scope.

**Work**
- One issue at a time, small commits.
- A choice between real alternatives: add it to `ops/DECISIONS.md`.
- Anything verified: add it to `ops/EVIDENCE.md` with method, result and limits.
- Public wording (README, UI copy, video script, submission form): update `ops/CLAIMS.md`.
- A new dependency or tool: verify it and add it to `ops/DEPENDENCIES.md` before it goes on the critical path.
- New ideas: add them to `ops/ISSUES.md` as `parked`. Do not build them now.

**Handoff** (reserve the last 10 minutes)
1. Run the smoke check and the tests you touched; record the results, failures included, in EVIDENCE.
2. Overwrite `ops/STATE.md`; update ISSUES, PLAN and the session log in CLOCK.
3. Run the foundation check if the skill is installed (`foundation.mjs check`); fix or record what it reports.
4. Commit `chore(ops): handoff: <summary>` and push.
5. Report in five lines: done (with evidence IDs), broken, next action, blockers, time to the next gate.

## Truth rules

- Authority, highest first: running code and executed checks, git history, `ops/` files, memory or chat. When they disagree, fix the docs to match reality.
- Label what you report: OBSERVED (you ran or saw it), DERIVED (read in source or docs), INFERRED (hypothesis or estimate), UNKNOWN. Write NOT_ENOUGH_INFO instead of guessing.
- Never report a check, measurement or result that did not run. A retry that passed is not a root cause.
- No public claim without a row in `ops/CLAIMS.md` that is verified or honestly labeled.
- Changing the plan takes a DECISION entry. After the feature freeze gate: fixes, states, polish and docs only.
- Never commit secrets: `.env` stays untracked and `.env.example` lists the variables.

## Commands

| Purpose | Command |
|---|---|
| Install | `npm install` (inside WSL: `wsl.exe -d Ubuntu -- bash scripts/wsl-run.sh "npm install"`) |
| Run locally | `npm run env:up`, then `npm run ui:dev` with ui/.env.local pointing at a contract |
| Smoke check (demo path) | `npm run compile && npm run env:up && npm run test:local` (about 8 min) |
| Tests | `npm run compile:fast && npm run test:sim` (seconds, no network) |
| Deploy | `MIDNIGHT_NETWORK=preview npx vite-node scripts/preview-setup.ts` (needs funded seeds in .env.preview) |

## Where things live

| Path | Holds |
|---|---|
| `ops/STATE.md` | Current truth, overwritten at each handoff |
| `ops/PLAN.md` | Thesis, demo path, milestones, targeted prizes, out of scope |
| `ops/ISSUES.md` | Work items with owner, status and evidence |
| `ops/DECISIONS.md` | Append-only decision log |
| `ops/EVIDENCE.md` | Records of checks that ran |
| `ops/CLAIMS.md` | Public claims and their evidence |
| `ops/DEPENDENCIES.md` | Verified dependency facts |
| `ops/CLOCK.md` | Deadline, gates, session log |
| `ops/private/` | Gitignored notes that must not be public |
| `contract/` | Compact contract, witnesses, compiled output in managed/ (gitignored) |
| `src/` | crypto, wallet and provider harness, tests in src/test/ |
| `ui/` | Browser app (Vite + React), served with contract/managed/sotto as public dir |
| `scripts/` | WSL runner, Preview setup |

## Project rules
- Docker Desktop must be running for anything that proves: the devnet, the deploy script and Lace in the browser all use the local proof server on 127.0.0.1:6300 (`npm run env:up` or `docker compose up -d --wait proof-server`). It does not autostart on this machine.
- npm on /mnt/c is slow (install 10 min, vite-node start 2 min). For heavy runs use the native copy: `rsync` the repo (minus node_modules, .git, ui/dist, contract/managed) to `~/build/sotto` in WSL and run there.
- Compact compiles only in WSL Ubuntu: `wsl.exe -d Ubuntu -- bash -lc 'export PATH="$HOME/.local/bin:$PATH"; cd <wsl path>; compact compile <file> <outdir>'`. Toolchain pinned to 0.36.0; never run a bare `compact update`.
- Versions follow the ledger 9 matrix in `ops/DEPENDENCIES.md`. Ledger 8 tutorials and samples do not work.
- Commits are authored by owolabenjade. No co-author lines or tool credits in commits, README or submission copy.
