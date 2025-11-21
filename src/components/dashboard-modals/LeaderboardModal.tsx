import { memo, useState, useEffect } from "react";
import { UserCircle, Users, Trophy, Calendar } from "lucide-react";
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
  rank: number;
  isCurrentUser: boolean;
}

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
  const { accessToken } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch leaderboard data when league or period changes
  useEffect(() => {
    async function loadLeaderboard() {
      if (!selectedLeague || !accessToken || modalStep !== 2) {
        return;
      }

      setIsLoading(true);
      try {
        const api = new APIClient(accessToken);
        const data = await api.getLeagueLeaderboard(selectedLeague.id, leaderboardPeriod);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, [selectedLeague?.id, leaderboardPeriod, accessToken, modalStep]);

  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
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
                  className="w-full p-3 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10 hover:bg-[#2d332d]/80 transition-all"
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
            <p className="text-white/70 text-xs mb-4">
              {leaderboardView === 'individual' ? 'Individual' : 'Team'} • {leaderboardPeriod === 'total' ? 'All Time' : 'This Week'}
            </p>
            <div className="space-y-2 w-full max-h-44 overflow-y-auto scrollbar-hide mb-4">
              {isLoading ? (
                <p className="text-white/50 text-xs">Loading...</p>
              ) : leaderboardView === 'individual' ? (
                // Individual leaderboard - REAL DATA
                leaderboardData.length > 0 ? (
                  leaderboardData.map((member) => (
                    <div
                      key={member.userId}
                      className={`flex items-center justify-between p-2 rounded-full ${
                        member.isCurrentUser ? 'bg-[#7a8872]' : 'bg-[#2d332d]/60 backdrop-blur-sm border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-xs w-5">#{member.rank}</span>
                        <span className="text-white text-sm">{member.isCurrentUser ? 'You' : member.name}</span>
                      </div>
                      <span className="text-white text-sm">{member.totalHours.toFixed(1)}h</span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50 text-xs italic">No workouts yet in this league</p>
                )
              ) : (
                // Team leaderboard - Coming soon
                <p className="text-white/50 text-xs italic">Team leaderboard coming soon!</p>
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
      </div>

      {/* External Filter Buttons - Bottom Right (only on step 2) */}
      {modalStep === 2 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-3">
            {/* View Type Toggles */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setLeaderboardView('individual')}
                className={`w-20 h-20 rounded-full ${
                  leaderboardView === 'individual'
                    ? 'bg-[#7a8872] border-2 border-white/40'
                    : 'bg-[#2d2d2d] border border-white/20'
                } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#7a8872]/80 shadow-lg`}
              >
                <UserCircle className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Individual</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setLeaderboardView('team')}
                className={`w-20 h-20 rounded-full ${
                  leaderboardView === 'team'
                    ? 'bg-[#7a8872] border-2 border-white/40'
                    : 'bg-[#2d2d2d] border border-white/20'
                } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#7a8872]/80 shadow-lg`}
              >
                <Users className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Team</span>
            </div>

            {/* Period Toggles */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setLeaderboardPeriod('total')}
                className={`w-20 h-20 rounded-full ${
                  leaderboardPeriod === 'total'
                    ? 'bg-[#7a8872] border-2 border-white/40'
                    : 'bg-[#2d2d2d] border border-white/20'
                } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#7a8872]/80 shadow-lg`}
              >
                <Trophy className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Total<br />Time</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setLeaderboardPeriod('weekly')}
                className={`w-20 h-20 rounded-full ${
                  leaderboardPeriod === 'weekly'
                    ? 'bg-[#7a8872] border-2 border-white/40'
                    : 'bg-[#2d2d2d] border border-white/20'
                } backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#7a8872]/80 shadow-lg`}
              >
                <Calendar className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Weekly</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const LeaderboardModal = memo(LeaderboardModalComponent);