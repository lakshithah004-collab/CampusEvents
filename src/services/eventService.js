
import { supabase } from '../lib/supabase'

export async function getEvents() {
  const [eventsResult, countsResult] = await Promise.all([
    supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        event_date,
        event_time,
        venue,
        image_url,
        max_participants,
        status,
        event_categories(name)
      `)
      .eq('status', 'published')
      .gte('event_date', new Date().toLocaleDateString('en-CA'))
      .order('event_date', { ascending: true }),

    supabase.rpc('get_public_event_counts')
  ])

  if (eventsResult.error) throw eventsResult.error
  if (countsResult.error) throw countsResult.error

  const counts = Object.fromEntries(
    countsResult.data.map((item) => [
      item.event_id,
      Number(item.confirmed_count)
    ])
  )

  return eventsResult.data.map((event) => {
    const registeredCount = counts[event.id] || 0

    return {
      ...event,
      category: event.event_categories?.name || 'General',
      registeredCount,
      availableSeats: Math.max(
        0,
        event.max_participants - registeredCount
      )
    }
  })
}
