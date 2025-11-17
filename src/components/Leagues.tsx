import { Users, Plus, Search, Trophy, Clock, Archive, Bell, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { FloatingContent } from "./FloatingContent";

interface LeaguesProps {
  onBack: () => void;
  onLeagueClick: (leagueId: string) => void;
  onJoinLeague: () => void;
  onCreateLeague: () => void;
}

interface League {
  id: string;
  name: string;
  memberCount: number;
  yourRank: number;
  yourTime: number;
  endDate: string;
  status: 'active' | 'ended' | 'invited';
}

export function Leagues({ onBack, onLeagueClick, onJoinLeague, onCreateLeague }: LeaguesProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ended' | 'invited'>('all');

  // Mock data for leagues
  const allLeagues: League[] = [
    {
      id: "1",
      name: "November Champions",
      memberCount: 24,
      yourRank: 3,
      yourTime: 12.5,
      endDate: "Nov 30, 2025",
      status: 'active'
    },
    {
      id: "2",
      name: "Team Fitness Warriors",
      memberCount: 8,
      yourRank: 2,
      yourTime: 8.2,
      endDate: "Nov 30, 2025",
      status: 'active'
    },
    {
      id: "3",
      name: "Weekend Warriors",
      memberCount: 16,
      yourRank: 5,
      yourTime: 6.8,
      endDate: "Nov 30, 2025",
      status: 'active'
    },
    {
      id: "4",
      name: "October Challenge",
      memberCount: 32,
      yourRank: 1,
      yourTime: 24.5,
      endDate: "Oct 31, 2025",
      status: 'ended'
    }
  ];

  // Filter leagues based on status
  const leagues = filterStatus === 'all' 
    ? allLeagues 
    : allLeagues.filter(league => league.status === filterStatus);

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#2d332d] mb-0.5">Competitions</p>
              <h1 className="text-xl text-[#2d332d]">My Leagues</h1>
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

        {/* League Count */}
        <div className="mb-4">
          <h3 className="text-base text-[#2d332d]">
            {filterStatus === 'all' ? 'All Leagues' : 
             filterStatus === 'active' ? 'Active Leagues' :
             filterStatus === 'ended' ? 'Ended Leagues' :
             'Invited'} ({leagues.length})
          </h3>
        </div>

        {/* Leagues List */}
        {leagues.length > 0 ? (
          <div className="space-y-3 mb-32">
            {leagues.map((league) => (
              <div
                key={league.id}
                onClick={() => onLeagueClick(league.id)}
                className="bg-[#eef0ed] rounded-2xl p-4 cursor-pointer hover:bg-[#9ca895] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#2d332d]">{league.name}</h4>
                    <p className="text-sm text-[#2d332d]/60">{league.memberCount} members</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-[#2d332d]">#{league.yourRank}</p>
                    <p className="text-xs text-[#2d332d]/60">{league.yourTime}h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-[#2d332d]/30" />
              <p className="text-[#2d332d] mb-2">No leagues yet</p>
              <p className="text-sm text-[#2d332d]/70">Join or create a league to start competing!</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Bottom Right */}
      <div className="fixed bottom-8 right-4 flex flex-col gap-3 z-50">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onJoinLeague}
            className="w-20 h-20 rounded-full bg-[#2d2d2d] flex items-center justify-center transition-all shadow-lg"
          >
            <Search className="w-7 h-7 text-[#9ca895]" strokeWidth={2} />
          </button>
          <span className="text-xs text-[#2d2d2d]">Join</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onCreateLeague}
            className="w-20 h-20 rounded-full bg-[#2d2d2d] flex items-center justify-center transition-all shadow-lg"
          >
            <Plus className="w-7 h-7 text-[#9ca895]" strokeWidth={2} />
          </button>
          <span className="text-xs text-[#2d2d2d]">Create</span>
        </div>
      </div>
    </FloatingContent>
  );
}
