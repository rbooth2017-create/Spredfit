import { memo, useEffect, useState, useMemo } from "react";
import { Users, Trophy, ArrowLeft, Check, EyeOff, Star, Share2, Copy, Settings, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../../utils/AppContext";
import { useAuth } from "../../utils/auth";
import { APIClient } from "../../utils/api";
import { TeamsModal } from './TeamsModal';

// ✅ Switch component - with forced animation
function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCheckedChange(!checked);
      }}
      style={{
        backgroundColor: checked ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)',
      }}
      className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2"
    >
      <span
        aria-hidden="true"
        style={{
          transform: checked ? 'translateX(1rem)' : 'translateX(0)',
        }}
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out"
      />
    </button>
  );
}

interface League {
  name: string;
  rank: number;
  totalMembers: number;
  id: string;
  isManager?: boolean;
  code?: string;
  ownerId?: string;
  allowStealthMode?: boolean;
  allowDoubleUp?: boolean;
}

interface Sport {
  name: string;
  icon: any;
}

interface MembershipStatus {
  stealthUntil: string | null;
  inStealthMode: boolean;
  doubleUpDate: string | null;
  doubleUpUsed: boolean;
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
  const { createLeague, refreshLeagues } = useApp();
  const { accessToken, profile } = useAuth();
  
  // Teams modal state
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [selectedLeagueForTeams, setSelectedLeagueForTeams] = useState<{ id: string; name: string } | null>(null);

  // Membership status for selected league
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Memoize API client
  const api = useMemo(() => {
    if (!accessToken) return null;
    return new APIClient(accessToken);
  }, [accessToken]);

