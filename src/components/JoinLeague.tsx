import { useState } from "react";
import { ArrowLeft, Search, Users, Trophy, Clock, ChevronRight, Hash, Globe, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FloatingContent } from "./FloatingContent";

interface JoinLeagueProps {
  onBack: () => void;
  onJoin: (leagueId: string) => void;
}

interface AvailableLeague {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  endDate: string;
  isPublic: boolean;
}

export function JoinLeague({ onBack, onJoin }: JoinLeagueProps) {
  const [viewMode, setViewMode] = useState<'code' | 'browse'>('code');
  const [leagueCode, setLeagueCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSize, setFilterSize] = useState<'all' | 'small' | 'medium' | 'large'>('all');

  // Mock available public leagues
  const publicLeagues: AvailableLeague[] = [
    {
      id: "pub1",
      name: "Global Fitness Challenge",
      memberCount: 156,
      description: "Join fitness enthusiasts worldwide!",
      endDate: "Dec 31, 2025",
      isPublic: true
    },
    {
      id: "pub2",
      name: "City Runners League",
      memberCount: 43,
      description: "For runners in our city",
      endDate: "Nov 30, 2025",
      isPublic: true
    },
    {
      id: "pub3",
      name: "Morning Warriors",
      memberCount: 28,
      description: "Early morning workout crew",
      endDate: "Nov 30, 2025",
      isPublic: true
    },
    {
      id: "pub4",
      name: "Weekend Warriors",
      memberCount: 12,
      description: "Weekend fitness enthusiasts",
      endDate: "Nov 30, 2025",
      isPublic: true
    }
  ];

  const filteredLeagues = publicLeagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      league.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSize = filterSize === 'all' || 
      (filterSize === 'small' && league.memberCount < 30) ||
      (filterSize === 'medium' && league.memberCount >= 30 && league.memberCount < 100) ||
      (filterSize === 'large' && league.memberCount >= 100);
    
    return matchesSearch && matchesSize;
  });

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#2d332d] mb-0.5">Join Competition</p>
              <h1 className="text-xl text-[#2d332d]">Find League</h1>
            </div>
            <Trophy className="w-4 h-4 text-[#2d332d]/60" />
          </div>
        </div>

        {/* Action Buttons - 2x3 Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setViewMode('code')}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none ${
                viewMode === 'code'
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                  : "bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] border border-[#2d332d]/10"
              }`}
            >
              <Hash className="w-6 h-6" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#2d332d]">Code</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setViewMode('browse')}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none ${
                viewMode === 'browse'
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                  : "bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] border border-[#2d332d]/10"
              }`}
            >
              <Globe className="w-6 h-6" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#2d332d]">Browse</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setFilterSize('all')}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none ${
                filterSize === 'all'
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                  : "bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] border border-[#2d332d]/10"
              }`}
            >
              <Trophy className="w-6 h-6" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#2d332d]">All</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setFilterSize('small')}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none ${
                filterSize === 'small'
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                  : "bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] border border-[#2d332d]/10"
              }`}
            >
              <Users className="w-5 h-5" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#2d332d]">Small</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setFilterSize('medium')}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none ${
                filterSize === 'medium'
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                  : "bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] border border-[#2d332d]/10"
              }`}
            >
              <Users className="w-6 h-6" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#2d332d]">Medium</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setFilterSize('large')}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none ${
                filterSize === 'large'
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                  : "bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] border border-[#2d332d]/10"
              }`}
            >
              <Users className="w-7 h-7" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#2d332d]">Large</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="mb-32">
          {/* Enter Code View */}
          {viewMode === 'code' && (
            <div>
              <h3 className="text-base text-[#2d332d] mb-3">Enter League Code</h3>
              <div className="bg-[#eef0ed] rounded-3xl p-6">
                <p className="text-sm text-[#2d332d]/60 mb-4">
                  Have a league code? Enter it below to join instantly.
                </p>
                
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="LEAGUE-CODE-123"
                    value={leagueCode}
                    onChange={(e) => setLeagueCode(e.target.value.toUpperCase())}
                    className="bg-[#8a9881]/20 border-[#2d332d]/20 text-[#2d332d] placeholder:text-[#2d332d]/40 h-12 text-center tracking-wider"
                    maxLength={20}
                  />
                  
                  <Button
                    onClick={() => {
                      if (leagueCode.trim()) {
                        onJoin(leagueCode);
                      }
                    }}
                    disabled={!leagueCode.trim()}
                    className="w-full h-12 bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join League
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Browse View */}
          {viewMode === 'browse' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base text-[#2d332d]">
                  Available Leagues ({filteredLeagues.length})
                </h3>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2d332d]/40" />
                <Input
                  type="text"
                  placeholder="Search leagues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d] placeholder:text-[#2d332d]/40 h-10 pl-10 rounded-full"
                />
              </div>

              {/* Leagues List */}
              <div className="space-y-2">
                {filteredLeagues.map((league) => (
                  <div
                    key={league.id}
                    className="relative p-4 rounded-3xl bg-[#eef0ed] border border-[#2d332d]/5 hover:border-[#2d332d]/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base text-[#2d332d] mb-1">{league.name}</h3>
                        <p className="text-xs text-[#2d332d]/60 mb-2">{league.description}</p>
                        <div className="flex items-center gap-2 text-[#2d332d]/60">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">{league.memberCount} members</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#2d332d]/10">
                      <div className="flex items-center gap-2 text-xs text-[#2d332d]/60">
                        <Clock className="w-4 h-4" />
                        <span>Ends {league.endDate}</span>
                      </div>
                      <Button
                        onClick={() => onJoin(league.id)}
                        size="sm"
                        className="bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] h-8 gap-1"
                      >
                        Join
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredLeagues.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-[#2d332d]/30" />
                    <p className="text-[#2d332d] mb-2">No leagues found</p>
                    <p className="text-sm text-[#2d332d]/70">Try a different search or filter</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </FloatingContent>
  );
}
