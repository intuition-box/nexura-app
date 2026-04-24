import React from 'react'
import { createRoot } from 'react-dom/client'
import { configureClient, API_URL_DEV, API_URL_PROD } from '@0xintuition/graphql'
import App from './App'
import { network } from './lib/constants'
// @ts-ignore: allow side-effect CSS import without a module declaration
import './index.css'

// Point the Intuition GraphQL indexer at the chain the app is actually using.
// Default SDK config targets mainnet; on testnet that makes getAtomDetails /
// getTripleDetails return null, which breaks the proof-of-action flow.
configureClient({ apiUrl: network === 'mainnet' ? API_URL_PROD : API_URL_DEV })

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
