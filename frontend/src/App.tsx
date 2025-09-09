import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import io from 'socket.io-client'
import MultiplayerCursors from './components/MultiplayerCursors'
import VoteNotifications from './components/VoteNotifications'
import AnimatedCounter from './components/AnimatedCounter'
import FloatingNav from './components/FloatingNav'
import './App.css'

const socket = io('/', {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
})

function App() {
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [connected, setConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState(0)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const cards = [
    {
      id: 'gaylord1',
      name: 'Patrik Jakubčo',
      role: 'Innovation Leader',
      image: 'https://ca.slack-edge.com/T056AS13329-U08LHKZLW13-5e63546372d4-192',
      hot: true,
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'gaylord2', 
      name: 'Palo Habera',
      role: 'Creative Director',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/PavolHaberaKraus.jpg',
      hot: false,
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'gaylord3',
      name: 'Vašo Patejdl',
      role: 'Strategy Expert',
      image: 'https://i.scdn.co/image/ab67616100005174474b21aac8ad28d40be779f9',
      hot: false,
      color: '#95E1D3',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ]
  
  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true)
    })
    
    socket.on('voteUpdate', (data: any) => {
      setVotes(prev => ({...prev, [data.cardId]: data.count}))
    })
    
    socket.on('disconnect', () => {
      setConnected(false)
    })
    
    cards.forEach((card) => {
      fetch(`/api/votes/${card.id}`)
        .then(res => res.json())
        .then(data => setVotes(prev => ({...prev, [card.id]: data.count || 0})))
        .catch(err => console.log('Error loading votes:', err))
    })
    
    return () => {
      socket.off('connect')
      socket.off('voteUpdate')
      socket.off('disconnect')
    }
  }, [])

  const handleVote = (cardId: string) => {
    socket.emit('vote', { cardId })
    setSelectedCard(cardId)
    setTimeout(() => setSelectedCard(null), 600)
  }

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000000',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #000000 50%)',
        opacity: 0.8
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 50% 100%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)`,
          animation: 'pulse 10s ease-in-out infinite'
        }} />
      </div>

      {/* Main Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        zIndex: 1
      }}>
        <MultiplayerCursors socket={socket} onUsersUpdate={setActiveUsers} />
        <FloatingNav activeUsers={activeUsers} connected={connected} />
        <VoteNotifications socket={socket} cards={cards} />
        
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '8px 20px',
            borderRadius: '100px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: connected ? '#34C759' : '#FF3B30',
            boxShadow: connected ? '0 0 10px #34C759' : '0 0 10px #FF3B30',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '13px',
            fontWeight: 500
          }}>
          </span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            textAlign: 'center', 
            marginBottom: '60px',
            marginTop: '100px',
            zIndex: 1
          }}
        >
          <h1 style={{
            fontSize: '72px',
            fontWeight: 700,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #999999 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            Hall of Fame
          </h1>
          <p style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '16px',
            fontWeight: 400,
            letterSpacing: '-0.01em'
          }}>
            Choose your champion
          </p>
        </motion.div>

        {/* Cards Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {cards.map((card, index) => {
            const voteCount = votes[card.id] || 0
            const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100) : 0
            const isHovered = hoveredCard === card.id
            const isSelected = selectedCard === card.id
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onHoverStart={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
                style={{
                  position: 'relative',
                  transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Card Background with Glow */}
                <div style={{
                  position: 'absolute',
                  inset: '-1px',
                  background: card.gradient,
                  borderRadius: '32px',
                  opacity: isHovered ? 0.3 : 0,
                  filter: 'blur(20px)',
                  transition: 'opacity 0.3s ease'
                }} />
                
                {/* Card Content */}
                <div style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  borderRadius: '32px',
                  padding: '40px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isHovered 
                    ? '0 30px 60px rgba(0, 0, 0, 0.4)' 
                    : '0 10px 40px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isSelected ? 'scale(0.98)' : 'scale(1)'
                }}>
                  {/* Trending Badge */}
                  {card.hot && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.5 + index * 0.1 }}
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '24px',
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        color: '#000',
                        padding: '6px 16px',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
                      }}
                    >
                      🔥 Trending
                    </motion.div>
                  )}
                  
                  {/* Profile Section */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '140px',
                      height: '140px',
                      margin: '0 auto 24px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        inset: '-2px',
                        background: card.gradient,
                        borderRadius: '50%',
                        opacity: isHovered ? 1 : 0.5,
                        transition: 'opacity 0.3s ease',
                        animation: isHovered ? 'rotate 3s linear infinite' : 'none'
                      }} />
                      <img
                        src={card.image}
                        alt={card.name}
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #000'
                        }}
                      />
                    </div>
                    
                    <h3 style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      color: '#fff',
                      margin: '0 0 4px 0',
                      letterSpacing: '-0.01em'
                    }}>
                      {card.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      margin: '0 0 32px 0',
                      fontWeight: 500
                    }}>
                      {card.role}
                    </p>
                    
                    {/* Vote Count with Animation */}
                    <div style={{ marginBottom: '24px' }}>
                      <AnimatedCounter 
                        value={voteCount} 
                        className="text-white"
                      />
                      <div style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.3)',
                        marginTop: '8px',
                        fontWeight: 500
                      }}>
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                    
                    {/* Progress Ring */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 32px',
                      position: 'relative'
                    }}>
                      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke={card.color}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${(percentage / 100) * 226} 226`}
                          style={{
                            transition: 'stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: card.color
                      }}>
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                    
                    {/* Vote Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVote(card.id)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: isHovered 
                          ? card.gradient
                          : 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isHovered 
                          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                          : 'none'
                      }}
                    >
                      Vote Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Add pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default App
