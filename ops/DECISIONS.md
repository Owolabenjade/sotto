# DECISIONS

Append only. To change a decision, add a new entry that supersedes it and mark the old one `superseded by D-00N`.

## D-001: Adopt the Foundation operating files
Date (UTC): 2026-11-16T16:19Z
Status: accepted
Context: The build is timeboxed and agents lose context between sessions.
Decision: The repository carries current truth in ops/, and every session follows the protocol in AGENTS.md.
Alternatives: Rely on chat history, or keep one notes file.
Consequences: Each session spends about 15 minutes on boot and handoff. Any agent can continue from the files.

## D-002: Build Sotto (verified-insider tip line), not a sealed-bid tender or rent screening
Date (UTC): 2026-11-16T16:10Z
Status: accepted (Gate A, human pick)
Context: 14 days, solo; rubric weights Engineering 40 and QA 15. Scores: insider tip line 4.30 (4.15 after the prior-art rescore), sealed-bid tender 4.15, rent screening 3.60.
Decision: Build A. Angle against prior art: fully on-chain on Preview (depapp's is mocked), a two-way anonymous case thread, and a public response clock on the ledger.
Alternatives: sealed-bid tender (hard to prove the lowest bid without losers revealing); rent screening (identity theme saturated, about 22 Wave-1 entries).
Consequences: Must show real transactions; must address fee-payer linkage honestly.

## D-003: Name Sotto; thesis and tagline locked (Gate B)
Date (UTC): 2026-11-16T16:18Z
Status: accepted (human)
Context: Shortlist Sotto, Firsthand, Confidant; web search found no whistleblowing product with these names.
Decision: Sotto. Tagline: "Anonymous insider reports, with a response clock anyone can verify."
Alternatives: Firsthand, Confidant. Rejected: Hushline (taken), Canary, Whistle.
Consequences: The thesis is C-001.

## D-004: Wave 3 deadline taken as 2026-11-30T15:00Z
Date (UTC): 2026-11-16T15:50Z
Status: accepted
Context: The program page gave conflicting Wave 3 dates (Nov 16 in Rules, Nov 30 in Program Structure). The AKINDO countdown read by the user settles it.
Decision: Deadline 2026-11-30T15:00Z (= 2026-12-01 00:00 JST, INFERRED). Re-read the exact time on AKINDO before the Submitted gate.
Alternatives: none.
Consequences: Submitted gate set about 27 hours before.

## D-005: Reuse midnight-examples infrastructure; the contract and app logic are new
Date (UTC): 2026-11-17T22:30Z
Status: accepted
Context: midnight-local-dev is archived; midnight-examples (commit 9c354d6, 2026-11-14) is the maintained, ledger 9-pinned source and is Apache-2.0. Rules require the Midnight functionality to be newly developed during the Wave.
Decision: Copy harness files (src/test/sim.ts, src/wallet.ts, src/providers.ts, src/config.ts, src/deployments.ts, scripts/wait-for-dust.ts, compose.yml, ui provider wiring) with their Apache headers and a provenance line. Write contract/sotto.compact, witnesses, crypto, tests, UI and scripts from scratch.
Alternatives: Write the wallet and provider plumbing from scratch (days of work, no judging value); fork the voting example (would read as a fork).
Consequences: README credits midnight-examples for the harness and states which files are new.

## D-006: Host the UI as a static Vercel deployment uploaded from ui/dist
Date (UTC): 2026-11-18T12:15Z
Status: accepted
Context: The page must serve the compiled prover keys (108 MB, largest 45 MB) for Lace to prove. Vercel cannot run the Compact compiler, and committing generated keys bloats the repo.
Decision: Build in WSL (`npm run ui:build`), deploy `ui/dist` with the Vercel CLI (account owolabenjade, logged in).
Alternatives: commit contract/managed and build on Vercel (leaderboard's approach); GitHub Pages; Cloudflare Pages (25 MB per-file limit rules it out).
Consequences: Redeploys are manual; record each deployed commit in EVIDENCE. Upload size limits on Vercel are UNKNOWN until the first deploy.
