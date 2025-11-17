import { memo } from "react";

interface MetricsModalProps {
  profile: any;
}

function MetricsModalComponent({ profile }: MetricsModalProps) {
  return (
    <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center text-center w-full px-4">
        <p className="text-white text-sm mb-3">Your Metrics</p>
        <div className="space-y-3 w-full max-h-60 overflow-y-auto scrollbar-hide">
          <div className="py-2">
            <p className="text-white/70 text-xs mb-1">This Week</p>
            <p className="text-white text-2xl">{profile?.weeklyHours ? `${profile.weeklyHours}h` : '0h'}</p>
            <p className="text-emerald-400 text-xs mt-1">{profile?.weeklyChange || ''}</p>
          </div>
          <div className="py-2">
            <p className="text-white/70 text-xs mb-1">This Month</p>
            <p className="text-white text-2xl">{profile?.monthlyHours ? `${profile.monthlyHours}h` : '0h'}</p>
            <p className="text-emerald-400 text-xs mt-1">{profile?.monthlyStatus || ''}</p>
          </div>
          <div className="py-2">
            <p className="text-white/70 text-xs mb-1">Avg per Week</p>
            <p className="text-white text-2xl">{profile?.avgWeeklyHours ? `${profile.avgWeeklyHours}h` : '0h'}</p>
            <p className="text-white/60 text-xs mt-1">Last 4 weeks</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const MetricsModal = memo(MetricsModalComponent);
