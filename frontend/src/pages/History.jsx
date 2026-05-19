import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './History.css'
import FloatingEmbers from '../components/FloatingEmbers'

function History() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const userId = parseInt(localStorage.getItem('user_id') || '0')

  const filters = ['All', 'Flashcards', 'Quiz', 'Summary']

  const typeIcons = {
    Flashcards: '▣',
    Quiz: '?',
    Summary: '≡',
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await fetch(`http://localhost:5279/api/ai/sessions/${userId}`)
      const data = await res.json()
      setSessions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'All'
    ? sessions
    : sessions.filter(s => s.type === filter)

  return (
    <div className="history-wrapper">
      <FloatingEmbers />

      <video autoPlay loop muted playsInline className="history-bg-video">
        <source src="/history-bg.mp4" type="video/mp4" />
      </video>
      <div className="history-overlay" />

      <div className="history-content">

        {/* HEADER */}
        <div className="history-header-top">
          <button className="history-back-btn" onClick={() => navigate('/dashboard')}>
            ← BACK TO DASHBOARD
          </button>
        </div>

        <div className="history-header-info">
          <p className="history-title-sub">⬡ RHYZEN AI SYSTEM ⬡</p>
          <h1 className="history-title">SESSION HISTORY</h1>
          <p className="history-count">
            <span className="history-count-dot" />
            {sessions.length} TOTAL SESSIONS
          </p>
        </div>

        <div className="history-divider" />

        {/* FILTERS */}
        <div className="history-filters">
          {filters.map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* SESSIONS */}
        {loading ? (
          <div className="history-loading">LOADING SESSIONS...</div>
        ) : filtered.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">◷</div>
            <p>No {filter === 'All' ? '' : filter} sessions yet.</p>
          </div>
        ) : (
          <div className="sessions-list">
            {filtered.map(item => (
              <div
                key={item.id}
                className="session-item"
                onClick={() => navigate(`/${item.type.toLowerCase()}`)}
              >
                <div className="session-left">
                  <div className="session-icon">
                    {typeIcons[item.type] || '◷'}
                  </div>
                  <div className="session-info">
                    <p className="session-title">{item.title}</p>
                    <p className="session-date">{item.date}</p>
                  </div>
                </div>
                <span className="session-badge">{item.type.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default History