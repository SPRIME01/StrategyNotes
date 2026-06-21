import { createRoot } from 'react-dom/client'
import { App } from './App'

// ponytail: no StrictMode, no router, no state libs yet. Phase 12 (UI system)
// introduces the atomic component library. This entry only proves the harness.
createRoot(document.getElementById('root')!).render(<App />)
