//! StrategyNotes desktop shell (Phase F, Option A). Spawns the existing axum
//! server as a subprocess (the `strategynotes serve` binary) and loads the
//! React UI in a Tauri webview. The UI's vite proxy forwards /api to the
//! backend, so the spine flow runs from the desktop exactly as from the
//! browser/CLI. Markdown remains the source of truth; SQLite remains derived.
//!
//! Env:
//!   STRATEGYNOTES_DATA  - vault directory (default: ../strategynotes-data)
//!   STRATEGYNOTES_PORT  - backend port (default: 8787)
//!
//! On a webkit2gtk-equipped machine:
//!   cd src-tauri && cargo run   (or `tauri dev` from the repo root)

use std::process::{Child, Command};

const DEFAULT_DATA_DIR: &str = "strategynotes-data";
const DEFAULT_PORT: u16 = 8787;
const BACKEND_BINARY: &str = "../target/debug/strategynotes";

fn main() {
    let data_dir =
        std::env::var("STRATEGYNOTES_DATA").unwrap_or_else(|_| DEFAULT_DATA_DIR.into());
    let port: u16 = std::env::var("STRATEGYNOTES_PORT")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(DEFAULT_PORT);

    // 1. Spawn the local backend (the existing CLI binary in serve mode).
    let mut backend = Command::new(BACKEND_BINARY)
        .args(["serve", &data_dir, &port.to_string()])
        .spawn()
        .expect("failed to spawn strategynotes backend binary (build it first: cargo build -p strategynotes-server)");

    // 2. Wait for /api/health before opening the window.
    let health = format!("http://127.0.0.1:{port}/api/health");
    let ready = wait_for_health(&health, 100);
    if !ready {
        eprintln!("warning: backend did not become healthy at {health}; the window may show connection errors");
    }

    // 3. Launch the Tauri webview (loads ../ui via the config's devUrl /
    //    frontendDist; the UI proxies /api to the backend on {port}).
    let result = tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running strategynotes-desktop");

    // 4. Tear down the backend on exit.
    kill_backend(&mut backend);
    let _ = result;
}

fn wait_for_health(url: &str, attempts: u32) -> bool {
    for _ in 0..attempts {
        if let Ok(resp) = reqwest::blocking::get(url) {
            if resp.status().is_success() {
                return true;
            }
        }
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    false
}

fn kill_backend(child: &mut Child) {
    let _ = child.kill();
    let _ = child.wait();
}
