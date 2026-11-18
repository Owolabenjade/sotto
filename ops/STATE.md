# STATE

Updated (UTC): 2026-11-18T13:14Z
Verified at commit: 40f8db4 (plus this handoff's uncommitted docs)
Phase: tracer bullet done (M1); core build (M2) next

## Works now
- Contract v1.1 (feedback clock per Art. 9(1)(f)) compiles; simulator suite 30/30 (E-007).
- Local devnet end to end 6/6 with real proofs (E-004, previous contract revision).
- Preview: contract 0b0a90a0…eb17a1 deployed, 5 members, 1 sealed demo case (E-008). Secrets in .demo/preview.json (gitignored).
- Public page https://sotto-ivory.vercel.app reads it with no wallet (E-005, E-008).

## Broken or known issues
- Devnet suite not yet rerun on contract v1.1.
- Browser filing and officer actions through Lace untested (I-014).
- Clock headline wraps to five lines on desktop; tighten in polish.
- Reporter's own Lace wallet pays fees, which can link reports to it (I-012).

## In progress
- I-007 UI for acknowledge, thread and close (written, untested in browser).

## Next action
1. Human: Lace on Preview with local proof server, funded, DUST registered; create a credential on /#/report and send the member key.
2. Agent: script to enrol a member key as officer (scripts/officer.ts), then test filing through Lace (I-014).
3. Agent: rerun devnet suite on v1.1; DUST sponsorship (I-012).

## Blockers and waiting on
- Lace setup by the human.
- Docker Desktop must be running for any proving (it closed once today).

## Open unknowns
- U-2: DUST sponsorship from a browser wallet flow (private-party shows the Node flow).
- U-4: Exact deadline time on AKINDO (countdown-derived 2026-11-30T15:00Z); question for Discord.
- GDPR view of ciphertext on an immutable ledger: not established; never claim compliance.