  // Load membership status when viewing a league
  useEffect(() => {
    const loadMembershipStatus = async () => {
      if (!selectedLeague || modalStep !== 2 || !api) return;
      
      setLoadingStatus(true);
      try {
        const status = await api.getLeagueMembershipStatus(selectedLeague.id);
        setMembershipStatus(status);
        
        // Update local state based on DB status
        const now = new Date();
        const isStealthActive = status.stealthUntil && new Date(status.stealthUntil) > now;
        setStealthActivated(!!isStealthActive);
        
        const isTodayDoubleUp = status.doubleUpDate && 
          new Date(status.doubleUpDate).toDateString() === now.toDateString();
        setDoubleUpActivated(!!isTodayDoubleUp);
      } catch (error) {
        console.error('Failed to load membership status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };

    loadMembershipStatus();
  }, [selectedLeague?.id, modalStep, api]);

 // Fetch league properties when viewing a league
useEffect(() => {
  if (!selectedLeague || modalStep !== 2) return;
  
  const fullLeague = userLeagues.find(l => l.id === selectedLeague.id);
  
  console.log('🔍 useEffect running - selectedLeague.id:', selectedLeague.id);
  console.log('🔍 userLeagues length:', userLeagues.length);
  console.log('🔍 Found fullLeague:', fullLeague);
  
  if (fullLeague) {
    console.log('🔍 fullLeague.allowStealthMode:', fullLeague.allowStealthMode);
    console.log('🔍 fullLeague.allowDoubleUp:', fullLeague.allowDoubleUp);
    console.log('🔍 selectedLeague.allowStealthMode:', selectedLeague.allowStealthMode);
    console.log('🔍 selectedLeague.allowDoubleUp:', selectedLeague.allowDoubleUp);
    
    // Check if we need to update
    const needsUpdate = 
      selectedLeague.allowStealthMode === undefined ||
      selectedLeague.allowDoubleUp === undefined ||
      selectedLeague.allowStealthMode !== fullLeague.allowStealthMode ||
      selectedLeague.allowDoubleUp !== fullLeague.allowDoubleUp ||
      !selectedLeague.code;
    
    console.log('🔍 needsUpdate:', needsUpdate);
    
    if (needsUpdate) {
      console.log('🔄 Updating selectedLeague with properties from userLeagues');
      setSelectedLeague({
        ...selectedLeague,
        code: fullLeague.code || fullLeague.leagueCode,
        allowStealthMode: fullLeague.allowStealthMode,
        allowDoubleUp: fullLeague.allowDoubleUp,
        ownerId: fullLeague.ownerId,
      });
    }
  } else {
    console.log('❌ fullLeague not found in userLeagues!');
  }
}, [selectedLeague?.id, userLeagues, modalStep]);

  // Calculate stealth time remaining
  const getStealthTimeRemaining = () => {
    if (!membershipStatus?.stealthUntil) return null;
    
    const now = new Date();
    const end = new Date(membershipStatus.stealthUntil);
    
    if (end <= now) return null;
    
    const diffMs = end.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    }
    return `${diffHours}h`;
  };

  const handleStealthToggle = async () => {
    if (!selectedLeague || !api) return;

    // Check if league allows stealth mode
    if (!selectedLeague.allowStealthMode) {
      toast.error('Stealth mode not enabled for this league');
      return;
    }

    try {
      const now = new Date();
      const isCurrentlyActive = membershipStatus?.stealthUntil && new Date(membershipStatus.stealthUntil) > now;

      if (isCurrentlyActive) {
        // Deactivate stealth
        await api.deactivateStealth(selectedLeague.id);
        setStealthActivated(false);
        setMembershipStatus({
          ...membershipStatus!,
          stealthUntil: null,
          inStealthMode: false,
        });
        
        toast.success('Stealth Deactivated', {
          description: 'You\'re now visible on the leaderboard',
        });
      } else {
        // Activate stealth
        const result = await api.activateStealth(selectedLeague.id);
        setStealthActivated(true);
        setMembershipStatus({
          ...membershipStatus!,
          stealthUntil: result.stealth_until,
          inStealthMode: true,
        });
        
        toast.success('Stealth Activated!', {
          description: 'Your activities hidden for 3 days',
        });
      }
    } catch (error) {
      console.error('Failed to toggle stealth mode:', error);
      toast.error('Failed to update stealth mode', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleDoubleUpToggle = async () => {
    if (!selectedLeague || !api) return;

    // Check if league allows double up
    if (!selectedLeague.allowDoubleUp) {
      toast.error('Double Up Day not enabled for this league');
      return;
    }

    // Check if already used
    if (membershipStatus?.doubleUpUsed) {
      toast.error('Double Up already used', {
        description: 'You can only use Double Up once per league',
      });
      return;
    }

    // Check if already active today
    const now = new Date();
    const isTodayDoubleUp = membershipStatus?.doubleUpDate && 
      new Date(membershipStatus.doubleUpDate).toDateString() === now.toDateString();

    if (isTodayDoubleUp) {
      toast.info('Double Up already active for today');
      return;
    }

    // Confirm activation
    const confirmed = window.confirm(
      'Activate Double Up Day?\n\nAll workouts logged today will count for 2x points. This can only be used once!'
    );

    if (!confirmed) return;

    try {
      const result = await api.activateDoubleUp(selectedLeague.id);
      setDoubleUpActivated(true);
      setMembershipStatus({
        ...membershipStatus!,
        doubleUpDate: result.double_up_date,
        doubleUpUsed: true,
      });
      
      toast.success('Double Up Active!', {
        description: 'All workouts today will count for 2x points!',
      });
    } catch (error) {
      console.error('Failed to activate double up:', error);
      toast.error('Failed to activate Double Up', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    if (window.confirm('Are you sure you want to leave this league?')) {
      try {
        if (!accessToken) {
          toast.error('Authentication required');
          return;
        }
        
        const api = new APIClient(accessToken);
        await api.leaveLeague(leagueId);
        
        toast.success('Left League', {
          description: 'You have left the league',
        });
        
        await refreshLeagues();
      } catch (error) {
        console.error('Failed to leave league:', error);
        toast.error('Failed to leave league', {
          description: error instanceof Error ? error.message : 'Please try again',
        });
      }
    }
  };

  const handleCreateLeague = async () => {
    if (!newLeagueName.trim()) {
      toast.error('Please enter a league name');
      return;
    }
  
    try {
      console.log('🏆 Creating league:', newLeagueName);
      console.log('🔧 Toggle states:', { 
        isPrivate, 
        allowTeams, 
        stealthMode, 
        doubleUp 
      });
     
      // Calculate dates based on duration
      const startDate = new Date().toISOString();
      let endDate = new Date();
      
      switch (duration) {
        case '1 week':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case '2 weeks':
          endDate.setDate(endDate.getDate() + 14);
          break;
        case '1 month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case '3 months':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case '6 months':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case '1 year':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      const result = await createLeague({
        name: newLeagueName,
        description: '',
        startDate: startDate,
        endDate: endDate.toISOString(),
        isPrivate: isPrivate,
        allowedSports: selectedLeagueSports.length > 0 ? selectedLeagueSports : null,
        allowTeams: allowTeams,
        allowStealthMode: stealthMode,
        allowDoubleUp: doubleUp,
      });
  
      console.log('✅ League created:', result);
      setCreatedLeagueCode(result.league_code);
      await refreshLeagues();
      setModalStep(5);
      
      toast.success('League Created!', {
        description: `Share code ${result.league_code} with friends`,
      });
    } catch (error) {
      console.error('❌ Failed to create league:', error);
      toast.error('Failed to create league', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  // Render stealth button status
  const renderStealthStatus = () => {
    if (loadingStatus) return 'Loading...';
    
    if (!selectedLeague?.allowStealthMode) {
      return 'Not Available';
    }

    const timeRemaining = getStealthTimeRemaining();
    if (timeRemaining) {
      return `Active\n${timeRemaining}`;
    }
    
    return 'Stealth\nMode';
  };

  // Render double up button status
  const renderDoubleUpStatus = () => {
    if (loadingStatus) return 'Loading...';
    
    if (!selectedLeague?.allowDoubleUp) {
      return 'Not Available';
    }

    if (membershipStatus?.doubleUpUsed) {
      return 'Already\nUsed';
    }

    if (doubleUpActivated) {
      return 'Active\nToday!';
    }
    
    return 'Double Up\nDay';
  };

  return (
    <>
      {/* Teams Modal Overlay */}
      {showTeamsModal && selectedLeagueForTeams && accessToken && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70]" onClick={(e) => e.stopPropagation()}>
          <TeamsModal
            leagueId={selectedLeagueForTeams.id}
            leagueName={selectedLeagueForTeams.name}
            accessToken={accessToken}
            onClose={() => {
              setShowTeamsModal(false);
              setSelectedLeagueForTeams(null);
            }}
          />
        </div>
      )}

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
            <p className="text-white text-[20px] mb-4">{selectedLeague.name}</p>
            <p className="text-white/70 text-s mb-2">Your Rank: #{selectedLeague.rank}</p>
            {selectedLeague.code && (
              <p className="text-white/50 text-[30px] mb-4">Code: {selectedLeague.code}</p>
            )}
            <div className="space-y-2 w-full max-h-44 overflow-y-auto scrollbar-hide mb-4">
              
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
                    <span className="text-white/50 text-[8px]">Hide for 3 days</span>
                  </div>
                  <Switch checked={stealthMode} onCheckedChange={setStealthMode} />
                </div>
                
                <div className="flex items-center justify-between bg-[#2d332d]/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2">
                  <div className="flex flex-col items-start">
                    <label className="text-white text-[10px]">Double Up Day</label>
                    <span className="text-white/50 text-[8px]">2x points (one-time)</span>
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

              {/* League code preview */}
              <div className="text-center">
                <p className="text-white/70 text-[9px] mb-1">Your invite code will be:</p>
                <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 inline-block">
                  <span className="text-white text-xs">Generated on creation</span>
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

        {/* Step 6: Manage Leagues */}
        {modalStep === 6 && (() => {
          const managedLeagues = userLeagues;
          return (
            <div className="flex flex-col items-center text-center w-full h-full p-6">
              <p className="text-white text-sm mb-4 flex-shrink-0">Manage Leagues</p>
              <div className="space-y-2 w-full px-2 flex-1 overflow-y-auto scrollbar-hide">
                {managedLeagues.length > 0 ? (
                  managedLeagues.map((league, idx) => (
                    <div
                      key={idx}
                      className="w-full p-3 rounded-2xl bg-[#2d332d]/60 backdrop-blur-sm border border-white/10"
                    >
                      <p className="text-white text-sm mb-1">{league.name}</p>
                      <p className="text-white/50 text-[10px] mb-2">Code: {league.code || 'Loading...'}</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={async () => {
                            const code = league.code || '';
                            if (!code) {
                              toast.error('League code not available');
                              return;
                            }
                            try {
                              await navigator.clipboard.writeText(code);
                              toast.success('Code Copied!', {
                                description: `${code} copied to clipboard`,
                              });
                            } catch (error) {
                              toast.info('League Code', {
                                description: code,
                                duration: 5000,
                              });
                            }
                          }}
                          className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[10px] border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" strokeWidth={2} />
                          Copy
                        </button>
                        <button
                          onClick={async () => {
                            const code = league.code || '';
                            if (!code) {
                              toast.error('League code not available');
                              return;
                            }
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: 'Join my SPREDfit League!',
                                  text: `Join "${league.name}" on SPREDfit with code: ${code}`,
                                });
                              } catch (error) {
                                if (error instanceof Error && error.name !== 'AbortError') {
                                  toast.info('Share Code', {
                                    description: `Code: ${code}`,
                                    duration: 5000,
                                  });
                                }
                              }
                            } else {
                              toast.info('Share Code', {
                                description: `Code: ${code}`,
                                duration: 5000,
                              });
                            }
                          }}
                          className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[10px] border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1"
                        >
                          <Share2 className="w-3 h-3" strokeWidth={2} />
                          Share
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLeagueForTeams({ id: league.id, name: league.name });
                            setShowTeamsModal(true);
                          }}
                          className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[10px] border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" strokeWidth={2} />
                          Teams
                        </button>
                        {league.ownerId === profile?.id ? (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete "${league.name}"?\n\nThis action cannot be undone.`)) {
                                try {
                                  if (!accessToken) {
                                    toast.error('Authentication required');
                                    return;
                                  }
                                  
                                  const api = new APIClient(accessToken);
                                  await api.deleteLeague(league.id);
                                  
                                  toast.success('League Deleted', {
                                    description: `"${league.name}" has been deleted`,
                                  });
                                  
                                  await refreshLeagues();
                                } catch (error) {
                                  console.error('Failed to delete league:', error);
                                  toast.error('Failed to delete league', {
                                    description: error instanceof Error ? error.message : 'Please try again',
                                  });
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-sm text-red-200 text-[10px] border border-red-400/30 hover:bg-red-500/30 transition-all flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" strokeWidth={2} />
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeaveLeague(league.id)}
                            className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[10px] border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" strokeWidth={2} />
                            Leave
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-white/50 text-xs italic">You don't manage any leagues yet.</p>
                    <p className="text-white/30 text-[10px] mt-2">Create a league to manage it!</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* External Buttons - Step 1: Your Leagues List */}
      {modalStep === 1 && (
        <>
          {/* Left side - Manage button */}
          <div className="fixed bottom-8 left-4 z-[60]" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(6)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Settings className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-xs text-center">Manage</span>
            </div>
          </div>

          {/* Right side - Join and Create buttons */}
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
        </>
      )}

      {/* External Buttons - Step 2: League Detail View */}
      {modalStep === 2 && (
        <>
          {console.log('🔍 Button render - selectedLeague:', selectedLeague)}
          {console.log('🔍 Button render - allowStealthMode:', selectedLeague?.allowStealthMode)}
          {console.log('🔍 Button render - allowDoubleUp:', selectedLeague?.allowDoubleUp)}
          {console.log('🔍 Button render - loadingStatus:', loadingStatus)}
          
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
                  onClick={handleStealthToggle}
                  disabled={!selectedLeague?.allowStealthMode || loadingStatus}
                  className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-lg ${
                    !selectedLeague?.allowStealthMode || loadingStatus
                      ? 'bg-white/5 border border-white/10 opacity-50 cursor-not-allowed'
                      : stealthActivated
                      ? 'bg-white/30 border-2 border-white/50'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <EyeOff className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center whitespace-pre-line">
                  {renderStealthStatus()}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleDoubleUpToggle}
                  disabled={
                    !selectedLeague?.allowDoubleUp || 
                    loadingStatus || 
                    membershipStatus?.doubleUpUsed === true
                  }
                  className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-lg ${
                    !selectedLeague?.allowDoubleUp || loadingStatus || membershipStatus?.doubleUpUsed
                      ? 'bg-white/5 border border-white/10 opacity-50 cursor-not-allowed'
                      : doubleUpActivated
                      ? 'bg-white/30 border-2 border-white/50'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Star className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center whitespace-pre-line">
                  {renderDoubleUpStatus()}
                </span>
              </div>
            </div>
          </div>
        </>
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
                onClick={async () => {
                  if (joinLeagueCode.length >= 4) {
                    try {
                      const api = new APIClient(accessToken!);
                      await api.joinLeague(joinLeagueCode);
                      toast.success('Joined League!', {
                        description: `You've joined with code ${joinLeagueCode}`,
                      });
                      await refreshLeagues();
                      setJoinLeagueCode('');
                      setModalStep(1);
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to join league');
                    }
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
                onClick={handleCreateLeague}
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
                      if (error instanceof Error && error.name !== 'AbortError') {
                        toast.info('Share Code', {
                          description: `Code: ${createdLeagueCode}`,
                          duration: 5000,
                        });
                      }
                    }
                  } else {
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

      {/* External Buttons - Step 6: Manage Leagues */}
      {modalStep === 6 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setModalStep(1)}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
            >
              <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-[10px] text-center">Back</span>
          </div>
        </div>
      )}
    </>
  );
}

export const LeaguesModal = memo(LeaguesModalComponent);