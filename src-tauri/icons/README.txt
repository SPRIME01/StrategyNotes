# src-tauri placeholder icons

The Tauri bundle config references `icons/icon.png`. Drop a 512x512 PNG here
before running `tauri build` (production bundling). For `cargo run` / dev, the
icon is not strictly required, but `tauri build` will fail without it.

Generate with: `pnpm dlx @tauri-apps/cli icon path/to/source.png` (produces the
full icon set). Or place a single icon.png and adjust tauri.conf.json.
