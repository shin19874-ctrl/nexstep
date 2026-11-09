import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { ListingsProvider } from './lib/ListingsContext'
import { AuthProvider } from './lib/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <ListingsProvider>
          <App />
        </ListingsProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
)
