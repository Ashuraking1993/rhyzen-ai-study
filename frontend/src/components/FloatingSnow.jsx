import './FloatingSnow.css'

const flakes = ['❄', '❅', '❆']

function FloatingSnow() {
  return (
    <div className="snowflakes">
      {[...Array(35)].map((_, i) => (
        <span
          key={i}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random(),
            fontSize: `${12 + Math.random() * 18}px`,
            filter: `blur(${Math.random() * 1}px)`
          }}
        >
          {flakes[Math.floor(Math.random() * flakes.length)]}
        </span>
      ))}
    </div>
  )
}

export default FloatingSnow