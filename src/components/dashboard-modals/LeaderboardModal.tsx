import { memo } from "react";
import { UserCircle, Users, Trophy, Calendar } from "lucide-react";

interface League {
  name: string;
  rank: number;
  totalMembers: number;
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
              {leaderboardView === 'individual' ? (
                // Individual leaderboard
                [
                  { name: 'Sarah C.', time: leaderboardPeriod === 'total' ? '12.5h' : '8.2h', rank: 1 },
                  { name: 'You', time: leaderboardPeriod === 'total' ? '11.2h' : '7.5h', rank: selectedLeague.rank },
                  { name: 'Marcus J.', time: leaderboardPeriod === 'total' ? '10.8h' : '6.9h', rank: 3 },
                  { name: 'Emily R.', time: leaderboardPeriod === 'total' ? '9.5h' : '5.8h', rank: 4 },
                  { name: 'David K.', time: leaderboardPeriod === 'total' ? '8.3h' : '4.2h', rank: 5 },
                ].map((member) => (
                  <div
                    key={`individual-${member.name}`}
                    className={`flex items-center justify-between p-2 rounded-full ${
                      member.name === 'You' ? 'bg-[#7a8872]' : 'bg-[#2d332d]/60 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-xs w-5">#{member.rank}</span>
                      <span className="text-white text-sm">{member.name}</span>
                    </div>
                    <span className="text-white text-sm">{member.time}</span>
                  </div>
                ))
              ) : (
                // Team leaderboard
                [
                  { name: 'Thunder Squad', time: leaderboardPeriod === 'total' ? '45.2h' : '28.5h', rank: 1 },
                  { name: 'Your Team', time: leaderboardPeriod === 'total' ? '38.7h' : '24.1h', rank: 2 },
                  { name: 'Lightning Crew', time: leaderboardPeriod === 'total' ? '35.4h' : '22.3h', rank: 3 },
                  { name: 'Storm Chasers', time: leaderboardPeriod === 'total' ? '32.1h' : '19.8h', rank: 4 },
                  { name: 'Wind Runners', time: leaderboardPeriod === 'total' ? '28.9h' : '17.2h', rank: 5 },
                ].map((team) => (
                  <div
                    key={`team-${team.rank}`}
                    className={`flex items-center justify-between p-2 rounded-full ${
                      team.name === 'Your Team' ? 'bg-[#7a8872]' : 'bg-[#2d332d]/60 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-xs w-5">#{team.rank}</span>
                      <span className="text-white text-sm">{team.name}</span>
                    </div>
                    <span className="text-white text-sm">{team.time}</span>
                  </div>
                ))
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

// ✅ Memoize to prevent unnecessary re-renders
export const LeaderboardModal = memo(LeaderboardModalComponent);
