import GlassSurface from './GlassSurface'

interface FloatingNavProps {
  activeUsers: number
  connected: boolean
  tokenCA?: string
}

export default function FloatingNav({ activeUsers, connected, tokenCA }: FloatingNavProps) {
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      width: '90%',
      maxWidth: '1100px'
    }}>
      <GlassSurface
        width="100%"
        height={70}
        borderRadius={35}
        backgroundOpacity={0.1}
        saturation={1.2}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          width: '100%',
          height: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B35 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '16px',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)'
              }}>
                💀
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff', letterSpacing: '-0.5px' }}>
                $FUKD
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '5px 14px',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: connected ? '#34C759' : '#FF3B30'
              }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', fontWeight: 500 }}>
                <strong>{activeUsers}</strong> Degens Online
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              style={{
                background: 'rgba(255, 59, 48, 0.15)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '12px',
                padding: '8px 20px',
                color: '#FF6B35',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '160px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 59, 48, 0.25)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 59, 48, 0.15)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              onClick={() => {
                if (tokenCA && tokenCA !== 'Coming Soon') {
                  navigator.clipboard.writeText(tokenCA)
                  alert('CA copied to clipboard!')
                } else {
                  alert('Contract Address coming soon!')
                }
              }}
            >
              <span style={{ fontWeight: 700 }}>CA:</span>
              <span style={{ fontSize: '11px', opacity: 0.9, fontFamily: 'monospace' }}>
                {tokenCA === 'Coming Soon' ? 'Coming Soon' : `${tokenCA?.slice(0, 6)}...${tokenCA?.slice(-4)}`}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 'auto' }}>
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
            <a 
              href="#vote" 
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                e.currentTarget.style.background = 'transparent'
              }}
            >Vote</a>
            <a 
              href="#rewards" 
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                e.currentTarget.style.background = 'transparent'
              }}
            >Rewards</a>
            <a 
              href="#winners" 
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                e.currentTarget.style.background = 'transparent'
              }}
            >Winners</a>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 8px' }} />
            <a 
              href="https://dexscreener.com" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
              </svg>
              Chart
            </a>
            <a 
              href="https://t.me/rekdtoken" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #2AABEE, #229ED9)',
                color: '#fff',
                textDecoration: 'none',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(42, 171, 238, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(42, 171, 238, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(42, 171, 238, 0.3)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.941z"/>
              </svg>
              Join TG
            </a>
          </div>
        </div>
      </GlassSurface>
    </div>
  )
}