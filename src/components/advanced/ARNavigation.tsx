/**
 * AR Navigation - UNIQUE FEATURE
 * 
 * Augmented Reality navigation overlay for walking to pickup point
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Navigation, X, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ARNavigationProps {
  destination: {
    lat: number;
    lng: number;
    label: string;
  };
  onClose: () => void;
}

export function ARNavigation({ destination, onClose }: ARNavigationProps) {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [heading, setHeading] = useState(0);
  const [distance, setDistance] = useState(0);
  const [direction, setDirection] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    checkARSupport();
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      // Start device orientation tracking
      window.addEventListener('deviceorientation', handleOrientation);
      // Start GPS tracking
      startLocationTracking();
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isActive]);

  const checkARSupport = () => {
    const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    const hasOrientation = 'DeviceOrientationEvent' in window;
    const hasGeolocation = 'geolocation' in navigator;

    setIsARSupported(hasCamera && hasOrientation && hasGeolocation);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      setHeading(360 - event.alpha);
      updateDirection(360 - event.alpha);
    }
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          // Calculate distance to destination
          const dist = calculateDistance(
            userLat,
            userLng,
            destination.lat,
            destination.lng
          );
          
          setDistance(dist);
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const updateDirection = (currentHeading: number) => {
    const angleToDest = currentHeading; // Simplified - should calculate actual bearing
    
    if (angleToDest > 337.5 || angleToDest <= 22.5) {
      setDirection('straight');
    } else if (angleToDest > 22.5 && angleToDest <= 67.5) {
      setDirection('slight-right');
    } else if (angleToDest > 67.5 && angleToDest <= 112.5) {
      setDirection('right');
    } else if (angleToDest > 112.5 && angleToDest <= 157.5) {
      setDirection('sharp-right');
    } else if (angleToDest > 157.5 && angleToDest <= 202.5) {
      setDirection('behind');
    } else if (angleToDest > 202.5 && angleToDest <= 247.5) {
      setDirection('sharp-left');
    } else if (angleToDest > 247.5 && angleToDest <= 292.5) {
      setDirection('left');
    } else {
      setDirection('slight-left');
    }
  };

  const getDirectionArrow = () => {
    const arrows: Record<string, string> = {
      'straight': '⬆️',
      'slight-right': '↗️',
      'right': '➡️',
      'sharp-right': '↘️',
      'behind': '⬇️',
      'sharp-left': '↙️',
      'left': '⬅️',
      'slight-left': '↖️',
    };
    return arrows[direction] || '⬆️';
  };

  if (!isARSupported) {
    return (
      <div className="p-6 text-center">
        <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          AR Navigation requires camera and orientation permissions
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Camera Feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />

        {/* AR Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* UI Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Bar */}
          <div className="p-4 flex items-center justify-between pointer-events-auto">
            <Badge className="bg-black/50 backdrop-blur-xl border-white/20">
              <Target className="w-4 h-4 mr-2" />
              {distance.toFixed(0)}m away
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-black/50 backdrop-blur-xl hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Center Navigation Arrow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className="text-9xl drop-shadow-2xl"
            >
              {getDirectionArrow()}
            </motion.div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">
                    {destination.label}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {distance < 10 ? 'You\'re almost there!' : `Keep walking ${direction.replace('-', ' ')}`}
                  </p>
                </div>
              </div>

              {/* Compass */}
              <div className="flex items-center justify-center">
                <motion.div
                  style={{ rotate: -heading }}
                  className="w-16 h-16 relative"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-white/30" />
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-red-500" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* AR Markers (would be positioned based on GPS) */}
        <AnimatePresence>
          {distance < 50 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="text-6xl drop-shadow-2xl"
                >
                  📍
                </motion.div>
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/70 backdrop-blur-xl px-4 py-2 rounded-full text-white text-sm">
                  Pickup Point
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
