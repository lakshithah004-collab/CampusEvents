
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Plus,
  Pencil,
  XCircle,
  Users,
  LogOut,
  LayoutDashboard,
  Save,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const emptyForm = {
  title: '',
  description: '',
  category_id: '',
  event_date: '',
  event_time: '',
  venue: '',
  image_url: '',
  max_participants: 100,
  status: 'published'
}

export default function AdminDashboard({ user }) {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [tab, setTab] = useState('events')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')

    const [eventsResult, categoriesResult, registrationsResult] =
      await Promise.all([
        supabase
          .from('events')
          .select('*, event_categories(name)')
          .order('event_date', { ascending: true }),

        supabase
          .from('event_categories')
          .select('id, name')
          .order('name'),

        supabase
          .from('registrations')
          .select(`
            id,
            student_id,
            event_id,
            registration_date,
            status,
            events(title)
          `)
          .order('registration_date', { ascending: false })
      ])

    if (eventsResult.error) setError(eventsResult.error.message)
    else setEvents(eventsResult.data || [])

    if (categoriesResult.error) setError(categoriesResult.error.message)
    else setCategories(categoriesResult.data || [])

    if (registrationsResult.error) setError(registrationsResult.error.message)
    else setRegistrations(registrationsResult.data || [])

    setLoading(false)
  }

  function openCreateForm() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      category_id: categories[0]?.id || ''
    })
    setShowForm(true)
    setMessage('')
  }

  function openEditForm(event) {
    setEditingId(event.id)
    setForm({
      title: event.title || '',
      description: event.description || '',
      category_id: event.category_id || '',
      event_date: event.event_date || '',
      event_time: event.event_time || '',
      venue: event.venue || '',
      image_url: event.image_url || '',
      max_participants: event.max_participants || 100,
      status: event.status || 'published'
    })
    setShowForm(true)
    setMessage('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      ...form,
      max_participants: Number(form.max_participants)
    }

    if (!payload.title.trim() || !payload.event_date || !payload.venue.trim()) {
      setError('Please enter the event title, date and venue.')
      setSaving(false)
      return
    }

    let result

    if (editingId) {
      result = await supabase
        .from('events')
        .update(payload)
        .eq('id', editingId)
    } else {
      result = await supabase
        .from('events')
        .insert({
          ...payload,
          created_by: user.id
        })
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      setMessage(editingId ? 'Event updated successfully.' : 'Event created successfully.')
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      await loadData()
    }

    setSaving(false)
  }

  async function cancelEvent(event) {
    const confirmed = window.confirm(
      `Cancel "${event.title}"?`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', event.id)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Event cancelled.')
      await loadData()
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error.message)
      return
    }

    navigate('/login')
  }

  const publishedCount = events.filter(
    event => event.status === 'published'
  ).length

  const confirmedCount = registrations.filter(
    item => item.status === 'confirmed'
  ).length

  return (
    <main style={s.page}>
      <header style={s.header}>
        <div style={s.brand}>
          <CalendarDays size={25} />
          Campus<span style={s.accent}>Events</span>
          <span style={s.adminTag}>ADMIN</span>
        </div>

        <button style={s.logout} onClick={handleLogout}>
          <LogOut size={17} /> Logout
        </button>
      </header>

      <section style={s.container}>
        <div style={s.welcome}>
          <div>
            <span style={s.eyebrow}>ADMINISTRATION PANEL</span>
            <h1>Admin Dashboard</h1>
            <p>Manage college events and student registrations.</p>
          </div>

          <button style={s.refresh} onClick={loadData}>
            <RefreshCw size={17} /> Refresh
          </button>
        </div>

        <div style={s.stats}>
          <Stat icon={<CalendarDays />} label="Total Events" value={events.length} />
          <Stat icon={<LayoutDashboard />} label="Published Events" value={publishedCount} />
          <Stat icon={<Users />} label="Confirmed Registrations" value={confirmedCount} />
        </div>

        <div style={s.tabs}>
          <button
            onClick={() => setTab('events')}
            style={tab === 'events' ? s.activeTab : s.tab}
          >
            <CalendarDays size={17} /> Manage Events
          </button>

          <button
            onClick={() => setTab('registrations')}
            style={tab === 'registrations' ? s.activeTab : s.tab}
          >
            <Users size={17} /> Registrations
          </button>
        </div>

        {message && <div style={s.success}>{message}</div>}
        {error && <div style={s.error}>{error}</div>}

        {tab === 'events' && (
          <>
            <div style={s.sectionHeader}>
              <h2>College Events</h2>
              <button style={s.primary} onClick={openCreateForm}>
                <Plus size={18} /> Add Event
              </button>
            </div>

            {showForm && (
              <form style={s.form} onSubmit={handleSave}>
                <h2>{editingId ? 'Edit Event' : 'Create New Event'}</h2>

                <label style={s.label}>Event Title</label>
                <input
                  style={s.input}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Enter event name"
                />

                <label style={s.label}>Description</label>
                <textarea
                  style={s.input}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the event"
                  rows={3}
                />

                <label style={s.label}>Category</label>
                <select
                  style={s.input}
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <div style={s.formGrid}>
                  <div>
                    <label style={s.label}>Event Date</label>
                    <input
                      type="date"
                      style={s.input}
                      value={form.event_date}
                      onChange={e => setForm({ ...form, event_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={s.label}>Event Time</label>
                    <input
                      type="time"
                      style={s.input}
                      value={form.event_time}
                      onChange={e => setForm({ ...form, event_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <label style={s.label}>Venue</label>
                <input
                  style={s.input}
                  value={form.venue}
                  onChange={e => setForm({ ...form, venue: e.target.value })}
                  required
                  placeholder="Event location"
                />

                <label style={s.label}>Image URL</label>
                <input
                  style={s.input}
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />

                <div style={s.formGrid}>
                  <div>
                    <label style={s.label}>Maximum Participants</label>
                    <input
                      type="number"
                      min="1"
                      style={s.input}
                      value={form.max_participants}
                      onChange={e => setForm({ ...form, max_participants: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={s.label}>Status</label>
                    <select
                      style={s.input}
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div style={s.formActions}>
                  <button type="submit" style={s.primary} disabled={saving}>
                    <Save size={17} />
                    {saving ? 'Saving...' : 'Save Event'}
                  </button>

                  <button
                    type="button"
                    style={s.secondary}
                    onClick={() => setShowForm(false)}
                  >
                    Close
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <p style={s.muted}>Loading events...</p>
            ) : events.length === 0 ? (
              <p style={s.muted}>No events found.</p>
            ) : (
              <div style={s.eventList}>
                {events.map(event => (
                  <article key={event.id} style={s.eventCard}>
                    <div>
                      <span style={s.category}>
                        {event.event_categories?.name || 'General'}
                      </span>
                      <h3>{event.title}</h3>
                      <p>{event.event_date} · {event.event_time} · {event.venue}</p>
                      <span style={s.status}>{event.status}</span>
                    </div>

                    <div style={s.cardActions}>
                      <button
                        style={s.edit}
                        onClick={() => openEditForm(event)}
                      >
                        <Pencil size={16} /> Edit
                      </button>

                      {event.status !== 'cancelled' && (
                        <button
                          style={s.cancel}
                          onClick={() => cancelEvent(event)}
                        >
                          <XCircle size={16} /> Cancel
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'registrations' && (
          <>
            <h2 style={s.registrationHeading}>Student Registrations</h2>

            {loading ? (
              <p style={s.muted}>Loading registrations...</p>
            ) : registrations.length === 0 ? (
              <p style={s.muted}>No registrations yet.</p>
            ) : (
              <div style={s.eventList}>
                {registrations.map(item => (
                  <article key={item.id} style={s.eventCard}>
                    <div>
                      <h3>{item.events?.title || 'Event'}</h3>
                      <p>Student ID: {item.student_id}</p>
                      <p>Registered: {new Date(item.registration_date).toLocaleString()}</p>
                    </div>
                    <span style={s.status}>{item.status}</span>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div style={s.statCard}>
      <div style={s.statIcon}>{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#080b18',
    color: '#fff',
    fontFamily: 'inherit'
  },
  header: {
    padding: '20px 6%',
    borderBottom: '1px solid #27304a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    fontSize: 22,
    fontWeight: 800
  },
  accent: { color: '#a78bfa' },
  adminTag: {
    fontSize: 10,
    background: '#39265f',
    color: '#c4b5fd',
    padding: '5px 8px',
    borderRadius: 20
  },
  logout: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    padding: '10px 14px',
    background: '#1b2540',
    color: '#fff',
    border: '1px solid #39435e',
    borderRadius: 9,
    cursor: 'pointer'
  },
  container: {
    width: '90%',
    maxWidth: 1100,
    margin: '45px auto'
  },
  welcome: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    flexWrap: 'wrap',
    marginBottom: 30
  },
  eyebrow: {
    color: '#a78bfa',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 700
  },
  refresh: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#1b2540',
    color: '#fff',
    border: '1px solid #39435e',
    padding: '11px 15px',
    borderRadius: 9,
    cursor: 'pointer'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
    gap: 16,
    marginBottom: 35
  },
  statCard: {
    background: '#141b30',
    border: '1px solid #29324c',
    borderRadius: 14,
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 9
  },
  statIcon: { color: '#a78bfa' },
  tabs: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    borderBottom: '1px solid #29324c',
    marginBottom: 25
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '13px 16px',
    color: '#aab2ca',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer'
  },
  activeTab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '13px 16px',
    color: '#fff',
    background: '#272044',
    border: 'none',
    borderBottom: '2px solid #9874ff',
    cursor: 'pointer'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 17px',
    background: 'linear-gradient(100deg,#8155ff,#3978ff)',
    color: '#fff',
    border: 'none',
    borderRadius: 9,
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondary: {
    padding: '12px 17px',
    background: '#202a43',
    color: '#fff',
    border: '1px solid #39435e',
    borderRadius: 9,
    cursor: 'pointer'
  },
  eventList: {
    display: 'grid',
    gap: 14
  },
  eventCard: {
    background: '#141b30',
    border: '1px solid #29324c',
    borderRadius: 13,
    padding: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap'
  },
  category: {
    color: '#b59aff',
    fontSize: 13
  },
  status: {
    display: 'inline-block',
    background: '#203b38',
    color: '#5ee6b2',
    padding: '6px 10px',
    borderRadius: 20,
    fontSize: 12
  },
  cardActions: {
    display: 'flex',
    gap: 9,
    flexWrap: 'wrap'
  },
  edit: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#26385d',
    color: '#fff',
    border: 'none',
    padding: '9px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  cancel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#4b252f',
    color: '#ffb4b4',
    border: 'none',
    padding: '9px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  form: {
    background: '#141b30',
    border: '1px solid #39435e',
    borderRadius: 15,
    padding: 23,
    marginBottom: 25
  },
  label: {
    display: 'block',
    color: '#c4cbe0',
    fontSize: 13,
    margin: '15px 0 7px'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: 12,
    borderRadius: 8,
    border: '1px solid #39435e',
    background: '#0c1325',
    color: '#fff',
    font: 'inherit'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
    gap: 15
  },
  formActions: {
    display: 'flex',
    gap: 10,
    marginTop: 22
  },
  success: {
    background: '#173b32',
    color: '#69e6b1',
    padding: 13,
    borderRadius: 9,
    marginBottom: 18
  },
  error: {
    background: '#48242c',
    color: '#ffaaaa',
    padding: 13,
    borderRadius: 9,
    marginBottom: 18
  },
  muted: { color: '#aab2ca' },
  registrationHeading: { marginBottom: 20 }
}
