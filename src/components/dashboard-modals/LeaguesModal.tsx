import { memo } from "react";
import { Users, Trophy, ArrowLeft, Check, EyeOff, Star, Share2, Copy } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner@2.0.3";

interface League {
  name: string;
  rank: number;
  totalMembers: number;
  id: string; // Add an ID to uniquely identify each league
}

interface Sport {
  name: string;
  icon: any;
}

interface LeaguesModalProps {
  modalStep: number;
  setModalStep: (step: number) => void;
  userLeagues: League[];
  selectedLeague: League | null;
  setSelectedLeague: (league: League | null) => void;
  joinLeagueCode: string;
  setJoinLeagueCode: (code: string) => void;
  newLeagueName: string;
  setNewLeagueName: (name: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  allowTeams: boolean;
  setAllowTeams: (value: boolean) => void;
  isPrivate: boolean;
  setIsPrivate: (value: boolean) => void;
  stealthMode: boolean;
  setStealthMode: (value: boolean) => void;
  doubleUp: boolean;
  setDoubleUp: (value: boolean) => void;
  sports: Sport[];
  selectedLeagueSports: string[];
  toggleLeagueSport: (sportName: string) => void;
  createdLeagueCode: string;
  setCreatedLeagueCode: (code: string) => void;
  stealthActivated: boolean;
  setStealthActivated: (value: boolean) => void;
  doubleUpActivated: boolean;
  setDoubleUpActivated: (value: boolean) => void;
  onClose: () => void;
}

function LeaguesModalComponent({
  modalStep,
  setModalStep,
  userLeagues,
  selectedLeague,
  setSelectedLeague,
  joinLeagueCode,
  setJoinLeagueCode,
  newLeagueName,
  setNewLeagueName,
  duration,
  setDuration,
  allowTeams,
  setAllowTeams,
  isPrivate,
  setIsPrivate,
  stealthMode,
  setStealthMode,
  doubleUp,
  setDoubleUp,
  sports,
  selectedLeagueSports,
  toggleLeagueSport,
  createdLeagueCode,
  setCreatedLeagueCode,
  stealthActivated,
  setStealthActivated,
  doubleUpActivated,
  setDoubleUpActivated,
  onClose,
}: LeaguesModalProps) {
  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
        {/* Step 1: Your Leagues List */}
        {modalStep === 1 && (
          <div className="flex flex-col items-center text-center w-full">
            <p className="text-white text-sm mb-4">Your Leagues</p>
            <div className="space-y-2 w-full px-4 max-h-52 overflow-y-auto scrollbar-hide">
              {userLeagues.length > 0 ? (
                userLeagues.map((league, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedLeague(league);
                      setModalStep(2);
                    }}
                    className="w-full p-3 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10 hover:bg-[#2d332d]/80 transition-all"
                  >
                    <p className="text-white text-sm mb-1">{league.name}</p>
                    <p className="text-white/70 text-xs">Rank #{league.rank} of {league.totalMembers}</p>
                  </button>
                ))
              ) : (
                <p className="text-white/50 text-xs italic">No leagues yet. Create or join one!</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: League Details */}
        {modalStep === 2 && selectedLeague && (
          <div className="flex flex-col items-center text-center w-full px-4">
            <p className="text-white text-sm mb-1">{selectedLeague.name}</p>
            <p className="text-white/70 text-xs mb-4">Your Rank: #{selectedLeague.rank}</p>
            <div className="space-y-2 w-full max-h-44 overflow-y-auto scrollbar-hide mb-4">
              <p className="text-white/50 text-xs italic">Leaderboard coming soon!</p>
            </div>
            <button
              onClick={() => setModalStep(1)}
              className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Join League */}
        {modalStep === 3 && (
          <div className="flex flex-col items-center text-center w-full px-6 space-y-4">
            <p className="text-white text-sm">Join League</p>
            <p className="text-white/70 text-xs">Enter league code</p>
            <input
              type="text"
              value={joinLeagueCode}
              onChange={(e) => setJoinLeagueCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-center placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 uppercase"
              maxLength={6}
            />
          </div>
        )}

        {/* Step 4: Create League */}
        {modalStep === 4 && (
          <div className="flex flex-col w-full h-full p-10 max-w-[280px]">
            <p className="text-white text-sm mb-3 text-center flex-shrink-0">Create League</p>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 mb-3 min-h-0">
              <input
                type="text"
                value={newLeagueName}
                onChange={(e) => setNewLeagueName(e.target.value)}
                placeholder="League name"
                className="w-full px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-center text-xs placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                maxLength={30}
              />
              
              {/* Duration selector */}
              <div className="space-y-1.5">
                <label className="text-white/80 text-[10px] block text-left">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <option value="1 week" className="bg-[#2d332d]">1 week</option>
                  <option value="2 weeks" className="bg-[#2d332d]">2 weeks</option>
                  <option value="1 month" className="bg-[#2d332d]">1 month</option>
                  <option value="3 months" className="bg-[#2d332d]">3 months</option>
                  <option value="6 months" className="bg-[#2d332d]">6 months</option>
                  <option value="1 year" className="bg-[#2d332d]">1 year</option>
                </select>
              </div>

              {/* Toggle options */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-[#2d332d]/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2">
                  <label className="text-white text-[10px]">Allow Teams</label>
                  <Switch checked={allowTeams} onCheckedChange={setAllowTeams} />
                </div>
                
                <div className="flex items-center justify-between bg-[#2d332d]/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2">
                  <label className="text-white text-[10px]">Private</label>
                  <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                </div>
                
                <div className="flex items-center justify-between bg-[#2d332d]/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2">
                  <div className="flex flex-col items-start">
                    <label className="text-white text-[10px]">Stealth Mode</label>
                    <span className="text-white/50 text-[8px]">Hide from leaderboard</span>
                  </div>
                  <Switch checked={stealthMode} onCheckedChange={setStealthMode} />
                </div>
                
                <div className="flex items-center justify-between bg-[#2d332d]/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2">
                  <div className="flex flex-col items-start">
                    <label className="text-white text-[10px]">Double Up Day</label>
                    <span className="text-white/50 text-[8px]">2x points on Saturdays</span>
                  </div>
                  <Switch checked={doubleUp} onCheckedChange={setDoubleUp} />
                </div>
              </div>

              {/* Sports Selection */}
              <div className="space-y-2">
                <label className="text-white/80 text-[10px] block text-left">Included Sports</label>
                <div className="grid grid-cols-2 gap-2">
                  {sports.map((sport) => {
                    const Icon = sport.icon;
                    const isSelected = selectedLeagueSports.includes(sport.name);
                    return (
                      <button
                        key={sport.name}
                        onClick={() => toggleLeagueSport(sport.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                          isSelected
                            ? 'bg-white/20 border-2 border-white/40'
                            : 'bg-white/5 border-2 border-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                        <span className="text-white text-[9px]">{sport.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-white/50 text-[8px] text-center">
                  {selectedLeagueSports.length} of {sports.length} sports selected
                </p>
              </div>

              {/* League code */}
              <div className="text-center">
                <p className="text-white/70 text-[9px] mb-1">Invite code:</p>
                <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 inline-block">
                  <span className="text-white text-xs">SPRD{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: League Created Confirmation */}
        {modalStep === 5 && (
          <div className="flex flex-col items-center justify-center w-full h-full p-10 max-w-[280px]">
            <div className="text-center space-y-4">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-white mb-2">League Created!</p>
                <p className="text-white/70 text-xs">{newLeagueName}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-white/70 text-[10px]">Share this code with friends:</p>
                <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-white">{createdLeagueCode}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* External Buttons - Step 1: Your Leagues List */}
      {modalStep === 1 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(3)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Users className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-xs text-center">Join</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(4)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Trophy className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-xs text-center">Create</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 2: League Detail View */}
      {modalStep === 2 && (
        <div className="fixed bottom-8 right-4 z-[60] flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {/* Explanatory Text */}
          <div className="flex flex-col gap-3">
            <div className="px-3 py-2 max-w-[180px]">
              <p className="text-white text-[9px] leading-tight">
                Stealth mode hides your activities for 3 days
              </p>
            </div>
            <div className="px-3 py-2 max-w-[180px]">
              <p className="text-white text-[9px] leading-tight">
                Double your workouts for that day (can use only once)
              </p>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  setStealthActivated(!stealthActivated);
                  toast.success(
                    !stealthActivated ? 'Stealth Activated!' : 'Stealth Deactivated',
                    {
                      description: !stealthActivated 
                        ? 'Your activities hidden for 3 days' 
                        : 'You\'re now visible on the leaderboard',
                    }
                  );
                }}
                className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-lg ${
                  stealthActivated
                    ? 'bg-white/30 border-2 border-white/50'
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                <EyeOff className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">
                {stealthActivated ? 'Stealth\nActivated' : 'Stealth\nMode'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  setDoubleUpActivated(!doubleUpActivated);
                  toast.success(
                    !doubleUpActivated ? 'Double Up Active!' : 'Double Up Deactivated',
                    {
                      description: !doubleUpActivated 
                        ? 'Double points for today\'s workout!' 
                        : 'Back to regular points',
                    }
                  );
                }}
                className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-lg ${
                  doubleUpActivated
                    ? 'bg-white/30 border-2 border-white/50'
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                <Star className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">
                {doubleUpActivated ? 'Double Up\nActive' : 'Double Up\nDay'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 3: Join League */}
      {modalStep === 3 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(1)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Back</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  if (joinLeagueCode.length >= 4) {
                    toast.success('Joined League!', {
                      description: `You've joined with code ${joinLeagueCode}`,
                    });
                    onClose();
                  } else {
                    toast.error('Please enter a valid code');
                  }
                }}
                className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 shadow-lg ${
                  joinLeagueCode.length >= 4
                    ? 'bg-[#2d2d2d] hover:bg-[#2d2d2d]/90'
                    : 'bg-white/10 opacity-50 cursor-not-allowed'
                }`}
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Join</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 4: Create League */}
      {modalStep === 4 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(1)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Back</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  if (newLeagueName.trim()) {
                    const code = `SPRD${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
                    setCreatedLeagueCode(code);
                    setModalStep(5);
                  }
                }}
                disabled={!newLeagueName.trim()}
                className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 shadow-lg ${
                  newLeagueName.trim()
                    ? 'bg-[#2d2d2d] hover:bg-[#2d2d2d]/90'
                    : 'bg-[#2d2d2d]/20 opacity-40 cursor-not-allowed'
                }`}
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Create</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 5: League Created Confirmation */}
      {modalStep === 5 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(createdLeagueCode);
                    toast.success('Code Copied!', {
                      description: `${createdLeagueCode} copied to clipboard`,
                    });
                  } catch (error) {
                    // Fallback if clipboard API fails
                    toast.info('League Code', {
                      description: createdLeagueCode,
                      duration: 5000,
                    });
                  }
                }}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Copy className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Copy<br/>Code</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Join my SPREDfit League!',
                        text: `Join "${newLeagueName}" on SPREDfit with code: ${createdLeagueCode}`,
                      });
                    } catch (error) {
                      // User cancelled or share failed, show toast with code
                      if (error instanceof Error && error.name !== 'AbortError') {
                        toast.info('Share Code', {
                          description: `Code: ${createdLeagueCode}`,
                          duration: 5000,
                        });
                      }
                    }
                  } else {
                    // Fallback: show code in toast
                    toast.info('Share Code', {
                      description: `Code: ${createdLeagueCode}`,
                      duration: 5000,
                    });
                  }
                }}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Share2 className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Share</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Done</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const LeaguesModal = memo(LeaguesModalComponent);