# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-11-18

Evidence labels follow the repo's truth rules: OBSERVED (we ran or saw it), DERIVED (read in a source), INFERRED (our hypothesis), NOT_ENOUGH_INFO. Public wording must also have a row in `ops/CLAIMS.md`.

## Product Overview
**One-liner:** Anonymous insider reports, with a response clock anyone can verify.
**What it does:** An employee proves in zero knowledge that they are a current member of the organisation's registry and files a report nobody can trace back to them. The compliance officer answers through an encrypted two-way thread. Every acknowledgement and closure is timestamped on Midnight's public ledger, so anyone can check that the channel is answered without seeing a single report.
**Product category:** Whistleblowing / internal reporting channel software ("speak-up", "ethics hotline", "whistleblower system"). How buyers search: "whistleblowing software EU directive", "anonymous reporting channel".
**Product type:** Web app on a public privacy blockchain (Midnight). Today: open-source prototype on Midnight Preview.
**Business model:** Not decided. Hypothesis (INFERRED): per-organisation subscription for the hosted channel and officer console, with the public clock free to read. Pricing: NOT_ENOUGH_INFO.

## Target Audience
**Target companies:** Private companies in the EU with 50 or more workers, which must run an internal reporting channel (Directive (EU) 2019/1937, Art. 8(3), DERIVED, E-006). Best early fit (INFERRED): companies whose reputation depends on being seen to listen, such as regulated industries, suppliers under ESG or supply-chain audits, and firms with active works councils.
**Decision-makers:** Chief compliance officer or head of ethics; general counsel; HR director. Technical influencer: CISO / IT security.
**Primary use case:** Receive reports from verified insiders, keep the reporter's identity out of everyone's reach (the company's included), and prove the legal deadlines were met.
**Jobs to be done:**
- Meet Art. 9(1)(b) and (f): acknowledge within seven days, give feedback within three months of acknowledgement, and show it.
- Get reports people actually dare to file, because the protection doesn't depend on trusting the company.
- Keep investigating after the report: ask follow-up questions without unmasking the reporter.
**Use cases:**
- An employee reports skipped safety inspections and answers the investigator's questions over weeks, anonymously.
- A supplier audit or works council checks the public clock instead of asking for a self-reported hotline statistic.
- A company publishes its response record as a trust signal to staff, investors or journalists.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Compliance officer (user, champion) | Meeting deadlines, getting usable reports, audit trail | Anonymous drop boxes give one message and no way to ask follow-ups; deadline evidence is self-reported | A thread with every reporter, and deadlines the ledger proves |
| General counsel / CCO (decision maker) | Legal exposure, retaliation claims, regulator questions | Has to show the channel is real and the identity is protected | Identity protection by cryptography, not by policy; a record nobody can edit afterwards |
| CISO / IT security (technical influencer) | Data held, breach blast radius, vendor risk | A hosted hotline is a store of explosive personal data | Nothing identifying is held anywhere; report text is sealed end to end |
| Employee who reports (end user) | Not being identified, being answered | Distrusts any channel the employer runs | Proof-based anonymity they can check, and a reply they can read |
| Works council / auditor / journalist (verifier) | Whether reports are taken seriously | Only sees the company's own numbers | Reads the response clock directly, with no account |

## Problems & Pain Points
**Core problem:** Whistleblowing channels fail on trust in both directions. Reporters don't believe their identity is safe from the employer, and outsiders can't tell whether reports are answered.
**Why alternatives fall short:**
- Hosted hotline and case-management tools: anonymity rests on the vendor's and the employer's promise. Response statistics are self-reported. (INFERRED from the category, not checked product by product.)
- Open-source tip lines (GlobaLeaks, Hush Line, SecureDrop): strong for receiving tips, but anyone can submit, so there is no proof the reporter is an insider, and nothing public about responsiveness. (INFERRED.)
- Crypto-native attempts: StealthNote proves a company email login for public posts, with no case handling (DERIVED). Vera Report routes tips to agencies over Telegram with no insider proof (DERIVED). The open-source Midnight whistleblower inbox uses mock transactions (DERIVED, its README).
**What it costs them:** Unreported misconduct that surfaces later as a scandal or regulator action; spam and bad-faith reports from outsiders; time spent proving to auditors that deadlines were met. Amounts: NOT_ENOUGH_INFO.
**Emotional tension:** Reporters fear retaliation. Officers fear being blamed for a channel nobody trusts, or for a missed deadline they can't disprove.

## Competitive Landscape
**Direct:** EQS Integrity Line, NAVEX, FaceUp, Whistleblower Software and similar hosted channels. They fall short because the operator could identify reporters and the response record is the company's own word. (INFERRED.)
**Secondary:** Open-source tip lines (GlobaLeaks, Hush Line, SecureDrop). They fall short because they can't tell insiders from outsiders and publish nothing about responsiveness. (INFERRED.)
**Indirect:** An email inbox, a phone hotline, an ombudsperson, or going straight to a regulator or journalist. These fall short on anonymity and follow-up, or skip the company entirely.
**Ecosystem prior art:** Vera Report (AlphaTON with the Midnight Foundation, Telegram; DERIVED), StealthNote (Aztec developer, Google sign-in token; DERIVED), depapp/midnight-whistleblower (Midnight, mock on-chain; DERIVED).

## Differentiation
**Key differentiators:**
- Verified insider, unknown person: the circuit proves current membership without revealing which member (E-003, E-004).
- A conversation, not a drop box: an encrypted two-way thread; a reporter who has left can still answer (E-003).
- The response clock is public: acknowledgement and feedback timing against the directive's deadlines, read from the ledger by anyone (contract and devnet: E-004, E-007; live page: pending).
- The employer never holds the reporter's secret, so it can't compute which reports are whose.
**How we do it differently:** Proofs instead of promises. The member's secret never leaves their browser; the ledger stores timing and ciphertext only.
**Why that's better:** Reporters can rely on maths rather than their employer's goodwill; outsiders can check responsiveness without being shown anything confidential.
**Why customers choose us:** NOT_ENOUGH_INFO (no customers yet).

## Objections
| Objection | Response |
|-----------|----------|
| "Our employees don't have crypto wallets." | Today the reporter needs Lace on Midnight. DUST sponsorship (I-012, planned) lets the company pay every fee, so reporters never hold tokens. Say "planned" until it ships. |
| "Anonymous reports can't be investigated." | The thread lets the officer ask follow-up questions and the reporter answer, still anonymously. |
| "A public clock exposes us." | It shows only timing and counts, never content or identity. Companies that meet their deadlines get a record they can point to. |
| "Is ciphertext on a permanent ledger GDPR-safe?" | Nothing identifying is on chain, and the text is sealed to its recipient. Whether deleting keys counts as erasure needs legal review: NOT_ENOUGH_INFO. Don't claim compliance. |
| "Why a blockchain?" | Because the clock has to be checkable without trusting the company or us, and the membership proof needs a public registry root. |

**Anti-persona:** Organisations that want to identify reporters, companies under 50 workers with no legal obligation and no reputational need, and anyone wanting a public tip board for unverified outsiders.

## Switching Dynamics
**Push:** Low report volume because staff don't trust the hotline; auditors and works councils asking for proof of responsiveness. (INFERRED.)
**Pull:** Verified-insider reports, follow-up without unmasking, and a public deadline record.
**Habit:** An existing hotline contract that "ticks the box"; case workflows already in place.
**Anxiety:** Crypto unfamiliarity; legal review of an on-chain design; whether staff will install a wallet.

## Customer Language
**How they describe the problem:** NOT_ENOUGH_INFO. No interviews yet. Collect verbatim phrases before writing sales copy.
**How they describe us:** NOT_ENOUGH_INFO.
**Words to use:** report, reporting person, acknowledge, acknowledgement of receipt, feedback, follow-up, internal reporting channel, member, credential, sealed, response clock, on time, overdue. (The directive's own vocabulary, DERIVED.)
**Words to avoid:** "trustless", "revolutionary", "web3-powered", "military-grade", "100% anonymous", "compliant" (not established), "tamper-proof" (say what the ledger proves instead), "AI".
**Glossary:**
| Term | Meaning |
|------|---------|
| Credential | A secret generated in the employee's browser; never leaves it |
| Member key | The credential's fingerprint, given to the officer and registered on chain |
| Case | One report and its thread; its id is a nullifier, so one per member per 30-day period |
| Response clock | Public on-time and late counts for acknowledgement (7 days) and feedback (3 months from acknowledgement) |
| Sealed | Encrypted in the browser to the recipient's key; the ledger holds only ciphertext |

## Brand Voice
| Attribute | Means | Doesn't mean | Example line |
|-----------|-------|--------------|--------------|
| Quiet | Calm, low-key, no alarm | Vague or timid | "Nobody, including the company, can see who filed a report or what it says. Anyone can see whether it was answered in time." |
| Exact | Says what is proved and what isn't | Jargon or legalese | "Times are proved to within 15 minutes of block time." |
| Plain | Short sentences, concrete nouns | Cute or casual | "Seal and file report" |
| Honest about limits | Names what is planned or mocked | Self-deprecating | "In the browser, the reporter's own Lace wallet pays, which can link reports to that wallet." |

**Tone by context:**
- Support: patient, step by step, never blames the user.
- Launch: lead with the outcome for the reporter and the verifier, then the mechanism.
- Errors: say what failed and the next step ("Couldn't read the channel from the Midnight indexer… Try again").
- Sales: deadlines and proof, no fear-selling.
- Social: one concrete fact per post.
**Terms we own:** response clock; verified insider; sealed report.
**Never use (and why):** "anonymous" alone without saying from whom (overclaims); "compliant" (needs legal review); "uncensorable" (not the job).

## Proof Points
**Metrics:** Only measured ones: simulator suite 30/30 (E-007); local devnet end to end 6/6 with real proofs (E-004); hosted UI serves the proving keys (E-005). No usage numbers exist.
**Customers:** None. Do not imply any.
**Testimonials:** None.
**Value themes:**
| Theme | Proof |
|-------|-------|
| Verified insider, unknown person | E-003 (non-member, lying witness, revoked member rejected; no member key in case records), E-004 |
| Conversation, not a drop box | E-003, E-004 (two-way thread on devnet) |
| Deadlines on a public clock | E-006 (directive text), E-007 (feedback clock per Art. 9(1)(f)) |

## Goals
**Business goal (now):** Score well in Midnight Buildathon Wave 3 (deadline about 2026-11-30T15:00Z): Product & Vision 15%, Communication 10%, Business Development 5%. Then validate with compliance officers.
**Conversion action:** For judges, open the response clock, then file and answer a report on Preview. For future buyers, book a pilot channel (not offered yet).
**Current metrics:** NOT_ENOUGH_INFO.

## Learnings
*Decisions and tested lessons. Newest first. Keep it to about 20 active entries.*
| Date | Learning | Evidence | Applies to | Status |
|------|----------|----------|------------|--------|
| 2026-11-18 | State the feedback deadline as "three months from acknowledgement", not "three months from the report" | Directive Art. 9(1)(f), E-006 | All copy, UI labels, deck | active |
| 2026-11-16 | Lead with what is new against Midnight prior art: real on-chain proofs, the two-way thread and the public clock | Prior-art review, D-002 | Deck, video, README | active |

## Changelog
*Newest first. One line per revision: what changed and why.*
- v1 (2026-11-18) — Initial context, drafted from the repo, research and the verified directive text.
