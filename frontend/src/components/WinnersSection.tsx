import { motion } from 'framer-motion'

export default function WinnersSection() {
  return (
    <div id="winners" style={{
      marginTop: '80px',
      padding: '60px 40px',
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.03), rgba(255, 150, 0, 0.01))',
      backdropFilter: 'blur(100px) saturate(180%)',
      WebkitBackdropFilter: 'blur(100px) saturate(180%)',
      borderRadius: '32px',
      border: '1px solid rgba(255, 215, 0, 0.15)',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '48px'
      }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
        >
          <h2 style={{
            fontSize: '48px',
            fontWeight: 700,
            background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '16px'
          }}>
            🏆 Lucky Winners
          </h2>
        </motion.div>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.6)',
          lineHeight: 1.5,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Random voters will be selected for rewards at each milestone.
          The more you vote, the higher your chances!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {['50K MC', '100K MC', '250K MC', '500K MC'].map((milestone, index) => (
          <motion.div
            key={milestone}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#FFD700',
                margin: 0
              }}>
                {milestone} Winners
              </h3>
              <div style={{
                padding: '4px 12px',
                background: 'rgba(255, 215, 0, 0.15)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FFD700'
              }}>
                Pending
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[1, 2, 3].map((place) => (
                <div
                  key={place}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: place === 1 ? '#FFD700' : place === 2 ? '#C0C0C0' : '#CD7F32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#000'
                  }}>
                    {place}
                  </div>
                  <div style={{
                    flex: 1,
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontStyle: 'italic'
                  }}>
                    Waiting for milestone...
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 150, 0, 0.05))',
        borderRadius: '16px',
        border: '1px solid rgba(255, 215, 0, 0.2)'
      }}>
        <div style={{
          fontSize: '24px',
          marginBottom: '8px'
        }}>
          🎯
        </div>
        <div style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#FFD700',
          marginBottom: '8px'
        }}>
          Winners Coming Soon!
        </div>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Vote now to be eligible for upcoming rewards. Winners will be randomly selected from all voters.
        </div>
      </div>
    </div>
  )
}
