import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Clean up any SSR rendered static lyrics container on hydration
const ssrContent = document.getElementById('ssr-garba-content');
if (ssrContent) {
  ssrContent.remove();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
