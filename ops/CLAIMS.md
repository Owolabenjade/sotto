# CLAIMS

Every claim made in public (README, video, deck, submission form, UI copy, posts) gets a row with its exact wording.
Status: verified (evidence shows it) | estimated (the public copy says "estimated") | mocked (the public copy says it is simulated or seeded) | planned (must not appear in public copy as present fact) | retracted
A `verified` row cites at least one evidence ID that exists in EVIDENCE.

| ID | Claim (exact public wording) | Where it appears | Evidence | Status |
|---|---|---|---|---|
| C-001 | For compliance teams at EU companies that must run a whistleblowing channel, Sotto lets a verified current employee file a report and hold a two-way conversation without revealing who they are, by proving membership in the employee registry inside a Compact zero-knowledge circuit on Midnight, while the company's acknowledgements and response deadlines are timestamped on the public ledger, so anyone can check the channel is answered without seeing a single report. | README title, video opening, submission tagline | | planned |
| C-002 | "A report is accepted only from a credential in the current member registry, and the proof reveals nothing about which member filed it." | README What it does | E-003 (non-member, lying witness, revoked, no member key in case records), E-004 | verified |
| C-003 | "The officer can ask follow-up questions and the reporter can answer, still anonymously, even after leaving the company." | README What it does | E-003 (revoked reporter answers), E-004 (two-way thread on devnet) | verified |
| C-004 | "A public page shows, from the ledger, how many reports were acknowledged within 7 days, how many are overdue and how many were closed within 3 months." | README What it does | Counters: E-003. Page: not yet run | planned |
| C-005 | "Companies with 50 or more employees in the EU must run an internal reporting channel, acknowledge reports within 7 days and give feedback within 3 months (Directive (EU) 2019/1937, Art. 8 and 9)." | README Why it matters | I-009 | planned |
| C-006 | "Every caller-supplied time is checked against block time to within 15 minutes." | README How it works, UI provenance line | E-003 (timestamp slack tests); SLACK=900 in scripts/preview-setup.ts | verified |
| C-007 | "Simulator suite ... 28 / 28 passed" | README Proof | E-003 | verified |
| C-008 | "Local devnet ... 6 / 6 passed" | README Proof | E-004 | verified |
| C-009 | "In the browser, the reporter's own Lace wallet pays, which can link reports to that wallet." | README What is real | DERIVED from the fee model; I-012 | verified |
