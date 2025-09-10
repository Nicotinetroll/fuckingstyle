import { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'

interface UserInfoPanelProps {
  socket: Socket
  userName: string
  userColor: string
}

export default function UserInfoPanel({ socket, userName, userColor }: UserInfoPanelProps) {
  const [solAddress, setSolAddress] = useState('')
  const [savedSolAddress, setSavedSolAddress] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [votesRemaining, setVotesRemaining] = useState(10)
  const [, setVotedCards] = useState<string[]>([])
  
  useEffect(() => {
    // Load saved data from localStorage
    const saved = localStorage.getItem('userSolAddress')
    if (saved) {
      setSavedSolAddress(saved)
      setSolAddress(saved)
    }
    
    // Load voted cards from localStorage
    const voted = localStorage.getItem('votedCards')
    if (voted) {
      const cards = JSON.parse(voted)
      setVotedCards(cards)
      setVotesRemaining(Math.max(0, 10 - cards.length))
    }
  }, [])
  
  useEffect(() => {
    // Listen for successful votes
    socket.on('voteSuccess', () => {
      // Vote counting is handled in App.tsx
    })
    
    socket.on('solAddressUpdated', (data: { success: boolean }) => {
      if (data.success) {
        console.log('SOL address updated successfully')
      }
    })
    
    return () => {
      socket.off('voteSuccess')
      socket.off('solAddressUpdated')
    }
  }, [socket])
  
  // Update votes remaining when votedCards changes
  useEffect(() => {
    const handleStorageChange = () => {
      const voted = localStorage.getItem('votedCards')
      if (voted) {
        const cards = JSON.parse(voted)
        setVotedCards(cards)
        setVotesRemaining(Math.max(0, 10 - cards.length))
      }
    }
    
    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically for changes from same tab
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
      
      // Send to backend
      socket.emit('updateSolAddress', { address: solAddress.trim() })
    }
  }
  
  const handleEdit = () => {
    setIsEditing(true)
    setSolAddress(savedSolAddress)
  }
  
  const handleResetVotes = () => {
    if (confirm('Are you sure you want to reset all your votes? This cannot be undone!')) {
      localStorage.removeItem('votedCards')
      setVotedCards([])
      setVotesRemaining(10)
      window.location.reload() // Reload to reset the UI
    }
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
        {/* Header */}
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
                Your Identity
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
        </div>
        
        {/* Content */}
        <div style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Votes Remaining */}
          <div style={{
            background: votesRemaining > 0 
              ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(48, 209, 88, 0.05))'
              : 'linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 69, 58, 0.05))',
            borderRadius: '12px',
            padding: '12px',
            border: votesRemaining > 0 
              ? '1px solid rgba(52, 199, 89, 0.2)'
              : '1px solid rgba(255, 59, 48, 0.2)',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Votes Remaining
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: votesRemaining > 0 ? '#34C759' : '#FF3B30'
            }}>
              {votesRemaining}/10
            </div>
            
            {/* Reset Button */}
            <button
              onClick={handleResetVotes}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 59, 48, 0.2)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: '#FF3B30',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 59, 48, 0.3)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 59, 48, 0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Reset
            </button>
          </div>
          
          {/* SOL Address Section - ALWAYS VISIBLE */}
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
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
          
          {/* Debug Info - Temporary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'monospace'
          }}>
            <div>Debug Info:</div>
            <div>User ID: {localStorage.getItem('userId')?.substring(0, 20)}...</div>
            <div>Votes Used: {10 - votesRemaining}</div>
            <div>Socket Connected: {socket.connected ? '✅' : '❌'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
