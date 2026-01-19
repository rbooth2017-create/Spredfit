import { memo, useState, useEffect } from "react";
import { UserCircle, Users, Trophy, Calendar, Timer, Footprints, Bike, ArrowLeft, Flag } from "lucide-react";
import { useAuth } from "../../utils/auth";
import { APIClient } from "../../utils/api";

interface League {
  name: string;
  rank: number;
  totalMembers: number;
  id: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  totalHours: number;
  totalDistance?: number;
  totalPoints?: number;
  rank: number;
  isCurrentUser: boolean;
}

interface TeamLeaderboardEntry {
  teamId: string;
  teamName: string;
  totalHours: number;
  totalDistance?: number;
  memberCount: number;
  rank: number;
  isCurrentUserTeam: boolean;
}

interface UserWorkout {
  id: string;
  type: string;
  title?: string;
  duration: number;
  distance?: number;
  date: string;
  notes?: string;
  userId: string;  // Add this
  stealthUntil?: string;  // Add this
  stealthActivatedAt?: string;  // Add this
}

type MetricType = 'time' | 'distance_run' | 'distance_cycle' | 'f1_points';

interface LeaderboardModalProps {
  modalStep: number;
  setModalStep: (step: number) => void;
  userLeagues: League[];
  selectedLeague: League | null;
  setSelectedLeague: (league: League | null) => void;
  leaderboardView: 'individual' | 'team';
  setLeaderboardView: (view: 'individual' | 'team') => void;
  leaderboardPeriod: 'total' | 'weekly';
  setLeaderboardPeriod: (period: 'total' | 'weekly') => void;
}

