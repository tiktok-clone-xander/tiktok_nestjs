import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

// Common animation variants
export const fadeInVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

export const slideInFromRightVariants = {
  hidden: {
    x: 300,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.25, 0, 1],
    },
  },
  exit: {
    x: 300,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.25, 0, 1],
    },
  },
}

export const slideInFromLeftVariants = {
  hidden: {
    x: -300,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.25, 0, 1],
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.25, 0, 1],
    },
  },
}

export const slideInFromTopVariants = {
  hidden: {
    y: -100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.25, 0, 1],
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.25, 0, 1],
    },
  },
}

export const slideInFromBottomVariants = {
  hidden: {
    y: 100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.25, 0, 1],
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.25, 0, 1],
    },
  },
}

export const scaleVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.25, 0, 1],
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.25, 0, 1],
    },
  },
}

export const bounceVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
      duration: 0.5,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerItemVariants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

// Loading spinner variants
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}

// Heart like animation
export const heartLikeVariants = {
  initial: { scale: 1 },
  liked: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
}

// Video card hover variants
export const videoCardVariants = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

// Button variants
export const buttonVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.1,
      ease: 'easeInOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeInOut',
    },
  },
}

// Modal variants
export const modalBackdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

export const modalVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 100,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 100,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

// Toast notification variants
export const toastVariants = {
  hidden: {
    x: 300,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    x: 300,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
}

// Page transition variants
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// Components using these variants

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
}

export function FadeIn({ children, delay = 0, duration = 0.3 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration, ease: 'easeInOut' }}
    >
      {children as any}
    </motion.div>
  )
}

interface SlideInProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'top' | 'bottom'
  delay?: number
}

export function SlideIn({ children, direction = 'bottom', delay = 0 }: SlideInProps) {
  const variants = {
    left: slideInFromLeftVariants,
    right: slideInFromRightVariants,
    top: slideInFromTopVariants,
    bottom: slideInFromBottomVariants,
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants[direction]}
      style={{
        transitionDelay: `${delay}s`,
      }}
    >
      {children as any}
    </motion.div>
  )
}

interface ScaleInProps {
  children: ReactNode
  delay?: number
}

export function ScaleIn({ children, delay = 0 }: ScaleInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleVariants}
      style={{
        transitionDelay: `${delay}s`,
      }}
    >
      {children as any}
    </motion.div>
  )
}

interface StaggeredListProps {
  children: ReactNode
}

export function StaggeredList({ children }: StaggeredListProps) {
  return (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={staggerContainerVariants}>
      {children as any}
    </motion.div>
  )
}

interface StaggeredItemProps {
  children: ReactNode
}

export function StaggeredItem({ children }: StaggeredItemProps) {
  return <motion.div variants={staggerItemVariants}>{children as any}</motion.div>
}

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function AnimatedButton({
  children,
  onClick,
  className = '',
  disabled = false,
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled ? 'rest' : 'hover'}
      whileTap={disabled ? 'rest' : 'tap'}
    >
      {children as any}
    </motion.button>
  )
}

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 24, className = '' }: LoadingSpinnerProps) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      variants={spinnerVariants}
      animate="animate"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="32"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="32;0;32"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </motion.div>
  )
}

interface ModalProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function Modal({ children, isOpen, onClose, className = '' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-900 ${className}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {children as any}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransitionVariants}>
      {children as any}
    </motion.div>
  )
}
