import { memo } from "react";
import { Play, Calendar, SkipForward, X } from "lucide-react";

interface PlannedWorkoutExternalButtonsProps {
  onStartWorkout: () => void;
  onViewFullPlan: () => void;
  onClose: () => void;
}

/**
 * PlannedWorkoutExternalButtons Component
 * 
 * Renders the floating action buttons that appear outside the PlannedWorkoutDetail modal.
 * These buttons are positioned in the bottom-right corner.
 */
function PlannedWorkoutExternalButtonsComponent({ 
  onStartWorkout,
  onViewFullPlan,
  onClose 
}: PlannedWorkoutExternalButtonsProps) {
  return (
    <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-3">
        {/* Start Workout Button - Primary action */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onStartWorkout}
            className="w-20 h-20 rounded-full bg-[#8C7A64] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#7A6A56] shadow-lg"
          >
            <Play className="w-7 h-7 text-white" strokeWidth={2} fill="white" />
          </button>
          <span className="text-white text-xs text-center">Start</span>
        </div>

        {/* View Plan Button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onViewFullPlan}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-white/20 shadow-lg"
          >
            <Calendar className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
          <span className="text-white text-[10px] text-center">Plan</span>
        </div>

        {/* Skip/Close Button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onClose}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-white/20 shadow-lg"
          >
            <X className="w-5 h-5 text-white/70" strokeWidth={2} />
          </button>
          <span className="text-white/70 text-[10px] text-center">Close</span>
        </div>
      </div>
    </div>
  );
}

export const PlannedWorkoutExternalButtons = memo(PlannedWorkoutExternalButtonsComponent);
