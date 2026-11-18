# PLAN

Project: Sotto
Tagline: Anonymous insider reports, with a response clock anyone can verify.
Thesis: For compliance teams at EU companies that must run a whistleblowing channel, Sotto lets a verified current employee file a report and hold a two-way conversation without revealing who they are, by proving membership in the employee registry inside a Compact zero-knowledge circuit on Midnight, while the company's acknowledgements and response deadlines are timestamped on the public ledger, so anyone can check the channel is answered without seeing a single report.
Timebox: hackathon
Deadline and gates: see ops/CLOCK.md

Change this plan only through a DECISION entry. Keep it to one screen.

## Demo path
The single flow that must work every time. Everything else is optional.
1. Compliance officer deploys a Sotto channel for "Acme" on Midnight Preview and enrols employees; the public ledger holds only a Merkle root of credential commitments.
2. An employee loads their credential and files a report; the circuit proves "current member" and burns a per-period nullifier; the case opens on-chain with a timestamp, contents encrypted off the public ledger.
3. The officer acknowledges the case and asks a follow-up; the public response clock shows the acknowledgement time.
4. The reporter replies anonymously on the same case.
5. Public page shows channel stats from the ledger (cases, acknowledged on time, overdue). A second report in the same period and a revoked credential are both rejected on screen.

## Milestones
| ID | Milestone | Done when (observable) | Gate | Status |
|---|---|---|---|---|
| M1 | Tracer bullet | Steps 1-2 run end to end, ugly, on a public URL against Preview; smoke check passes | Tracer bullet | done (E-004, E-008) |
| M2 | Core | Steps 1-5 complete with real transactions; simulator tests cover member, non-member, double report, revoked, ack, reply | Feature freeze | todo |
| M3 | Hardened | Loading, empty and error states on the demo path; design floor passes; benchmark gaps fixed or disclosed | Video recorded | todo |
| M4 | Shipped | README, deck, video and AKINDO submission done; presubmit passes; platform shows submitted | Submitted | todo |

Status: todo | doing | done | cut

## Targeted tracks and prizes
| Track or prize | Requirement (verbatim, with source) | Where we meet it | Status |
|---|---|---|---|
| Midnight Buildathon Wave 3 grant pool (US$5,000, split by points) | "Include at least one Compact contract that compiles successfully." (program page pasted 2026-11-16) | `contract/sotto.compact` | todo |
| same | "The repository must include the midnightntwrk label on GitHub." | repo topics | todo |
| same | Midnight code "publicly available under the Apache License 2.0" | LICENSE | done |
| same | Public repo, README, slide deck, demo video, progress description | M4 | todo |

## Out of scope
- Attribute proofs (department, seniority), evidence attestation, rewards or payouts.
- Mainnet deployment; mobile app; multi-organisation onboarding UI.
- Real HR or SSO integration (credentials are issued by the demo officer console).
