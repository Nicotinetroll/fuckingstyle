interface TokenInfoProps {
  isMobile?: boolean
}

export default function TokenInfo({ isMobile = false }: TokenInfoProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.05))',
      backdropFilter: 'blur(80px) saturate(180%)',
      WebkitBackdropFilter: 'blur(80px) saturate(180%)',
      border: '1px solid rgba(147, 51, 234, 0.2)',
      borderRadius: isMobile ? '20px' : '24px',
      padding: isMobile ? '24px' : '32px',
      marginBottom: '40px',
      boxShadow: '0 20px 60px rgba(147, 51, 234, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '20px' : '0'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: 600,
            color: 'rgba(147, 51, 234, 0.9)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Development Fund
          </div>
          <div style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '12px'
          }}>
            20% of Total Supply
          </div>
          <div style={{
            fontSize: isMobile ? '13px' : '15px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6
          }}>
            Reserved for development team, marketing initiatives, exchange listings, 
            and project sustainability. Transparent allocation for long-term growth.
          </div>
        </div>
        {!isMobile && (
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
        )}
      </div>
    </div>
  )
}