import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { CompanyAuthProvider } from './context/CompanyAuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import App from './App'
import './index.css'

const clientId = "126425596356-3nab12730qea0hdvevdvjrttu4e1h7to.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <AuthProvider>
          <CompanyAuthProvider>
            <AdminAuthProvider>
              <App />
            </AdminAuthProvider>
          </CompanyAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
