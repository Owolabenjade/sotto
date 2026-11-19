#!/usr/bin/env bash
# Compares prover key sizes of the persistentHash contract and the
# transientHash variant (a proxy for circuit size and proving time).
cd "$HOME/build" || exit 1
for f in hp/out/keys/*.prover; do
  b=$(basename "$f")
  printf '%-24s transient=%10s  persistent=%10s\n' "$b" "$(stat -c %s "$f")" "$(stat -c %s "sotto/contract/managed/sotto/keys/$b")"
done
