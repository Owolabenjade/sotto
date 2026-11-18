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
| @midnight-ntwrk/compact-runtime (via midnight-js-protocol 5.0.0, v9) | 0.21.0 | critical | 2026-11-18T00:20Z | E-003, E-004 | verified | Must match the compiler exactly |
| @midnight-ntwrk/midnight-js-* | 5.0.0 (network-id 5.0.0-rc.5) | critical | 2026-11-18T00:20Z | E-004 | verified | |
| @midnightntwrk/wallet-sdk | 2.0.0 | critical | 2026-11-18T00:20Z | E-004 | verified | 1.x cannot transact on ledger 9 |
| Proof server (docker midnightntwrk/proof-server) | 9.0.0 | critical (tests) | 2026-11-18T00:20Z | E-004 | verified | Local on :6300 for tests. In the browser Lace proves via the DApp connector (leaderboard example), so the site needs no hosted proof server |
| Local devnet via compose.yml (node 2.1.101, indexer 4.4.101) | images pinned | critical (tests) | 2026-11-18T00:20Z | E-004 | verified | midnight-local-dev is archived; compose.yml copied from midnight-examples (9c354d6). Image pulls can fail with short read: retry |
| Midnight Preview network (RPC + indexer) | rpc.preview.midnight.network, indexer api/v4 | critical (public demo) | | | unverified | Chain relaunched 2026-11-07; may reset |
| Preview faucet | faucet.preview.midnight.network | critical | | | unverified | Rate limited; DUST generation takes time |
| Lace wallet (Midnight, DApp connector 4.1.0) | | critical (UI) | | | unverified | Needs the local proof server setting |
| DUST sponsorship / relayer pays fees | | optional (anonymity hardening) | | | unverified | Without it the fee payer can link the reporter; disclose |
| Hosting for the UI (Vercel static deploy) | Vercel CLI 65.15.0 | critical (public URL) | 2026-11-18T12:46Z | E-005 | verified | 134 MB upload accepted; 45 MB key served. Production alias https://sotto-ivory.vercel.app |

## How to verify a dependency
1. Read the current official docs; note the URL and the date you read them.
2. Install the exact version you will use and pin it (lockfile, foundry.toml, requirements file).
3. Run the smallest real call against the real service, not a mock: one request, one transaction, one completion.
4. Record the command and its output as an EVIDENCE entry, then fill the row.
5. Write down what could stop you during the event: key approval time, quotas and rate limits, cost, faucet limits, region limits, breaking changes, missing features.
