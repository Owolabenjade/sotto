# DEPENDENCIES

Fail closed: nothing goes on the critical path until its row here is `verified` with evidence.
Covers libraries, SDKs, APIs, models, chains and testnets, faucets, hosting, data sources, agent skills and MCP servers.
Status: verified | unverified | failed | dropped
Role: critical (the demo path breaks without it) | optional

Version source: https://docs.midnight.network/relnotes/support-matrix.md (read 2026-11-16; mainnet, preprod and preview all on ledger 9). Ledger 8 versions do not work on any public network.

| Dependency | Pinned version | Role | Verified (UTC) | Evidence | Status | Limits, keys, gotchas |
|---|---|---|---|---|---|---|
| Compact devtools (`compact`) in WSL Ubuntu | 0.5.3 | critical | 2026-11-16T16:00Z | E-001 | verified | Windows unsupported natively; WSL only. Matrix lists devtools 0.5.1; 0.5.3 installed and works |
| Compact toolchain (`compact compile`) | 0.36.0 (language 0.28.0) | critical | 2026-11-16T16:00Z | E-001 | verified | Never run a bare `compact update` |
| @midnight-ntwrk/compact-runtime | 0.21.0 | critical | | | unverified | Must match the compiler exactly |
| @midnight-ntwrk/midnight-js | 5.0.0 | critical | | | unverified | |
| @midnightntwrk/wallet-sdk | 2.0.0 | critical | | | unverified | 1.x cannot transact on ledger 9 |
| Proof server (docker midnightntwrk/proof-server) | 9.0.0 | critical | | | unverified | Always local on :6300. Sees private witnesses, so a hosted one weakens the privacy model (U-1 in STATE) |
| midnight-local-dev (undeployed network) | main | critical (tests) | | | unverified | Needs Docker and Node 22; genesis wallet pre-funded |
| Midnight Preview network (RPC + indexer) | rpc.preview.midnight.network, indexer api/v4 | critical (public demo) | | | unverified | Chain relaunched 2026-11-07; may reset |
| Preview faucet | faucet.preview.midnight.network | critical | | | unverified | Rate limited; DUST generation takes time |
| Lace wallet (Midnight, DApp connector 4.1.0) | | critical (UI) | | | unverified | Needs the local proof server setting |
| DUST sponsorship / relayer pays fees | | optional (anonymity hardening) | | | unverified | Without it the fee payer can link the reporter; disclose |
| Hosting for the UI (Vercel or similar) | | critical (public URL) | | | unverified | |

## How to verify a dependency
1. Read the current official docs; note the URL and the date you read them.
2. Install the exact version you will use and pin it (lockfile, foundry.toml, requirements file).
3. Run the smallest real call against the real service, not a mock: one request, one transaction, one completion.
4. Record the command and its output as an EVIDENCE entry, then fill the row.
5. Write down what could stop you during the event: key approval time, quotas and rate limits, cost, faucet limits, region limits, breaking changes, missing features.
