import { useState } from "react";
import {
  ArrowLeft,
  Users,
  Clock,
  Trophy,
  Trash2,
  Eye,
  EyeOff,
  Edit2,
  UserMinus,
  ChevronRight,
  UsersRound,
  Plus,
  X,
  Gift,
  Zap,
  UserX,
  Share2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { orderedSports } from "./sportIcons";
import { Switch } from "./ui/switch";
import { SPREDfitFooter } from "./SPREDfitFooter";
import { Input } from "./ui/input";

interface ManageLeaguesProps {
  onBack: () => void;
  onUserClick?: (
    userId: number,
    userName: string,
    userAvatar: string,
    userInitials: string,
  ) => void;
}

interface ManagedLeague {
  id: string;
  name: string;
  memberCount: number;
  endDate: string;
  isPrivate: boolean;
  allowedSports: string[];
  leagueCode: string;
  members: Member[];
  useTeams: boolean;
  teams: Team[];
  allowDoubleUpDay: boolean;
  allowBonusHours: boolean;
  allowStealthMode: boolean;
}

interface Member {
  id: string;
  name: string;
  rank: number;
  totalTime: number;
  avatar: string;
  teamId?: string;
  bonusHours?: number;
  hasUsedDoubleUp?: boolean;
  isInStealthMode?: boolean;
  stealthDaysRemaining?: number;
}

interface Team {
  id: string;
  name: string;
  color: string;
}

export function ManageLeagues({
  onBack,
  onUserClick,
}: ManageLeaguesProps) {
  // Mock managed leagues
  const [leagues, setLeagues] = useState<ManagedLeague[]>([
    {
      id: "lg1",
      name: "Team Alpha Challenge",
      memberCount: 12,
      endDate: "Nov 30, 2025",
      isPrivate: false,
      allowedSports: orderedSports,
      leagueCode: "ALPH-A123-XYZ9",
      useTeams: true,
      allowDoubleUpDay: true,
      allowBonusHours: true,
      allowStealthMode: true,
      teams: [
        { id: "t1", name: "Thunder", color: "#10b981" },
        { id: "t2", name: "Lightning", color: "#3b82f6" },
      ],
      members: [
        {
          id: "1",
          name: "Alex Rivera",
          rank: 1,
          totalTime: 18.5,
          avatar: "",
          teamId: "t1",
          bonusHours: 1,
          hasUsedDoubleUp: true,
          isInStealthMode: false,
        },
        {
          id: "2",
          name: "Jordan Lee",
          rank: 2,
          totalTime: 16.2,
          avatar: "",
          teamId: "t2",
          bonusHours: 0,
          hasUsedDoubleUp: false,
          isInStealthMode: true,
          stealthDaysRemaining: 2,
        },
        {
          id: "3",
          name: "Sam Chen",
          rank: 3,
          totalTime: 14.8,
          avatar: "",
          teamId: "t1",
          bonusHours: 0,
          hasUsedDoubleUp: false,
          isInStealthMode: false,
        },
        {
          id: "4",
          name: "Taylor Kim",
          rank: 4,
          totalTime: 12.1,
          avatar: "",
          bonusHours: 0.5,
          hasUsedDoubleUp: false,
          isInStealthMode: false,
        },
      ],
    },
    {
      id: "lg2",
      name: "Private Fitness Group",
      memberCount: 6,
      endDate: "Dec 15, 2025",
      isPrivate: true,
      allowedSports: ["Running", "Cycling", "Swimming"],
      leagueCode: "PRIV-8765-QWE4",
      useTeams: false,
      allowDoubleUpDay: false,
      allowBonusHours: false,
      allowStealthMode: false,
      teams: [],
      members: [
        {
          id: "5",
          name: "Morgan Davis",
          rank: 1,
          totalTime: 22.3,
          avatar: "",
          bonusHours: 0,
          hasUsedDoubleUp: false,
          isInStealthMode: false,
        },
        {
          id: "6",
          name: "Casey Wilson",
          rank: 2,
          totalTime: 19.7,
          avatar: "",
          bonusHours: 0,
          hasUsedDoubleUp: false,
          isInStealthMode: false,
        },
      ],
    },
  ]);

  const [selectedLeague, setSelectedLeague] =
    useState<ManagedLeague | null>(null);
  const [showMembersDialog, setShowMembersDialog] =
    useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);
  const [showTeamsDialog, setShowTeamsDialog] = useState(false);
  const [showBonusHoursDialog, setShowBonusHoursDialog] =
    useState(false);
  const [editedSports, setEditedSports] = useState<string[]>(
    [],
  );
  const [editedPrivate, setEditedPrivate] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeams, setEditingTeams] = useState<Team[]>([]);
  const [bonusHoursInput, setBonusHoursInput] = useState<{
    [key: string]: string;
  }>({});

  const handleViewMembers = (league: ManagedLeague) => {
    setSelectedLeague(league);
    setShowMembersDialog(true);
  };

  const handleEditLeague = (league: ManagedLeague) => {
    setSelectedLeague(league);
    setEditedSports([...league.allowedSports]);
    setEditedPrivate(league.isPrivate);
    setShowEditDialog(true);
  };

  const handleDeleteLeague = (league: ManagedLeague) => {
    setSelectedLeague(league);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedLeague) {
      setLeagues(
        leagues.filter((l) => l.id !== selectedLeague.id),
      );
      setShowDeleteDialog(false);
      setSelectedLeague(null);
    }
  };

  const handleTogglePrivacy = (leagueId: string) => {
    setLeagues(
      leagues.map((league) =>
        league.id === leagueId
          ? { ...league, isPrivate: !league.isPrivate }
          : league,
      ),
    );
  };

  const handleShareLeague = async (league: ManagedLeague) => {
    const shareUrl = `https://www.spredfit.com/join/${league.leagueCode}`;
    const shareText = `Join "${league.name}" on SPREDfit! ${shareUrl} Code: ${league.leagueCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(shareText);
        alert('League code and URL copied to clipboard!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        alert('Unable to copy to clipboard');
      }
    }
  };

  const handleSportToggle = (sport: string) => {
    if (editedSports.includes(sport)) {
      setEditedSports(editedSports.filter((s) => s !== sport));
    } else {
      setEditedSports([...editedSports, sport]);
    }
  };

  const handleSelectAllSports = () => {
    if (editedSports.length === orderedSports.length) {
      setEditedSports([]);
    } else {
      setEditedSports(orderedSports);
    }
  };

  const saveEditedLeague = () => {
    if (selectedLeague) {
      setLeagues(
        leagues.map((league) =>
          league.id === selectedLeague.id
            ? {
                ...league,
                allowedSports: editedSports,
                isPrivate: editedPrivate,
              }
            : league,
        ),
      );
      setShowEditDialog(false);
      setSelectedLeague(null);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (selectedLeague) {
      const updatedLeague = {
        ...selectedLeague,
        members: selectedLeague.members.filter(
          (m) => m.id !== memberId,
        ),
        memberCount: selectedLeague.memberCount - 1,
      };
      setSelectedLeague(updatedLeague);
      setLeagues(
        leagues.map((l) =>
          l.id === selectedLeague.id ? updatedLeague : l,
        ),
      );
    }
  };

  const handleManageTeams = (league: ManagedLeague) => {
    setSelectedLeague(league);
    setEditingTeams([...league.teams]);
    setShowTeamsDialog(true);
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;

    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ];
    const newTeam: Team = {
      id: `t${Date.now()}`,
      name: newTeamName,
      color: colors[editingTeams.length % colors.length],
    };

    setEditingTeams([...editingTeams, newTeam]);
    setNewTeamName("");
  };

  const handleRemoveTeam = (teamId: string) => {
    setEditingTeams(
      editingTeams.filter((t) => t.id !== teamId),
    );
  };

  const handleAssignTeam = (
    memberId: string,
    teamId: string | null,
  ) => {
    if (selectedLeague) {
      const updatedMembers = selectedLeague.members.map((m) =>
        m.id === memberId ? { ...m, teamId } : m,
      );
      const updatedLeague = {
        ...selectedLeague,
        members: updatedMembers,
      };
      setSelectedLeague(updatedLeague);
      setLeagues(
        leagues.map((l) =>
          l.id === selectedLeague.id ? updatedLeague : l,
        ),
      );
    }
  };

  const saveTeams = () => {
    if (selectedLeague) {
      // Remove team assignments for deleted teams
      const validTeamIds = editingTeams.map((t) => t.id);
      const updatedMembers = selectedLeague.members.map(
        (m) => ({
          ...m,
          teamId:
            m.teamId && validTeamIds.includes(m.teamId)
              ? m.teamId
              : undefined,
        }),
      );

      const updatedLeague = {
        ...selectedLeague,
        teams: editingTeams,
        members: updatedMembers,
      };

      setLeagues(
        leagues.map((l) =>
          l.id === selectedLeague.id ? updatedLeague : l,
        ),
      );
      setSelectedLeague(updatedLeague);
      setShowTeamsDialog(false);
    }
  };

  const handleManageBonusHours = (league: ManagedLeague) => {
    setSelectedLeague(league);
    // Initialize bonus hours input with current values
    const initialValues: { [key: string]: string } = {};
    league.members.forEach((member) => {
      initialValues[member.id] = (
        member.bonusHours || 0
      ).toString();
    });
    setBonusHoursInput(initialValues);
    setShowBonusHoursDialog(true);
  };

  const saveBonusHours = () => {
    if (selectedLeague) {
      const updatedMembers = selectedLeague.members.map(
        (m) => ({
          ...m,
          bonusHours: parseFloat(bonusHoursInput[m.id] || "0"),
        }),
      );

      const updatedLeague = {
        ...selectedLeague,
        members: updatedMembers,
      };

      setLeagues(
        leagues.map((l) =>
          l.id === selectedLeague.id ? updatedLeague : l,
        ),
      );
      setSelectedLeague(updatedLeague);
      setShowBonusHoursDialog(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#8a9881] text-[#2d332d] flex flex-col">
      {/* Halftone pattern overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-full max-w-md" style={{ top: '-10vh', left: '-15%', transform: 'scale(2)' }}>
          <svg className="w-full h-auto" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.9" className="dot-pulsate">
              {Array.from({ length: 40 }).map((_, row) => {
                return Array.from({ length: 40 }).map((_, col) => {
                  const x = (col / 39) * 400;
                  const y = (row / 39) * 400;
                  const dx = x - 200;
                  const dy = y - 200;
                  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                  const maxRadius = 180;
                  if (distanceFromCenter > maxRadius) return null;
                  const normalizedDistance = distanceFromCenter / maxRadius;
                  let dotRadius;
                  if (normalizedDistance < 0.3) {
                    dotRadius = 2.5 - (normalizedDistance * 2);
                  } else if (normalizedDistance < 0.6) {
                    dotRadius = 1.8 - (normalizedDistance * 1.5);
                  } else {
                    dotRadius = 0.8 - ((normalizedDistance - 0.6) * 1.5);
                  }
                  dotRadius = Math.max(0.3, dotRadius);
                  return (
                    <circle
                      key={`${row}-${col}`}
                      cx={x}
                      cy={y}
                      r={dotRadius}
                      fill="#2d332d"
                    />
                  );
                });
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Decorative geometric circles */}
      <div className="absolute top-8 right-4 w-24 h-24 rounded-full bg-[#9ca895] opacity-40 blur-2xl pointer-events-none" />
      <div className="absolute bottom-16 left-4 w-20 h-20 rounded-full bg-[#7a8872] opacity-30 blur-xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 px-4 py-5 max-w-md mx-auto flex flex-col h-full w-full">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="icon"
                className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#8a9881]/30 h-8 w-8 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <p className="text-[10px] text-[#2d332d] mb-0.5">Admin Dashboard</p>
                <h1 className="text-xl text-[#2d332d]">Manage Leagues</h1>
              </div>
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

        {/* Leagues List - Scrollable */}
        <div className="overflow-hidden flex flex-col min-h-0 flex-1">
          <h3 className="text-base text-[#eef0ed] mb-3 flex-shrink-0">Your Leagues</h3>
          <div className="overflow-y-auto flex-1 space-y-3 lozenge-scrollbar">
            {leagues.length === 0 ? (
              <div className="bg-[#eef0ed] rounded-3xl p-8">
                <div className="text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-[#2d332d]/30" />
                  <p className="text-[#2d332d]/60 mb-2">
                    No leagues created yet
                  </p>
                  <p className="text-sm text-[#2d332d]/40">
                    Create a league to get started
                  </p>
                </div>
              </div>
            ) : (
              leagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-[#eef0ed] rounded-3xl p-5 border border-[#2d332d]/10"
                >
                  {/* League Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg text-[#2d332d]">{league.name}</h3>
                        {league.isPrivate ? (
                          <Badge className="bg-[#2d332d]/10 text-[#2d332d] border-[#2d332d]/20 text-xs">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Private
                          </Badge>
                        ) : (
                          <Badge className="bg-[#2d332d]/10 text-[#2d332d] border-[#2d332d]/20 text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[#2d332d]/60 text-sm mb-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {league.memberCount} members
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Ends {league.endDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[#2d332d]/40 font-mono">
                          {league.leagueCode}
                        </p>
                        <Button
                          onClick={() => handleShareLeague(league)}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-[#2d332d]/40 hover:text-[#2d332d] hover:bg-[#8a9881]/30"
                          title="Share league code"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sports */}
                  <div className="mb-4 pb-4 border-b border-[#2d332d]/10">
                    <p className="text-xs text-[#2d332d]/60 mb-2">
                      Allowed Sports:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {league.allowedSports.length ===
                      orderedSports.length ? (
                        <Badge className="bg-[#9ca895] text-[#2d332d] border-[#2d332d]/10 text-xs">
                          All Sports
                        </Badge>
                      ) : (
                        league.allowedSports.map((sport) => (
                          <Badge
                            key={sport}
                            className="bg-[#9ca895] text-[#2d332d] border-[#2d332d]/10 text-xs"
                          >
                            {sport}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Team Info */}
                  {league.useTeams && (
                    <div className="mb-4 pb-4 border-b border-[#2d332d]/10">
                      <p className="text-xs text-[#2d332d]/60 mb-2">
                        Teams:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {league.teams.length === 0 ? (
                          <span className="text-xs text-[#2d332d]/40">
                            No teams created yet
                          </span>
                        ) : (
                          league.teams.map((team) => (
                            <Badge
                              key={team.id}
                              className="bg-[#9ca895] text-[#2d332d] border-[#2d332d]/10 text-xs"
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-1.5"
                                style={{
                                  backgroundColor: team.color,
                                }}
                              ></div>
                              {team.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {(league.allowDoubleUpDay ||
                    league.allowBonusHours ||
                    league.allowStealthMode) && (
                    <div className="mb-4 pb-4 border-b border-[#2d332d]/10">
                      <p className="text-xs text-[#2d332d]/60 mb-2">
                        Features:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {league.allowDoubleUpDay && (
                          <Badge className="bg-[#2d332d]/10 text-[#2d332d] border-[#2d332d]/20 text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Double Up Day
                          </Badge>
                        )}
                        {league.allowBonusHours && (
                          <Badge className="bg-[#2d332d]/10 text-[#2d332d] border-[#2d332d]/20 text-xs">
                            <Gift className="w-3 h-3 mr-1" />
                            Bonus Hours
                          </Badge>
                        )}
                        {league.allowStealthMode && (
                          <Badge className="bg-[#2d332d]/10 text-[#2d332d] border-[#2d332d]/20 text-xs">
                            <UserX className="w-3 h-3 mr-1" />
                            Stealth Mode
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleViewMembers(league)}
                      size="sm"
                      variant="outline"
                      className="border-[#2d332d]/20 hover:bg-[#9ca895] text-[#2d332d] gap-1 h-10 rounded-full text-xs"
                    >
                      <Users className="w-4 h-4" />
                      Members
                    </Button>
                    {league.useTeams && (
                      <Button
                        onClick={() => handleManageTeams(league)}
                        size="sm"
                        variant="outline"
                        className="border-[#2d332d]/20 hover:bg-[#9ca895] text-[#2d332d] gap-1 h-10 rounded-full text-xs"
                      >
                        <UsersRound className="w-4 h-4" />
                        Teams
                      </Button>
                    )}
                    {league.allowBonusHours && (
                      <Button
                        onClick={() =>
                          handleManageBonusHours(league)
                        }
                        size="sm"
                        variant="outline"
                        className="border-[#2d332d]/20 hover:bg-[#9ca895] text-[#2d332d] gap-1 h-10 rounded-full text-xs"
                      >
                        <Gift className="w-4 h-4" />
                        Bonus
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEditLeague(league)}
                      size="sm"
                      variant="outline"
                      className="border-[#2d332d]/20 hover:bg-[#9ca895] text-[#2d332d] gap-1 h-10 rounded-full text-xs"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteLeague(league)}
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 hover:bg-red-500/10 text-red-600 gap-1 h-10 rounded-full text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* View Members Dialog */}
      <Dialog
        open={showMembersDialog}
        onOpenChange={setShowMembersDialog}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {selectedLeague?.name} - Members
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedLeague?.memberCount} members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedLeague?.members.map((member) => {
              const memberTeam = selectedLeague?.teams.find(
                (t) => t.id === member.teamId,
              );
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-emerald-500/30 transition-colors group"
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() =>
                      onUserClick &&
                      onUserClick(
                        parseInt(member.id),
                        member.name,
                        member.avatar || "",
                        member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join(""),
                      )
                    }
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-slate-950">
                        #{member.rank}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white group-hover:text-emerald-400 transition-colors">
                          {member.name}
                        </p>
                        {selectedLeague.allowDoubleUpDay &&
                          member.hasUsedDoubleUp && (
                            <Zap
                              className="w-3 h-3 text-yellow-400"
                              title="Used Double Up Day"
                            />
                          )}
                        {selectedLeague.allowStealthMode &&
                          member.isInStealthMode && (
                            <UserX
                              className="w-3 h-3 text-purple-400"
                              title={`In Stealth Mode (${member.stealthDaysRemaining || 0} days left)`}
                            />
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-400">
                          {member.totalTime} hours
                        </p>
                        {selectedLeague.allowBonusHours &&
                          member.bonusHours &&
                          member.bonusHours > 0 && (
                            <>
                              <span className="text-slate-600">
                                •
                              </span>
                              <span className="text-xs text-emerald-400">
                                +{member.bonusHours}h bonus
                              </span>
                            </>
                          )}
                        {memberTeam && (
                          <>
                            <span className="text-slate-600">
                              •
                            </span>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    memberTeam.color,
                                }}
                              ></div>
                              <span className="text-xs text-slate-400">
                                {memberTeam.name}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMember(member.id);
                    }}
                    size="icon"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit League Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit League</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update league settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border border-slate-700">
              <div className="flex-1">
                <Label
                  htmlFor="privacy-toggle"
                  className="text-white"
                >
                  Private League
                </Label>
                <p className="text-xs text-slate-400 mt-1">
                  Private leagues are not searchable
                </p>
              </div>
              <Switch
                id="privacy-toggle"
                checked={editedPrivate}
                onCheckedChange={setEditedPrivate}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            {/* Allowed Sports */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">
                  Allowed Sports
                </Label>
                <Button
                  onClick={handleSelectAllSports}
                  variant="ghost"
                  size="sm"
                  className="text-emerald-400 hover:text-emerald-300 h-auto p-0"
                >
                  {editedSports.length === orderedSports.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  {orderedSports.map((sport) => (
                    <div
                      key={sport}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-${sport}`}
                        checked={editedSports.includes(sport)}
                        onCheckedChange={() =>
                          handleSportToggle(sport)
                        }
                        className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <label
                        htmlFor={`edit-${sport}`}
                        className="text-sm text-slate-300 cursor-pointer select-none"
                      >
                        {sport}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              onClick={() => setShowEditDialog(false)}
              variant="outline"
              className="flex-1 border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={saveEditedLeague}
              disabled={editedSports.length === 0}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete League?</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "
              {selectedLeague?.name}"? This action cannot be
              undone and all members will lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
              className="flex-1 border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Teams Dialog */}
      <Dialog
        open={showTeamsDialog}
        onOpenChange={setShowTeamsDialog}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Teams - {selectedLeague?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Create teams and assign members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Create Team Section */}
            <div className="space-y-3">
              <Label className="text-white">
                Create New Team
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Team name"
                  value={newTeamName}
                  onChange={(e) =>
                    setNewTeamName(e.target.value)
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleAddTeam()
                  }
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button
                  onClick={handleAddTeam}
                  size="icon"
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Teams List */}
            <div className="space-y-3">
              <Label className="text-white">
                Teams ({editingTeams.length})
              </Label>
              <div className="space-y-2">
                {editingTeams.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No teams created yet
                  </p>
                ) : (
                  editingTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: team.color,
                          }}
                        ></div>
                        <span className="text-white">
                          {team.name}
                        </span>
                      </div>
                      <Button
                        onClick={() =>
                          handleRemoveTeam(team.id)
                        }
                        size="icon"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Member Assignment Section */}
            <div className="space-y-3">
              <Label className="text-white">
                Assign Members to Teams
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedLeague?.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs">
                        <span className="text-slate-950">
                          #{member.rank}
                        </span>
                      </div>
                      <span className="text-white text-sm">
                        {member.name}
                      </span>
                    </div>
                    <select
                      value={member.teamId || ""}
                      onChange={(e) =>
                        handleAssignTeam(
                          member.id,
                          e.target.value || null,
                        )
                      }
                      className="bg-slate-700 border-slate-600 text-white text-sm rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">No Team</option>
                      {editingTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              onClick={() => setShowTeamsDialog(false)}
              variant="outline"
              className="flex-1 border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={saveTeams}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              Save Teams
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bonus Hours Dialog */}
      <Dialog
        open={showBonusHoursDialog}
        onOpenChange={setShowBonusHoursDialog}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              Manage Bonus Hours
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Award bonus hours to members for achievements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedLeague?.members.map((member) => {
              const memberTeam = selectedLeague?.teams.find(
                (t) => t.id === member.teamId,
              );
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <div className="flex items-center gap-3 flex-1 mr-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-950 text-sm">
                        #{member.rank}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white truncate">
                          {member.name}
                        </p>
                        {selectedLeague.allowDoubleUpDay &&
                          member.hasUsedDoubleUp && (
                            <Zap
                              className="w-3 h-3 text-yellow-400 flex-shrink-0"
                              title="Used Double Up Day"
                            />
                          )}
                        {selectedLeague.allowStealthMode &&
                          member.isInStealthMode && (
                            <UserX
                              className="w-3 h-3 text-purple-400 flex-shrink-0"
                              title={`In Stealth Mode (${member.stealthDaysRemaining || 0} days left)`}
                            />
                          )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{member.totalTime}h total</span>
                        {memberTeam && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    memberTeam.color,
                                }}
                              ></div>
                              <span>{memberTeam.name}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={bonusHoursInput[member.id] || "0"}
                      onChange={(e) =>
                        setBonusHoursInput({
                          ...bonusHoursInput,
                          [member.id]: e.target.value,
                        })
                      }
                      className="w-20 bg-slate-700 border-slate-600 text-white text-center"
                      placeholder="0"
                    />
                    <span className="text-xs text-slate-400">
                      h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
            <p className="text-xs text-teal-300">
              <strong>Tip:</strong> Award bonus hours for
              achievements like longest workout, most
              consistent, best improvement, or any other
              milestones you want to celebrate!
            </p>
          </div>

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              onClick={() => setShowBonusHoursDialog(false)}
              variant="outline"
              className="flex-1 border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={saveBonusHours}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              Save Bonus Hours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <SPREDfitFooter />
    </div>
  );
}