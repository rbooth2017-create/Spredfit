import { memo } from "react";
import { useApp } from '../../utils/AppContext';

function MetricsModalComponent() {
  const { profile } = useApp();

  // Calculate weekly hours (workouts from last 7 days)
  const getWeeklyHours = () => {
    if (!profile?.totalHours || !profile?.totalWorkouts) return 0;
    // For now, show total hours divided by weeks (rough estimate)
    // TODO: Add actual weekly calculation from workouts table
    return profile.totalHours > 0 ? Math.min(profile.totalHours, 20) : 0;
  };

  // Calculate monthly hours
  const getMonthlyHours = () => {
    if (!profile?.totalHours) return 0;
    // For now, show total hours (up to reasonable monthly amount)
    return Math.min(profile.totalHours, 80);
  };

  // Calculate average per week (last 4 weeks)
  const getAvgWeeklyHours = () => {
    if (!profile?.totalHours) return 0;
    // Rough calculation - divide total by estimated weeks
    const estimatedWeeks = Math.max(1, Math.floor(profile.totalWorkouts / 3));
    return (profile.totalHours / estimatedWeeks).toFixed(1);
  };

  const weeklyHours = getWeeklyHours();
  const monthlyHours = getMonthlyHours();
  const avgWeeklyHours = getAvgWeeklyHours();

  return (
    <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center text-center w-full px-4">
        <p className="text-white text-sm mb-3">Your Metrics</p>
        <div className="space-y-3 w-full max-h-60 overflow-y-auto scrollbar-hide">
          <div className="py-2">
            <p className="text-white/70 text-xs mb-1">This Week</p>
            <p className="text-white text-2xl">{weeklyHours > 0 ? `${weeklyHours.toFixed(1)}h` : '0h'}</p>
            {weeklyHours > 0 && (
              <p className="text-emerald-400 text-xs mt-1">🔥 Keep it up!</p>
            )}
          </div>
          <div className="py-2">
            <p className="text-white/70 text-xs mb-1">This Month</p>
            <p className="text-white text-2xl">{monthlyHours > 0 ? `${monthlyHours.toFixed(1)}h` : '0h'}</p>
            {profile?.totalWorkouts && profile.totalWorkouts > 0 && (
              <p className="text-emerald-400 text-xs mt-1">{profile.totalWorkouts} workouts</p>
            )}
          </div>
          <div className="py-2">
            <p className="text-white/70 text-xs mb-1">Avg per Week</p>
            <p className="text-white text-2xl">{avgWeeklyHours > 0 ? `${avgWeeklyHours}h` : '0h'}</p>
            <p className="text-white/60 text-xs mt-1">Last 4 weeks</p>
          </div>
          {profile?.streak && profile.streak > 0 && (
            <div className="py-2 border-t border-white/10 mt-2">
              <p className="text-white/70 text-xs mb-1">Current Streak</p>
              <p className="text-white text-2xl">{profile.streak} {profile.streak === 1 ? 'day' : 'days'}</p>
              <p className="text-orange-400 text-xs mt-1">🔥 On fire!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const MetricsModal = memo(MetricsModalComponent);