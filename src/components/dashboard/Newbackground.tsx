import React from 'react';
import { motion } from 'motion/react';

export default function NewBackground() {
  // Total duration for one complete cycle of 3 schemes
  const CYCLE_DURATION = 24;

  // SCHEME 1: Abyssal Anchorfish Blue (Top) & Truffle Trouble (Bottom)
  // SCHEME 2: Oceanic Noir (Top) & Deep Saffron (Bottom)
  // SCHEME 3: Hēi Sè Black (Top) & Stellar Strawberry (Bottom)

  const topGradients = [
    'linear-gradient(135deg, #1B2632 0%, #2a3744 100%)', // Scheme 1 (Abyssal Anchorfish Blue)
    'linear-gradient(135deg, #172B36 0%, #234152 100%)', // Scheme 2 (Oceanic Noir)
    'linear-gradient(135deg, #142030 0%, #1f2d3d 100%)', // Scheme 3 (Hēi Sè Black)
    'linear-gradient(135deg, #1B2632 0%, #2a3744 100%)', // Loop
  ];

  const bottomGradients = [
    'linear-gradient(135deg, #A35139 0%, #C06042 100%)', // Scheme 1 (Truffle Trouble)
    'linear-gradient(135deg, #FF9932 0%, #FFB060 100%)', // Scheme 2 (Deep Saffron)
    'linear-gradient(135deg, #FF5C8D 0%, #FF7DA3 100%)', // Scheme 3 (Stellar Strawberry)
    'linear-gradient(135deg, #A35139 0%, #C06042 100%)', // Loop
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen -z-10 overflow-hidden bg-[#1B2632]">
      <div className="absolute inset-0 flex flex-col">
        
        {/* Top Section - 75% Height */}
        <div className="relative h-[75%] z-10">
           <motion.div 
             className="absolute inset-0"
             animate={{
               background: topGradients,
             }}
             transition={{
               duration: CYCLE_DURATION,
               ease: "linear",
               repeat: Infinity,
             }}
           />
           
           {/* Horizontal Shadow Seam */}
           <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Bottom Section - 25% Height - Single Color */}
        <div className="flex-1 relative">
          <motion.div 
            className="absolute inset-0"
            animate={{
               background: bottomGradients,
            }}
            transition={{
               duration: CYCLE_DURATION,
               ease: "linear",
               repeat: Infinity,
            }}
          />
          
          {/* Shadow Overlay */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Center "Pinch" Shadow 
          Positioned at the center of the horizontal fold
      */}
      <div 
        className="absolute top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, transparent 70%)'
        }}
      />
    </div>
  );
}
