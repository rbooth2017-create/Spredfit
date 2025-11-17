import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, Trophy, Users, TrendingUp, Award, Calendar, User } from "lucide-react";
import { FloatingContent } from "./FloatingContent";

interface LeaderboardProps {
  onBack: () => void;
  onProfile: () => void;
  onUserClick?: (userId: number, userName: string, userAvatar: string, userInitials: string) => void;
  onLeagueClick?: (leagueId: string) => void;
}

// Empty leagues - will be populated from backend
const userLeagues: any[] = [];

export function Leaderboard({ onBack, onProfile, onUserClick, onLeagueClick }: LeaderboardProps) {
  const [leaderboardType, setLeaderboardType] = useState<'individual' | 'teams'>('individual');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'alltime'>('month');

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      {/* Content */}
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#2d332d] mb-0.5">Your Leagues</p>
              <h1 className="text-xl text-[#2d332d]">Leaders</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#8a9881]/30 h-8 w-8"
            >
              <Trophy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h3 className="text-base text-[#2d332d]">
            Your Position - {
              timePeriod === 'alltime' ? 'All Time' :
              timePeriod === 'month' ? 'This Month' :
              'This Week'
            }
          </h3>
        </div>

        {/* League cards */}
        <div className="space-y-3">
          {userLeagues.map((league) => {
            const rank = league.ranks[leaderboardType][timePeriod];
            return (
              <div
                key={league.id}
                className="bg-[#eef0ed] rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm text-[#2d332d]">{league.name}</h4>
                  <span className="text-xs text-[#2d332d]/60">{league.totalMembers} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2d332d] flex items-center justify-center">
                    <span className="text-white text-xs">#{rank}</span>
                  </div>
                  <span className="text-xs text-[#2d332d]/80">
                    You're ranked #{rank} in this league
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Buttons - Fixed at Bottom Right */}
      <div className="fixed bottom-8 right-4 flex flex-col gap-3 z-50">
        {/* Row 1: Individual vs Teams */}
        <div className="flex gap-3">
          <button
            onClick={() => setLeaderboardType('individual')}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg relative overflow-hidden ${
              leaderboardType === 'individual' ? 'bg-[#2d2d2d]' : 'bg-transparent border-2 border-[#2d2d2d]'
            }`}
          >
            <User className={`w-7 h-7 relative z-10 ${leaderboardType === 'individual' ? 'text-[#9ca895]' : 'text-[#2d2d2d]'}`} strokeWidth={2} />
          </button>

          <button
            onClick={() => setLeaderboardType('teams')}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg relative overflow-hidden ${
              leaderboardType === 'teams' ? 'bg-[#2d2d2d]' : 'bg-transparent border-2 border-[#2d2d2d]'
            }`}
          >
            <Users className={`w-7 h-7 relative z-10 ${leaderboardType === 'teams' ? 'text-[#9ca895]' : 'text-[#2d2d2d]'}`} strokeWidth={2} />
          </button>
        </div>

        {/* Row 2: Week, Month, All Time */}
        <div className="flex gap-3">
          <button
            onClick={() => setTimePeriod('week')}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg relative overflow-hidden ${
              timePeriod === 'week' ? 'bg-[#2d2d2d]' : 'bg-transparent border-2 border-[#2d2d2d]'
            }`}
          >
            <TrendingUp className={`w-6 h-6 relative z-10 ${timePeriod === 'week' ? 'text-[#9ca895]' : 'text-[#2d2d2d]'}`} strokeWidth={2} />
          </button>

          <button
            onClick={() => setTimePeriod('month')}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg relative overflow-hidden ${
              timePeriod === 'month' ? 'bg-[#2d2d2d]' : 'bg-transparent border-2 border-[#2d2d2d]'
            }`}
          >
            <Calendar className={`w-6 h-6 relative z-10 ${timePeriod === 'month' ? 'text-[#9ca895]' : 'text-[#2d2d2d]'}`} strokeWidth={2} />
          </button>

          <button
            onClick={() => setTimePeriod('alltime')}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg relative overflow-hidden ${
              timePeriod === 'alltime' ? 'bg-[#2d2d2d]' : 'bg-transparent border-2 border-[#2d2d2d]'
            }`}
          >
            <Trophy className={`w-6 h-6 relative z-10 ${timePeriod === 'alltime' ? 'text-[#9ca895]' : 'text-[#2d2d2d]'}`} strokeWidth={2} />
          </button>
        </div>
      </div>
    </FloatingContent>
  );
}