/**
 * Premium Splash Screen
 * 
 * Beautiful animated splash screen with glassmorphism
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#008080] via-teal-700 to-[#607D4B]"
      >
        {/* Animated Background Shapes with 3D effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
              x: [0, 100, 0],
              y: [0, -100, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.5],
              rotate: [360, 180, 0],
              x: [0, -100, 0],
              y: [0, 100, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-[#800020]/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -180, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          {/* Logo/Icon with 3D Animation */}
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="mb-8"
          >
            <motion.div 
              className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255,255,255,0.2)",
                  "0 0 60px rgba(255,255,255,0.4)",
                  "0 0 20px rgba(255,255,255,0.2)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-7xl"
              >
                🚗
              </motion.div>
            </motion.div>
          </motion.div>

          {/* App Name with 3D effect */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-bold text-white mb-2 tracking-tight"
            style={{
              textShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)"
            }}
          >
            Wassel
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-white/90 mb-12"
          >
            Your Super App for Everything
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto"
          >
            <div className="h-2 bg-white/20 backdrop-blur-xl rounded-full overflow-hidden border border-white/30">
              <motion.div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-white to-white/80 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-sm mt-4"
            >
              Loading your experience...
            </motion.p>
          </motion.div>

          {/* Floating particles with depth */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [0, 1, 0],
                  scale: [0, Math.random() * 2 + 1, 0]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  filter: `blur(${Math.random() * 2}px)`
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}