import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import App from './App'
import AdminErrorBoundary from './components/AdminErrorBoundary'
import './styles.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminErrorBoundary>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </AdminErrorBoundary>
  </React.StrictMode>,
)
