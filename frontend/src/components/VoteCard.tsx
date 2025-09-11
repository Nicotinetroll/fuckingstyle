import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'

interface VoteCardProps {
  card: {
    id: string
    name: string
    role: string
    image: string
    color: string
    gradient: string
    scammerProfit?: string
    investorLoss?: string
  }
  index: number
  voteCount: number
  totalVotes: number
  isHovered: boolean
  isSelected: boolean
  votedCard: string | null
  votesForThisCard: number
  votesRemaining: number
  onHover: (id: string | null) => void
  onVote: (id: string) => void
  isTop?: boolean
}

export default function VoteCard({
  card,
  index,
  voteCount,
  totalVotes,
  isHovered,
  isSelected,
  votedCard,
  votesForThisCard,
  votesRemaining,
  onHover,
  onVote,
  isTop = false
}: VoteCardProps) {
  const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100) : 0
  const hasVoted = votesForThisCard > 0
  const isFirst = isTop && index === 0
  const isSecond = isTop && index === 1
  const isThird = isTop && index === 2
  const rank = !isTop ? index + 4 : index + 1

  if (!isTop) {
    return (
      <motion.div
        layoutId={card.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ 
          layout: { duration: 0.5, type: "spring" },
          delay: index * 0.03 
        }}
        onHoverStart={() => onHover(card.id)}
        onHoverEnd={() => onHover(null)}
        style={{
          position: 'relative',
          animation: votedCard === card.id ? 'voteShake 0.6s ease-in-out' : 'none'
        }}
      >
        <div style={{
          position: 'relative',
          background: isHovered 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          borderRadius: '16px',
          padding: '16px',
          border: isHovered 
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered 
            ? '0 10px 30px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isSelected ? 'scale(0.98)' : 'scale(1)',
          overflow: 'hidden'
        }}>
          {votedCard === card.id && (
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 20
            }}>
              <div style={{
                position: 'absolute',
                inset: '-50%',
                background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.5) 50%, transparent 60%)',
                animation: 'slideShine 0.6s ease-out'
              }} />
            </div>
          )}
          
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            #{rank}
          </div>
          
          {hasVoted && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: 'rgba(52, 199, 89, 0.2)',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#34C759'
            }}>
              {votesForThisCard}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              flexShrink: 0,
              position: 'relative'
            }}>
              <img
                src={card.image}
                alt={card.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255,255,255,0.1)'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48?text=' + card.name.charAt(0)
                }}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {card.name}
              </h4>
              <p style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {card.role}
              </p>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '4px',
                fontSize: '10px'
              }}>
                <span style={{ color: '#34C759' }}>
                  ↑{card.scammerProfit}
                </span>
                <span style={{ color: '#FF3B30' }}>
                  ↓{card.investorLoss}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#fff'
              }}>
                {voteCount}
                <span style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  marginLeft: '6px',
                  fontWeight: 400
                }}>
                  votes ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: votesRemaining > 0 ? 1.05 : 1 }}
              whileTap={{ scale: votesRemaining > 0 ? 0.95 : 1 }}
              onClick={() => onVote(card.id)}
              disabled={votesRemaining === 0}
              style={{
                padding: '6px 16px',
                background: votesRemaining === 0
                  ? 'rgba(255, 59, 48, 0.15)'
                  : isHovered 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: votesRemaining === 0
                  ? '1px solid rgba(255, 59, 48, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: votesRemaining === 0 ? 'rgba(255, 255, 255, 0.4)' : '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: votesRemaining === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                opacity: votesRemaining === 0 ? 0.5 : 1
              }}
            >
              {hasVoted ? `Voted (${votesForThisCard}x)` : votesRemaining === 0 ? 'No Votes' : 'Vote'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layoutId={card.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ 
        layout: { duration: 0.5, type: "spring" },
        delay: index * 0.05 
      }}
      onHoverStart={() => onHover(card.id)}
      onHoverEnd={() => onHover(null)}
      style={{
        position: 'relative',
        transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: votedCard === card.id ? 'voteShake 0.6s ease-in-out' : 'none'
      }}
    >
      {isFirst && (
        <>
          <div style={{
            position: 'absolute',
            inset: '-20px',
            background: 'radial-gradient(circle, rgba(255,100,0,0.4) 0%, transparent 70%)',
            filter: 'blur(20px)',
            animation: 'fireGlow 2s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: '60px',
            background: 'linear-gradient(180deg, transparent, rgba(255,100,0,0.3))',
            filter: 'blur(10px)',
            animation: 'fireFlicker 0.5s ease-in-out infinite'
          }} />
        </>
      )}
      
      {votedCard === card.id && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '32px',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 20
        }}>
          <div style={{
            position: 'absolute',
            inset: '-50%',
            background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%)',
            animation: 'slideShine 0.6s ease-out'
          }} />
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        inset: '-1px',
        background: isFirst 
          ? 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
          : isSecond
          ? 'linear-gradient(135deg, #C0C0C0 0%, #757575 100%)'
          : isThird
          ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'
          : card.gradient,
        borderRadius: '32px',
        opacity: isHovered ? 0.3 : 0,
        filter: 'blur(20px)',
        transition: 'opacity 0.3s ease'
      }} />
      
      <div style={{
        position: 'relative',
        background: isFirst 
          ? 'linear-gradient(135deg, rgba(255,100,0,0.08), rgba(255,150,0,0.03))'
          : isSecond
          ? 'linear-gradient(135deg, rgba(192,192,192,0.06), rgba(184,184,184,0.02))'
          : isThird
          ? 'linear-gradient(135deg, rgba(205,127,50,0.06), rgba(184,115,51,0.02))'
          : 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: '32px',
        padding: '40px',
        border: isFirst 
          ? '1px solid rgba(255, 150, 0, 0.2)'
          : isSecond
          ? '1px solid rgba(192, 192, 192, 0.15)'
          : isThird
          ? '1px solid rgba(205, 127, 50, 0.15)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isFirst
          ? '0 0 40px rgba(255, 100, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.2)'
          : isSecond
          ? '0 0 30px rgba(192, 192, 192, 0.1), 0 10px 40px rgba(0, 0, 0, 0.2)'
          : isThird
          ? '0 0 30px rgba(205, 127, 50, 0.1), 0 10px 40px rgba(0, 0, 0, 0.2)'
          : isHovered 
          ? '0 30px 60px rgba(0, 0, 0, 0.4)' 
          : '0 10px 40px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'scale(0.98)' : 'scale(1)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-16px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 + index * 0.1 }}
            style={{
              background: index === 0 
                ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                : index === 1 
                ? 'linear-gradient(135deg, #E5E5E5, #B8B8B8)'
                : 'linear-gradient(135deg, #CD7F32, #B87333)',
              color: '#000',
              padding: '8px 24px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: index === 0 
                ? '0 4px 20px rgba(255, 215, 0, 0.6)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {index === 0 ? '1ST PLACE' : index === 1 ? '2ND PLACE' : '3RD PLACE'}
          </motion.div>
        </div>
        
        {hasVoted && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #34C759, #30D158)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(52, 199, 89, 0.4)'
          }}>
            ✓ {votesForThisCard}x
          </div>
        )}
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '140px',
            height: '140px',
            margin: '0 auto 24px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: '-2px',
              background: isFirst 
                ? 'linear-gradient(135deg, #FFD700, #FF6B35)'
                : isSecond
                ? 'linear-gradient(135deg, #E5E5E5, #999999)'
                : isThird
                ? 'linear-gradient(135deg, #CD7F32, #8B4513)'
                : card.gradient,
              borderRadius: '50%',
              opacity: isHovered || isFirst ? 1 : 0.5,
              transition: 'opacity 0.3s ease',
              animation: isHovered || isFirst ? 'rotate 3s linear infinite' : 'none'
            }} />
            <img
              src={card.image}
              alt={card.name}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #000',
                background: 'rgba(255,255,255,0.1)'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/140?text=' + card.name.charAt(0)
              }}
            />
          </div>
          
          <h3 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#fff',
            margin: '0 0 4px 0',
            letterSpacing: '-0.01em'
          }}>
            {card.name}
          </h3>
          
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: '0 0 20px 0',
            fontWeight: 500
          }}>
            {card.role}
          </p>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'rgba(52, 199, 89, 0.15)',
              border: '1px solid rgba(52, 199, 89, 0.3)',
              borderRadius: '12px',
              padding: '8px 16px'
            }}>
              <div style={{
                fontSize: '10px',
                color: 'rgba(52, 199, 89, 0.8)',
                marginBottom: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Scammer Profit
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#34C759'
              }}>
                {card.scammerProfit || 'Unknown'}
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255, 59, 48, 0.15)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: '12px',
              padding: '8px 16px'
            }}>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 59, 48, 0.8)',
                marginBottom: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Investor Loss
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FF3B30'
              }}>
                {card.investorLoss || 'Unknown'}
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <AnimatedCounter 
              value={voteCount} 
              className="text-white"
            />
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginTop: '8px',
              fontWeight: 500
            }}>
              {percentage.toFixed(1)}% of total
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: votesRemaining > 0 ? 1.05 : 1 }}
            whileTap={{ scale: votesRemaining > 0 ? 0.95 : 1 }}
            onClick={() => onVote(card.id)}
            disabled={votesRemaining === 0}
            style={{
              width: '100%',
              padding: '16px',
              background: votesRemaining === 0
                ? 'rgba(255, 59, 48, 0.15)'
                : isHovered 
                ? isFirst
                  ? 'linear-gradient(135deg, #FFD700, #FF6B35)'
                  : isSecond
                  ? 'linear-gradient(135deg, #E5E5E5, #999999)'
                  : isThird
                  ? 'linear-gradient(135deg, #CD7F32, #8B4513)'
                  : card.gradient
                : isFirst
                  ? 'rgba(255, 150, 0, 0.15)'
                  : isSecond
                  ? 'rgba(192, 192, 192, 0.15)'
                  : isThird
                  ? 'rgba(205, 127, 50, 0.15)'
                  : 'rgba(255, 255, 255, 0.1)',
              border: votesRemaining === 0
                ? '1px solid rgba(255, 59, 48, 0.3)'
                : isFirst
                ? '1px solid rgba(255, 215, 0, 0.4)'
                : isSecond
                ? '1px solid rgba(192, 192, 192, 0.4)'
                : isThird
                ? '1px solid rgba(205, 127, 50, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              color: votesRemaining === 0 ? 'rgba(255, 255, 255, 0.4)' : '#fff',
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              cursor: votesRemaining === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isHovered && votesRemaining > 0
                ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                : isFirst
                ? '0 2px 8px rgba(255, 215, 0, 0.2)'
                : isSecond
                ? '0 2px 8px rgba(192, 192, 192, 0.2)'
                : isThird
                ? '0 2px 8px rgba(205, 127, 50, 0.2)'
                : '0 2px 8px rgba(255, 255, 255, 0.1)',
              textShadow: isFirst || isSecond || isThird
                ? '0 1px 3px rgba(0,0,0,0.4)'
                : '0 1px 2px rgba(0,0,0,0.3)',
              opacity: votesRemaining === 0 ? 0.5 : 1
            }}
          >
            {hasVoted ? `Voted (${votesForThisCard}x)` : votesRemaining === 0 ? 'No Votes Left' : 'Vote Now'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
