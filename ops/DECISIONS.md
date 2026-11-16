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
Date (UTC): 2026-11-16T16:40Z
Status: accepted (Gate A, human pick)
Context: 14 days, solo; rubric weights Engineering 40 and QA 15. Scores: insider tip line 4.30 (4.15 after the prior-art rescore), sealed-bid tender 4.15, rent screening 3.60.
Decision: Build A. Angle against prior art: fully on-chain on Preview (depapp's is mocked), a two-way anonymous case thread, and a public response clock on the ledger.
Alternatives: sealed-bid tender (hard to prove the lowest bid without losers revealing); rent screening (identity theme saturated, about 22 Wave-1 entries).
Consequences: Must show real transactions; must address fee-payer linkage honestly.

## D-003: Name Sotto; thesis and tagline locked (Gate B)
Date (UTC): 2026-11-16T16:55Z
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
