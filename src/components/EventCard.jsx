
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowUpRight
} from 'lucide-react'

import { format } from 'date-fns'

export default function EventCard({ event, onExplore }) {
  const eventDate = new Date(`${event.event_date}T00:00:00`)

  return (
    <article className="event-card">
      <div className="event-image">
        <img
          src={event.image_url}
          alt={event.title}
          loading="lazy"
        />

        <span className="event-category">
          {event.category}
        </span>
      </div>

      <div className="event-content">
        <h3>{event.title}</h3>

        <p className="event-description">
          {event.description}
        </p>

        <div className="event-info">
          <span>
            <CalendarDays size={15} />
            {format(eventDate, 'dd MMM yyyy')}
          </span>

          <span>
            <MapPin size={15} />
            {event.venue}
          </span>

          <span>
            <Users size={15} />
            {event.availableSeats} seats left
          </span>
        </div>

        <button
          type="button"
          onClick={onExplore}
          className="event-button"
        >
          Explore event
          <ArrowUpRight size={17} />
        </button>
      </div>
    </article>
  )
}
