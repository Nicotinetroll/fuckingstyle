import { motion } from 'framer-motion'
import TokenInfo from './TokenInfo'
import WinnersSection from './WinnersSection'

export default function RewardsSection() {
  const milestones = [
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
  ]

  return (
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
      <div id="rewards" style={{
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

      <TokenInfo />

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
            }}>Hold $FUKD</div>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.5
            }}>
              Minimum $50 worth of tokens required
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
          {milestones.map((item, index) => (
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

      <WinnersSection />
    </motion.div>
  )
}