# STATE

Updated (UTC): 2026-11-16T16:21Z
Verified at commit: none (first commit pending)
Phase: research done; foundation set up; next phase tracer bullet

## Works now
- Compact 0.36.0 in WSL compiles a Merkle-membership + nullifier probe (E-001).

## Broken or known issues
- None recorded.

## In progress
- I-001 dependency verification (compiler done; runtime, wallet SDK, proof server, local-dev, Preview pending).

## Next action
1. Human: create a public GitHub repo "sotto", add the topic midnightntwrk, share the URL (I-002). The gh CLI is not installed.
2. Agent: bring up midnight-local-dev and proof server 9.0.0 in WSL Docker and run one real transaction (I-001), then scaffold (I-003).

## Blockers and waiting on
- GitHub repo URL from the human.

## Open unknowns
- U-1: The proof server is always local and sees private witnesses. Can judges try the live URL without running Docker? Options: Lace with a local proof server (honest, more setup) or a hosted proof server (weakens privacy; must be disclosed). Resolve during the tracer bullet.
- U-2: Does DUST sponsorship or a relayer work on Preview, so the reporter's wallet never pays fees?
- U-3: Where encrypted report bodies live (on-ledger ciphertext vs off-chain store with an on-chain hash).
- U-4: Exact deadline time on AKINDO (derived from the countdown as 15:00Z).
