import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Placeholder until the router and providers are wired in step 2
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h1>Book Tracker</h1>
  </StrictMode>,
)