function LeaderboardModalComponent({
  modalStep,
  setModalStep,
  userLeagues,
  selectedLeague,
  setSelectedLeague,
  leaderboardView,
  setLeaderboardView,
  leaderboardPeriod,
  setLeaderboardPeriod,
}: LeaderboardModalProps) {
  const { accessToken, user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [teamLeaderboardData, setTeamLeaderboardData] = useState<TeamLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [metricType, setMetricType] = useState<MetricType>('time');
  
  // New state for user workout list
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [userWorkouts, setUserWorkouts] = useState<UserWorkout[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Fetch leaderboard data when league, view, period, or metric changes
  useEffect(() => {
    async function loadLeaderboard() {
      if (!selectedLeague || !accessToken || modalStep !== 2) {
        return;
      }

          // ✅ ADD THIS CHECK
    if (!accessToken) {
      console.warn('⚠️ Skipping leaderboard load - no access token yet');
      return;
    }

      setIsLoading(true);
      try {
        const api = new APIClient(accessToken);
        
        if (leaderboardView === 'individual') {
          if (metricType === 'f1_points') {
            // Use the F1 leaderboard API
            const data = await api.getLeagueF1Leaderboard(
              selectedLeague.id,
              leaderboardPeriod
            );
            setLeaderboardData(data);
          } else {
            const data = await api.getLeagueLeaderboard(
              selectedLeague.id, 
              leaderboardPeriod,
              metricType
            );
            setLeaderboardData(data);
          }
        } else {
          const data = await api.getLeagueTeamLeaderboard(
            selectedLeague.id, 
            leaderboardPeriod,
            metricType === 'f1_points' ? 'time' : metricType // Fall back to time for teams
          );
          setTeamLeaderboardData(data);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        setLeaderboardData([]);
        setTeamLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, [selectedLeague?.id, leaderboardView, leaderboardPeriod, metricType, accessToken, modalStep]);

  // Fetch user workouts when viewing step 3
  useEffect(() => {
    async function loadUserWorkouts() {
      if (!selectedUser || !selectedLeague || !accessToken || modalStep !== 3) {
        return;
      }

      setLoadingWorkouts(true);
      try {
        const api = new APIClient(accessToken);
        const workouts = await api.getUserWorkoutsInLeague(selectedUser.userId, selectedLeague.id);
        setUserWorkouts(workouts);
      } catch (error) {
        console.error('Failed to load user workouts:', error);
        setUserWorkouts([]);
      } finally {
        setLoadingWorkouts(false);
      }
    }

    loadUserWorkouts();
  }, [selectedUser?.userId, selectedLeague?.id, accessToken, modalStep]);

  // Format display value based on metric type
  const formatMetricValue = (entry: LeaderboardEntry | TeamLeaderboardEntry) => {
    if (metricType === 'time') {
      return `${entry.totalHours.toFixed(1)}h`;
    } else if (metricType === 'f1_points') {
      return `${(entry as LeaderboardEntry).totalPoints || 0} pts`;
    } else {
      return `${(entry.totalDistance || 0).toFixed(1)}km`;
    }
  };

  // Get metric label
  const getMetricLabel = () => {
    switch (metricType) {
      case 'time':
        return 'Total Time';
      case 'distance_run':
        return 'Distance Run';
      case 'distance_cycle':
        return 'Distance Cycled';
      case 'f1_points':
        return 'F1 Points';
      default:
        return 'Total Time';
    }
  };

  // Format date for workout display
  const formatWorkoutDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle clicking on a user
  const handleUserClick = (member: LeaderboardEntry) => {
    setSelectedUser(member);
    setModalStep(3);
  };

  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">

        {/* 🟢 ADD THIS LOADING GUARD HERE - BEFORE STEP 1 */}
        {!accessToken && modalStep === 2 && (
          <div className="flex flex-col items-center justify-center text-center w-full h-full">
            <p className="text-white text-sm mb-2">Loading...</p>
            <p className="text-white/50 text-xs">Authenticating...</p>
          </div>
        )}


        {/* Step 1: All Leagues Overview */}
        {modalStep === 1 && (
          <div className="flex flex-col items-center text-center w-full">
            <p className="text-white text-sm mb-4">Your League Rankings</p>
            <div className="space-y-2 w-full px-4 max-h-56 overflow-y-auto scrollbar-hide">
              {userLeagues.map((league, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedLeague(league);
                    setModalStep(2);
                  }}
                  className="w-full p-3 rounded-full bg-[#FFFFFF]/60 backdrop-blur-sm border border-white/10 hover:bg-[#FFFFFF]/80 transition-all"
                >
                  <p className="text-white text-sm mb-1">{league.name}</p>
                  <p className="text-white/70 text-xs">
                    You're #{league.rank} of {league.totalMembers}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Full League Leaderboard */}
        {modalStep === 2 && selectedLeague && (
          <div className="flex flex-col items-center text-center w-full px-4">
            <p className="text-white text-sm mb-1">{selectedLeague.name}</p>
            <p className="text-white/70 text-xs mb-1">
              {leaderboardView === 'individual' ? 'Individual' : 'Team'}
            </p>
            <p className="text-white/60 text-[10px] mb-2">
              {getMetricLabel()} • {leaderboardPeriod === 'total' ? 'All Time' : 'This Week'}
            </p>
            <div className="space-y-2 w-full max-h-56 overflow-y-auto mb-4" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}>
              {isLoading ? (
                <p className="text-white/50 text-xs">Loading...</p>
              ) : leaderboardView === 'individual' ? (
                // Individual leaderboard - now clickable
                leaderboardData.length > 0 ? (
                  leaderboardData.map((member) => (
                    <button
                      key={member.userId}
                      onClick={() => handleUserClick(member)}
                      className={`w-full flex items-center justify-between p-2 rounded-full transition-all ${
                        member.isCurrentUser 
                          ? 'bg-[#FFFFFF] hover:bg-[#FFFFFF]/90' 
                          : 'bg-[#FFFFFF]/60 backdrop-blur-sm border border-white/10 hover:bg-[#FFFFFF]/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-xs w-5">#{member.rank}</span>
                        <span className="text-white text-sm">{member.isCurrentUser ? 'You' : member.name}</span>
                      </div>
                      <span className="text-white text-sm">{formatMetricValue(member)}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-white/50 text-xs italic">No workouts yet in this league</p>
                )
              ) : (
                // Team leaderboard
                teamLeaderboardData.length > 0 ? (
                  teamLeaderboardData.map((team) => (
                    <div
                      key={team.teamId}
                      className={`p-2 rounded-2xl ${
                        team.isCurrentUserTeam ? 'bg-[#FFFFFF]' : 'bg-[#FFFFFF]/60 backdrop-blur-sm border border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 text-xs w-5">#{team.rank}</span>
                          <span className="text-white text-sm font-medium">{team.teamName}</span>
                        </div>
                        <span className="text-white text-sm font-bold">{formatMetricValue(team)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Users className="w-3 h-3 text-white/50" />
                        <span className="text-white/50 text-xs">{team.memberCount} member{team.memberCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50 text-xs italic">No teams created yet</p>
                )
              )}
            </div>
            <button
              onClick={() => setModalStep(1)}
              className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: User Workout List */}
        {modalStep === 3 && selectedUser && (
          <div className="flex flex-col items-center text-center w-full px-4">
            <p className="text-white text-sm mb-1">
              {selectedUser.isCurrentUser ? 'Your' : `${selectedUser.name}'s`} Workouts
            </p>
            <p className="text-white/70 text-xs mb-3">{selectedLeague?.name}</p>
            
            <div className="space-y-2 w-full max-h-56 overflow-y-auto mb-4" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {loadingWorkouts ? (
              <p className="text-white/50 text-xs">Loading workouts...</p>
            ) : (() => {
                // Filter out stealth workouts for other users
                const visibleWorkouts = selectedUser.isCurrentUser 
                  ? userWorkouts 
                  : userWorkouts.filter(workout => {
                      if (!workout.stealthUntil) return true;
                      
                      const stealthEnd = new Date(workout.stealthUntil);
                      const stealthStart = workout.stealthActivatedAt 
                        ? new Date(workout.stealthActivatedAt) 
                        : new Date(stealthEnd.getTime() - 3 * 24 * 60 * 60 * 1000);
                      const workoutDate = new Date(workout.date);
                      
                      // Hide if workout was during stealth period
                      return !(workoutDate >= stealthStart && workoutDate <= stealthEnd);
                    });
                
                return visibleWorkouts.length > 0 ? (
                  visibleWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-3 rounded-2xl bg-[#FFFFFF]/60 backdrop-blur-sm border border-white/10 text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">
                          {workout.title || workout.type}
                        </span>
                        <span className="text-white/70 text-xs">{formatWorkoutDate(workout.date)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/80 text-xs">
                        <span>{workout.duration} min</span>
                        {workout.distance && workout.distance > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {workout.type === 'Swimming' && workout.distance < 1
                                ? `${(workout.distance * 1000).toFixed(0)} m`
                                : `${workout.distance.toFixed(1)} km`}
                            </span>
                          </>
                        )}
                      </div>
                      {workout.notes && (
                        <p className="text-white/60 text-xs mt-1 italic">{workout.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-white/50 text-xs italic">No workouts found</p>
                );
              })()
            }
          </div>
            
            <button
              onClick={() => setModalStep(2)}
              className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Leaderboard
            </button>
          </div>
        )}
      </div>
      
            {/* External Filter Buttons (only on step 2) */}
            {modalStep === 2 && (
              <>
                {/* Right Side: Metric Type Buttons (2x2 Grid) */}
                <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top Row: Time and Run */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setMetricType('time')}
                        className={`w-20 h-20 rounded-full ${
                          metricType === 'time'
                            ? 'bg-[#FFFFFF] border-2 border-white/40'
                            : 'bg-[#2d2d2d] border border-white/20'
                        } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#FFFFFF]/80 shadow-lg`}
                      >
                        <Timer className="w-7 h-7 text-white" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center h-6 flex items-center">Time</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setMetricType('distance_run')}
                        className={`w-20 h-20 rounded-full ${
                          metricType === 'distance_run'
                            ? 'bg-[#FFFFFF] border-2 border-white/40'
                            : 'bg-[#2d2d2d] border border-white/20'
                        } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#FFFFFF]/80 shadow-lg`}
                      >
                        <Footprints className="w-7 h-7 text-white" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center h-6 flex items-center">Run</span>
                    </div>
      
                    {/* Bottom Row: Cycle and F1 */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setMetricType('distance_cycle')}
                        className={`w-20 h-20 rounded-full ${
                          metricType === 'distance_cycle'
                            ? 'bg-[#FFFFFF] border-2 border-white/40'
                            : 'bg-[#2d2d2d] border border-white/20'
                        } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#FFFFFF]/80 shadow-lg`}
                      >
                        <Bike className="w-7 h-7 text-white" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center h-6 flex items-center">Cycle</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setMetricType('f1_points')}
                        className={`w-20 h-20 rounded-full ${
                          metricType === 'f1_points'
                            ? 'bg-[#FFFFFF] border-2 border-white/40'
                            : 'bg-[#2d2d2d] border border-white/20'
                        } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#FFFFFF]/80 shadow-lg`}
                      >
                        <Flag className="w-7 h-7 text-white" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center h-6 flex items-center">F1</span>
                    </div>
                  </div>
                </div>
      
                {/* Left Side: 2x2 Grid Layout */}
                <div className="fixed bottom-8 left-4 z-[60]" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top Row: Individual and Team */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setLeaderboardView('individual')}
                        className={`w-20 h-20 rounded-full ${
                          leaderboardView === 'individual'
                            ? 'bg-[#FFFFFF] border-2 border-white/40'
                            : 'bg-[#2d2d2d] border border-white/20'
                        } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#FFFFFF]/80 shadow-lg`}
                      >
                        <UserCircle className="w-7 h-7 text-white" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center h-6 flex items-center">Individual</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setLeaderboardView('team')}
                        className={`w-20 h-20 rounded-full ${
                          leaderboardView === 'team'
                            ? 'bg-[#FFFFFF] border-2 border-white/40'
                            : 'bg-[#2d2d2d] border border-white/20'
                        } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#FFFFFF]/80 shadow-lg`}
                      >
                        <Users className="w-7 h-7 text-white" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center h-6 flex items-center">Team</span>
                    </div>
      
                    {/* Bottom Row: All Time and Weekly */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setLeaderboardPeriod('total')}
                        className={`w-20 h-20 rounded-full ${
                          leaderboardPeriod === 'total'
                            ? 'bg-[#FFFFFF] border-2 border-white/40'
                            : 'bg-[#2d2d2d] border border-white/20'
                        } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#FFFFFF]/80 shadow-lg`}
                      >
                        <Trophy className="w-7 h-7 text-white" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center h-6 flex items-center">All Time</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setLeaderboardPeriod('weekly')}
                        className={`w-20 h-20 rounded-full ${
                          leaderboardPeriod === 'weekly'
                            ? 'bg-[#FFFFFF] border-2 border-white/40'
                            : 'bg-[#2d2d2d] border border-white/20'
                        } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#FFFFFF]/80 shadow-lg`}
                      >
                        <Calendar className="w-7 h-7 text-white" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center h-6 flex items-center">Weekly</span>
                    </div>
                  </div>
                </div>
              </>
            )}
    </>
  );
}

export const LeaderboardModal = memo(LeaderboardModalComponent);