
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import { useState, useEffect } from 'react'
import FloatingEmbers from '../components/FloatingEmbers'



function Dashboard() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('user_name') || 'OPERATOR'
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [activeNav, setActiveNav] = useState('dashboard')
  const [history, setHistory] = useState([])

  const userId = parseInt(localStorage.getItem('user_id') || '0')

      useEffect(() => {
        if (userId > 0) fetchSessions()
      }, [])

      const fetchSessions = async () => {
        try {
          const res = await fetch(`http://localhost:5279/api/ai/sessions/${userId}`)
          const data = await res.json()
          setHistory(data)
        } catch (err) {
          console.error(err)
        }
      }

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: '⊞' },
    { id: 'flashcards', label: 'FLASHCARDS', icon: '▣' },
    { id: 'quiz', label: 'QUIZ', icon: '?' },
    { id: 'history', label: 'HISTORY', icon: '◷' },
  ]

 const handleGenerate = async (type) => {
  
  if (!notes.trim()) return alert('Please input some notes first!')
  setLoading(true)
  setResult(null)
  try {
    const response = await fetch('http://localhost:5279/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, type, userId })
    })
    const data = await response.json()

    if (type === 'Flashcards') {
      localStorage.setItem('flashcards_data', data.result)
      navigate('/flashcards')
      return
    }

    if (type === 'Quiz') {
      localStorage.setItem('quiz_data', data.result)
      navigate('/quiz')
      return
    }

    setResult({ text: data.result, type: data.type })
    await fetchSessions()
  } catch (err) {
    console.error(err)
    alert('Backend connection error!')
  } finally {
    setLoading(false)
  }
}

     const [typedHeader, setTypedHeader] = useState('')
     const headerText = 'DASHBOARD'

    useEffect(() => {
      setTypedHeader('')
      let i = 0
      const interval = setInterval(() => {
        setTypedHeader(headerText.slice(0, i + 1))
        i++
        if (i >= headerText.length) clearInterval(interval)
      }, 80)
      return () => clearInterval(interval)
    }, [])

    

  useEffect(() => {
    if (userId > 0) fetchSessions()
  }, [])

  const [toast, setToast] = useState('')
   

  return (

    
    <div className="dashboard-wrapper">

      {toast && (
      <div className="cyber-toast">
        ✓ {toast}
      </div>
    )}

     <FloatingEmbers style={{
        left: `${Math.random() * 100}%`,
        animationDuration: `${8 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random(),
        transform: `scale(${0.5 + Math.random()})`,
        filter: `blur(${Math.random() * 1.5}px)`
      }} />

      <video autoPlay loop muted playsInline className="dashboard-bg-video">
        <source src="/dashboard-bg.mp4" type="video/mp4" />
      </video>

      <div className="dashboard-overlay" />

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <p className="sidebar-logo-sub">RHYZEN</p>
          <p className="sidebar-logo-title">AI STUDY SYSTEM</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveNav(item.id)
                if (item.id !== 'dashboard') navigate(`/${item.id}`)
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-exit" onClick={() => navigate('/')}>
          ← EXIT SYSTEM
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">

       <div className="dashboard-header">
       <p className="dashboard-header-sub">WELCOME BACK, {userName.toUpperCase()}</p>
        <h1 className="dashboard-header-title">
          {typedHeader}
          {typedHeader.length < headerText.length && (
            <span className="cursor-blink">|</span>
          )}
        </h1>
      </div>

        {/* Notes input */}
        <div className="panel">
          <p className="panel-label">INPUT NOTES</p>
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Paste your notes here..."
          />
          <div className="generate-buttons">
            {['Flashcards', 'Quiz', 'Summary'].map(type => (
              <button
                key={type}
                className="generate-btn"
                onClick={() => handleGenerate(type)}
                disabled={loading}
              >
                GENERATE {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && <div className="loading-text">PROCESSING...</div>}

        {/* Result */}
        {result && !loading && (
  <div className="result-panel">
    <div className="result-header">
      <div className="result-header-left">
        <p className="result-label">{result.type.toUpperCase()} RESULT</p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {result.type === 'Summary' && (
          <button
            className="result-copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(result.text)
              setToast('SUMMARY COPIED')

          setTimeout(() => {
            setToast('')
          }, 2500)
            }}
          >
            ⎘ COPY
          </button>
        )}
        <button className="result-clear-btn" onClick={() => setResult(null)}>
          ✕ CLEAR
        </button>
      </div>
    </div>
    <div className="result-content">{result.text}</div>
  </div>
)}
        {/* History */}
        <div className="panel">
          <p className="panel-label">RECENT SESSIONS</p>
          {history.length === 0 ? (
            <p className="empty-history">No sessions yet.</p>
          ) : (
            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div>
                    <p className="history-title">{item.title}</p>
                    <p className="history-date">{item.date}</p>
                  </div>
                  <span className="history-badge">{item.type.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard