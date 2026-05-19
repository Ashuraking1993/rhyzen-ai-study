import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import FloatingEmbers from '../components/FloatingEmbers'

function Home() {
  const navigate = useNavigate()
  const [showLoading, setShowLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [typedSubtitle, setTypedSubtitle] = useState('')
  const [typedTitle, setTypedTitle] = useState('')
  const [showDesc, setShowDesc] = useState(false)
  const [showBtn, setShowBtn] = useState(false)

  const subtitleText = 'RHYZEN AI SYSTEM'
  const titleText = 'AI STUDY ASSISTANT'

  useEffect(() => {
    if (!visible) return

    // Type subtitle first
    let i = 0
    const subtitleInterval = setInterval(() => {
      setTypedSubtitle(subtitleText.slice(0, i + 1))
      i++
      if (i >= subtitleText.length) clearInterval(subtitleInterval)
    }, 80)

    // Type title after subtitle done
    setTimeout(() => {
      let j = 0
      const titleInterval = setInterval(() => {
        setTypedTitle(titleText.slice(0, j + 1))
        j++
        if (j >= titleText.length) clearInterval(titleInterval)
      }, 60)
    }, subtitleText.length * 80 + 300)

    // Show description after title
    setTimeout(() => {
      setShowDesc(true)
    }, subtitleText.length * 80 + titleText.length * 60 + 600)

    // Show button last
    setTimeout(() => {
      setShowBtn(true)
    }, subtitleText.length * 80 + titleText.length * 60 + 1200)

  }, [visible])

  return (

    <>
      {showLoading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'black',
          zIndex: 9999,
        }}>
          <video
            src="/loading-intro.mp4"
            autoPlay
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onEnded={() => {
              setShowLoading(false)
              setTimeout(() => setVisible(true), 100)
            }}
          />
          <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',

            transform: 'translate(-50%, -50%)',

            width: '100%',

            textAlign: 'center',

            fontFamily: "'Orbitron', sans-serif",

            zIndex: 10000,

            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              fontSize: '0.9rem',

              letterSpacing: '10px',

              color: 'rgba(255,0,0,0.95)',

              marginBottom: '18px',

              textTransform: 'uppercase',

              textShadow:
                '0 0 10px rgba(255,0,0,0.8), 0 0 30px rgba(255,0,0,0.35)',

              animation: 'pulse 2s infinite',
            }}
          >
            RHYZEN AI SYSTEM
          </p>

          <h1
            style={{
              fontSize: '4.5rem',

              fontWeight: '900',

              letterSpacing: '8px',

              color: 'white',

              marginBottom: '18px',

              textTransform: 'uppercase',

              textShadow: `
                0 0 10px rgba(255,255,255,0.95),
                0 0 25px rgba(255,0,0,0.95),
                0 0 50px rgba(255,0,0,0.55),
                0 0 100px rgba(255,0,0,0.2)
              `,

              animation: 'systemGlow 2.5s ease-in-out infinite',
            }}
          >
            INITIALIZING
          </h1>

          <p
            style={{
              fontSize: '1rem',

              letterSpacing: '6px',

              color: 'rgba(255,255,255,0.55)',

              textTransform: 'uppercase',

              animation: 'pulse 2s infinite',
            }}
          >
            BOOTING RHYZEN CORE...
          </p>
        </div>
          <div style={{ 
            position: 'absolute',
            bottom: 0, left: 0,
            width: '100%',
            height: '200px',
            background: 'linear-gradient(transparent, black)',
            zIndex: 9999,
          }} />
        </div>
      )}

      <div className="app" style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.5s ease',
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            opacity: 0.6,
          }}
        >
          <source src="/landing-bg.mp4" type="video/mp4" />
        </video>

           <FloatingEmbers style={{
        left: `${Math.random() * 100}%`,
        animationDuration: `${8 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random(),
        transform: `scale(${0.5 + Math.random()})`,
        filter: `blur(${Math.random() * 1.5}px)`
      }} />

        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(255,0,0,0.1), rgba(0,0,0,0.7) 70%)',
          zIndex: 1,
        }} />

        <div className="content" style={{ position: 'relative', zIndex: 2 }}>

          {/* Typewriter subtitle */}
          <p className="subtitle">
            {typedSubtitle}
            {typedSubtitle.length < subtitleText.length && (
              <span style={{ animation: 'blink 0.7s infinite' }}>|</span>
            )}
          </p>

          {/* Typewriter title */}
          <h1 className="title">
            {typedTitle}
            {typedTitle.length > 0 && typedTitle.length < titleText.length && (
              <span style={{ animation: 'blink 0.7s infinite' }}>|</span>
            )}
          </h1>

          {/* Fade in description */}
          <p className="description" style={{
            opacity: showDesc ? 1 : 0,
            transform: showDesc ? 'translateY(0)' : 'translateY(15px)',
            transition: 'opacity 1.2s ease, transform 1.2s ease',
          }}>
            Ascend beyond human learning.
            AI-powered summaries, quizzes, flashcards,
            and intelligent tutoring.
          </p>

          {/* Fade in button */}
        <button className="start-btn" onClick={() => navigate('/login')}>
          ENTER SYSTEM
        </button>

        </div>
      </div>
    </>
  )
}

export default Home