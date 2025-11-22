import React from 'react';
import { motion } from 'motion/react';

interface AnimatedBackgroundProps {
  animationsPaused?: boolean;
  dimmed?: boolean;
}

export function AnimatedBackground({ animationsPaused = false, dimmed = false }: AnimatedBackgroundProps) {
  // Total duration for one complete cycle of 3 schemes
  const CYCLE_DURATION = 24;

  // SCHEME 1: Abyssal Anchorfish Blue (Top) & Truffle Trouble (Bottom)
  // SCHEME 2: Oceanic Noir (Top) & Deep Saffron (Bottom)
  // SCHEME 3: Hēi Sè Black (Top) & Stellar Strawberry (Bottom)

  const topColors = [
    '#1B2632', // Scheme 1 (Abyssal Anchorfish Blue)
    '#114c5A', // Scheme 2 (Oceanic Noir)
    '#142030', // Scheme 3 (Hēi Sè Black)
    '#172B36', // Loop
  ];

  const bottomColors = [
    '#A35139', // Scheme 1 (Truffle Trouble)
    '#FF9932', // Scheme 2 (Deep Saffron)
    '#FF5C8D', // Scheme 3 (Stellar Strawberry)
    '#A35139', // Loop
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen -z-10 overflow-hidden bg-[#1B2632]">
      {/* Top Section - 75% Height */}
      <motion.div 
        className="absolute top-0 left-0 right-0"
        style={{ height: '75%' }}
        animate={animationsPaused ? {} : {
          backgroundColor: topColors,
        }}
        transition={{
          duration: CYCLE_DURATION,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Bottom Section - 25% Height */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '25%' }}
        animate={animationsPaused ? {} : {
           backgroundColor: bottomColors,
        }}
        transition={{
           duration: CYCLE_DURATION,
           ease: "linear",
           repeat: Infinity,
        }}
      />

      {/* Dimming overlay when modals are open */}
      {dimmed && (
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 z-20" />
      )}
    </div>
  );
}