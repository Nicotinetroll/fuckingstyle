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
        setNotifications(prev => [newNotif, ...prev].slice(0, 4)) // Max 4 notifications
        
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
      top: '100px',
      right: '20px',
      zIndex: 40,
      maxWidth: '420px', // Wider
      pointerEvents: 'none'
    }}>
      {notifications.map((notif, index) => (
        <div
          key={notif.id}
          className="notification-item"
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            color: '#fff',
            padding: '16px 20px',
            marginBottom: '10px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 500,
            opacity: 1 - (index * 0.12),
            animation: `slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), colorPulse 0.6s ease-out`,
            transform: 'translateX(0)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 80px rgba(120, 119, 198, 0)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            letterSpacing: '-0.01em',
            overflow: 'hidden'
          }}
        >
          {/* Animated gradient background overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(120, 119, 198, 0.15), rgba(255, 119, 198, 0.15), rgba(120, 219, 255, 0.15))',
            opacity: 0,
            animation: 'gradientPulse 0.8s ease-out',
            pointerEvents: 'none'
          }} />
          
          {/* Animated border glow */}
          <div style={{
            position: 'absolute',
            inset: '-1px',
            background: 'linear-gradient(90deg, #7877C6, #FF77C6, #78DBFF)',
            borderRadius: '16px',
            opacity: 0,
            animation: 'borderGlow 0.6s ease-out',
            pointerEvents: 'none',
            zIndex: -1
          }} />
          
          {/* Animated dot with glow */}
          <div style={{
            position: 'relative',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #34C759, #30D158)',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(52, 199, 89, 0.6)',
            animation: 'dotPulse 0.6s ease-out'
          }}>
            {/* Pulse ring */}
            <div style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              border: '2px solid rgba(52, 199, 89, 0.4)',
              animation: 'ringExpand 0.6s ease-out'
            }} />
          </div>
          
          {/* Text content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              {notif.voter}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.75)',
              fontWeight: 400
            }}>
              voted for <span style={{ fontWeight: 500 }}>{notif.cardName}</span>
            </div>
          </div>
          
          {/* Vote count indicator (optional) */}
          <div style={{
            padding: '4px 10px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.8)',
            animation: 'fadeIn 0.6s ease-out 0.2s both'
          }}>
            +1
          </div>
        </div>
      ))}
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(420px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes colorPulse {
          0% {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 80px rgba(120, 119, 198, 0.4);
          }
          50% {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 120px rgba(255, 119, 198, 0.3);
          }
          100% {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 80px rgba(120, 119, 198, 0);
          }
        }
        
        @keyframes gradientPulse {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          50% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        @keyframes borderGlow {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.5;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.02);
          }
        }
        
        @keyframes dotPulse {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes ringExpand {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
