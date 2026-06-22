import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vite + Vitest config. The dev proxy forwards /api -> the Rust HTTP server
// (run `cargo run -p strategynotes-server -- serve`). Production builds can be
// served by Tauri (Phase 12 sub-slice) or any static host + the API server.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
  test: {
    environment: "jsdom",
  },
});
