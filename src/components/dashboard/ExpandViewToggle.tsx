import { memo } from "react";
import { EyeOff, Eye } from "lucide-react";

interface ExpandViewToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * ExpandViewToggle Component
 * 
 * Renders the hide/show buttons toggle positioned above the main action buttons.
 * This button allows users to expand the activity carousel to full size by hiding side buttons.
 */
function ExpandViewToggleComponent({ isExpanded, onToggle }: ExpandViewToggleProps) {
  return (
    <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 z-[90]">
      {/* Hide/Show Buttons Toggle */}
      <button
        onClick={onToggle}
        className="flex flex-col items-center gap-1 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
        title={isExpanded ? "Show buttons" : "Hide buttons"}
      >
        {isExpanded ? (
          <Eye className="w-5 h-5" strokeWidth={2} />
        ) : (
          <EyeOff className="w-5 h-5" strokeWidth={2} />
        )}
        <span className="text-[9px] text-white whitespace-nowrap">
          {isExpanded ? "Show Buttons" : "Hide Buttons"}
        </span>
      </button>
    </div>
  );
}

export const ExpandViewToggle = memo(ExpandViewToggleComponent);