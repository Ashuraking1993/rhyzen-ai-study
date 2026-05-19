import './FloatingEmbers.css'

function FloatingEmbers() {
  return (
    <div className="embers">
      {[...Array(40)].map((_, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${6 + Math.random() * 8}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random(),
            width: `${2 + Math.random() * 5}px`,
            height: `${2 + Math.random() * 5}px`,
            filter: `blur(${Math.random() * 1.5}px)`
          }}
        />
      ))}
    </div>
  )
}

export default FloatingEmbers