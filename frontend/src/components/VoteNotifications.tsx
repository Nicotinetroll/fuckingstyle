import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'

interface VoteNotification {
  id: string
  cardId: string
  cardName: string
  voter: string
  timestamp: number
}

interface Card {
  id: string
  name: string
}

interface VoteNotificationsProps {
  socket: Socket
  cards: Card[]
}

export default function VoteNotifications({ socket, cards }: VoteNotificationsProps) {
  const [notifications, setNotifications] = useState<VoteNotification[]>([])
  
  useEffect(() => {
    const handleVoteUpdate = (data: any) => {
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
        
        // Auto remove after 4 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id))
        }, 4000)
      }
    }
    
    socket.on('voteUpdate', handleVoteUpdate)
    
    return () => {
      socket.off('voteUpdate', handleVoteUpdate)
    }
  }, [socket, cards])
  
  return (
    <div className="notifications-container" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '400px',
      pointerEvents: 'none'
    }}>
      {notifications.map((notif, index) => (
        <div
          key={notif.id}
          className="notification-item"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '12px 20px',
            marginBottom: '10px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)',
            fontSize: '14px',
            fontWeight: 600,
            opacity: 1 - (index * 0.1),
            animation: 'slideIn 0.3s ease-out, shake 0.5s ease-in-out',
            transform: 'translateX(0)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>🔥</span>
          <span>{notif.voter} voted for {notif.cardName}!</span>
          <span style={{ fontSize: '18px' }}>💎</span>
        </div>
      ))}
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-10px) rotate(-1deg); }
          20% { transform: translateX(10px) rotate(1deg); }
          30% { transform: translateX(-10px) rotate(-1deg); }
          40% { transform: translateX(10px) rotate(1deg); }
          50% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
