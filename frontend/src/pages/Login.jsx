import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

 const handleSubmit = async () => {
  setError('')
  setSuccess('')

  if (!email || !password) {
    return setError('Fill in all fields!')
  }

  setLoading(true)

  try {
    await new Promise(resolve => setTimeout(resolve, 1200))

    if (isRegister) {
      setSuccess('Demo account created!')
      setIsRegister(false)
    } else {
      localStorage.setItem('token', 'demo-token')
      localStorage.setItem('user_name', 'Ashura')
      localStorage.setItem('user_id', '1')

      navigate('/dashboard')
    }
  } catch (err) {
    setError('Something went wrong!')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="login-wrapper">
      <video autoPlay loop muted playsInline className="login-bg-video">
        <source src="/loading-intro.mp4" type="video/mp4" />
      </video>
      <div className="login-overlay" />

      <div className="login-box">
        <div className="login-header">
          <p className="login-sub">⬡ RHYZEN AI SYSTEM ⬡</p>
          <h1 className="login-title">{isRegister ? 'REGISTER' : 'LOGIN'}</h1>
          <p className="login-desc">
            {isRegister ? 'Create your operator account' : 'Access the system'}
          </p>
        </div>

        <div className="login-form">
          {isRegister && (
            <div className="input-group">
              <label className="input-label">OPERATOR NAME</label>
              <input
                className="login-input"
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">EMAIL</label>
            <input
              className="login-input"
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">PASSWORD</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <p className="login-error">⚠ {error}</p>}
          {success && <p className="login-success">✓ {success}</p>}

          <button
            className="login-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : isRegister ? 'CREATE ACCOUNT' : 'ENTER SYSTEM'}
          </button>

          <p className="login-switch">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <span onClick={() => {
              setIsRegister(!isRegister)
              setError('')
              setSuccess('')
            }}>
              {isRegister ? ' LOGIN' : ' REGISTER'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login