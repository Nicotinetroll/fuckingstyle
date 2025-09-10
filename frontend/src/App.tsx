import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import io from 'socket.io-client'
import MultiplayerCursors from './components/MultiplayerCursors'
import VoteNotifications from './components/VoteNotifications'
import AnimatedCounter from './components/AnimatedCounter'
import FloatingNav from './components/FloatingNav'
import UserInfoPanel from './components/UserInfoPanel'
import './App.css'

const socket = io('/', {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
})

interface Card {
  id: string
  name: string
  role: string
  image: string
  color: string
  gradient: string
}

function App() {
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [connected, setConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState(0)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [votedCard, setVotedCard] = useState<string | null>(null)
  const [, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [userColor, setUserColor] = useState<string>('#000000')
  const [votedCards, setVotedCards] = useState<string[]>([])
  
  // All cards data
  const allCards: Card[] = [
    {
      id: 'candidate1',
      name: 'Patrik Jakubčo',
      role: 'Innovation Leader',
      image: 'https://ca.slack-edge.com/T056AS13329-U08LHKZLW13-5e63546372d4-192',
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'candidate2', 
      name: 'Palo Habera',
      role: 'Creative Director',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/PavolHaberaKraus.jpg',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'candidate3',
      name: 'Vašo Patejdl',
      role: 'Strategy Expert',
      image: 'https://i.scdn.co/image/ab67616100005174474b21aac8ad28d40be779f9',
      color: '#95E1D3',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'candidate4',
      name: 'Richard Müller',
      role: 'Technical Architect',
      image: 'https://www.aktuality.sk/thumbnail/660x/richard-muller.jpg',
      color: '#FFA07A',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      id: 'candidate5',
      name: 'Marika Gombitová',
      role: 'Product Manager',
      image: 'https://www.teraz.sk/img/5b/5b1ee7e4-bcf3-4e7a-beb4-fab5f7bc9e35_660x.jpg',
      color: '#98D8C8',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      id: 'candidate6',
      name: 'Miroslav Žbirka',
      role: 'Design Lead',
      image: 'https://t.aimg.sk/magaziny/K5G1B7YFQY2x7kVekQ_3WA~Meky.jpg?t=L2ZpdC1pbi82NDB4MA%3D%3D&h=sEqIkfRqcvRc7S9RqiCgVQ&e=2145916800&v=1',
      color: '#FFB6C1',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    },
    {
      id: 'candidate7',
      name: 'Peter Nagy',
      role: 'Marketing Director',
      image: 'https://www.cas.sk/wp-content/uploads/2021/03/peter-nagy-cas.sk_.jpg',
      color: '#DDA0DD',
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    },
    {
      id: 'candidate8',
      name: 'Jaro Filip',
      role: 'Operations Manager',
      image: 'https://www.feminity.zoznam.sk/wp-content/uploads/2019/11/jaro-filip.jpg',
      color: '#F0E68C',
      gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
    },
    {
      id: 'candidate9',
      name: 'Robo Grigorov',
      role: 'Business Analyst',
      image: 'https://www.expres.sk/wp-content/uploads/2020/01/grigorov-e1578492815329.jpg',
      color: '#87CEEB',
      gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
    },
    {
      id: 'candidate10',
      name: 'Boris Kollár',
      role: 'Security Expert',
      image: 'https://www.aktuality.sk/foto/605911/605911_660x.jpg',
      color: '#9370DB',
      gradient: 'linear-gradient(135deg, #667eea 0%, #FF6B6B 100%)'
    },
    {
      id: 'candidate11',
      name: 'Milan Lasica',
      role: 'Content Strategist',
      image: 'https://cdn.webnoviny.sk/sites/32/2021/07/milan-lasica.jpg',
      color: '#20B2AA',
      gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
    },
    {
      id: 'candidate12',
      name: 'Jožo Ráž',
      role: 'Data Scientist',
      image: 'https://www.zpiestan.sk/wp-content/uploads/jozo-raz-3.jpg',
      color: '#FF69B4',
      gradient: 'linear-gradient(135deg, #f43b47 0%, #453a94 100%)'
    },
    {
      id: 'candidate13',
      name: 'Dara Rolins',
      role: 'Brand Manager',
      image: 'https://www.blesk.cz/img/1/normal1200/6731729_.jpg',
      color: '#FF1493',
      gradient: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)'
    }
  ]
  
  // Load user identity from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    const storedVotedCards = localStorage.getItem('votedCards')
    
    if (storedVotedCards) {
      setVotedCards(JSON.parse(storedVotedCards))
    }
    
    // Send identity to server
    socket.emit('identify', { 
      userId: storedUserId,
      solAddress: localStorage.getItem('userSolAddress')
    })
    
    // Listen for identity response
    socket.on('identity', (data: { userId: string, name: string, color: string, solAddress?: string }) => {
      setUserId(data.userId)
      setUserName(data.name)
      setUserColor(data.color)
      
      // Store in localStorage
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('userName', data.name)
      localStorage.setItem('userColor', data.color)
      
      if (data.solAddress) {
        localStorage.setItem('userSolAddress', data.solAddress)
      }
    })
    
    return () => {
      socket.off('identity')
    }
  }, [])
  
  // Sort cards by votes
  const sortedCards = useMemo(() => {
    return [...allCards].sort((a, b) => {
      const votesA = votes[a.id] || 0
      const votesB = votes[b.id] || 0
      return votesB - votesA
    })
  }, [votes])
  
  // Split into top 3 and bottom 10
  const topCards = sortedCards.slice(0, 3)
  const bottomCards = sortedCards.slice(3, 13)
  
  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true)
    })
    
    socket.on('voteUpdate', (data: any) => {
      setVotes(prev => ({...prev, [data.cardId]: data.count}))
      // Trigger shake animation for everyone
      setVotedCard(data.cardId)
      setTimeout(() => setVotedCard(null), 600)
    })
    
    socket.on('disconnect', () => {
      setConnected(false)
    })
    
    allCards.forEach((card) => {
      fetch(`/api/votes/${card.id}`)
        .then(res => res.json())
        .then(data => setVotes(prev => ({...prev, [card.id]: data.count || 0})))
    })
    
    return () => {
      socket.off('connect')
      socket.off('voteUpdate')
      socket.off('disconnect')
    }
  }, [])

  const handleVote = (cardId: string) => {
    
    // Check vote limit (allow multiple votes for same candidate)
    if (votedCards.length >= 10) {
      alert('You have used all 10 votes!')
      return
    }
    
    // Update local state (allow duplicates)
    const newVotedCards = [...votedCards, cardId]
    setVotedCards(newVotedCards)
    localStorage.setItem('votedCards', JSON.stringify(newVotedCards))
    
    // Send vote to server
    socket.emit('vote', { cardId })
    
    // Visual feedback
    setSelectedCard(cardId)
    setTimeout(() => setSelectedCard(null), 600)
  }

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)
  const votesRemaining = 10 - votedCards.length

  // Render large card for top 3
  const renderTopCard = (card: Card, index: number) => {
    const voteCount = votes[card.id] || 0
    const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100) : 0
    const isHovered = hoveredCard === card.id
    const isSelected = selectedCard === card.id
    const votesForThisCard = votedCards.filter(id => id === card.id).length
    const hasVoted = votesForThisCard > 0
    const isFirst = index === 0
    const isSecond = index === 1
    const isThird = index === 2
    
    return (
      <motion.div
        key={card.id}
        layoutId={card.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ 
          layout: { duration: 0.5, type: "spring" },
          delay: index * 0.05 
        }}
        onHoverStart={() => setHoveredCard(card.id)}
        onHoverEnd={() => setHoveredCard(null)}
        style={{
          position: 'relative',
          transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: votedCard === card.id ? 'voteShake 0.6s ease-in-out' : 'none'
        }}
      >
        {/* Fire effect for 1st place */}
        {isFirst && (
          <>
            <div style={{
              position: 'absolute',
              inset: '-20px',
              background: 'radial-gradient(circle, rgba(255,100,0,0.4) 0%, transparent 70%)',
              filter: 'blur(20px)',
              animation: 'fireGlow 2s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              height: '60px',
              background: 'linear-gradient(180deg, transparent, rgba(255,100,0,0.3))',
              filter: 'blur(10px)',
              animation: 'fireFlicker 0.5s ease-in-out infinite'
            }} />
          </>
        )}
        
        {/* Shine effect when voted */}
        {votedCard === card.id && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '32px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 20
          }}>
            <div style={{
              position: 'absolute',
              inset: '-50%',
              background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%)',
              animation: 'slideShine 0.6s ease-out'
            }} />
          </div>
        )}
        
        {/* Card Background with Glow */}
        <div style={{
          position: 'absolute',
          inset: '-1px',
          background: isFirst 
            ? 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
            : isSecond
            ? 'linear-gradient(135deg, #C0C0C0 0%, #757575 100%)'
            : isThird
            ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'
            : card.gradient,
          borderRadius: '32px',
          opacity: isHovered ? 0.3 : 0,
          filter: 'blur(20px)',
          transition: 'opacity 0.3s ease'
        }} />
        
        {/* Card Content */}
        <div style={{
          position: 'relative',
          background: isFirst 
            ? 'linear-gradient(135deg, rgba(255,100,0,0.08), rgba(255,150,0,0.03))'
            : isSecond
            ? 'linear-gradient(135deg, rgba(192,192,192,0.06), rgba(184,184,184,0.02))'
            : isThird
            ? 'linear-gradient(135deg, rgba(205,127,50,0.06), rgba(184,115,51,0.02))'
            : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderRadius: '32px',
          padding: '40px',
          border: isFirst 
            ? '1px solid rgba(255, 150, 0, 0.2)'
            : isSecond
            ? '1px solid rgba(192, 192, 192, 0.15)'
            : isThird
            ? '1px solid rgba(205, 127, 50, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isFirst
            ? '0 0 40px rgba(255, 100, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.2)'
            : isSecond
            ? '0 0 30px rgba(192, 192, 192, 0.1), 0 10px 40px rgba(0, 0, 0, 0.2)'
            : isThird
            ? '0 0 30px rgba(205, 127, 50, 0.1), 0 10px 40px rgba(0, 0, 0, 0.2)'
            : isHovered 
            ? '0 30px 60px rgba(0, 0, 0, 0.4)' 
            : '0 10px 40px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isSelected ? 'scale(0.98)' : 'scale(1)'
        }}>
          {/* Rank Badge */}
          <div style={{
            position: 'absolute',
            top: '-16px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 + index * 0.1 }}
              style={{
                background: index === 0 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                  : index === 1 
                  ? 'linear-gradient(135deg, #E5E5E5, #B8B8B8)'
                  : 'linear-gradient(135deg, #CD7F32, #B87333)',
                color: '#000',
                padding: '8px 24px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                boxShadow: index === 0 
                  ? '0 4px 20px rgba(255, 215, 0, 0.6)'
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {index === 0 ? '1ST PLACE' : index === 1 ? '2ND PLACE' : '3RD PLACE'}
            </motion.div>
          </div>
          
          {/* Already Voted Badge */}
          {hasVoted && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'linear-gradient(135deg, #34C759, #30D158)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(52, 199, 89, 0.4)'
            }}>
              ✓ {votesForThisCard}x
            </div>
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
                background: isFirst 
                  ? 'linear-gradient(135deg, #FFD700, #FF6B35)'
                  : isSecond
                  ? 'linear-gradient(135deg, #E5E5E5, #999999)'
                  : isThird
                  ? 'linear-gradient(135deg, #CD7F32, #8B4513)'
                  : card.gradient,
                borderRadius: '50%',
                opacity: isHovered || isFirst ? 1 : 0.5,
                transition: 'opacity 0.3s ease',
                animation: isHovered || isFirst ? 'rotate 3s linear infinite' : 'none'
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
              color: 'rgba(255, 255, 255, 0.5)',
              margin: '0 0 32px 0',
              fontWeight: 500
            }}>
              {card.role}
            </p>
            
            {/* Vote Count */}
            <div style={{ marginBottom: '24px' }}>
              <AnimatedCounter 
                value={voteCount} 
                className="text-white"
              />
              <div style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: '8px',
                fontWeight: 500
              }}>
                {percentage.toFixed(1)}% of total
              </div>
            </div>
            
            {/* Vote Button */}
            <motion.button
              whileHover={{ scale: votesRemaining > 0 ? 1.05 : 1 }}
              whileTap={{ scale: votesRemaining > 0 ? 0.95 : 1 }}
              onClick={() => handleVote(card.id)}
              disabled={votesRemaining === 0}
              style={{
                width: '100%',
                padding: '16px',
                background: votesRemaining === 0
                  ? 'rgba(255, 59, 48, 0.15)'
                  : isHovered 
                  ? isFirst
                    ? 'linear-gradient(135deg, #FFD700, #FF6B35)'
                    : isSecond
                    ? 'linear-gradient(135deg, #E5E5E5, #999999)'
                    : isThird
                    ? 'linear-gradient(135deg, #CD7F32, #8B4513)'
                    : card.gradient
                  : isFirst
                    ? 'rgba(255, 150, 0, 0.15)'
                    : isSecond
                    ? 'rgba(192, 192, 192, 0.15)'
                    : isThird
                    ? 'rgba(205, 127, 50, 0.15)'
                    : 'rgba(255, 255, 255, 0.1)',
                border: votesRemaining === 0
                  ? '1px solid rgba(255, 59, 48, 0.3)'
                  : isFirst
                  ? '1px solid rgba(255, 215, 0, 0.4)'
                  : isSecond
                  ? '1px solid rgba(192, 192, 192, 0.4)'
                  : isThird
                  ? '1px solid rgba(205, 127, 50, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                color: votesRemaining === 0 ? 'rgba(255, 255, 255, 0.4)' : '#fff',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                cursor: votesRemaining === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isHovered && votesRemaining > 0
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : isFirst
                  ? '0 2px 8px rgba(255, 215, 0, 0.2)'
                  : isSecond
                  ? '0 2px 8px rgba(192, 192, 192, 0.2)'
                  : isThird
                  ? '0 2px 8px rgba(205, 127, 50, 0.2)'
                  : '0 2px 8px rgba(255, 255, 255, 0.1)',
                textShadow: isFirst || isSecond || isThird
                  ? '0 1px 3px rgba(0,0,0,0.4)'
                  : '0 1px 2px rgba(0,0,0,0.3)',
                opacity: votesRemaining === 0 ? 0.5 : 1
              }}
            >
              {hasVoted ? `Voted (${votesForThisCard}x)` : votesRemaining === 0 ? 'No Votes Left' : 'Vote Now'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Render compact card for bottom 10
  const renderCompactCard = (card: Card, index: number) => {
    const voteCount = votes[card.id] || 0
    const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100) : 0
    const isHovered = hoveredCard === card.id
    const isSelected = selectedCard === card.id
    const votesForThisCard = votedCards.filter(id => id === card.id).length
    const hasVoted = votesForThisCard > 0
    const rank = index + 4 // Since these are positions 4-13
    
    return (
      <motion.div
        key={card.id}
        layoutId={card.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ 
          layout: { duration: 0.5, type: "spring" },
          delay: index * 0.03 
        }}
        onHoverStart={() => setHoveredCard(card.id)}
        onHoverEnd={() => setHoveredCard(null)}
        style={{
          position: 'relative',
          animation: votedCard === card.id ? 'voteShake 0.6s ease-in-out' : 'none'
        }}
      >
        {/* Compact Card */}
        <div style={{
          position: 'relative',
          background: isHovered 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          borderRadius: '16px',
          padding: '16px',
          border: isHovered 
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered 
            ? '0 10px 30px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isSelected ? 'scale(0.98)' : 'scale(1)',
          overflow: 'hidden'
        }}>
          {/* Shine effect when voted */}
          {votedCard === card.id && (
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 20
            }}>
              <div style={{
                position: 'absolute',
                inset: '-50%',
                background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.5) 50%, transparent 60%)',
                animation: 'slideShine 0.6s ease-out'
              }} />
            </div>
          )}
          
          {/* Rank number */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            #{rank}
          </div>
          
          {/* Already Voted indicator */}
          {hasVoted && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: 'rgba(52, 199, 89, 0.2)',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#34C759'
            }}>
              {votesForThisCard}
            </div>
          )}
          
          {/* Horizontal layout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Avatar */}
            <div style={{
              width: '48px',
              height: '48px',
              flexShrink: 0,
              position: 'relative'
            }}>
              <img
                src={card.image}
                alt={card.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>
            
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {card.name}
              </h4>
              <p style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {card.role}
              </p>
            </div>
          </div>
          
          {/* Stats and Vote */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#fff'
              }}>
                {voteCount}
                <span style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  marginLeft: '6px',
                  fontWeight: 400
                }}>
                  votes ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* Compact Vote Button */}
            <motion.button
              whileHover={{ scale: votesRemaining > 0 ? 1.05 : 1 }}
              whileTap={{ scale: votesRemaining > 0 ? 0.95 : 1 }}
              onClick={() => handleVote(card.id)}
              disabled={votesRemaining === 0}
              style={{
                padding: '6px 16px',
                background: votesRemaining === 0
                  ? 'rgba(255, 59, 48, 0.15)'
                  : isHovered 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: votesRemaining === 0
                  ? '1px solid rgba(255, 59, 48, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: votesRemaining === 0 ? 'rgba(255, 255, 255, 0.4)' : '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: votesRemaining === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                opacity: votesRemaining === 0 ? 0.5 : 1
              }}
            >
              {hasVoted ? `Voted (${votesForThisCard}x)` : votesRemaining === 0 ? 'No Votes' : 'Vote'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#000000',
      overflowX: 'hidden',
      overflowY: 'auto',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #000000 50%)',
        opacity: 0.8,
        zIndex: 0
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        zIndex: 1
      }}>
        <MultiplayerCursors socket={socket} onUsersUpdate={setActiveUsers} />
        <FloatingNav activeUsers={activeUsers} connected={connected} />
        <VoteNotifications socket={socket} cards={allCards} />
        {userName && <UserInfoPanel socket={socket} userName={userName} userColor={userColor} />}

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
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '16px',
            fontWeight: 400,
            letterSpacing: '-0.01em'
          }}>
            Vote for your champion • {votesRemaining} votes left
          </p>
        </motion.div>

        {/* Top 3 Cards */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '40px',
              maxWidth: '1200px',
              width: '100%',
              marginBottom: '60px'
            }}
          >
            {topCards.map((card, index) => renderTopCard(card, index))}
          </motion.div>
        </AnimatePresence>

        {/* Divider */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          marginBottom: '40px'
        }} />

        {/* Bottom 10 Cards - 2 rows of 5 */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              maxWidth: '1200px',
              width: '100%',
              marginBottom: '80px'
            }}
          >
            {bottomCards.map((card, index) => renderCompactCard(card, index))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fireGlow {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }
        @keyframes fireFlicker {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes voteShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-3px) rotate(-0.5deg); }
          20% { transform: translateX(3px) rotate(0.5deg); }
          30% { transform: translateX(-3px) rotate(-0.5deg); }
          40% { transform: translateX(3px) rotate(0.5deg); }
          50% { transform: translateX(0) rotate(0deg) scale(1.02); }
          60% { transform: translateX(0) rotate(0deg) scale(1); }
        }
        
        @keyframes slideShine {
          0% { 
            transform: translateX(-100%) rotate(25deg);
          }
          100% {
            transform: translateX(200%) rotate(25deg);
          }
        }
        
        @media (max-width: 1200px) {
          div[style*="gridTemplateColumns: 'repeat(5, 1fr)'"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 'repeat(5, 1fr)'"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          div[style*="gridTemplateColumns: 'repeat(3, 1fr)'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default App
