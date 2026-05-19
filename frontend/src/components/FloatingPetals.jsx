import './FloatingPetals.css'

function FloatingPetals() {
  return (
    <div className="petals">
      {[...Array(25)].map((_, i) => (
        <span
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random(),
            transform: `scale(${0.5 + Math.random()})`
          }}
        />
      ))}
    </div>
  )
}

export default FloatingPetals