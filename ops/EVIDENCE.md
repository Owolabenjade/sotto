# EVIDENCE

Each entry records a check that actually ran. If it did not run, it is not evidence: write it as a proposed check in ISSUES instead.

Format (copy for each entry, numbering upward):

    ## E-001: <what was checked>
    Date (UTC): 2026-01-01T12:00Z
    Commit: abc1234
    Environment: OS, browser or device, network, chain or model and version
    Method: exact command, steps or URL
    Result: what you observed: output, numbers, links, screenshot path
    Label: OBSERVED or DERIVED
    Limits: what this does not show

## Entries

## E-001: Compact 0.36.0 compiles a Merkle-membership + nullifier contract
Date (UTC): 2026-11-16T16:00Z
Commit: none (pre-repo; probe saved as research/probe/probe.compact)
Environment: Windows 11 Pro, WSL2 Ubuntu, compact 0.5.3, toolchain 0.36.0 (b5d9e4dfc 2026-11-03)
Method: official installer (compact-installer.sh), `compact update 0.36.0`, `compact compile probe.compact out`
Result: "Compiling 2 circuits"; real 10.8s; produced out/contract/index.js, out/keys/{enroll,fileReport}.{prover,verifier}, out/zkir/*.zkir. Probe uses HistoricMerkleTree<16,Bytes<32>>, Set<Bytes<32>>, Counter, two witnesses, persistentHash, merkleTreePathRoot, checkRoot.
Label: OBSERVED
Limits: Compile only. No runtime execution, no proof generated, no transaction; enroll is unrestricted in the probe.

## E-002: Event and network research
Date (UTC): 2026-11-16T15:50Z
Commit: none
Environment: web
Method: program page (pasted by the user); AKINDO countdown read by the user ("13Days 23:14" at about 15:46Z); docs.midnight.network networks-and-environments, installation, support matrix, windows-compact-setup; github.com/thirdbase1/buildathon-radar data/midnight.json; prior-art pages (depapp/midnight-whistleblower, Decrypt on Vera Report, The Block on StealthNote)
Result: deadline about 2026-11-30T15:00Z; ledger 9 matrix; preview has Midnight-hosted RPC/indexer and a faucet; 159 Wave-1 submissions (snapshot 2026-09-23); 2 whistleblowing matches in Wave 1; depapp repo uses MockOnChainAdapter (mock tx hashes)
Label: DERIVED
Limits: Deadline derived from a countdown, not a stated timestamp; the scrape is stale and has no Wave 2 or 3 data.

## E-003: Sotto contract v1 simulator suite passes
Date (UTC): 2026-11-17T23:08Z
Commit: 4569712 plus uncommitted src/crypto.ts and src/test/crypto.sim.test.ts (committed right after this entry)
Environment: WSL2 Ubuntu, Node 22.23.5, npm 11.21.2, compact 0.36.0 (--skip-zk), vitest 5.1.0, @midnight-ntwrk/midnight-js-protocol 5.0.0
Method: `npm run compile:fast && npm run test:sim` via scripts/wsl-run.sh
Result: 2 files, 28 tests passed in 15.4s. sotto.sim.test.ts 24 (registry 5, filing 10, response clock 5, thread 4); crypto.sim.test.ts 4. Includes: non-member, lying witness, revoked member with replayed stale path, double report per period, timestamp slack, non-officer guards, assertNotInPublicState for every member secret and the officer secret, and no member key in case records.
Label: OBSERVED
Limits: In-memory runtime only: no proofs, no network, no fees. Block time is simulated with Sim.at().

## E-004: Demo path runs end to end on the local devnet with real proofs
Date (UTC): 2026-11-18T00:20Z
Commit: 071abdc plus uncommitted src/test/sotto.test.ts and src/providers.ts rename (committed right after this entry)
Environment: WSL2 Ubuntu, Docker 28.5.1; images midnight-node 2.1.101, indexer-standalone 4.4.101, proof-server 9.0.0 (undeployed network); compact 0.36.0 full compile (7 circuits, 36.8s); midnight-js 5.0.0, wallet-sdk 2.0.0, testkit-js 5.0.0
Method: `docker compose up -d --wait`, then `LOG_LEVEL=warn npm run test:local` (src/test/sotto.test.ts)
Result: 6/6 passed in 213s of test time: deploy (17.0s); enrol 3 members (70.2s); member files a sealed report from a different wallet, officer decrypts it from the indexer (29.4s); duplicate report in the same period rejected; acknowledge + officer question + anonymous reporter answer, ackOnTime=1, messageCount=3, reporter decrypts the question (70.5s); revoked member rejected (22.9s).
Label: OBSERVED
Limits: Local undeployed network, not Preview. Rejection tests assert that the call throws, not which assert fired (the sim suite E-003 checks messages). Fees are paid by test wallets, not sponsored.

## E-005: UI builds and Vercel serves it with the prover keys
Date (UTC): 2026-11-18T12:46Z
Commit: 58bdc30 plus uncommitted ui/tsconfig.json and the vite-plugin-top-level-await override in package.json
Environment: WSL2 native copy (~/build/sotto, npm install 53s), vite 6.4.4; Vercel CLI 65.15.0, account owolabenjade, static deploy of ui/dist (134 MB)
Method: `npx tsc --noEmit -p ui` (clean); `npm run ui:build` (built in 21.8s after pinning @swc/core 1.15.47); `vercel deploy --yes --prod` from a folder holding ui/dist; curl of /, /keys/fileReport.prover, /compiler/contract-manifest.json
Result: 200 for all three; fileReport.prover served with 45,098,477 bytes (same as the compiled file); production alias https://sotto-ivory.vercel.app, no deployment protection on the alias.
Label: OBSERVED
Limits: Page load only; no contract address in this build, no browser render checked, no Lace interaction.

## E-006: EU Whistleblowing Directive thresholds and deadlines, verbatim
Date (UTC): 2026-11-18T13:05Z
Commit: fa8cbc7
Environment: web; EUR-Lex returned HTTP 202 with an empty body to scripted requests, so the text was read from legislation.gov.uk's copy of the directive as adopted
Method: curl https://www.legislation.gov.uk/eudr/2019/1937/chapter/II/data.htm?view=plain and extract Articles 8 and 9
Result: Art. 8(3): "Paragraph 1 shall apply to legal entities in the private sector with 50 or more workers." Art. 9(1)(b): "acknowledgment of receipt of the report to the reporting person within seven days of that receipt;" Art. 9(1)(f): "a reasonable timeframe to provide feedback, not exceeding three months from the acknowledgment of receipt or, if no acknowledgement was sent to the reporting person, three months from the expiry of the seven-day period after the report was made;"
Label: DERIVED
Limits: legislation.gov.uk is an official UK copy of the EU text, not EUR-Lex itself. National transpositions can differ (calendar vs working days, thresholds for public bodies). Consequence: the contract's feedback clock was counting from the report; fixed to count from the acknowledgement (E-007).

## E-007: Feedback clock follows Art. 9(1)(f); simulator suite 30/30
Date (UTC): 2026-11-18T13:08Z
Commit: fa8cbc7 plus uncommitted contract/sotto.compact closeCase change and two new tests
Environment: WSL2 native copy (~/build/sotto), compact 0.36.0 --skip-zk, vitest 5.1.0
Method: `npm run compile:fast && npm run test:sim`
Result: 2 files, 30 tests passed. New: "starts the feedback clock at the acknowledgement" (closed at ack + 90d - 60s counts on time although it is past opened + 90d); "starts the feedback clock at day 7 when the acknowledgement was late" (one on time, one late). Full compile with keys afterwards: 18.0s, 14 key files.
Label: OBSERVED
Limits: Simulator only; the devnet suite (E-004) ran against the previous contract and has not been rerun on this one.
