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
  )
}
