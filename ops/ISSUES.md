# ISSUES

Status: todo | doing | blocked | done | parked | cut
`done` requires an evidence ID. One `doing` item per owner. New ideas enter as `parked` and wait for a DECISION or a free slot.

| ID | Title | Owner | Status | Milestone | Done when | Evidence |
|---|---|---|---|---|---|---|
| I-001 | Verify critical dependencies | agent | doing | M1 | Every critical row in DEPENDENCIES is verified with evidence | E-001, E-003, E-004 (left: Preview, faucet, Lace, hosting) |
| I-002 | Create public GitHub repo with topic midnightntwrk, push | human | doing | M1 | Repo public; topic visible on GitHub | Repo public 2026-11-16; topic missing (API showed topics: []) |
| I-003 | Scaffold contract + TS API + UI on ledger 9 versions | agent | done | M1 | `npm install` and build succeed at pinned versions | E-003, E-004 |
| I-004 | Sotto contract v1 + Compact simulator tests | agent | done | M1 | Tests pass: member files, non-member rejected, double report rejected | E-003 |
| I-005 | Demo-path smoke check against the local devnet | agent | done | M1 | Steps 1-2 run on the undeployed network | E-004 (`npm run test:local`) |
| I-006 | Deploy contract to Preview and UI to a public URL | agent | doing | M1 | Contract address on Preview; UI loads logged out and shows the ledger | |
| I-007 | Acknowledge, follow-up, anonymous reply, public response clock | agent | doing | M2 | Steps 3-5 work with real transactions | Contract + devnet E-004; UI written, not yet run |
| I-008 | Credential revocation (leaf overwrite) | agent | done | M2 | Revoked credential rejected in a test | E-003, E-004 (UI button untested) |
| I-009 | Verify EU Whistleblowing Directive timelines (7 days / 3 months) against the text | agent | todo | M3 | EVIDENCE entry quoting Directive 2019/1937 | |
| I-010 | Slide deck | agent | todo | M4 | Deck link in SUBMISSION | |
| I-011 | Attribute proofs (department, seniority) | | parked | | | |
| I-012 | DUST sponsorship so the reporter's wallet never pays (private-party pattern) | agent | todo | M2 | Report filed from a zero-balance wallet with fees paid by the org sponsor | |
| I-013 | README as proof (setup, architecture, privacy model, how to test) | agent | todo | M4 | presubmit passes the README checks | |
