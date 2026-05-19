import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Quiz.css'
import FloatingEmbers from '../components/FloatingEmbers'

function Quiz() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [inputAnswer, setInputAnswer] = useState('')
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('quiz_data')
      if (!raw) { setError(true); return }

      let cleaned = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .trim()

      if (!cleaned.endsWith(']')) {
        const lastComplete = cleaned.lastIndexOf('},')
        if (lastComplete !== -1) {
          cleaned = cleaned.substring(0, lastComplete + 1) + ']'
        } else {
          cleaned = cleaned + ']'
        }
      }

      const parsed = JSON.parse(cleaned)

      // Normalize type values — AI may generate different naming conventions
      const normalizeType = (type = '') => {
        const t = type.toLowerCase().replace(/[_\s-]/g, '')
        if (t.includes('multiple') || t.includes('mcq') || t.includes('choice')) return 'multiple'
        if (t.includes('truefalse') || t.includes('boolean') || t.includes('single') || t.includes('tf')) return 'single'
        if (t.includes('identify') || t.includes('fillin') || t.includes('fillblank') || t.includes('blank') || t.includes('short') || t.includes('open')) return 'identify'
        return type // fallback: keep original so we can debug
      }

      const normalized = (Array.isArray(parsed) ? parsed : []).map(q => {
        const choices = q.choices || q.options || []

        // If answer is a letter (A/B/C/D), convert to actual choice text
        let answer = q.answer
        if (typeof answer === 'string' && /^[A-Da-d]$/.test(answer.trim())) {
          const idx = answer.trim().toUpperCase().charCodeAt(0) - 65
          answer = choices[idx] ?? answer
        }

        return {
          ...q,
          type: normalizeType(q.type) || 'multiple',
          choices,
          answer,
        }
      })

      
      setQuestions(normalized)
    } catch (e) {
      
      setError(true)
    }
  }, [])

  const currentQ = questions[current]

  const handleChoiceSelect = (choice) => {
    if (answered) return
    setSelected(choice)
    setAnswered(true)
    if (choice === currentQ.answer) setScore(s => s + 1)
  }

  const handleIdentifySubmit = () => {
    if (answered || !inputAnswer.trim()) return
    setAnswered(true)
    if (inputAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase())
      setScore(s => s + 1)
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setInputAnswer('')
      setAnswered(false)
    }
  }

  const handleRetry = () => {
    setCurrent(0)
    setSelected(null)
    setInputAnswer('')
    setAnswered(false)
    setScore(0)
    setFinished(false)
  }

  // FIX 1: Removed 'reveal' class — it was making unchosen choices flash green,
  // making it look like multiple answers were correct and confusing the layout.
  const getChoiceClass = (choice) => {
    if (!answered) return ''
    if (choice === currentQ.answer) return 'correct'
    if (choice === selected && choice !== currentQ.answer) return 'wrong'
    return '' // was 'reveal' — removed
  }

  const getTypeLabel = (type) => {
    switch(type) {
      case 'multiple': return 'MULTIPLE CHOICE'
      case 'single': return 'TRUE / FALSE'
      case 'identify': return 'FILL IN THE BLANK'
      default: return 'QUESTION'
    }
  }

  if (error) return (
    <div className="quiz-wrapper">

     

      
      <video autoPlay loop muted playsInline className="quiz-bg-video">
        <source src="/loading-intro.mp4" type="video/mp4" />
      </video>
      <div className="quiz-overlay" />
      <div className="quiz-content">
        <p className="quiz-error">No quiz found. Go back and generate one!</p>
        <button className="quiz-back-btn" onClick={() => navigate('/dashboard')}>← BACK</button>
      </div>
    </div>
  )

  if (questions.length === 0) return (
    <div className="quiz-wrapper">
      <video autoPlay loop muted playsInline className="quiz-bg-video">
        <source src="/loading-intro.mp4" type="video/mp4" />
      </video>
      <div className="quiz-overlay" />
      <div className="quiz-content">
        <p className="quiz-loading">LOADING QUIZ...</p>
      </div>
    </div>
  )

  return (
    <div className="quiz-wrapper">

       <FloatingEmbers style={{
        left: `${Math.random() * 100}%`,
        animationDuration: `${8 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random(),
        transform: `scale(${0.5 + Math.random()})`,
        filter: `blur(${Math.random() * 1.5}px)`
      }} />

      <video autoPlay loop muted playsInline className="quiz-bg-video">
        <source src="/loading-intro.mp4" type="video/mp4" />
      </video>
      <div className="quiz-overlay" />

      <div className="quiz-content">
        <div className="quiz-header">
          <div className="quiz-header-top">
            <button className="quiz-back-btn" onClick={() => navigate('/dashboard')}>
              ← BACK TO DASHBOARD
            </button>
          </div>
          <div className="quiz-header-info">
            <p className="quiz-title-sub">⬡ RHYZEN AI SYSTEM ⬡</p>
            <h1 className="quiz-title">QUIZ MODE</h1>
            <p className="quiz-count">
              <span className="quiz-dot" /> {questions.length} QUESTIONS
            </p>
          </div>
          <div className="quiz-divider" />
        </div>

        {/* RESULTS */}
        {finished ? (
          <div className="quiz-results">
            <p className="results-title">⬡ MISSION COMPLETE ⬡</p>
            <p className="results-score">{score}/{questions.length}</p>
            <p className="results-sub">
              {score === questions.length ? 'PERFECT SCORE! OUTSTANDING OPERATOR!' :
               score >= questions.length / 2 ? 'GOOD JOB! KEEP TRAINING!' :
               'KEEP STUDYING, OPERATOR!'}
            </p>
            <button className="results-btn" onClick={handleRetry}>RETRY</button>
            <button className="results-btn outline" onClick={() => navigate('/dashboard')}>
              BACK TO DASHBOARD
            </button>
          </div>
        ) : (
          <>
            {/* PROGRESS */}
            <div className="quiz-progress">
              <p className="quiz-progress-text">
                QUESTION {current + 1} OF {questions.length}
              </p>
              <p className="quiz-score-text">SCORE: {score}</p>
            </div>

            {/* QUESTION */}
            <div className="question-card">
              <span className="question-type-badge">
                {getTypeLabel(currentQ.type)}
              </span>
              <p className="question-text">{currentQ.question}</p>

              {/* MULTIPLE / SINGLE CHOICE */}
              {(currentQ.type === 'multiple' || currentQ.type === 'single') && (
                <div className="choices-list">
                  {currentQ.choices.map((choice, i) => (
                    <button
                      key={i}
                      className={`choice-btn ${getChoiceClass(choice)}`}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={answered}
                    >
                      <span className="choice-label">
                        {currentQ.type === 'multiple'
                          ? String.fromCharCode(65 + i)
                          : i === 0 ? 'T' : 'F'}
                      </span>
                      {choice}
                    </button>
                  ))}
                </div>
              )}

              {/* IDENTIFY */}
              {/* FIX 2: Wrapped in identify-wrapper div for proper layout,
                  and added box-sizing fix in CSS so input doesn't overflow
                  and hide the Submit/Next buttons */}
              {currentQ.type === 'identify' && (
                <div className="identify-wrapper">
                  <input
                    className={`identify-input ${
                      answered
                        ? inputAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase()
                          ? 'correct' : 'wrong'
                        : ''
                    }`}
                    type="text"
                    placeholder="Type your answer here..."
                    value={inputAnswer}
                    onChange={e => setInputAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleIdentifySubmit()}
                    disabled={answered}
                  />
                  {!answered && (
                    <button className="quiz-action-btn" onClick={handleIdentifySubmit}>
                      SUBMIT ANSWER
                    </button>
                  )}
                </div>
              )}

              {/* FEEDBACK */}
              {answered && (
                <p className={`feedback-text ${
                  (currentQ.type === 'identify'
                    ? inputAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase()
                    : selected === currentQ.answer)
                  ? 'correct' : 'wrong'
                }`}>
                  {(currentQ.type === 'identify'
                    ? inputAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase()
                    : selected === currentQ.answer)
                    ? '✓ CORRECT!'
                    : `✗ WRONG! Correct answer: ${currentQ.answer}`}
                </p>
              )}

              {/* FIX 3: Next button is now always visible after answering —
                  was previously getting pushed off-screen on identify type */}
              {answered && (
                <button className="quiz-action-btn" onClick={handleNext}>
                  {current + 1 >= questions.length ? 'SEE RESULTS' : 'NEXT QUESTION →'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Quiz
