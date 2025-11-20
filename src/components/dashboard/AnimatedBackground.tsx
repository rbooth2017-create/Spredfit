import { motion } from "motion/react";
import { createPortal } from "react-dom";

interface AnimatedBackgroundProps {
  animationsPaused?: boolean;
  dimmed?: boolean;
}

export function AnimatedBackground({ animationsPaused = false, dimmed = false }: AnimatedBackgroundProps) {
  const backgroundContent = (
    <div 
      className="fixed top-0 left-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
      style={{ 
        zIndex: -10,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Wave layer 1 - Top left corner */}
      <motion.div
        className="absolute -top-[30%] -left-[20%] w-[80%] h-[80%] will-change-transform"
        animate={!animationsPaused ? {
          x: [0, 20, 0],
          y: [0, 15, 0],
          rotate: [0, 2, 0],
        } : false}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full opacity-30"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M0,400 Q250,300 500,400 T1000,400 L1000,1000 L0,1000 Z"
            animate={!animationsPaused ? {
              fill: [
                "#70d4a8", // Sage green
                "#f09a6b", // Coral peach
                "#88aed6", // Powder blue
                "#70d4a8", // Back to sage green
              ],
            } : false}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      {/* Wave layer 2 - Top right corner */}
      <motion.div
        className="absolute -top-[30%] -right-[20%] w-[80%] h-[80%] will-change-transform"
        animate={!animationsPaused ? {
          x: [0, -15, 0],
          y: [0, 20, 0],
          rotate: [0, -2, 0],
        } : false}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full opacity-25"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M0,500 Q300,350 600,500 T1200,500 L1200,1000 L0,1000 Z"
            animate={!animationsPaused ? {
              fill: [
                "#f09a6b", // Coral peach
                "#88aed6", // Powder blue
                "#70d4a8", // Sage green
                "#f09a6b", // Back to coral peach
              ],
            } : false}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      {/* Wave layer 3 - Bottom area */}
      <motion.div
        className="absolute -bottom-[20%] left-0 w-[100%] h-[60%] will-change-transform"
        animate={!animationsPaused ? {
          x: [0, 15, 0],
          y: [0, -15, 0],
          rotate: [0, 1, 0],
        } : false}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full opacity-20"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M0,600 Q200,500 400,600 T800,600 T1200,600 L1200,1000 L0,1000 Z"
            animate={!animationsPaused ? {
              fill: [
                "#88aed6", // Powder blue
                "#70d4a8", // Sage green
                "#f09a6b", // Coral peach
                "#88aed6", // Back to powder blue
              ],
            } : false}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      {/* Dimmed overlay for modal screens */}
      {dimmed && (
        <div className="absolute inset-0 bg-black/40 z-10" />
      )}
    </div>
  );

  // Render directly to document.body to escape ALL parent constraints
  return createPortal(backgroundContent, document.body);
}

export default AnimatedBackground;