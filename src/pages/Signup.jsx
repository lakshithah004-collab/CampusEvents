import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ArrowLeft, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    studentId: '',
    department: '',
    password: '',
    confirmPassword: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }

  async function handleSignup(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.fullName.trim(),
              student_id: form.studentId.trim(),
              department: form.department.trim()
            }
          }
        })

      if (signupError) throw signupError

      if (data.session) {
        navigate('/dashboard')
      } else {
        setSuccess(
          'Your account has been created. Please check your email for the confirmation link, then log in.'
        )
      }
    } catch (err) {
      setError(err.message || 'Unable to create your account.')
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
          Join Campus<span style={styles.accent}>Events</span>
        </h1>

        <p style={styles.subtitle}>
          Create your student account and discover campus life.
        </p>

        <form onSubmit={handleSignup} style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            name="fullName"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>College Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Student ID</label>
          <input
            style={styles.input}
            name="studentId"
            placeholder="Enter your student ID"
            value={form.studentId}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Department</label>
          <input
            style={styles.input}
            name="department"
            placeholder="Example: Computer Science"
            value={form.department}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            style={styles.input}
            type="password"
            name="confirmPassword"
            placeholder="Enter password again"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Student Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
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
    maxWidth: '490px',
    margin: '0 auto',
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
    fontSize: '27px',
    margin: '22px 0 8px'
  },
  accent: {
    color: '#9874ff'
  },
  subtitle: {
    color: '#aab2ca',
    lineHeight: 1.6,
    marginBottom: '25px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  label: {
    fontSize: '14px',
    color: '#dce1f3',
    fontWeight: 600,
    marginTop: '5px'
  },
  input: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '9px',
    border: '1px solid #39435e',
    background: '#0d1427',
    color: '#ffffff',
    boxSizing: 'border-box',
    fontSize: '15px',
    outline: 'none'
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
  success: {
    color: '#75e5a1',
    fontSize: '14px',
    lineHeight: 1.6
  },
  footer: {
    color: '#aab2ca',
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px'
  }
}