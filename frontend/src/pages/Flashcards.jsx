import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Flashcards.css'
import FloatingPetals from '../components/FloatingPetals'

function Flashcards() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState({})
  const [error, setError] = useState(false)

 useEffect(() => {
  try {
    const raw = localStorage.getItem('flashcards_data')
    if (!raw) { setError(true); return }

    let cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .trim()

    // Extract JSON array lang — from [ to last ]
    const start = cleaned.indexOf('[')
    const end = cleaned.lastIndexOf(']')
    
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1)
    } else if (start !== -1) {
      // Incomplete — auto close
      cleaned = cleaned.substring(start)
      const lastBrace = cleaned.lastIndexOf('}')
      if (lastBrace !== -1) {
        cleaned = cleaned.substring(0, lastBrace + 1) + ']'
      }
    }

    const parsed = JSON.parse(cleaned)
    setCards(Array.isArray(parsed) ? parsed : [])
  } catch (e) {
    
    setError(true)
  }
}, [])
  const toggleFlip = (index) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="flashcards-wrapper">
      <FloatingPetals />
      <video autoPlay loop muted playsInline className="flashcards-bg-video">
        <source src="/flashcard-bg.mp4" type="video/mp4" />
      </video>
      <div className="flashcards-overlay" />

     <div className="flashcards-content">
  <div className="flashcards-header">

    <div className="flashcards-header-top">
      <button className="flashcards-back-btn" onClick={() => navigate('/dashboard')}>
        ← BACK TO DASHBOARD
      </button>
    </div>

    <div className="flashcards-header-info">
      <p className="flashcards-title-sub">⬡ RHYZEN AI SYSTEM ⬡</p>
      <h1 className="flashcards-title">FLASHCARDS</h1>
      {cards.length > 0 && (
        <p className="flashcards-count">
          <span className="count-dot" /> {cards.length} CARDS GENERATED
        </p>
      )}
    </div>

    <div className="flashcards-header-divider" />
  </div>

        {error ? (
          <div className="flashcards-error">
            No flashcards found. Go back and generate some!
          </div>
        ) : cards.length === 0 ? (
          <div className="flashcards-loading">LOADING CARDS...</div>
        ) : (
          <div className="cards-grid">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`flip-card ${flipped[index] ? 'flipped' : ''}`}
                onClick={() => toggleFlip(index)}
              >
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <p className="card-side-label">QUESTION</p>
                    <p className="card-question">{card.question}</p>
                    <p className="card-hint">CLICK TO REVEAL</p>
                  </div>
                  <div className="flip-card-back">
                    <p className="card-side-label">ANSWER</p>
                    <p className="card-answer">{card.answer}</p>
                    <p className="card-hint">CLICK TO FLIP BACK</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Flashcards