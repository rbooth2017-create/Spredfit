import { memo } from "react";
import { EyeOff, Eye } from "lucide-react";

interface ExpandViewToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

function ExpandViewToggleComponent({ isExpanded, onToggle }: ExpandViewToggleProps) {
  return (
    <div className="absolute bottom-[140px] left-4 z-[100]">
      <button
        onClick={onToggle}
        className="flex flex-col items-center gap-1 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all pointer-events-auto"
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