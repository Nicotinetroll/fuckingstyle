import { useEffect, useState, useCallback } from 'react'
import io from 'socket.io-client'
import './App.css'

const socket = io('/', {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
})

interface VoteNotification {
  id: string
  cardId: string
  cardName: string
  voter: string
  timestamp: number
}

interface User {
  id: string
  name: string
  color: string
  x: number
  y: number
}

function App() {
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<VoteNotification[]>([])
  const [cursors, setCursors] = useState<Map<string, User>>(new Map())
  const [activeUsers, setActiveUsers] = useState(0)
  
  const cards = [
    {
      id: 'gaylord1',
      name: 'Patrik Jakubčo',
      image: 'https://ca.slack-edge.com/T056AS13329-U08LHKZLW13-5e63546372d4-192',
      hot: true
    },
    {
      id: 'gaylord2', 
      name: 'Palo Habera',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/PavolHaberaKraus.jpg',
      hot: false
    },
    {
      id: 'gaylord3',
      name: 'Vašo Patejdl',
      image: 'https://i.scdn.co/image/ab67616100005174474b21aac8ad28d40be779f9',
      hot: false
    }
  ]
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    socket.emit('cursorMove', { 
      x: e.clientX,
      y: e.clientY
    })
  }, [])
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    
    socket.on('connect', () => {
      console.log('Connected!')
      setConnected(true)
    })
    
    socket.on('users', (users: User[]) => {
      const newCursors = new Map()
      users.forEach(user => {
        if (user.id !== socket.id) {
          newCursors.set(user.id, user)
        }
      })
      setCursors(newCursors)
      setActiveUsers(users.length)
    })
    
    socket.on('userJoined', (user: User) => {
      setCursors(prev => {
        const updated = new Map(prev)
        updated.set(user.id, user)
        return updated
      })
      setActiveUsers(prev => prev + 1)
    })
    
    socket.on('userLeft', (userId: string) => {
      setCursors(prev => {
        const updated = new Map(prev)
        updated.delete(userId)
        return updated
      })
      setActiveUsers(prev => Math.max(0, prev - 1))
    })
    
    socket.on('cursorUpdate', (data: User) => {
      setCursors(prev => {
        const updated = new Map(prev)
        updated.set(data.id, data)
        return updated
      })
    })
    
    socket.on('voteUpdate', (data: any) => {
      console.log('Vote update:', data)
      setVotes(prev => ({...prev, [data.cardId]: data.count}))
      
      const card = cards.find(c => c.id === data.cardId)
      if (card && data.voter) {
        const newNotif: VoteNotification = {
          id: Math.random().toString(),
          cardId: data.cardId,
          cardName: card.name,
          voter: data.voter,
          timestamp: Date.now()
        }
        setNotifications(prev => [newNotif, ...prev].slice(0, 10))
        
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id))
        }, 4000)
      }
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
      document.removeEventListener('mousemove', handleMouseMove)
      socket.off('connect')
      socket.off('voteUpdate')
      socket.off('disconnect')
      socket.off('users')
      socket.off('userJoined')
      socket.off('userLeft')
      socket.off('cursorUpdate')
    }
  }, [handleMouseMove])

  const handleVote = (cardId: string) => {
    console.log('Voting for:', cardId)
    socket.emit('vote', { cardId })
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'Arial Black, sans-serif',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Other users' cursors */}
      {Array.from(cursors.values()).map(cursor => (
        <div
          key={cursor.id}
          style={{
            position: 'fixed',
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'all 0.1s linear'
          }}
        >
          <svg width="24" height="24">
            <path
              d="M0,0 L0,18 L6,14 L10,22 L13,20 L9,12 L16,12 Z"
              fill={cursor.color}
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          <span style={{
            position: 'absolute',
            top: '24px',
            left: '12px',
            background: cursor.color,
            color: '#fff',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {cursor.name}
          </span>
        </div>
      ))}
      
      {/* Live users counter */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '25px',
        fontSize: '18px',
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
      }}>
        👥 {activeUsers} online
      </div>

      <div className="notifications-container" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        maxWidth: '400px'
      }}>
        {notifications.map((notif, index) => (
          <div
            key={notif.id}
            className="notification-shake"
            style={{
              background: 'linear-gradient(90deg, #00ff88, #00ffff)',
              color: '#000',
              padding: '15px 20px',
              marginBottom: '10px',
              borderRadius: '10px',
              boxShadow: '0 5px 20px rgba(0,255,255,0.5)',
              fontSize: '18px',
              fontWeight: 'bold',
              opacity: 1 - (index * 0.1),
              animation: 'slideIn 0.3s ease-out, shake 0.5s ease-in-out'
            }}
          >
            🔥💸 {notif.voter} voted for {notif.cardName}! 💸🔥
          </div>
        ))}
      </div>

      <div style={{maxWidth: '1400px', margin: '0 auto', width: '100%'}}>
        <div style={{textAlign: 'center', marginBottom: '60px'}}>
          <h1 className="rainbow-text" style={{
            fontSize: 'clamp(36px, 5vw, 72px)',
            color: '#fff',
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            marginBottom: '20px',
            animation: 'rainbow 3s linear infinite'
          }}>
            🏳️‍🌈 Hall of Gaylords 🏳️‍🌈
          </h1>
          <p style={{
            fontSize: 'clamp(20px, 3vw, 32px)',
            color: '#ffd700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontWeight: 'bold'
          }}>
            Vote Your Champion!
          </p>
          <p style={{
            marginTop: '15px',
            fontSize: '20px',
            color: connected ? '#00ff00' : '#ff0000',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            fontWeight: 'bold'
          }}>
            {connected ? '🟢 LIVE VOTING' : '🔴 CONNECTING...'}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {cards.map((card) => (
            <div key={card.id} className={card.hot ? 'card-hot' : ''} style={{
              background: card.hot 
                ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                : 'rgba(255, 255, 255, 0.95)',
              borderRadius: '25px',
              padding: '35px',
              textAlign: 'center',
              boxShadow: card.hot 
                ? '0 15px 40px rgba(255,215,0,0.6)' 
                : '0 10px 30px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              position: 'relative',
              animation: card.hot ? 'glow 2s ease-in-out infinite' : 'none',
              border: card.hot ? '3px solid #FFD700' : 'none'
            }}>
              {card.hot && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  background: '#FF0000',
                  color: '#fff',
                  padding: '8px 15px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  animation: 'shake 2s ease-in-out infinite',
                  boxShadow: '0 3px 10px rgba(255,0,0,0.5)'
                }}>
                  🔥 HOT FAVORITE 🔥
                </div>
              )}
              <img 
                src={card.image} 
                alt={card.name}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  marginBottom: '25px',
                  border: card.hot ? '5px solid #FFD700' : '4px solid #667eea',
                  objectFit: 'cover'
                }}
              />
              <h2 style={{
                fontSize: '28px',
                marginBottom: '20px',
                color: card.hot ? '#fff' : '#333',
                textShadow: card.hot ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}>
                {card.name}
              </h2>
              <div style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: card.hot ? '#fff' : '#667eea',
                marginBottom: '25px',
                textShadow: card.hot ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}>
                {votes[card.id] || 0}
              </div>
              <button
                onClick={() => handleVote(card.id)}
                className="vote-button"
                style={{
                  background: card.hot 
                    ? 'linear-gradient(135deg, #FF1493, #FF69B4)'
                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  border: 'none',
                  padding: '18px 50px',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  borderRadius: '35px',
                  cursor: 'pointer',
                  boxShadow: '0 5px 15px rgba(102,126,234,0.4)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15) rotate(-2deg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                }}
              >
                Vote Now!
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
