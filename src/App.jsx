
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import Home from './pages/Home.jsx'
import Login from './pages/StudentLogin.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

import { supabase } from './lib/supabase.js'

function AppRoutes() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roleLoading, setRoleLoading] = useState(false)
  const [roleError, setRoleError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (error) console.error(error)

      if (active) {
        setSession(data?.session ?? null)
        setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadRole() {
      if (!session?.user?.id) {
        setRole(null)
        setRoleError('')
        setRoleLoading(false)
        return
      }

      setRoleLoading(true)
      setRoleError('')

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!active) return

      if (error) {
        setRoleError(error.message)
        setRole(null)
      } else {
        setRole(data.role)
      }

      setRoleLoading(false)
    }

    loadRole()

    return () => {
      active = false
    }
  }, [session?.user?.id])

  if (loading) {
    return <div style={styles.loading}>Loading CampusEvents...</div>
  }

  if (session && roleLoading) {
    return <div style={styles.loading}>Checking your account...</div>
  }

  if (session && roleError) {
    return (
      <div style={styles.loading}>
        Unable to load your account role: {roleError}
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          session
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/signup"
        element={
          session
            ? <Navigate to="/dashboard" replace />
            : <Signup />
        }
      />

      <Route
        path="/dashboard"
        element={
          session
            ? role === 'admin'
              ? <AdminDashboard user={session.user} />
              : <Dashboard user={session.user} />
            : <Navigate to="/login" replace />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

const styles = {
  loading: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#080b18',
    color: '#ffffff',
    fontSize: '18px',
    padding: '24px',
    textAlign: 'center'
  }
}
