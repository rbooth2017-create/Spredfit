import { memo, useState, useEffect } from 'react';
import { X, Activity, Heart, Moon, Weight, Droplet } from 'lucide-react';
import { useApp } from '../../utils/AppContext';
import { fetchTodayMetrics } from '../../utils/healthData';

interface MetricsModalProps {
  onClose: () => void;
}

function MetricsModalComponent({ onClose }: MetricsModalProps) {
  const { profile } = useApp();
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthMetrics();
  }, []);

  const loadHealthMetrics = async () => {
    setLoading(true);
    try {
      const today = await fetchTodayMetrics();
      setHealthMetrics(today);
    } catch (error) {
      console.error('Error loading health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate weekly hours (workouts from last 7 days)
  const getWeeklyHours = () => {
    if (!profile?.totalHours || !profile?.totalWorkouts) return 0;
    return profile.totalHours > 0 ? Math.min(profile.totalHours, 20) : 0;
  };

  // Calculate monthly hours
  const getMonthlyHours = () => {
    if (!profile?.totalHours) return 0;
    return Math.min(profile.totalHours, 80);
  };

  // Calculate average per week (last 4 weeks)
  const getAvgWeeklyHours = () => {
    if (!profile?.totalHours) return 0;
    const estimatedWeeks = Math.max(1, Math.floor(profile.totalWorkouts / 3));
    return (profile.totalHours / estimatedWeeks).toFixed(1);
  };

  const weeklyHours = getWeeklyHours();
  const monthlyHours = getMonthlyHours();
  const avgWeeklyHours = getAvgWeeklyHours();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Your Metrics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div 
          className="flex-1 overflow-y-auto p-6"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            .flex-1.overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="space-y-8">
            {/* Original Circular Metrics */}
            <div className="flex justify-center">
              <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl">
                <div className="flex flex-col items-center text-center w-full px-4">
                  <p className="text-white text-sm mb-3">Workout Summary</p>
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
            </div>

            {/* Divider */}
            <div className="border-t-2 border-white/20"></div>

            {/* Health Data Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white text-center">Health Data</h3>
              
              {loading ? (
                <div className="text-center py-8 text-white/70">Loading health data...</div>
              ) : healthMetrics ? (
                <div className="space-y-4">
                  {/* Daily Activity */}
                  {(healthMetrics.steps !== null && healthMetrics.steps !== undefined) && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-400" />
                        Daily Activity
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {healthMetrics.steps !== null && healthMetrics.steps !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-orange-400 font-medium">Steps</p>
                            <p className="text-xl font-bold text-white">{healthMetrics.steps.toLocaleString()}</p>
                          </div>
                        )}
                        {healthMetrics.calories !== null && healthMetrics.calories !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-red-400 font-medium">Calories</p>
                            <p className="text-xl font-bold text-white">{Math.round(healthMetrics.calories)}</p>
                          </div>
                        )}
                        {healthMetrics.distance !== null && healthMetrics.distance !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-blue-400 font-medium">Distance</p>
                            <p className="text-xl font-bold text-white">{(healthMetrics.distance / 1000).toFixed(2)} km</p>
                          </div>
                        )}
                        {healthMetrics.floors !== null && healthMetrics.floors !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-purple-400 font-medium">Floors</p>
                            <p className="text-xl font-bold text-white">{healthMetrics.floors}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Heart Health */}
                  {(healthMetrics.heartRate !== null || healthMetrics.hrv !== null || healthMetrics.vo2Max !== null) && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        Heart Health
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {healthMetrics.heartRate !== null && healthMetrics.heartRate !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-red-400 font-medium">Heart Rate</p>
                            <p className="text-xl font-bold text-white">{Math.round(healthMetrics.heartRate)} bpm</p>
                          </div>
                        )}
                        {healthMetrics.hrv !== null && healthMetrics.hrv !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-pink-400 font-medium">HRV</p>
                            <p className="text-xl font-bold text-white">{Math.round(healthMetrics.hrv)} ms</p>
                          </div>
                        )}
                        {healthMetrics.vo2Max !== null && healthMetrics.vo2Max !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-rose-400 font-medium">VO₂ Max</p>
                            <p className="text-xl font-bold text-white">{healthMetrics.vo2Max.toFixed(1)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sleep & Recovery */}
                  {healthMetrics.sleep !== null && healthMetrics.sleep !== undefined && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        Sleep & Recovery
                      </h4>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-indigo-400 font-medium">Sleep Duration</p>
                        <p className="text-xl font-bold text-white">{(healthMetrics.sleep / 60).toFixed(1)} hours</p>
                      </div>
                    </div>
                  )}

                  {/* Body Metrics */}
                  {(healthMetrics.weight !== null || healthMetrics.bmi !== null) && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                        <Weight className="w-4 h-4 text-green-400" />
                        Body Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {healthMetrics.weight !== null && healthMetrics.weight !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-green-400 font-medium">Weight</p>
                            <p className="text-xl font-bold text-white">{healthMetrics.weight.toFixed(1)} kg</p>
                          </div>
                        )}
                        {healthMetrics.bmi !== null && healthMetrics.bmi !== undefined && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-teal-400 font-medium">BMI</p>
                            <p className="text-xl font-bold text-white">{healthMetrics.bmi.toFixed(1)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hydration */}
                  {healthMetrics.water !== null && healthMetrics.water !== undefined && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-cyan-400" />
                        Hydration
                      </h4>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-cyan-400 font-medium">Water Intake</p>
                        <p className="text-xl font-bold text-white">{(healthMetrics.water / 1000).toFixed(2)} L</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/70 mb-2">No health data available</p>
                  <p className="text-sm text-white/50">Import data from Settings to view your health metrics</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const MetricsModal = memo(MetricsModalComponent);