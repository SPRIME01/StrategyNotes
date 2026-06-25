# StrategyNotes dev control.
#
#   just dev-up     # backend (hot) + frontend (Vite HMR)
#   just dev-down   # stop both
#   just dev-logs   # tail logs
#
# Hot reload: frontend = Vite HMR (instant). Backend = a small bash watcher that
# rebuilds + restarts the server when *.rs change (no cargo-watch dependency).

set shell := ["bash", "-c"]
backend-port := "8787"
run := ".run"

# ─── dev-up ─────────────────────────────────────────────────────────────
dev-up:
  #!/usr/bin/env bash
  set -euo pipefail
  mkdir -p {{run}}
  if [ -f {{run}}/backend.pid ] || [ -f {{run}}/ui.pid ]; then
    echo "Already running? Run 'just dev-down' first." >&2; exit 1
  fi

  # Backend watcher: on *.rs change, kill the old server (by PID), rebuild,
  # restart. NB: do NOT use pkill -f here — the pattern would match this very
  # watcher script (its cmdline contains it) and suicide. Track the server PID.
  setsid bash -c '
    srvpid=""; sigil=""
    while true; do
      cur=$(find core/src adapters/src server/src -name "*.rs" 2>/dev/null | sort \
            | xargs sha256sum 2>/dev/null | sha256sum)
      if [ "$cur" != "$sigil" ]; then
        sigil="$cur"
        echo "[watch] change detected → rebuilding" >> {{run}}/backend.log
        [ -n "$srvpid" ] && kill "$srvpid" 2>/dev/null || true
        sleep 0.3
        if cargo build --bin strategynotes >> {{run}}/backend.log 2>&1; then
          target/debug/strategynotes serve strategynotes-data {{backend-port}} >> {{run}}/backend.log 2>&1 &
          srvpid=$!
          echo "[watch] server pid $srvpid on :{{backend-port}}" >> {{run}}/backend.log
        else
          echo "[watch] build failed; fix and save to retry" >> {{run}}/backend.log
        fi
      fi
      sleep 1
    done
  ' </dev/null &
  echo $! > {{run}}/backend.pid

  # Frontend — Vite HMR.
  setsid bash -c 'pnpm -C ui dev' </dev/null > {{run}}/ui.log 2>&1 &
  echo $! > {{run}}/ui.pid

  sleep 2
  echo "▲ StrategyNotes dev is up"
  echo "  UI:        http://localhost:5173"
  echo "  backend:   http://localhost:{{backend-port}}/api/health"
  echo "  logs:      {{run}}/backend.log   {{run}}/ui.log   (just dev-logs)"
  echo "  stop:      just dev-down"

# ─── dev-down ───────────────────────────────────────────────────────────
dev-down:
  #!/usr/bin/env bash
  for f in {{run}}/backend.pid {{run}}/ui.pid; do
    [ -f "$f" ] || continue
    pid=$(cat "$f")
    kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
    rm -f "$f"
  done
  rm -rf {{run}}
  echo "▼ dev stopped"

# ─── dev-logs ───────────────────────────────────────────────────────────
dev-logs:
  #!/usr/bin/env bash
  touch {{run}}/backend.log {{run}}/ui.log
  tail -f {{run}}/backend.log {{run}}/ui.log
