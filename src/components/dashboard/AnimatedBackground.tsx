import { memo } from "react";

interface AnimatedBackgroundProps {
  animationsPaused?: boolean;
}

/**
 * AnimatedBackground Component
 * 
 * Renders the animated background for the SPREDfit dashboard:
 * - Color cycling animation through 5-color gradient (#025E73, #011F26, #A5A692, #BFB78F, #F2A71B)
 * - Halftone dot pattern with pulsating animation (dots grow/shrink)
 * - Decorative geometric circles with blur effects
 * 
 * The background uses inline CSS animations for maximum compatibility
 */
function AnimatedBackgroundComponent({ animationsPaused = false }: AnimatedBackgroundProps) {
  return (
    <>
      <style>{`
        @keyframes backgroundFade {
          0% { background-color: #025E73; }
          20% { background-color: #011F26; }
          40% { background-color: #A5A692; }
          60% { background-color: #BFB78F; }
          80% { background-color: #F2A71B; }
          100% { background-color: #025E73; }
        }
        
        @keyframes dotPulsate {
          0% { opacity: 0.3; transform: scale(1); }
          21.05% { opacity: 0.2; transform: scale(1.15); }
          57.89% { opacity: 0.2; transform: scale(1.15); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        
        .spredfit-dot-pulse {
          animation: dotPulsate 19s ease-in-out infinite;
        }
      `}</style>

      {/* Main animated background removed to allow animation visibility */}

      {/* Halftone pattern overlay - centered */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ transform: 'translateZ(0)' }}>
        <div className="relative w-full max-w-md" style={{ top: '-10vh', left: '-15%', transform: 'scale(2)' }}>
          <svg className="w-full h-auto" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <g 
              opacity="0.5" 
              className="spredfit-dot-pulse" 
              style={{ 
                willChange: 'opacity, transform',
                animationPlayState: animationsPaused ? 'paused' : 'running'
              }}
            >
              {Array.from({ length: 40 }).map((_, row) => {
                return Array.from({ length: 40 }).map((_, col) => {
                  // Position
                  const x = (col / 39) * 400;
                  const y = (row / 39) * 400;
                  
                  // Distance from center (200, 200)
                  const dx = x - 200;
                  const dy = y - 200;
                  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                  
                  // Only show dots within a certain radius
                  const maxRadius = 180;
                  if (distanceFromCenter > maxRadius) return null;
                  
                  // Calculate dot size based on distance (larger in center)
                  const normalizedDistance = distanceFromCenter / maxRadius;
                  
                  // Create the halftone effect - bigger in center, smaller at edges (reduced sizes to prevent merging)
                  let dotRadius;
                  if (normalizedDistance < 0.3) {
                    // Center area - large dots but not overlapping
                    dotRadius = 2.5 - (normalizedDistance * 2);
                  } else if (normalizedDistance < 0.6) {
                    // Middle area
                    dotRadius = 1.8 - (normalizedDistance * 1.5);
                  } else {
                    // Outer area - smaller dots
                    dotRadius = 0.8 - ((normalizedDistance - 0.6) * 1.5);
                  }
                  
                  // Ensure minimum size
                  dotRadius = Math.max(0.3, dotRadius);
                  
                  return (
                    <circle
                      key={`${row}-${col}`}
                      cx={x}
                      cy={y}
                      r={dotRadius}
                      fill="white"
                      opacity="0.5"
                    />
                  );
                });
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Decorative geometric circles */}
      <div className="absolute top-8 right-4 w-24 h-24 rounded-full bg-[#9ca895] opacity-40 blur-2xl pointer-events-none" />
      <div className="absolute bottom-16 left-4 w-20 h-20 rounded-full bg-[#7a8872] opacity-30 blur-xl pointer-events-none" />
    </>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const AnimatedBackground = memo(AnimatedBackgroundComponent);