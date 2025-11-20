import React from 'react';
import { motion } from 'motion/react';

interface AnimatedBackgroundProps {
  animationsPaused?: boolean;
  dimmed?: boolean;
}

export function AnimatedBackground({ animationsPaused = false, dimmed = false }: AnimatedBackgroundProps) {
  return (
    <div 
      className="fixed inset-0 w-screen h-screen -z-10"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10,
      }}
    >
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#86a088] via-[#86a088] to-transparent" />
      
      {/* Wave Layer 1 - Sage Green */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'soft-light' }}
        animate={animationsPaused ? {} : {
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.path
          d="M0,50 Q250,20 500,50 T1000,50 L1000,200 L0,200 Z"
          animate={animationsPaused ? {} : {
            fill: ['#8a9881', '#7a8872', '#8a9881'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.svg>

      {/* Wave Layer 2 - Coral Peach */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'soft-light' }}
        animate={animationsPaused ? {} : {
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <motion.path
          d="M0,100 Q250,70 500,100 T1000,100 L1000,300 L0,300 Z"
          animate={animationsPaused ? {} : {
            fill: ['#a88e86', '#8C7A64', '#a88e86'],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.svg>

      {/* Wave Layer 3 - Powder Blue */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'soft-light' }}
        animate={animationsPaused ? {} : {
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      >
        <motion.path
          d="M0,150 Q250,120 500,150 T1000,150 L1000,400 L0,400 Z"
          animate={animationsPaused ? {} : {
            fill: ['#86a088', '#9ca895', '#86a088'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.svg>

      {/* Dimming overlay when modals are open */}
      {dimmed && (
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-300" />
      )}
    </div>
  );
}