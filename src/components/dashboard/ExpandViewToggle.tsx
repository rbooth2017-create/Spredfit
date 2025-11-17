import { memo } from "react";

interface ExpandViewToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
  animationsPaused: boolean;
  onAnimationToggle: () => void;
}

/**
 * ExpandViewToggle Component
 * 
 * A toggle switch positioned above the "Today" button that allows users to:
 * - Pause/resume background animations
 * - Hide the utility buttons at the top
 * - Expand the activity carousel to full size
 */
function ExpandViewToggleComponent({ isExpanded, onToggle, animationsPaused, onAnimationToggle }: ExpandViewToggleProps) {
  return (
    <div className="fixed bottom-[280px] left-0 right-0 z-[70] pointer-events-none">
      <div className="max-w-[440px] mx-auto px-4 pointer-events-auto">
        <div className="flex flex-col gap-2">
          {/* Animation Toggle */}
          <div className="flex items-center gap-2">
            {/* Toggle Switch */}
            <button
              onClick={onAnimationToggle}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg"
              role="switch"
              aria-checked={animationsPaused}
              aria-label={animationsPaused ? "Resume animations" : "Pause animations"}
            >
              {/* Toggle Circle */}
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white/70 transition-all duration-300 shadow-md ${
                  animationsPaused ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            
            {/* Label */}
            <span className="text-white/60 text-xs">
              {animationsPaused ? "Resume Animation" : "Pause Animation"}
            </span>
          </div>

          {/* Hide Buttons Toggle */}
          <div className="flex items-center gap-2">
            {/* Toggle Switch */}
            <button
              onClick={onToggle}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg"
              role="switch"
              aria-checked={isExpanded}
              aria-label={isExpanded ? "Show utility buttons" : "Hide utility buttons and expand view"}
            >
              {/* Toggle Circle */}
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white/70 transition-all duration-300 shadow-md ${
                  isExpanded ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            
            {/* Label */}
            <span className="text-white/60 text-xs">
              {isExpanded ? "Show Buttons" : "Hide Buttons"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ExpandViewToggle = memo(ExpandViewToggleComponent);