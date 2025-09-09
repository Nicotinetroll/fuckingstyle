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
  const [isMobile, setIsMobile] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const lastEmitTime = useRef(0)
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMobile) return
    
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
        if (user.id !== socket.id) {
          newCursors.set(user.id, user)
        }
      })
      setCursors(newCursors)
      setUserCount(users.length)
    })
    
    socket.on('userJoined', (user: User) => {
      setCursors(prev => {
        const updated = new Map(prev)
        updated.set(user.id, user)
        return updated
      })
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
      if (!isMobile) {
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

  return (
    <>
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
          <div
            key={cursor.id}
            style={{
              position: 'fixed',
              left: `${viewportX}px`,
              top: `${viewportY}px`,
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.1s linear',
              transform: 'translate(-8px, -8px)'
            }}
          >
            <svg width="24" height="24">
              <path
                d="M0,0 L0,18 L6,14 L10,22 L13,20 L9,12 L16,12 Z"
                fill={cursor.color}
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>
            <span style={{
              position: 'absolute',
              top: '24px',
              left: '12px',
              background: cursor.color,
              color: '#fff',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {cursor.name}
            </span>
          </div>
        )
      })}
    </>
  )
}
