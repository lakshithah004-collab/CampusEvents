import { CalendarDays, ArrowUpRight, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="#home" className="brand">
        <span className="brand-icon">
          <CalendarDays size={22} />
        </span>
        <span>
          Campus<span className="brand-accent">Events</span>
        </span>
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#events">Explore Events</a>
        <a href="#about">About</a>
      </div>

      <div className="nav-actions">
        <Link to="/login" className="nav-login">
          Student Login
        </Link>

        <Link to="/signup" className="nav-cta">
          Sign Up <ArrowUpRight size={16} />
        </Link>
      </div>

      <Link
        to="/login"
        className="mobile-menu"
        aria-label="Student login"
      >
        <Menu size={24} />
      </Link>
    </nav>
  )
}