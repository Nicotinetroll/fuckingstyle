import { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'

interface UserInfoPanelProps {
  socket: Socket
  userName: string
  userColor: string
  isMobile?: boolean
}

declare global {
  interface Window {
    resetVotes?: () => void;
  }
}

export default function UserInfoPanel({ socket, userName, userColor, isMobile = false }: UserInfoPanelProps) {
  const [solAddress, setSolAddress] = useState('')
  const [savedSolAddress, setSavedSolAddress] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [votesRemaining, setVotesRemaining] = useState(10)
  const [, setVotedCards] = useState<string[]>([])
  
  const handleResetVotes = () => {
    if (confirm('Are you sure you want to reset all your votes? This cannot be undone!')) {
      localStorage.removeItem('votedCards')
      setVotedCards([])
      setVotesRemaining(10)
      window.location.reload()
    }
  }
  
  useEffect(() => {
    window.resetVotes = handleResetVotes
    
    return () => {
      delete window.resetVotes
    }
  }, [])
  
  useEffect(() => {
    const saved = localStorage.getItem('userSolAddress')
    if (saved) {
      setSavedSolAddress(saved)
      setSolAddress(saved)
    }
    
    const voted = localStorage.getItem('votedCards')
    if (voted) {
      const cards = JSON.parse(voted)
      setVotedCards(cards)
      setVotesRemaining(Math.max(0, 10 - cards.length))
    }
  }, [])
  
  useEffect(() => {
    socket.on('voteSuccess', () => {})
    socket.on('solAddressUpdated', (_data: { success: boolean }) => {})
    
    return () => {
      socket.off('voteSuccess')
      socket.off('solAddressUpdated')
    }
  }, [socket])
  
  useEffect(() => {
    const handleStorageChange = () => {
      const voted = localStorage.getItem('votedCards')
      if (voted) {
        const cards = JSON.parse(voted)
        setVotedCards(cards)
        setVotesRemaining(Math.max(0, 10 - cards.length))
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    const interval = setInterval(() => {
      const voted = localStorage.getItem('votedCards')
      if (voted) {
        const cards = JSON.parse(voted)
        setVotedCards(cards)
        setVotesRemaining(Math.max(0, 10 - cards.length))
      }
    }, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])
  
  const handleSaveSolAddress = () => {
    if (solAddress.trim()) {
      localStorage.setItem('userSolAddress', solAddress.trim())
      setSavedSolAddress(solAddress.trim())
      setIsEditing(false)
      socket.emit('updateSolAddress', { address: solAddress.trim() })
    }
  }
  
  const handleEdit = () => {
    setIsEditing(true)
    setSolAddress(savedSolAddress)
  }
  
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: userColor
            }} />
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff'
              }}>
                {userName}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                {savedSolAddress ? `${savedSolAddress.slice(0, 4)}...${savedSolAddress.slice(-4)}` : 'No wallet'}
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 700,
                color: votesRemaining > 0 ? '#34C759' : '#FF3B30'
              }}>
                {votesRemaining}
              </div>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Votes
              </div>
            </div>
            
            {!savedSolAddress && (
              <button
                onClick={() => {
                  const address = prompt('Enter your SOL address for rewards:')
                  if (address) {
                    setSolAddress(address)
                    handleSaveSolAddress()
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Add Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        width: '320px'
      }}>
        <div 
          style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${userColor}15, ${userColor}05)`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: userColor
            }} />
            <div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Identity
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '-0.01em'
              }}>
                {userName}
              </div>
            </div>
          </div>
          
          <div style={{
            textAlign: 'right',
            paddingRight: '4px'
          }}>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Votes Left
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: votesRemaining > 0 ? '#34C759' : '#FF3B30'
            }}>
              {votesRemaining}/10
            </div>
          </div>
        </div>
        
        <div style={{
          padding: '16px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                SOL Address for Rewards
              </div>
              {savedSolAddress && !isEditing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            
            {(!savedSolAddress || isEditing) ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={solAddress}
                  onChange={(e) => setSolAddress(e.target.value)}
                  placeholder="Enter SOL address..."
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSaveSolAddress()
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                wordBreak: 'break-all',
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                fontFamily: 'monospace'
              }}>
                {savedSolAddress}
              </div>
            )}
            
            {!savedSolAddress && (
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Add your SOL address to receive rewards
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}