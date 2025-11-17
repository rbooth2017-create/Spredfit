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
 * The background uses CSS animations defined in globals.css:
 * - .background-fade: Color cycling (95s loop - 19s per color)
 * - .dot-pulsate: Dot size pulsation (19s loop)
 */
function AnimatedBackgroundComponent({ animationsPaused = false }: AnimatedBackgroundProps) {
  return (
    <>
      {/* Main animated background with color cycling - starts at first color to prevent flash */}
      <div 
        className="absolute inset-0 bg-[#025E73] -z-10 background-fade" 
        style={{ 
          willChange: 'background-color', 
          transform: 'translateZ(0)',
          animationPlayState: animationsPaused ? 'paused' : 'running'
        }} 
      />

      {/* Halftone pattern overlay - centered */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ transform: 'translateZ(0)' }}>
        <div className="relative w-full max-w-md" style={{ top: '-10vh', left: '-15%', transform: 'scale(2)' }}>
          <svg className="w-full h-auto" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <g 
              opacity="0.5" 
              className="dot-pulsate" 
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