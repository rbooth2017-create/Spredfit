import { memo } from "react";

interface AnimatedBackgroundProps {
  animationsPaused?: boolean;
}

/**
 * AnimatedBackground Component
 * 
 * Renders the animated gradient background for the SPREDfit dashboard:
 * - Color cycling animation through 5-color gradient (#025E73, #011F26, #A5A692, #BFB78F, #F2A71B)
 * 
 * The background uses inline CSS animations for maximum compatibility
 */
function AnimatedBackgroundComponent({ animationsPaused = false }: AnimatedBackgroundProps) {
  return (
    <style>{`
      @keyframes backgroundFade {
        0% { background-color: #025E73; }
        20% { background-color: #011F26; }
        40% { background-color: #A5A692; }
        60% { background-color: #BFB78F; }
        80% { background-color: #F2A71B; }
        100% { background-color: #025E73; }
      }
    `}</style>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const AnimatedBackground = memo(AnimatedBackgroundComponent);