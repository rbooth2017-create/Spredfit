import { memo } from "react";
import { Play, ArrowLeft } from "lucide-react";

interface TodaysActivityExternalButtonsProps {
  onStartWorkout: () => void;
  onBack: () => void;
}

/**
 * TodaysActivityExternalButtons Component
 * 
 * Renders the floating action buttons that appear outside the TodaysActivity modal.
 * These buttons are positioned in the bottom-right corner.
 */
function TodaysActivityExternalButtonsComponent({ 
  onStartWorkout,
  onBack 
}: TodaysActivityExternalButtonsProps) {
  return (
    <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-3">
        {/* Start Workout Button - Primary action */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onStartWorkout}
            className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
          >
            <Play className="w-7 h-7 text-white" strokeWidth={2} fill="white" />
          </button>
          <span className="text-white text-xs text-center">Start</span>
        </div>

        {/* Back Button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onBack}
            className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
          >
            <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <span className="text-white text-xs text-center">Back</span>
        </div>
      </div>
    </div>
  );
}

export const TodaysActivityExternalButtons = memo(TodaysActivityExternalButtonsComponent);