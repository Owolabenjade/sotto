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
