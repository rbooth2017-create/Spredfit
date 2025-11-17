import { memo } from "react";

interface AnimatedBackgroundProps {
  dimmed?: boolean;
}

/**
 * AnimatedBackground Component
 * 
 * Renders the animated background for SPREDfit:
 * - Color cycling animation through 5-color gradient (#025E73, #011F26, #A5A692, #BFB78F, #F2A71B)
 * - Halftone dot pattern with pulsating animation (dots grow/shrink)
 * - 95 second total cycle (19 seconds per color)
 * - 19 second breathing dot animation (4-7-8 technique)
 */
function AnimatedBackgroundComponent({ dimmed = false }: AnimatedBackgroundProps) {
  return (
    <>
      {/* Main animated background with color cycling */}
      <div 
        className="fixed inset-0 background-fade"
        style={{ 
          backgroundColor: '#025E73',
          willChange: 'background-color',
          opacity: dimmed ? 0.7 : 1,
          zIndex: -10
        }} 
      />

      {/* Halftone pattern overlay - centered */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: -9 }}>
        <div className="relative w-full max-w-md" style={{ top: '-10vh', left: '-15%', transform: 'scale(2)' }}>
          <svg className="w-full h-auto" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <g 
              opacity="0.5" 
              className="dot-pulsate" 
              style={{ 
                willChange: 'opacity, transform'
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
                  
                  // Create the halftone effect - bigger in center, smaller at edges
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

      {/* Dim overlay when content is floating above */}
      {dimmed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
          style={{ zIndex: 5 }}
        />
      )}
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const AnimatedBackground = memo(AnimatedBackgroundComponent);