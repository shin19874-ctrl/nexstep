import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// After Google sign-in or a password-reset link, the browser returns to the home page.
// This sends the person to the right place (their account, the page they wanted, or the reset form).
export default function AuthRedirect() {
  const { user, recovery } = useAuth()
  const nav = useNavigate()
  useEffect(() => {
    if (recovery) { nav('/reset-password', { replace: true }); return }
    if (user) {
      const n = sessionStorage.getItem('nexstep_next')
      if (n) { sessionStorage.removeItem('nexstep_next'); nav(n.startsWith('/') && !n.startsWith('//') ? n : '/account', { replace: true }) }
    }
  }, [user, recovery, nav])
  return null
}
