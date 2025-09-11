import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import io from 'socket.io-client'
import MultiplayerCursors from './components/MultiplayerCursors'
import VoteNotifications from './components/VoteNotifications'
import FloatingNav from './components/FloatingNav'
import UserInfoPanel from './components/UserInfoPanel'
import VoteCard from './components/VoteCard'
import RewardsSection from './components/RewardsSection'
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
      image: '/hawk.png',
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
      scammerProfit: '$2.8M',
      investorLoss: '$151M'
    },
    {
      id: 'wlfi',
      name: 'WLFI Trump',
      role: '2024 - Trump Family DeFi',
      image: '/WLFI.jpeg',
      color: '#DC2626',
      gradient: 'linear-gradient(135deg, #DC2626, #991B1B)',
      scammerProfit: '$300M+',
      investorLoss: 'TBD'
    },
    {
      id: 'luna',
      name: 'LUNA / Terra',
      role: '2022 - Do Kwon Masterclass',
      image: '/luna.png',
      color: '#FFD93D',
      gradient: 'linear-gradient(135deg, #FFD93D, #FF6B6B)',
      scammerProfit: '$80M+',
      investorLoss: '$60B'
    },
    {
      id: 'ftx',
      name: 'FTT / FTX',
      role: '2022 - SBF Prison Speedrun',
      image: '/ftt.webp',
      color: '#5FCFFF',
      gradient: 'linear-gradient(135deg, #5FCFFF, #3B82F6)',
      scammerProfit: '$8B+',
      investorLoss: '$8B'
    },
    {
      id: 'andrewt',
      name: 'DADDY Tate',
      role: '2024 - Andrew Tate Pump',
      image: '/daddy.jpg',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      scammerProfit: '$10M+',
      investorLoss: '$45M'
    },
    {
      id: 'iggy',
      name: 'MOTHER Iggy',
      role: '2024 - Iggy Azalea Coin',
      image: '/iggy.png',
      color: '#F472B6',
      gradient: 'linear-gradient(135deg, #F472B6, #DB2777)',
      scammerProfit: '$5M+',
      investorLoss: '$25M'
    },
    {
      id: 'squid',
      name: 'Squid Game',
      role: '2021 - Netflix Rugpull',
      image: '/squid.svg',
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF006E, #8338EC)',
      scammerProfit: '$3.36M',
      investorLoss: '$3.36M'
    },
    {
      id: 'celsius',
      name: 'CEL / Celsius',
      role: '2022 - Mashinsky Bank',
      image: '/cel.png',
      color: '#FF8C42',
      gradient: 'linear-gradient(135deg, #FF8C42, #FF3C38)',
      scammerProfit: '$50M+',
      investorLoss: '$4.7B'
    },
    {
      id: 'safemoon',
      name: 'SafeMoon',
      role: '2021 - Safely to Zero',
      image: '/safemoon.png',
      color: '#00E4B3',
      gradient: 'linear-gradient(135deg, #00E4B3, #0B7A75)',
      scammerProfit: '$200M+',
      investorLoss: '$8.9B'
    },
    {
      id: 'bitconnect',
      name: 'BitConnect',
      role: '2018 - WASU WASU WASUUUP',
      image: '/bitconnect.png',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B, #DC2626)',
      scammerProfit: '$2.4B',
      investorLoss: '$3.5B'
    },
    {
      id: 'cryptozoo',
      name: 'CryptoZoo',
      role: '2021 - Logan Paul Zoo',
      image: '/cryptozoo.png',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      scammerProfit: '$3M+',
      investorLoss: '$3M'
    },
    {
      id: 'savethechildren',
      name: 'Save The Kids',
      role: '2021 - FaZe Clan Special',
      image: '/savethekids.png',
      color: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
      scammerProfit: '$1.5M',
      investorLoss: '$1.5M'
    },
    {
      id: 'milady',
      name: 'LADYS Milady',
      role: '2023 - Milady Meme Coin',
      image: '/layds.png',
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
        <FloatingNav activeUsers={activeUsers} connected={connected} tokenCA="DxF8qKLmpX7YR4bNv9aTcGZ2Jk5Wp3HQs6Fx8nL7aN9" />
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
            fontSize: 'clamp(36px, 8vw, 72px)',
            fontWeight: 900,
            background: 'linear-gradient(180deg, #FF3B30 0%, #FF6B35 50%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textTransform: 'uppercase'
          }}>
            We Got Fucking REKD
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 3vw, 24px)',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '16px',
            fontWeight: 400,
            letterSpacing: '-0.01em'
          }}>
            Vote for the most legendary crypto scams in fucking.style • {votesRemaining} votes left
          </p>
        </motion.div>

        <div id="vote">
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
              {topCards.map((card, index) => (
                <VoteCard
                  key={card.id}
                  card={card}
                  index={index}
                  voteCount={votes[card.id] || 0}
                  totalVotes={totalVotes}
                  isHovered={hoveredCard === card.id}
                  isSelected={selectedCard === card.id}
                  votedCard={votedCard}
                  votesForThisCard={votedCards.filter(id => id === card.id).length}
                  votesRemaining={votesRemaining}
                  onHover={setHoveredCard}
                  onVote={handleVote}
                  isTop={true}
                />
              ))}
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
              {bottomCards.map((card, index) => (
                <VoteCard
                  key={card.id}
                  card={card}
                  index={index}
                  voteCount={votes[card.id] || 0}
                  totalVotes={totalVotes}
                  isHovered={hoveredCard === card.id}
                  isSelected={selectedCard === card.id}
                  votedCard={votedCard}
                  votesForThisCard={votedCards.filter(id => id === card.id).length}
                  votesRemaining={votesRemaining}
                  onHover={setHoveredCard}
                  onVote={handleVote}
                  isTop={false}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <RewardsSection />
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
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          /* Top 3 cards - single column */
          div[style*="gridTemplateColumns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          
          /* Bottom 10 cards - 2 columns */
          div[style*="gridTemplateColumns: repeat(5, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          
          /* Rewards milestones - 2 columns */
          div[style*="gridTemplateColumns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          
          /* Winners section - single column */
          div[style*="gridTemplateColumns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          
          /* How to qualify - single column */
          div[style*="gridTemplateColumns: repeat(3, 1fr)"][style*="gap: 24px"] {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          /* Hide multiplayer cursors on mobile */
          .notifications-container {
            display: none !important;
          }
          
          /* Adjust main padding */
          div[style*="padding: 40px 20px"] {
            padding: 20px 12px !important;
          }
          
          /* Smaller margins */
          div[style*="marginTop: 100px"] {
            margin-top: 80px !important;
          }
          
          div[style*="marginBottom: 60px"] {
            margin-bottom: 40px !important;
          }
        }
        
        /* Small mobile (iPhone SE, etc) */
        @media (max-width: 375px) {
          /* Even smaller text */
          h1[style*="fontSize: clamp"] {
            font-size: clamp(28px, 7vw, 48px) !important;
          }
          
          /* Bottom cards - single column on very small screens */
          div[style*="gridTemplateColumns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          
          /* Rewards milestones - single column */
          div[style*="gridTemplateColumns: repeat(2, 1fr)"][style*="gap: 12px"] {
            grid-template-columns: 1fr !important;
          }
        }
        
        /* Tablet optimizations */
        @media (min-width: 769px) and (max-width: 1024px) {
          /* Top 3 cards stay as 3 */
          /* Bottom 10 cards - 3 columns */
          div[style*="gridTemplateColumns: repeat(5, 1fr)"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          /* Rewards milestones - 2 columns */
          div[style*="gridTemplateColumns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        /* Large desktop - keep original */
        @media (min-width: 1025px) {
          /* Everything stays as designed */
        }
      `}</style>
    </div>
  )
}

export default App