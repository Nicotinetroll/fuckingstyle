import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  className?: string
}

export default function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  
  useEffect(() => {
    setDisplayValue(value)
  }, [value])
  
  const digits = displayValue.toString().padStart(3, '0').split('')
  
  return (
    <div className={`flex justify-center ${className}`}>
      {digits.map((digit, index) => (
        <div key={index} className="relative h-16 w-10 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${index}-${digit}`}
              initial={{ y: -80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              transition={{
                y: { type: "spring", stiffness: 300, damping: 30 }
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-5xl font-bold tabular-nums">
                {digit}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
