import { useEffect, useState, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'

interface User {
  id: string
  name: string
  color: string
  x: number
  y: number
  message?: string
  isTyping?: boolean
}

interface MultiplayerCursorsProps {
  socket: Socket
  onUsersUpdate?: (count: number) => void
}

export default function MultiplayerCursors({ socket, onUsersUpdate }: MultiplayerCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, User>>(new Map())
  const [isMobile, setIsMobile] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')
  const [myPosition, setMyPosition] = useState({ x: 50, y: 50 })
  const [myColor, setMyColor] = useState('#000000')
  const lastEmitTime = useRef(0)
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socketRef = useRef(socket)
  const MAX_VISIBLE_CHARS = 20  // 20 characters
  const AUTO_CLEAR_TIMEOUT = 5000 // 5 seconds
  
  // Update socket ref when it changes
  useEffect(() => {
    socketRef.current = socket
  }, [socket])
  
  // Function to determine if text should be white or black based on background
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Return black for light colors, white for dark
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }
  
  // Get visible portion of text (last 20 characters)
  const getVisibleText = (text: string): string => {
    if (text.length <= MAX_VISIBLE_CHARS) return text
    return text.slice(-MAX_VISIBLE_CHARS)
  }
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMobile) return
    
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docWidth = document.documentElement.scrollWidth
    const docHeight = document.documentElement.scrollHeight
    
    const x = ((e.clientX + scrollLeft) / docWidth) * 100
    const y = ((e.clientY + scrollTop) / docHeight) * 100
    
    // Update my position for self cursor
    setMyPosition({ 
      x: e.clientX,
      y: e.clientY 
    })
    
    // Throttle network emissions
    const now = Date.now()
    if (now - lastEmitTime.current < 30) return
    lastEmitTime.current = now
    
    socket.emit('cursorMove', { x, y })
  }, [isMobile, socket])
  
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (isMobile) return
    
    // Ignore if user is typing in an input/textarea or has modifier keys pressed
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return
    }
    
    // Ignore modifier keys and special keys
    if (e.ctrlKey || e.metaKey || e.altKey) return
    
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault()
      setCurrentMessage(prev => {
        const newMessage = prev.slice(0, -1)
        socketRef.current.emit('userTyping', { message: newMessage, isTyping: newMessage.length > 0 })
        
        // Clear existing timeout
        if (messageTimeout.current) {
          clearTimeout(messageTimeout.current)
          messageTimeout.current = null
        }
        
        // Set new timeout if there's still text
        if (newMessage.length > 0) {
          messageTimeout.current = setTimeout(() => {
            setCurrentMessage('')
            socketRef.current.emit('userTyping', { message: '', isTyping: false })
          }, AUTO_CLEAR_TIMEOUT)
        }
        
        return newMessage
      })
      return
    }
    
    // Handle Enter to clear message
    if (e.key === 'Enter') {
      e.preventDefault()
      setCurrentMessage('')
      socketRef.current.emit('userTyping', { message: '', isTyping: false })
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current)
        messageTimeout.current = null
      }
      return
    }
    
    // Handle Escape to clear message
    if (e.key === 'Escape') {
      e.preventDefault()
      setCurrentMessage('')
      socketRef.current.emit('userTyping', { message: '', isTyping: false })
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current)
        messageTimeout.current = null
      }
      return
    }
    
    // Only handle printable characters
    if (e.key.length === 1) {
      e.preventDefault()
      setCurrentMessage(prev => {
        const newMessage = prev + e.key
        socketRef.current.emit('userTyping', { message: newMessage, isTyping: true })
        
        // Clear existing timeout
        if (messageTimeout.current) {
          clearTimeout(messageTimeout.current)
        }
        
        // Set new timeout
        messageTimeout.current = setTimeout(() => {
          setCurrentMessage('')
          socketRef.current.emit('userTyping', { message: '', isTyping: false })
        }, AUTO_CLEAR_TIMEOUT)
        
        return newMessage
      })
    }
  }, [isMobile]) // Removed currentMessage from dependencies
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    if (!isMobile) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('keydown', handleKeyPress)
    }
    
    socket.on('users', (users: User[]) => {
      const newCursors = new Map()
      
      users.forEach(user => {
        if (user.id !== socket.id) {
          newCursors.set(user.id, user)
        } else {
          // Store my color for self cursor
          setMyColor(user.color)
        }
      })
      setCursors(newCursors)
      setUserCount(users.length)
    })
    
    socket.on('userJoined', (user: User) => {
      if (user.id !== socket.id) {
        setCursors(prev => {
          const updated = new Map(prev)
          updated.set(user.id, user)
          return updated
        })
      } else {
        // Store my color when I join
        setMyColor(user.color)
      }
      setUserCount(prev => prev + 1)
    })
    
    socket.on('userLeft', (userId: string) => {
      setCursors(prev => {
        const updated = new Map(prev)
        updated.delete(userId)
        return updated
      })
      setUserCount(prev => Math.max(0, prev - 1))
    })
    
    socket.on('cursorUpdate', (data: User) => {
      if (!isMobile && data.id !== socket.id) {
        setCursors(prev => {
          const updated = new Map(prev)
          updated.set(data.id, data)
          return updated
        })
      }
    })
    
    socket.on('userTypingUpdate', (data: { id: string, message: string, isTyping: boolean }) => {
      if (data.id !== socket.id) {
        setCursors(prev => {
          const updated = new Map(prev)
          const user = updated.get(data.id)
          if (user) {
            updated.set(data.id, { ...user, message: data.message, isTyping: data.isTyping })
          }
          return updated
        })
      }
    })
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      if (!isMobile) {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('keydown', handleKeyPress)
      }
      socket.off('users')
      socket.off('userJoined')
      socket.off('userLeft')
      socket.off('cursorUpdate')
      socket.off('userTypingUpdate')
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current)
        messageTimeout.current = null
      }
    }
  }, [handleMouseMove, handleKeyPress, isMobile, socket])

  // Update parent component when user count changes
  useEffect(() => {
    onUsersUpdate?.(userCount)
  }, [userCount, onUsersUpdate])

  if (isMobile) return null

  const renderCursor = (color: string, x: number, y: number, name?: string, message?: string, isSelf?: boolean) => {
    // Lighten the color for better visibility on dark background
    const lightenColor = (hex: string): string => {
      const r = parseInt(hex.substr(1, 2), 16)
      const g = parseInt(hex.substr(3, 2), 16)
      const b = parseInt(hex.substr(5, 2), 16)
      
      // Lighten by 30%
      const newR = Math.min(255, r + (255 - r) * 0.3)
      const newG = Math.min(255, g + (255 - g) * 0.3)
      const newB = Math.min(255, b + (255 - b) * 0.3)
      
      return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`
    }
    
    const lightColor = lightenColor(color)
    const textColor = getContrastColor(lightColor)
    const borderColor = textColor === '#000000' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'
    
    // Decide what to show: message if typing, otherwise name (but for self, only show message)
    const displayText = isSelf ? (message || '') : (message || name)
    const visibleText = displayText ? getVisibleText(displayText) : ''
    
    // Don't render anything for self if no message
    if (isSelf && !message) return null
    
    return (
      <div
        style={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          pointerEvents: 'none',
          zIndex: 9999,
          transition: isSelf ? 'none' : 'all 0.05s linear',
          transform: 'translate(0, 0)'
        }}
      >
        {/* Only show cursor arrow for others, not self */}
        {!isSelf && (
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            style={{
              filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.16)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.12))',
              transform: 'rotate(-45deg) translate(-6px, -6px)'
            }}
          >
            <path 
              d="M15.1002 0.85587C15.4646 0.104234 16.5354 0.104231 16.8998 0.855867L30.9913 29.9196C31.3735 30.7079 30.6294 31.5717 29.7933 31.3104L16.2983 27.0932C16.1041 27.0325 15.8959 27.0325 15.7017 27.0932L2.20675 31.3104C1.37062 31.5717 0.626483 30.7079 1.00866 29.9196L15.1002 0.85587Z" 
              fill={lightColor}
            />
          </svg>
        )}
        
        {/* Display text (message or name) with colored background */}
        {visibleText && (
          <div style={{
            position: 'absolute',
            top: isSelf ? '10px' : '20px',
            left: isSelf ? '10px' : '18px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: message ? '500' : '600',
            whiteSpace: 'nowrap',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
            letterSpacing: '0.3px',
            color: textColor,
            backgroundColor: lightColor,
            boxShadow: `
              0 2px 8px rgba(0, 0, 0, 0.15),
              0 0 0 1px ${borderColor}
            `,
            animation: message ? 'pulse 1.5s ease-in-out infinite' : 'none',
            overflow: 'hidden',
            maxWidth: '200px',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {/* Show dots at the beginning if text is truncated */}
            {displayText && displayText.length > MAX_VISIBLE_CHARS && (
              <span style={{ opacity: 0.5, fontSize: '10px' }}>...</span>
            )}
            {visibleText}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
      
      {/* Render my own typing message */}
      {currentMessage && renderCursor(
        myColor, 
        myPosition.x, 
        myPosition.y, 
        undefined, 
        currentMessage, 
        true
      )}
      
      {/* Render other users' cursors */}
      {Array.from(cursors.values()).map(cursor => {
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const docWidth = document.documentElement.scrollWidth
        const docHeight = document.documentElement.scrollHeight
        
        const absoluteX = (cursor.x / 100) * docWidth
        const absoluteY = (cursor.y / 100) * docHeight
        
        const viewportX = absoluteX - scrollLeft
        const viewportY = absoluteY - scrollTop
        
        const isInViewport = 
          viewportX >= -50 && 
          viewportX <= window.innerWidth + 50 && 
          viewportY >= -50 && 
          viewportY <= window.innerHeight + 50
        
        if (!isInViewport) return null
        
        return (
          <div key={cursor.id}>
            {renderCursor(cursor.color, viewportX, viewportY, cursor.name, cursor.message, false)}
          </div>
        )
      })}
    </>
  )
}
