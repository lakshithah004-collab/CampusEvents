
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  LogOut,
  UserRound,
  GraduationCap,
  ArrowRight,
  MapPin,
  Clock,
  Users
} from 'lucide-react'

import { format } from 'date-fns'
import { supabase } from '../lib/supabase'

export default function Dashboard({ user }) {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [registrationLoading, setRegistrationLoading] = useState(true)
  const [error, setError] = useState('')
  const [registrationError, setRegistrationError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setRegistrationLoading(true)
      setError('')
      setRegistrationError('')

      const [profileResult, registrationResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, email, student_id, department, role')
          .eq('id', user.id)
          .single(),

        supabase
          .from('registrations')
          .select(`
            id,
            registration_date,
            status,
            events (
              id,
              title,
              event_date,
              event_time,
              venue,
              event_categories (name)
            )
          `)
          .eq('student_id', user.id)
          .order('registration_date', { ascending: false })
      ])

      if (profileResult.error) {
        setError(profileResult.error.message)
      } else {
        setProfile(profileResult.data)
      }

      if (registrationResult.error) {
        setRegistrationError(registrationResult.error.message)
      } else {
        setRegistrations(registrationResult.data || [])
      }

      setLoading(false)
      setRegistrationLoading(false)
    }

    loadDashboard()
  }, [user.id])

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      setError(logoutError.message)
      return
    }

    navigate('/login')
  }

  function formatEventDate(date) {
    if (!date) return 'Date unavailable'

    return format(new Date(`${date}T00:00:00`), 'dd MMM yyyy')
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.brand}>
          <CalendarDays size={24} />
          <span>
            Campus<span style={styles.accent}>Events</span>
          </span>
        </Link>

        <button onClick={handleLogout} style={styles.logout}>
          <LogOut size={17} /> Logout
        </button>
      </header>

      <section style={styles.content}>
        <span style={styles.eyebrow}>STUDENT DASHBOARD</span>

        <h1 style={styles.heading}>
          Welcome,
          <br />
          <span style={styles.accent}>
            {profile?.full_name || 'Student'}!
          </span>
        </h1>

        <p style={styles.subtitle}>
          Your campus experience starts here. Discover events and
          connect with your college community.
        </p>

        {loading && (
          <p style={styles.muted}>Loading your profile...</p>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {profile && (
          <div style={styles.profileCard}>
            <div style={styles.profileTitle}>
              <UserRound size={21} />
              <h2>My Student Profile</h2>
            </div>

            <ProfileRow label="Full Name" value={profile.full_name} />
            <ProfileRow label="Email" value={profile.email || user.email} />
            <ProfileRow label="Student ID" value={profile.student_id} />
            <ProfileRow label="Department" value={profile.department} />
            <ProfileRow label="Account Type" value={profile.role} />
          </div>
        )}

        <section style={styles.registrationsSection}>
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.eyebrow}>YOUR ACTIVITIES</span>
              <h2 style={styles.sectionTitle}>My Registrations</h2>
            </div>

            <span style={styles.count}>
              {registrations.length} Events
            </span>
          </div>

          {registrationLoading && (
            <p style={styles.muted}>Loading your registrations...</p>
          )}

          {registrationError && (
            <p style={styles.error}>{registrationError}</p>
          )}

          {!registrationLoading &&
            !registrationError &&
            registrations.length === 0 && (
              <div style={styles.emptyCard}>
                <CalendarDays size={35} color="#a78bfa" />
                <h3>No registrations yet</h3>
                <p>
                  You haven't registered for any campus events yet.
                  Explore upcoming events and reserve your place.
                </p>
                <Link to="/" style={styles.explore}>
                  Explore Events <ArrowRight size={18} />
                </Link>
              </div>
            )}

          {!registrationLoading &&
            !registrationError &&
            registrations.length > 0 && (
              <div style={styles.registrationGrid}>
                {registrations.map((registration) => {
                  const event = registration.events

                  if (!event) return null

                  return (
                    <article
                      key={registration.id}
                      style={styles.registrationCard}
                    >
                      <div style={styles.registrationTop}>
                        <span style={styles.category}>
                          {event.event_categories?.name || 'General'}
                        </span>

                        <span style={styles.confirmed}>
                          {registration.status}
                        </span>
                      </div>

                      <h3 style={styles.eventTitle}>{event.title}</h3>

                      <div style={styles.eventInfo}>
                        <span>
                          <CalendarDays size={16} />
                          {formatEventDate(event.event_date)}
                        </span>

                        <span>
                          <Clock size={16} />
                          {event.event_time || 'Time unavailable'}
                        </span>

                        <span>
                          <MapPin size={16} />
                          {event.venue || 'Venue unavailable'}
                        </span>
                      </div>

                      <div style={styles.registrationFooter}>
                        <span>
                          <GraduationCap size={16} />
                          Registration confirmed
                        </span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
        </section>

        <Link to="/" style={styles.explore}>
          <GraduationCap size={19} />
          Explore Campus Events
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div style={styles.profileRow}>
      <span style={styles.profileLabel}>{label}</span>
      <strong>{value || 'Not provided'}</strong>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#080b18',
    color: '#ffffff',
    fontFamily: 'inherit'
  },
  header: {
    minHeight: '75px',
    padding: '0 6%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #252d45'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '21px',
    fontWeight: 700
  },
  accent: {
    color: '#9874ff'
  },
  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    background: '#1b2540',
    border: '1px solid #39435e',
    borderRadius: '9px',
    color: '#ffffff',
    cursor: 'pointer'
  },
  content: {
    width: '90%',
    maxWidth: '850px',
    margin: '65px auto'
  },
  eyebrow: {
    color: '#a78bfa',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px'
  },
  heading: {
    fontSize: '42px',
    lineHeight: 1.2,
    margin: '18px 0'
  },
  subtitle: {
    color: '#aab2ca',
    lineHeight: 1.7,
    maxWidth: '580px'
  },
  muted: {
    color: '#aab2ca'
  },
  error: {
    color: '#ff8585',
    marginTop: '15px'
  },
  profileCard: {
    marginTop: '35px',
    padding: '25px',
    background: '#141b30',
    border: '1px solid #29324c',
    borderRadius: '16px'
  },
  profileTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#b59aff',
    marginBottom: '20px'
  },
  profileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    padding: '15px 0',
    borderTop: '1px solid #29324c',
    flexWrap: 'wrap'
  },
  profileLabel: {
    color: '#aab2ca'
  },
  registrationsSection: {
    marginTop: '55px'
  },
  sectionHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    marginBottom: '22px'
  },
  sectionTitle: {
    fontSize: '28px',
    margin: '10px 0 0'
  },
  count: {
    color: '#c4b5fd',
    background: '#211b3d',
    padding: '9px 14px',
    borderRadius: '20px',
    fontSize: '13px'
  },
  registrationGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '18px'
  },
  registrationCard: {
    padding: '22px',
    background: '#141b30',
    border: '1px solid #29324c',
    borderRadius: '15px'
  },
  registrationTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap'
  },
  category: {
    color: '#bca7ff',
    fontSize: '13px'
  },
  confirmed: {
    color: '#55e6a5',
    background: '#12362e',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    textTransform: 'capitalize'
  },
  eventTitle: {
    fontSize: '22px',
    margin: '18px 0'
  },
  eventInfo: {
    display: 'grid',
    gap: '13px',
    color: '#b5bfd5',
    fontSize: '14px'
  },
  registrationFooter: {
    borderTop: '1px solid #29324c',
    marginTop: '20px',
    paddingTop: '16px',
    color: '#55e6a5',
    fontSize: '13px'
  },
  emptyCard: {
    textAlign: 'center',
    padding: '35px 25px',
    background: '#141b30',
    border: '1px solid #29324c',
    borderRadius: '15px'
  },
  explore: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '28px',
    padding: '14px 19px',
    background: 'linear-gradient(100deg, #8155ff, #3978ff)',
    borderRadius: '10px',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 700
  }
}
