import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// ponytail: single config for vite + vitest. vitest/config re-exports vite's
// defineConfig with the `test` field typed. Tauri shell wiring (Phase 0
// sub-slice S-PHASE0-002) will extend this.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
