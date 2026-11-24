import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ArrowLeft, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        })

      if (loginError) throw loginError

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to log in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={styles.page}>
      <Link to="/" style={styles.back}>
        <ArrowLeft size={17} /> Back to Home
      </Link>

      <section style={styles.card}>
        <div style={styles.logo}>
          <CalendarDays size={25} />
        </div>

        <h1 style={styles.heading}>
          Welcome <span style={styles.accent}>Back.</span>
        </h1>

        <p style={styles.subtitle}>
          Log in to your CampusEvents student account.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            <LogIn size={18} />
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={styles.footer}>
          New to CampusEvents? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#080b18',
    color: '#ffffff',
    padding: '35px 18px',
    fontFamily: 'inherit'
  },
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#c4c8dc',
    textDecoration: 'none',
    marginBottom: '25px'
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    margin: '65px auto',
    padding: '35px',
    background: '#141b30',
    border: '1px solid #29324c',
    borderRadius: '20px',
    boxSizing: 'border-box'
  },
  logo: {
    width: '52px',
    height: '52px',
    display: 'grid',
    placeItems: 'center',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #8155ff, #3978ff)',
    borderRadius: '14px'
  },
  heading: {
    fontSize: '29px',
    margin: '22px 0 8px'
  },
  accent: {
    color: '#9874ff'
  },
  subtitle: {
    color: '#aab2ca',
    lineHeight: 1.6,
    marginBottom: '28px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  label: {
    fontSize: '14px',
    color: '#dce1f3',
    fontWeight: 600
  },
  input: {
    width: '100%',
    padding: '14px',
    borderRadius: '9px',
    border: '1px solid #39435e',
    background: '#0d1427',
    color: '#ffffff',
    boxSizing: 'border-box',
    fontSize: '15px'
  },
  button: {
    marginTop: '12px',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(100deg, #8155ff, #3978ff)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '9px'
  },
  error: {
    color: '#ff8585',
    fontSize: '14px'
  },
  footer: {
    color: '#aab2ca',
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px'
  }
}