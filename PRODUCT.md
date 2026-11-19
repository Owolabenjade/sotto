# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: the employee who reports.** A current member of an organisation who has seen misconduct and is deciding whether reporting is safe. Often not technical, has never used a crypto wallet, and is reading every word for signs that they could be identified. Their job: file a report that cannot be traced to them, then answer the investigator's questions without giving themselves away. (Delegated decision, 2026-11-19: the user leaned towards this and asked for an informed call; the research supports it because Sotto's value is that filing is safe without trusting the employer.)
- **Second: the public verifier.** Works councils, auditors, journalists, investors and Midnight Buildathon judges who open the public board to check, in seconds and with no account, whether the organisation answers reports on time.
- **Third: the compliance officer.** The buyer and daily operator at an EU company with 50 or more workers. Registers members by key, acknowledges cases, asks follow-up questions, closes cases, revokes leavers.

## Product Purpose

Sotto is a whistleblowing channel on the Midnight blockchain. A member proves in zero knowledge that they belong to the organisation's registry and files a sealed report nobody can trace back to them. The officer answers through an encrypted two-way thread. Acknowledgement and closure times are recorded on the public ledger, so anyone can check that the channel is answered without seeing a single report.

Success: an employee files and follows up without fear or confusion; a verifier understands the organisation's response record at a glance; an officer meets the deadlines in Directive (EU) 2019/1937, Art. 9(1)(b) and (f): acknowledgement within seven days, feedback within three months of acknowledgement.

## Positioning

Verified insider, unknown person, public clock. Hosted hotlines ask reporters to trust the operator and publish nothing about responsiveness; open tip lines cannot tell insiders from outsiders. Sotto proves membership without identity and puts the response deadlines on a public ledger nobody can edit afterwards.

## Operating Context

- Employees reach Sotto from a work or personal browser with the Lace wallet extension on the Midnight Preview network; a local proof server (Docker) is required today. Filing takes about two to three minutes (165 s observed, E-009), most of it zero-knowledge proving.
- The employee creates a credential in the browser, gives the officer only its fingerprint (the member key), and must keep a backup file to read replies later.
- The officer works from the officer desk (browser) or the officer CLI script.
- Verifiers open the public board with no wallet; it reads the Midnight indexer and refreshes every 20 seconds.
- Judges evaluate the live site, the GitHub repository, a demo video and a slide deck for the Midnight Buildathon Wave 3 (deadline about 2026-11-30 15:00 UTC).

## Capabilities and Constraints

- Working on Midnight Preview: enrol and revoke members, file a sealed report (one per member per 30-day period), acknowledge, two-way sealed thread, close; public counts of on-time and late acknowledgements and closures.
- Times are proved to within 15 minutes of block time.
- The ledger shows case ids, timestamps, status, member-key fingerprints and ciphertext. It never shows which member filed, report text, or member secrets.
- Known gap: the reporter's own Lace wallet pays the fee, which can link reports to that wallet; DUST sponsorship by the organisation is planned (I-012) and must be described as planned until it ships.
- Terminology: report, case, member, member key, credential, acknowledge, feedback, sealed, officer, the board / response clock.
- **Business model (delegated decision, hypothesis, 2026-11-19):** the code stays open source (Apache-2.0, as the Buildathon requires); organisations pay a subscription for a hosted, supported channel; the public board is always free to read. No pricing set; not validated with customers.

## Brand Commitments

- Name: Sotto. Tagline: "Anonymous insider reports, with a response clock anyone can verify."
- Voice: quiet, exact, plain, honest about limits (see `.agents/product-marketing.md`). Words to avoid: "trustless", "revolutionary", "100% anonymous", "compliant", "tamper-proof".
- No coding-tool credits in public copy.
- Visual anti-references: the editorial paper look (warm paper, serif, ink) and the station departure board (deep blue, condensed signage type, signal yellow) were both built and rejected by the user on 2026-11-19.

## Evidence on Hand

- Verified evidence log: `ops/EVIDENCE.md` (E-001 to E-010), public claims ledger: `ops/CLAIMS.md`.
- Live Preview channel "Acme Logistics GmbH" (demo organisation, contract in `deployments/preview.json`) with a demo report and the user's own test case.
- No customers, users, testimonials, pricing or partner logos exist; never fabricate them. "Acme Logistics GmbH" is a demo organisation and must read as one.

## Product Principles

1. The employee's safety comes first: every screen must make clear what is public and what is sealed before they act.
2. Prove, don't promise: show what the ledger shows, label what is planned or demo.
3. The public board must be readable in seconds by someone with no account and no crypto knowledge.
4. Plain words over crypto vocabulary; technical terms only where the user must act on them (credential, member key, Lace).

## Accessibility & Inclusion

WCAG 2.2 AA for contrast, focus and keyboard use; status never conveyed by colour alone; works at phone width; respects reduced motion. Employees may be under stress: no time pressure in the UI, no irreversible action without confirmation.
