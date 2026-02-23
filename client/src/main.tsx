import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// @ts-ignore: allow side-effect CSS import without a module declaration
import { ProjectProvider } from "./context/ProjectContext";
import './index.css'

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
