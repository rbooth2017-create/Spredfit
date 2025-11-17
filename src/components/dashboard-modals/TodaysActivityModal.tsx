import { memo } from "react";
import { Calendar } from "lucide-react";

/**
 * TodaysActivityModal Component
 * 
 * Displays a message when no activities are planned for today.
 * Prompts users to use the automatic generator or manually create activities.
 */
function TodaysActivityModalComponent() {
  return (
    <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center text-center w-full px-6">
        <div className="mb-4">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        </div>
        
        <h2 className="text-white text-xl mb-4">No Activities Planned</h2>
        
        <p className="text-white/70 text-sm leading-relaxed">
          Use the automatic generator or manually create to view here
        </p>
      </div>
    </div>
  );
}

export const TodaysActivityModal = memo(TodaysActivityModalComponent);