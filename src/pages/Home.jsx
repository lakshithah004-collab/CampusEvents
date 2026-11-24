
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Search,
  Sparkles,
  Users,
  MapPin,
  LoaderCircle,
  Clock,
  GraduationCap
} from 'lucide-react'

import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import { getEvents } from '../services/eventService'
import { supabase } from '../lib/supabase'

export default function Home() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const [registering, setRegistering] = useState(false)
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true)
        setError('')

        const data = await getEvents()
        setEvents(data)
      } catch (err) {
        console.error('Event loading error:', err)
        setError('Unable to load events. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const categories = useMemo(
    () => [
      'All',
      ...new Set(events.map(event => event.category))
    ],
    [events]
  )

  const filteredEvents = events.filter(event => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      (event.title || '').toLowerCase().includes(searchText) ||
      (event.venue || '').toLowerCase().includes(searchText) ||
      (event.description || '').toLowerCase().includes(searchText)

    const matchesCategory =
      category === 'All' || event.category === category

    return matchesSearch && matchesCategory
  })

  async function handleRegistration() {
    if (!selectedEvent || registering) return

    setRegistrationMessage('')
    setRegistrationSuccess(false)
    setRegistering(true)

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (!sessionData.session) {
        navigate('/login')
        return
      }

      const { data, error: registrationError } = await supabase.rpc(
        'register_for_event',
        {
          p_event_id: selectedEvent.id
        }
      )

      if (registrationError) {
        throw registrationError
      }

      if (!data || data.success !== true) {
        setRegistrationMessage(
          data?.message || 'Registration could not be completed.'
        )
        return
      }

      setRegistrationSuccess(true)
      setRegistrationMessage(
        data.message || 'Registration successful!'
      )

      setSelectedEvent(previous => ({
        ...previous,
        registeredCount: (previous.registeredCount || 0) + 1,
        availableSeats: Math.max(
          0,
          (previous.availableSeats || 0) - 1
        )
      }))

      setEvents(previous =>
        previous.map(event =>
          event.id === selectedEvent.id
            ? {
                ...event,
                registeredCount: (event.registeredCount || 0) + 1,
                availableSeats: Math.max(
                  0,
                  (event.availableSeats || 0) - 1
                )
              }
            : event
        )
      )
    } catch (err) {
      console.error('Registration error:', err)

      const message = err.message || ''

      if (message.toLowerCase().includes('already registered')) {
        setRegistrationMessage('You are already registered for this event.')
      } else if (message.toLowerCase().includes('event is full')) {
        setRegistrationMessage('Sorry, this event is full.')
      } else if (message.toLowerCase().includes('please log in')) {
        navigate('/login')
      } else {
        setRegistrationMessage(
          message || 'Registration failed. Please try again.'
        )
      }
    } finally {
      setRegistering(false)
    }
  }

  // EVENT DETAILS VIEW
  if (selectedEvent) {
    const eventDate = new Date(
      `${selectedEvent.event_date}T00:00:00`
    )

    return (
      <div className="app-shell">
        <Navbar />

        <main
          style={{
            maxWidth: '1150px',
            margin: '0 auto',
            padding: '45px 25px 100px',
            minHeight: '80vh'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedEvent(null)
              setRegistrationMessage('')
              setRegistrationSuccess(false)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#171d32',
              color: '#c4b5fd',
              border: '1px solid #343b55',
              padding: '13px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              marginBottom: '30px',
              fontSize: '15px'
            }}
          >
            <ArrowLeft size={18} />
            Back to Events
          </button>

          <div
            style={{
              background: '#141b30',
              border: '1px solid #303750',
              borderRadius: '22px',
              overflow: 'hidden'
            }}
          >
            <img
              src={selectedEvent.image_url}
              alt={selectedEvent.title}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            <div style={{ padding: '35px' }}>
              <span className="event-category">
                {selectedEvent.category}
              </span>

              <h1
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(30px, 5vw, 46px)',
                  marginTop: '25px',
                  marginBottom: '18px'
                }}
              >
                {selectedEvent.title}
              </h1>

              <p
                style={{
                  color: '#aab2c8',
                  fontSize: '16px',
                  lineHeight: '1.9',
                  maxWidth: '800px'
                }}
              >
                {selectedEvent.description}
              </p>

              <div
                style={{
                  borderTop: '1px solid #303750',
                  marginTop: '30px',
                  paddingTop: '20px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    color: '#d2d7e6',
                    marginBottom: '22px'
                  }}
                >
                  <CalendarDays color="#a78bfa" />
                  {eventDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>

                {selectedEvent.event_time && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      color: '#d2d7e6',
                      marginBottom: '22px'
                    }}
                  >
                    <Clock color="#a78bfa" />
                    {selectedEvent.event_time}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    color: '#d2d7e6',
                    marginBottom: '22px'
                  }}
                >
                  <MapPin color="#a78bfa" />
                  {selectedEvent.venue}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    color: '#d2d7e6'
                  }}
                >
                  <Users color="#a78bfa" />
                  {selectedEvent.availableSeats} seats available
                </div>
              </div>

              <div
                style={{
                  marginTop: '35px',
                  paddingTop: '25px',
                  borderTop: '1px solid #303750'
                }}
              >
                {registrationMessage && (
                  <div
                    role="status"
                    style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      marginBottom: '20px',
                      background: registrationSuccess
                        ? 'rgba(34,197,94,0.12)'
                        : 'rgba(239,68,68,0.12)',
                      color: registrationSuccess
                        ? '#4ade80'
                        : '#fca5a5',
                      border: `1px solid ${
                        registrationSuccess ? '#276749' : '#7f1d1d'
                      }`
                    }}
                  >
                    {registrationMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRegistration}
                  disabled={registering || registrationSuccess}
                  className="primary-button"
                  style={{
                    opacity: registering || registrationSuccess ? 0.7 : 1,
                    cursor: registering || registrationSuccess
                      ? 'not-allowed'
                      : 'pointer'
                  }}
                >
                  {registering ? (
                    <>
                      <LoaderCircle className="spinner" size={18} />
                      Registering...
                    </>
                  ) : registrationSuccess ? (
                    <>
                      <GraduationCap size={18} />
                      Registered Successfully
                    </>
                  ) : (
                    <>
                      Register for Event
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null)
                    setRegistrationMessage('')
                    setRegistrationSuccess(false)
                  }}
                  className="secondary-button"
                  style={{
                    marginLeft: '12px'
                  }}
                >
                  Explore More Events
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // HOMEPAGE VIEW
  return (
    <div className="app-shell">
      <Navbar />

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <Sparkles size={15} />
              YOUR CAMPUS. YOUR COMMUNITY. YOUR MOMENT.
            </div>

            <h1>
              Where Campus
              <br />
              Life Becomes <span>Unforgettable.</span>
            </h1>

            <p className="hero-description">
              Discover inspiring events, connect with talented people
              and experience everything your college community has to offer.
            </p>

            <div className="hero-buttons">
              <a href="#events" className="primary-button">
                Explore Events <ArrowRight size={18} />
              </a>

              <a href="#about" className="secondary-button">
                Discover CampusEvents
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{events.length}+</strong>
                <span>Upcoming Events</span>
              </div>

              <div>
                <strong>{categories.length - 1}</strong>
                <span>Categories</span>
              </div>

              <div>
                <strong>1</strong>
                <span>Campus Community</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-main">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                alt="College event"
              />

              <div className="visual-overlay">
                <span>DISCOVER SOMETHING NEW</span>
                <h3>Make Every Moment Count.</h3>
              </div>
            </div>

            <div className="floating-card">
              <CalendarDays size={28} />

              <div>
                <strong>Find your next event</strong>
                <span>Explore. Connect. Participate.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="features-strip">
          <div><CalendarDays /> Discover Events</div>
          <div><Users /> Meet Your Community</div>
          <div><MapPin /> Explore Your Campus</div>
          <div><Sparkles /> Create Memories</div>
        </section>

        <section className="events-section" id="events">
          <div className="section-heading">
            <div>
              <span className="section-label">
                WHAT'S HAPPENING
              </span>

              <h2>
                Explore Upcoming Events<span>.</span>
              </h2>

              <p>
                Find experiences that inspire you and bring people together.
              </p>
            </div>
          </div>

          <div className="event-toolbar">
            <div className="search-box">
              <Search size={19} />

              <input
                type="search"
                placeholder="Search events or venues..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="category-filters">
              {categories.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={
                    category === item ? 'filter active' : 'filter'
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <LoaderCircle className="spinner" size={30} />
              <p>Discovering amazing events...</p>
            </div>
          )}

          {error && (
            <p className="error-message">{error}</p>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="empty-state">
              <CalendarDays size={35} />
              <h3>No events found</h3>
              <p>Try another search or category.</p>
            </div>
          )}

          {!loading && !error && filteredEvents.length > 0 && (
            <div className="events-grid">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onExplore={() => {
                    setSelectedEvent(event)
                    setRegistrationMessage('')
                    setRegistrationSuccess(false)
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="about-section" id="about">
          <div>
            <span className="section-label">
              ABOUT CAMPUS EVENTS
            </span>

            <h2>
              More Than Events.
              <br />
              <span>It's Campus Life.</span>
            </h2>
          </div>

          <p>
            CampusEvents brings your college community together in one place.
            Discover opportunities, participate in activities and make your
            college experience memorable.
          </p>

          <a href="#events" className="about-link">
            Explore the community <ArrowRight size={18} />
          </a>
        </section>

        <footer className="footer">
          <div className="brand">
            <CalendarDays />
            Campus<span className="brand-accent">Events</span>
          </div>

          <p>Bringing campus communities together.</p>

          <span>© 2026 CampusEvents. All rights reserved.</span>
        </footer>
      </main>
    </div>
  )
}
