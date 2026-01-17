import { motion } from 'motion/react';
import { ReactNode } from 'react';

/**
 * 3D Animation Effects Library
 * 
 * Reusable 3D animation components for immersive user experience
 */

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function FloatingCard({ children, delay = 0, duration = 3 }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      animate={{ 
        opacity: 1, 
        y: [0, -10, 0],
        rotateX: 0
      }}
      transition={{ 
        opacity: { duration: 0.5, delay },
        y: { duration, repeat: Infinity, ease: "easeInOut", delay },
        rotateX: { duration: 0.5, delay }
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
}

interface Card3DProps {
  children: ReactNode;
  className?: string;
}

export function Card3D({ children, className = '' }: Card3DProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
        z: 50
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      className={className}
    >
      <div style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

interface PulsingOrbProps {
  size?: number;
  color?: string;
  className?: string;
}

export function PulsingOrb({ size = 200, color = 'bg-teal-500', className = '' }: PulsingOrbProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`${color} rounded-full blur-3xl ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

interface ParticleFieldProps {
  count?: number;
  color?: string;
}

export function ParticleField({ count = 20, color = 'bg-white' }: ParticleFieldProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            y: [null, (Math.random() - 0.5) * 100 + '%'],
            x: [null, (Math.random() - 0.5) * 100 + '%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
          className={`absolute w-1 h-1 ${color} rounded-full`}
        />
      ))}
    </div>
  );
}

interface WaveBackgroundProps {
  colors?: string[];
}

export function WaveBackground({ colors = ['from-teal-500', 'to-cyan-500'] }: WaveBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r ${colors[0]} ${colors[1]} opacity-20`}
        style={{
          clipPath: 'polygon(0 20%, 100% 0%, 100% 80%, 0% 100%)'
        }}
      />
      <motion.div
        animate={{
          x: ['100%', '-100%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute bottom-0 left-0 w-[200%] h-full bg-gradient-to-r ${colors[1]} ${colors[0]} opacity-20`}
        style={{
          clipPath: 'polygon(0 80%, 100% 100%, 100% 20%, 0% 0%)'
        }}
      />
    </div>
  );
}

interface GlowingButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  glowColor?: string;
}

export function GlowingButton({ children, onClick, className = '', glowColor = 'shadow-teal-500/50' }: GlowingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 0 30px rgba(0, 128, 128, 0.6)`
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`${className} relative overflow-hidden`}
    >
      <motion.div
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        style={{ width: '50%' }}
      />
      {children}
    </motion.button>
  );
}

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className = '' }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`relative ${className}`}
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          transformStyle: 'preserve-3d',
          position: 'relative'
        }}
      >
        {/* Front */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {front}
        </div>
        
        {/* Back */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}

interface ParallaxContainerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxContainer({ children, speed = 0.5, className = '' }: ParallaxContainerProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      style={{
        y: scrollY * speed
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RippleEffectProps {
  x: number;
  y: number;
}

export function RippleEffect({ x, y }: RippleEffectProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: '2px solid rgba(0, 128, 128, 0.5)',
        pointerEvents: 'none'
      }}
    />
  );
}

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ children, className = '', onClick }: MagneticButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Import useState and useEffect
import { useState, useEffect } from 'react';

export {
  FloatingCard,
  Card3D,
  PulsingOrb,
  ParticleField,
  WaveBackground,
  GlowingButton,
  FlipCard,
  ParallaxContainer,
  RippleEffect,
  MagneticButton
};
