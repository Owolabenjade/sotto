# Sotto: anonymous insider reports, with a response clock anyone can verify

**Live demo:** _deploying to Midnight Preview_ · **Video:** _coming in Wave 3_ · **Deck:** _coming in Wave 3_ · **Contract:** _see [deployments/](deployments/)_

Sotto is a whistleblowing channel on [Midnight](https://midnight.network). An employee proves, in zero knowledge, that they are a current member of the organisation's registry and files a report that nobody can trace back to them. The compliance officer answers through an encrypted two-way thread. Every acknowledgement and closure is timestamped on the public ledger, so anyone can check that the channel is actually answered, without seeing a single report.

## What it does

- **Verified, anonymous reports.** A report is accepted only from a credential in the current member registry, and the proof reveals nothing about which member filed it.
- **A conversation, not a drop box.** The officer can ask follow-up questions and the reporter can answer, still anonymously, even after leaving the company.
- **Public accountability.** A public page shows, from the ledger, how many reports were acknowledged within 7 days, how many are overdue and how many got feedback within 3 months of acknowledgement.

## Why it matters

Whistleblowing channels fail in two ways: reporters don't trust them to protect their identity, and nobody outside the company can tell whether reports are answered. Existing tools ask the reporter to trust the operator on the first point and give the public nothing on the second. Sotto replaces both with proofs.

EU law requires private companies with 50 or more workers to run an internal reporting channel, acknowledge each report within seven days and give feedback within three months of the acknowledgement ([Directive (EU) 2019/1937](https://www.legislation.gov.uk/eudr/2019/1937/chapter/II), Art. 8(3) and 9(1)). Sotto puts exactly those two deadlines on a public clock.

## How it works

```
 employee browser                      Midnight (public ledger)                 officer browser
 ────────────────                      ────────────────────────                 ───────────────
 secret sk (never leaves)              members: Merkle root of member keys
 memberKey = H(sk) ── given once ───▶  enrol(memberKey)  ◀── officer proves officerKey
 seal(report, officerBox)
 prove: H(sk) is a leaf of the root ─▶ fileReport: case id = H(sk, period, contract)
        case id not used yet           cases[id] = {openedAt, status, …}
                                       messages[id,0] = ciphertext ──────────────▶ open(…)
                                       acknowledge: ackOnTime or ackLate ◀──────── officer
 open(question) ◀──────────────────── messages[id,1] = ciphertext ◀────────────── officerMessage
 prove: H(sk, id) = reporterTag ────▶ messages[id,2] = ciphertext ──────────────▶ open(…)
```

1. The employee generates a secret in their browser and gives the officer only `memberKey(secret)`. The officer registers it with [`enrol`](contract/sotto.compact). Because the officer never holds the secret, they cannot compute a member's case ids.
2. To report, the browser seals the text to the officer's X25519 key ([`src/crypto.ts`](src/crypto.ts)) and calls [`fileReport`](contract/sotto.compact). The circuit checks a Merkle path from `memberKey(secret)` to the current registry root, derives the case id as a nullifier of the secret, the 30-day period and the contract address, and refuses a second report in the same period.
3. The public ledger stores the case's timestamps and status and the ciphertext. It never stores which member filed it.
4. [`acknowledge`](contract/sotto.compact) and [`closeCase`](contract/sotto.compact) compare the officer's timestamp against the 7-day window and the 3-month feedback window, which starts at the acknowledgement (or at day 7 if that was late), as Art. 9(1)(f) sets it, and increment public on-time or late counters. Every caller-supplied time is checked against block time to within 15 minutes.
5. Follow-ups are sealed to a per-case reporter key derived from the secret. [`reporterMessage`](contract/sotto.compact) proves authorship of the case with `reporterTag(secret, caseId)`, not membership, so a reporter who has since left can still answer.
6. [`revoke`](contract/sotto.compact) overwrites a member's leaf, so no proof against the new root can use that credential.

## Built with Midnight

| What | Where | Why the product depends on it |
|---|---|---|
| Compact contract with private witnesses | [`contract/sotto.compact`](contract/sotto.compact), [`contract/witnesses.ts`](contract/witnesses.ts) | The membership proof and the authorship proof run on secrets that never leave the user's device |
| Public and private state together | `cases`, counters (public) vs `secretKey` witness (private) | The response clock is public; who reported is not |
| `MerkleTree`, `persistentHash`, nullifiers | `members`, `caseNullifier`, `reporterTag` | Anonymous membership, one report per period, revocation |
| `blockTimeGte` / `blockTimeLt` | `stamp()` in the contract | Deadlines on the public clock are bound to block time |
| `Opaque<"Uint8Array">` ledger values | `messages` | Encrypted thread stored on chain, readable only by its recipient |
| Midnight.js 5, Wallet SDK 2, DApp connector (Lace) | [`src/`](src/), [`ui/src/chain.ts`](ui/src/chain.ts) | Proving, balancing and submitting transactions |

## Proof

| Check | Result | Evidence |
|---|---|---|
| Contract compiles with Compact 0.36.0 (7 circuits, with prover and verifier keys) | OK | `ops/EVIDENCE.md` E-004 |
| Simulator suite: every guard, the response clock, the thread, revocation, and "no secret in public state" checks | 30 / 30 passed | E-003, E-007 |
| Local devnet, real proofs and transactions: deploy, enrol 3, anonymous sealed report read by the officer, duplicate report rejected, on-time acknowledgement, two-way thread, revoked member rejected | 6 / 6 passed | E-004 |

## Try it

**Judge path:** _the Preview URL goes here once deployed._

**Run locally** (Linux, macOS or WSL; Node 22, Docker, [Compact](https://docs.midnight.network/getting-started/installation) 0.36.0):

```bash
git clone https://github.com/Owolabenjade/sotto.git && cd sotto
npm install
npm run compile:fast && npm run test:sim     # simulator suite, seconds
npm run compile                              # full build with ZK keys, about 40 s
npm run env:up && npm run test:local         # local devnet end to end, about 8 min
npm run env:down
```

## What is real and what is not

- Everything in the Proof table ran against the real compiler, runtime, proof server and a local Midnight node.
- The member registry is filled by the officer by hand. There is no HR or SSO integration.
- Fees: in the tests, a separate wallet pays for members' transactions. In the browser, the reporter's own Lace wallet pays, which can link reports to that wallet. DUST sponsorship by the organisation (I-012) removes that link and is in progress.
- The contract trusts the officer to pass the right leaf index to `revoke`.

## Built during the Midnight Buildathon, Wave 3

Started 16 November 2026. Nothing existed before. The test and wallet harness (`src/test/sim.ts`, `src/wallet.ts`, `src/providers.ts`, `src/config.ts`, `src/deployments.ts`, `scripts/wait-for-dust.ts`, `compose.yml` and the Lace provider wiring in `ui/src/chain.ts`) is adapted from [midnight-examples](https://github.com/midnightntwrk/midnight-examples) (Apache-2.0) and keeps its headers. The contract, witnesses, cryptography, tests, scripts and UI are new.

## Team

[Owolabenjade](https://github.com/Owolabenjade): design and build.

## What's next

- DUST sponsorship so reporters' wallets never pay or appear.
- Attribute proofs (department, site) without revealing identity.
- Multiple officers with a threshold to open a report.

## License

[Apache-2.0](LICENSE)
