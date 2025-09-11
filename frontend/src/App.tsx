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
  scammerProfit?: string
  investorLoss?: string
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
  
  const allCards: Card[] = [
    {
      id: 'hawk',
      name: 'HAWK Tuah',
      role: '2024 - Haliey Welch Disaster',
      image: 'https://assets.coingecko.com/coins/images/52148/large/hawk_200x200.png',
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
      scammerProfit: '$2.8M',
      investorLoss: '$151M'
    },
    {
      id: 'wlfi',
      name: 'WLFI Trump',
      role: '2024 - Trump Family DeFi',
      image: 'https://assets.coingecko.com/coins/images/40892/large/WLFi_Token.png',
      color: '#DC2626',
      gradient: 'linear-gradient(135deg, #DC2626, #991B1B)',
      scammerProfit: '$300M+',
      investorLoss: 'TBD'
    },
    {
      id: 'luna',
      name: 'LUNA / Terra',
      role: '2022 - Do Kwon Masterclass',
      image: 'https://assets.coingecko.com/coins/images/8284/large/01_LunaClassic_color.png',
      color: '#FFD93D',
      gradient: 'linear-gradient(135deg, #FFD93D, #FF6B6B)',
      scammerProfit: '$80M+',
      investorLoss: '$60B'
    },
    {
      id: 'ftx',
      name: 'FTT / FTX',
      role: '2022 - SBF Prison Speedrun',
      image: 'https://assets.coingecko.com/coins/images/9026/large/F.png',
      color: '#5FCFFF',
      gradient: 'linear-gradient(135deg, #5FCFFF, #3B82F6)',
      scammerProfit: '$8B+',
      investorLoss: '$8B'
    },
    {
      id: 'andrewt',
      name: 'DADDY Tate',
      role: '2024 - Andrew Tate Pump',
      image: 'https://assets.coingecko.com/coins/images/38755/large/daddy-tate-logo.png',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      scammerProfit: '$10M+',
      investorLoss: '$45M'
    },
    {
      id: 'iggy',
      name: 'MOTHER Iggy',
      role: '2024 - Iggy Azalea Coin',
      image: 'https://assets.coingecko.com/coins/images/39058/large/MOTHER-icon-new.png',
      color: '#F472B6',
      gradient: 'linear-gradient(135deg, #F472B6, #DB2777)',
      scammerProfit: '$5M+',
      investorLoss: '$25M'
    },
    {
      id: 'squid',
      name: 'Squid Game',
      role: '2021 - Netflix Rugpull',
      image: 'https://assets.coingecko.com/coins/images/19433/large/logo-500.png',
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF006E, #8338EC)',
      scammerProfit: '$3.36M',
      investorLoss: '$3.36M'
    },
    {
      id: 'celsius',
      name: 'CEL / Celsius',
      role: '2022 - Mashinsky Bank',
      image: 'https://assets.coingecko.com/coins/images/3263/large/CEL_logo.png',
      color: '#FF8C42',
      gradient: 'linear-gradient(135deg, #FF8C42, #FF3C38)',
      scammerProfit: '$50M+',
      investorLoss: '$4.7B'
    },
    {
      id: 'safemoon',
      name: 'SafeMoon',
      role: '2021 - Safely to Zero',
      image: 'https://assets.coingecko.com/coins/images/14362/large/174x174-white.png',
      color: '#00E4B3',
      gradient: 'linear-gradient(135deg, #00E4B3, #0B7A75)',
      scammerProfit: '$200M+',
      investorLoss: '$8.9B'
    },
    {
      id: 'bitconnect',
      name: 'BitConnect',
      role: '2018 - WASU WASU WASUUUP',
      image: 'https://cryptologos.cc/logos/bitconnect-bcc-logo.png',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B, #DC2626)',
      scammerProfit: '$2.4B',
      investorLoss: '$3.5B'
    },
    {
      id: 'cryptozoo',
      name: 'CryptoZoo',
      role: '2021 - Logan Paul Zoo',
      image: 'https://assets.coingecko.com/coins/images/32907/large/zoo.png',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      scammerProfit: '$3M+',
      investorLoss: '$3M'
    },
    {
      id: 'savethechildren',
      name: 'Save The Kids',
      role: '2021 - FaZe Clan Special',
      image: 'https://assets.coingecko.com/coins/images/15953/large/children.png',
      color: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
      scammerProfit: '$1.5M',
      investorLoss: '$1.5M'
    },
    {
      id: 'milady',
      name: 'LADYS Milady',
      role: '2023 - Milady Meme Coin',
      image: 'https://assets.coingecko.com/coins/images/29947/large/milady.png',
      color: '#A855F7',
      gradient: 'linear-gradient(135deg, #A855F7, #7C3AED)',
      scammerProfit: '$8M+',
      investorLoss: '$40M'
    }
  ]
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    const storedVotedCards = localStorage.getItem('votedCards')
    
    if (storedVotedCards) {
      setVotedCards(JSON.parse(storedVotedCards))
    }
    
    socket.emit('identify', { 
      userId: storedUserId,
      solAddress: localStorage.getItem('userSolAddress')
    })
    
    socket.on('identity', (data: { userId: string, name: string, color: string, solAddress?: string }) => {
      setUserId(data.userId)
      setUserName(data.name)
      setUserColor(data.color)
      
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
  
  const sortedCards = useMemo(() => {
    return [...allCards].sort((a, b) => {
      const votesA = votes[a.id] || 0
      const votesB = votes[b.id] || 0
      return votesB - votesA
    })
  }, [votes])
  
  const topCards = sortedCards.slice(0, 3)
  const bottomCards = sortedCards.slice(3, 13)
  
  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true)
    })
    
    socket.on('voteUpdate', (data: any) => {
      setVotes(prev => ({...prev, [data.cardId]: data.count}))
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
        .catch(() => {})
    })
    
    return () => {
      socket.off('connect')
      socket.off('voteUpdate')
      socket.off('disconnect')
    }
  }, [])

  const handleVote = (cardId: string) => {
    if (votedCards.length >= 10) {
      alert('You have used all 10 votes!')
      return
    }
    
    const newVotedCards = [...votedCards, cardId]
    setVotedCards(newVotedCards)
    localStorage.setItem('votedCards', JSON.stringify(newVotedCards))
    
    socket.emit('vote', { cardId })
    
    setSelectedCard(cardId)
    setTimeout(() => setSelectedCard(null), 600)
  }

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)
  const votesRemaining = 10 - votedCards.length

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
                  border: '3px solid #000',
                  background: 'rgba(255,255,255,0.1)'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/140?text=' + card.name.charAt(0)
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
              margin: '0 0 20px 0',
              fontWeight: 500
            }}>
              {card.role}
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'rgba(52, 199, 89, 0.15)',
                border: '1px solid rgba(52, 199, 89, 0.3)',
                borderRadius: '12px',
                padding: '8px 16px'
              }}>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(52, 199, 89, 0.8)',
                  marginBottom: '2px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Scammer Profit
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#34C759'
                }}>
                  {card.scammerProfit || 'Unknown'}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255, 59, 48, 0.15)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '12px',
                padding: '8px 16px'
              }}>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 59, 48, 0.8)',
                  marginBottom: '2px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Investor Loss
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FF3B30'
                }}>
                  {card.investorLoss || 'Unknown'}
                </div>
              </div>
            </div>
            
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

  const renderCompactCard = (card: Card, index: number) => {
    const voteCount = votes[card.id] || 0
    const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100) : 0
    const isHovered = hoveredCard === card.id
    const isSelected = selectedCard === card.id
    const votesForThisCard = votedCards.filter(id => id === card.id).length
    const hasVoted = votesForThisCard > 0
    const rank = index + 4
    
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255,255,255,0.1)'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48?text=' + card.name.charAt(0)
                }}
              />
            </div>
            
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
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '4px',
                fontSize: '10px'
              }}>
                <span style={{ color: '#34C759' }}>
                  ↑{card.scammerProfit}
                </span>
                <span style={{ color: '#FF3B30' }}>
                  ↓{card.investorLoss}
                </span>
              </div>
            </div>
          </div>
          
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
            Rugpull Hall of Fame
          </h1>
          <p style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '16px',
            fontWeight: 400,
            letterSpacing: '-0.01em'
          }}>
            Vote for the most legendary crypto scam • {votesRemaining} votes left
          </p>
        </motion.div>

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

        <div style={{
          width: '100%',
          maxWidth: '1200px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          marginBottom: '40px'
        }} />

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

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            width: '100%',
            maxWidth: '1200px',
            marginTop: '80px',
            marginBottom: '100px'
          }}
        >
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <h2 style={{
                fontSize: '56px',
                fontWeight: 700,
                background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                letterSpacing: '-0.03em',
                lineHeight: 1.1
              }}>
                Community Rewards
              </h2>
            </motion.div>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginTop: '20px',
              maxWidth: '650px',
              margin: '20px auto 0',
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              Vote for history's most legendary crypto disasters and earn rewards.
              Because if we can't beat them, let's at least rank them properly.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.05))',
            backdropFilter: 'blur(80px) saturate(180%)',
            WebkitBackdropFilter: 'blur(80px) saturate(180%)',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '40px',
            boxShadow: '0 20px 60px rgba(147, 51, 234, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'rgba(147, 51, 234, 0.9)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Development Fund
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '12px'
                }}>
                  20% of Total Supply
                </div>
                <div style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.6
                }}>
                  Reserved for development team, marketing initiatives, exchange listings, 
                  and project sustainability. Transparent allocation for long-term growth.
                </div>
              </div>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #9333EA, #4F46E5)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                boxShadow: '0 20px 40px rgba(147, 51, 234, 0.3)'
              }}>
                💎
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(100px) saturate(180%)',
            WebkitBackdropFilter: 'blur(100px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '30px',
            padding: '48px',
            marginBottom: '48px',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '40px',
              textAlign: 'center',
              letterSpacing: '-0.02em'
            }}>
              How to Qualify
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  textAlign: 'center',
                  padding: '32px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                }}>
                  💎
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '8px'
                }}>Hold Tokens</div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.5
                }}>
                  Join the community and hold tokens
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  textAlign: 'center',
                  padding: '32px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  boxShadow: '0 10px 30px rgba(240, 147, 251, 0.4)'
                }}>
                  🗳️
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '8px'
                }}>Vote</div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.5
                }}>
                  Use all your 10 votes wisely
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  textAlign: 'center',
                  padding: '32px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  boxShadow: '0 10px 30px rgba(79, 172, 254, 0.4)'
                }}>
                  👛
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '8px'
                }}>Add Wallet</div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.5
                }}>
                  Connect SOL address for rewards
                </div>
              </motion.div>
            </div>
          </div>

          <div style={{
            marginTop: '60px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '40px',
              textAlign: 'center',
              letterSpacing: '-0.02em'
            }}>
              Reward Milestones
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px'
            }}>
              {[
                {
                  mc: '50K MC',
                  reward: '10% Dev Wallet',
                  winners: '3 lucky voters',
                  color: '#34C759',
                  bg: 'rgba(52, 199, 89, 0.1)'
                },
                {
                  mc: '100K MC',
                  reward: '15% Dev Wallet',
                  winners: '5 lucky voters',
                  color: '#5AC8FA',
                  bg: 'rgba(90, 200, 250, 0.1)'
                },
                {
                  mc: '250K MC',
                  reward: '20% Dev Wallet',
                  winners: '10 lucky voters',
                  color: '#AF52DE',
                  bg: 'rgba(175, 82, 222, 0.1)'
                },
                {
                  mc: '500K MC',
                  reward: '30% Dev Wallet',
                  winners: '20 lucky voters',
                  color: '#FFD700',
                  bg: 'rgba(255, 215, 0, 0.1)'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  style={{
                    background: `linear-gradient(135deg, ${item.bg}, rgba(255,255,255,0.02))`,
                    backdropFilter: 'blur(60px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(60px) saturate(150%)',
                    border: `1px solid ${item.color}30`,
                    borderRadius: '20px',
                    padding: '28px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    boxShadow: `0 10px 40px ${item.color}15`
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`
                  }} />
                  
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '12px'
                  }}>
                    {item.mc}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: '6px'
                  }}>
                    {item.reward}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {item.winners}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '60px',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(60px)',
            WebkitBackdropFilter: 'blur(60px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.7,
              fontWeight: 400
            }}>
              This is a community project documenting crypto history's biggest failures.<br/>
              Not financial advice. DYOR. We're just here to rank the rugpulls.
            </div>
          </div>
        </motion.div>
      </div>

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
