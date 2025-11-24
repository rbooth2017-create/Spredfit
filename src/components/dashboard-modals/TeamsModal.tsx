// src/components/dashboard-modals/TeamsModal.tsx
import { memo, useState, useEffect, useMemo } from "react";
import { Users, Plus, ArrowLeft, Check, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { APIClient } from "../../utils/api";

interface Team {
  id: string;
  name: string;
  league_id: string;
  created_at: string;
  member_count?: number;
}

interface LeagueMember {
  id: string;
  user_id: string;
  league_id: string;
  full_name: string;
  team_id?: string;
}

interface TeamsModalProps {
  leagueId: string;
  leagueName: string;
  accessToken: string;
  onClose: () => void;
}

function TeamsModalComponent({ leagueId, leagueName, accessToken, onClose }: TeamsModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'list' | 'create' | 'assign'>('list');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const api = useMemo(() => new APIClient(accessToken), [accessToken]);

  useEffect(() => {
    loadTeamsAndMembers();
  }, [leagueId]);

  const loadTeamsAndMembers = async () => {
    try {
      setLoading(true);
      // Load teams for this league
      const teamsData = await api.getLeagueTeams(leagueId);
      setTeams(teamsData);

      // Load league members
      const membersData = await api.getLeagueMembers(leagueId);
      setLeagueMembers(membersData);
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      await api.createTeam({
        name: newTeamName,
        league_id: leagueId,
      });

      toast.success('Team Created!', {
        description: `${newTeamName} has been created`,
      });

      setNewTeamName('');
      setStep('list');
      await loadTeamsAndMembers();
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error('Failed to create team');
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (window.confirm(`Are you sure you want to delete "${teamName}"?`)) {
      try {
        await api.deleteTeam(teamId);
        toast.success('Team Deleted', {
          description: `${teamName} has been deleted`,
        });
        await loadTeamsAndMembers();
      } catch (error) {
        console.error('Failed to delete team:', error);
        toast.error('Failed to delete team');
      }
    }
  };

 const handleAssignMembers = async () => {
  if (!selectedTeam || selectedMembers.size === 0) {
    toast.error('Please select members to assign');
    return;
  }

  try {
    await api.assignMembersToTeam(selectedTeam.id, Array.from(selectedMembers), leagueId);
    
    toast.success('Members Assigned!', {
      description: `${selectedMembers.size} member(s) assigned to ${selectedTeam.name}`,
    });

    setSelectedMembers(new Set());
    setSelectedTeam(null);
    setStep('list');
    await loadTeamsAndMembers();
  } catch (error) {
    console.error('Failed to assign members:', error);
    toast.error('Failed to assign members');
  }
};

  const getUnassignedMembers = () => {
    return leagueMembers.filter(member => !member.team_id);
  };

  const getTeamMembers = (teamId: string) => {
    return leagueMembers.filter(member => member.team_id === teamId);
  };

    const toggleMemberSelection = (userId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedMembers(newSelection);
  };

  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center">
            <p className="text-white text-sm">Loading teams...</p>
          </div>
        ) : step === 'list' ? (
          <div className="flex flex-col items-center text-center w-full h-full p-6">
            <p className="text-white text-sm mb-2 flex-shrink-0">{leagueName}</p>
            <p className="text-white/70 text-xs mb-4 flex-shrink-0">Teams</p>
            <div className="space-y-2 w-full px-2 flex-1 overflow-y-auto scrollbar-hide">
              {teams.length > 0 ? (
                teams.map((team) => {
                  const teamMembers = getTeamMembers(team.id);
                  return (
                    <div
                      key={team.id}
                      className="w-full p-3 rounded-2xl bg-[#2d332d]/60 backdrop-blur-sm border border-white/10"
                    >
                      <p className="text-white text-sm mb-1">{team.name}</p>
                      <p className="text-white/50 text-[10px] mb-2">
                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                      </p>
                      {teamMembers.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {teamMembers.map((member) => (
                            <p key={member.id} className="text-white/70 text-[9px]">
                              • {member.full_name}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedTeam(team);
                            setStep('assign');
                          }}
                          className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[10px] border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" strokeWidth={2} />
                          Assign
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          className="px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-sm text-red-200 text-[10px] border border-red-400/30 hover:bg-red-500/30 transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" strokeWidth={2} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-white/50 text-xs italic">No teams yet</p>
                  <p className="text-white/30 text-[10px] mt-2">Create a team to get started!</p>
                </div>
              )}
            </div>
          </div>
        ) : step === 'create' ? (
          <div className="flex flex-col items-center text-center w-full px-6 space-y-4">
            <p className="text-white text-sm">Create Team</p>
            <p className="text-white/70 text-xs">Enter team name</p>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="w-full px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-center placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
              maxLength={30}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center w-full h-full p-6">
            <p className="text-white text-sm mb-2 flex-shrink-0">Assign to {selectedTeam?.name}</p>
            <p className="text-white/70 text-xs mb-4 flex-shrink-0">
              Select members to assign
            </p>
            <div className="space-y-2 w-full px-2 flex-1 overflow-y-auto scrollbar-hide">
              {getUnassignedMembers().length > 0 ? (
                getUnassignedMembers().map((member) => (
                                 <button
                  key={member.user_id}
                  onClick={() => toggleMemberSelection(member.user_id)}
                  className={`w-full p-3 rounded-2xl backdrop-blur-sm border transition-all ${
                    selectedMembers.has(member.user_id)
                      ? 'bg-white/20 border-white/40'
                      : 'bg-[#2d332d]/60 border-white/10 hover:bg-[#2d332d]/80'
                  }`}
                >
                  <p className="text-white text-sm">{member.full_name}</p>
                </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-white/50 text-xs italic">All members assigned</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* External Buttons */}
      <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                if (step === 'list') {
                  onClose();
                } else {
                  setStep('list');
                  setSelectedMembers(new Set());
                  setSelectedTeam(null);
                }
              }}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
            >
              <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-[10px] text-center">Back</span>
          </div>

          {step === 'list' && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setStep('create')}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Plus className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Create</span>
            </div>
          )}

          {step === 'create' && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
                className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 shadow-lg ${
                  newTeamName.trim()
                    ? 'bg-[#2d2d2d] hover:bg-[#2d2d2d]/90'
                    : 'bg-[#2d2d2d]/20 opacity-40 cursor-not-allowed'
                }`}
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Create</span>
            </div>
          )}

          {step === 'assign' && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleAssignMembers}
                disabled={selectedMembers.size === 0}
                className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 shadow-lg ${
                  selectedMembers.size > 0
                    ? 'bg-[#2d2d2d] hover:bg-[#2d2d2d]/90'
                    : 'bg-[#2d2d2d]/20 opacity-40 cursor-not-allowed'
                }`}
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">
                Assign ({selectedMembers.size})
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const TeamsModal = memo(TeamsModalComponent);