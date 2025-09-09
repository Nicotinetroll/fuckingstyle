import { useEffect, useState, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'

interface User {
  id: string
  name: string
  color: string
  x: number
  y: number
}

interface MultiplayerCursorsProps {
  socket: Socket
  onUsersUpdate?: (count: number) => void
}

export default function MultiplayerCursors({ socket, onUsersUpdate }: MultiplayerCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, User>>(new Map())
  const [myPosition, setMyPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [myColor, setMyColor] = useState<string>('#000000')
  const [isMobile, setIsMobile] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const lastEmitTime = useRef(0)
  
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
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMobile) return
    
    // Update own cursor position immediately (no throttling for own cursor)
    setMyPosition({ x: e.clientX, y: e.clientY })
    
    // Throttle network emissions
    const now = Date.now()
    if (now - lastEmitTime.current < 50) return
    lastEmitTime.current = now
    
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docWidth = document.documentElement.scrollWidth
    const docHeight = document.documentElement.scrollHeight
    
    const x = ((e.clientX + scrollLeft) / docWidth) * 100
    const y = ((e.clientY + scrollTop) / docHeight) * 100
    
    socket.emit('cursorMove', { x, y })
  }, [isMobile, socket])
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    if (!isMobile) {
      document.addEventListener('mousemove', handleMouseMove)
    }
    
    socket.on('users', (users: User[]) => {
      const newCursors = new Map()
      
      users.forEach(user => {
        if (user.id === socket.id) {
          setMyColor(user.color)
        } else {
          newCursors.set(user.id, user)
        }
      })
      setCursors(newCursors)
      setUserCount(users.length)
    })
    
    socket.on('userJoined', (user: User) => {
      if (user.id === socket.id) {
        setMyColor(user.color)
      } else {
        setCursors(prev => {
          const updated = new Map(prev)
          updated.set(user.id, user)
          return updated
        })
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
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      if (!isMobile) {
        document.removeEventListener('mousemove', handleMouseMove)
      }
      socket.off('users')
      socket.off('userJoined')
      socket.off('userLeft')
      socket.off('cursorUpdate')
    }
  }, [handleMouseMove, isMobile, socket])

  // Update parent component when user count changes
  useEffect(() => {
    onUsersUpdate?.(userCount)
  }, [userCount, onUsersUpdate])

  if (isMobile) return null

  const renderCursor = (color: string, x: number, y: number, name?: string, isOwn: boolean = false) => {
    const textColor = getContrastColor(color)
    const borderColor = textColor === '#000000' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'
    
    return (
      <div
        style={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          pointerEvents: 'none',
          zIndex: isOwn ? 9998 : 9999,
          transition: isOwn ? 'none' : 'all 0.08s cubic-bezier(0.25, 0.1, 0.25, 1)',
          transform: 'translate(0, 0)'
        }}
      >
        {/* Your custom arrow cursor */}
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
            fill={color}
          />
        </svg>
        
        {/* Name label with colored background - only for other users */}
        {!isOwn && name && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '18px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
            letterSpacing: '0.3px',
            color: textColor,
            backgroundColor: color,
            boxShadow: `
              0 2px 8px rgba(0, 0, 0, 0.15),
              0 0 0 1px ${borderColor}
            `
          }}>
            {name}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Render own cursor without name - no stuttering */}
      {!isMobile && myColor && renderCursor(myColor, myPosition.x, myPosition.y, undefined, true)}
      
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
            {renderCursor(cursor.color, viewportX, viewportY, cursor.name, false)}
          </div>
        )
      })}
    </>
  )
}
