import { useState } from "react";
import { ArrowLeft, Share2, Copy, CheckCircle, Trophy, Calendar, Lock, Unlock, User, Users as UsersIcon, Clock, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { orderedSports } from "./sportIcons";

interface CreateLeagueProps {
  onBack: () => void;
  onCreate: (leagueData: LeagueData) => void;
}

export interface LeagueData {
  name: string;
  duration: string;
  allowedSports: string[];
  leagueCode: string;
  isPrivate: boolean;
  useTeams: boolean;
  allowDoubleUpDay: boolean;
  allowBonusHours: boolean;
  allowStealthMode: boolean;
}

export function CreateLeague({ onBack, onCreate }: CreateLeagueProps) {
  const [leagueName, setLeagueName] = useState("");
  const [duration, setDuration] = useState("1-month");
  const [allowedSports, setAllowedSports] = useState<string[]>(orderedSports);
  const [isPrivate, setIsPrivate] = useState(false);
  const [useTeams, setUseTeams] = useState(false);
  const [allowDoubleUpDay, setAllowDoubleUpDay] = useState(false);
  const [allowBonusHours, setAllowBonusHours] = useState(false);
  const [allowStealthMode, setAllowStealthMode] = useState(false);
  const [created, setCreated] = useState(false);
  const [leagueCode, setLeagueCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSportToggle = (sport: string) => {
    if (allowedSports.includes(sport)) {
      setAllowedSports(allowedSports.filter(s => s !== sport));
    } else {
      setAllowedSports([...allowedSports, sport]);
    }
  };

  const handleSelectAllSports = () => {
    if (allowedSports.length === orderedSports.length) {
      setAllowedSports([]);
    } else {
      setAllowedSports(orderedSports);
    }
  };

  const generateLeagueCode = () => {
    // Generate a random league code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 2) code += '-';
    }
    return code;
  };

  const handleCreate = () => {
    if (!leagueName.trim()) return;
    
    const code = generateLeagueCode();
    setLeagueCode(code);
    setCreated(true);

    const data: LeagueData = {
      name: leagueName,
      duration,
      allowedSports,
      leagueCode: code,
      isPrivate,
      useTeams,
      allowDoubleUpDay,
      allowBonusHours,
      allowStealthMode
    };

    onCreate(data);
  };

  const handleCopyCode = async () => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(leagueCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: create a temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = leagueCode;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Failed to copy:', e);
      }
      document.body.removeChild(textarea);
    }
  };

  const handleShare = async () => {
    const shareText = `Join my SPREDfit league "${leagueName}"!\n\nLeague Code: ${leagueCode}\n\nLet's compete and push each other to move more!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${leagueName} on SPREDfit`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled share or error occurred
        if (err instanceof Error && err.name !== 'AbortError') {
          // Fallback to copy
          await handleCopyCode();
        }
      }
    } else {
      // No share API, just copy
      await handleCopyCode();
    }
  };

  if (created) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-[#8a9881] background-fade text-[#2d332d] flex flex-col">
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
                <div className="w-10 h-10 rounded-full bg-[#2d332d] flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#9ca895]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#2d332d] mb-0.5">Success!</p>
                  <h1 className="text-xl text-[#2d332d]">League Created</h1>
                </div>
              </div>
            </div>
          </div>

          {/* League Code Card - Floating */}
          <div className="mb-6 flex-shrink-0">
            <div className="text-center mb-4">
              <h2 className="text-2xl text-[#eef0ed]">{leagueName}</h2>
              <p className="text-[11px] text-[#eef0ed]/70 mt-1">Share this code with friends</p>
            </div>
            
            <div className="bg-[#eef0ed] rounded-3xl p-6 mb-4">
              <p className="text-[10px] text-[#2d332d]/60 mb-2 text-center">League Code</p>
              <p className="text-3xl text-[#2d332d] text-center tracking-wider mb-4">{leagueCode}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyCode}
                  className="h-12 rounded-full bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] flex items-center justify-center gap-2 transition-all border border-[#2d332d]/10"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="h-12 rounded-full bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* League Details - Scrollable */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 pr-16">
            <h3 className="text-base text-[#eef0ed] mb-3 flex-shrink-0">League Details</h3>
            <div className="overflow-y-auto flex-1 space-y-2 lozenge-scrollbar">
              <div className="flex items-center justify-between p-3 rounded-full bg-[#eef0ed]">
                <span className="text-[11px] text-[#2d332d]/60">Duration</span>
                <span className="text-sm text-[#2d332d]">{duration === '1-week' ? '1 Week' : duration === '2-weeks' ? '2 Weeks' : duration === '1-month' ? '1 Month' : '3 Months'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-full bg-[#eef0ed]">
                <span className="text-[11px] text-[#2d332d]/60">Allowed Sports</span>
                <span className="text-sm text-[#2d332d]">{allowedSports.length === orderedSports.length ? 'All Sports' : `${allowedSports.length} sports`}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-full bg-[#eef0ed]">
                <span className="text-[11px] text-[#2d332d]/60">Visibility</span>
                <span className="text-sm text-[#2d332d]">{isPrivate ? 'Private' : 'Public'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-full bg-[#eef0ed]">
                <span className="text-[11px] text-[#2d332d]/60">Competition Mode</span>
                <span className="text-sm text-[#2d332d]">{useTeams ? 'Team' : 'Individual'}</span>
              </div>
              {allowDoubleUpDay && (
                <div className="flex items-center justify-between p-3 rounded-full bg-[#eef0ed]">
                  <span className="text-[11px] text-[#2d332d]/60">Double Up Day</span>
                  <span className="text-sm text-[#2d332d]">Enabled</span>
                </div>
              )}
              {allowBonusHours && (
                <div className="flex items-center justify-between p-3 rounded-full bg-[#eef0ed]">
                  <span className="text-[11px] text-[#2d332d]/60">Bonus Hours</span>
                  <span className="text-sm text-[#2d332d]">Enabled</span>
                </div>
              )}
              {allowStealthMode && (
                <div className="flex items-center justify-between p-3 rounded-full bg-[#eef0ed]">
                  <span className="text-[11px] text-[#2d332d]/60">Stealth Mode</span>
                  <span className="text-sm text-[#2d332d]">Enabled</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Right External Buttons - Similar to Dashboard */}
          <div className="fixed bottom-8 right-4 z-[60] max-w-md mx-auto">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={onBack}
                  className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
                >
                  <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center">Back</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#8a9881] background-fade text-[#2d332d] flex flex-col">
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
              <div>
                <p className="text-[10px] text-[#2d332d] mb-0.5">New Competition</p>
                <h1 className="text-xl text-[#2d332d]">Create League</h1>
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

        {/* Action Buttons - 1x2 Grid */}
        <div className="flex justify-center gap-4 mb-6 px-4 flex-shrink-0">
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setIsPrivate(false)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none ${
                !isPrivate
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                  : "bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] border border-[#2d332d]/10"
              }`}
            >
              <Unlock className="w-6 h-6" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#eef0ed]">Public</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setIsPrivate(true)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none ${
                isPrivate
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                  : "bg-[#9ca895] hover:bg-[#a5b39d] text-[#2d332d] border border-[#2d332d]/10"
              }`}
            >
              <Lock className="w-6 h-6" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#eef0ed]">Private</span>
          </div>
        </div>

        {/* Form - Scrollable */}
        <div className="overflow-hidden flex flex-col min-h-0 flex-1">
          <h3 className="text-base text-[#eef0ed] mb-3 flex-shrink-0">League Settings</h3>
          <div className="overflow-y-auto flex-1 space-y-4 lozenge-scrollbar">
            {/* League Name */}
            <div className="space-y-2">
              <Label htmlFor="league-name" className="text-[#eef0ed] text-sm">League Name</Label>
              <Input
                id="league-name"
                type="text"
                placeholder="e.g., November Champions"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d] placeholder:text-[#2d332d]/40 h-12 rounded-full px-5"
                maxLength={50}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-[#eef0ed] text-sm">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d] h-12 rounded-full px-5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d]">
                  <SelectItem value="1-week" className="text-[#2d332d] focus:bg-[#9ca895] focus:text-[#2d332d]">1 Week</SelectItem>
                  <SelectItem value="2-weeks" className="text-[#2d332d] focus:bg-[#9ca895] focus:text-[#2d332d]">2 Weeks</SelectItem>
                  <SelectItem value="1-month" className="text-[#2d332d] focus:bg-[#9ca895] focus:text-[#2d332d]">1 Month</SelectItem>
                  <SelectItem value="3-months" className="text-[#2d332d] focus:bg-[#9ca895] focus:text-[#2d332d]">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allowed Sports */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[#eef0ed] text-sm">Allowed Sports</Label>
                <Button
                  onClick={handleSelectAllSports}
                  variant="ghost"
                  size="sm"
                  className="text-[#eef0ed] hover:text-[#eef0ed] hover:bg-[#9ca895]/50 h-auto p-0 text-xs"
                >
                  {allowedSports.length === orderedSports.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="bg-[#eef0ed] border-[#2d332d]/10 p-4 rounded-3xl">
                <div className="grid grid-cols-2 gap-3">
                  {orderedSports.map((sport) => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={sport}
                        checked={allowedSports.includes(sport)}
                        onCheckedChange={() => handleSportToggle(sport)}
                        className="border-[#2d332d]/30 data-[state=checked]:bg-[#2d332d] data-[state=checked]:border-[#2d332d]"
                      />
                      <label
                        htmlFor={sport}
                        className="text-xs text-[#2d332d] cursor-pointer select-none"
                      >
                        {sport}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Competition */}
            <div className="bg-[#eef0ed] border-[#2d332d]/10 p-4 rounded-3xl">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="useTeams"
                  checked={useTeams}
                  onCheckedChange={(checked) => setUseTeams(checked as boolean)}
                  className="mt-1 border-[#2d332d]/30 data-[state=checked]:bg-[#2d332d] data-[state=checked]:border-[#2d332d]"
                />
                <div className="flex-1">
                  <label
                    htmlFor="useTeams"
                    className="text-sm text-[#2d332d] cursor-pointer select-none"
                  >
                    Use Teams in Competition
                  </label>
                  <p className="text-xs text-[#2d332d]/60 mt-1">
                    Enable team-based competition. You can assign members to teams after league creation
                  </p>
                </div>
              </div>
            </div>

            {/* Double Up Day */}
            <div className="bg-[#eef0ed] border-[#2d332d]/10 p-4 rounded-3xl">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="doubleUpDay"
                  checked={allowDoubleUpDay}
                  onCheckedChange={(checked) => setAllowDoubleUpDay(checked as boolean)}
                  className="mt-1 border-[#2d332d]/30 data-[state=checked]:bg-[#2d332d] data-[state=checked]:border-[#2d332d]"
                />
                <div className="flex-1">
                  <label
                    htmlFor="doubleUpDay"
                    className="text-sm text-[#2d332d] cursor-pointer select-none"
                  >
                    Allow Double Up Day
                  </label>
                  <p className="text-xs text-[#2d332d]/60 mt-1">
                    Each participant can choose one day during the competition to double their workout time
                  </p>
                </div>
              </div>
            </div>

            {/* Bonus Hours */}
            <div className="bg-[#eef0ed] border-[#2d332d]/10 p-4 rounded-3xl">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="bonusHours"
                  checked={allowBonusHours}
                  onCheckedChange={(checked) => setAllowBonusHours(checked as boolean)}
                  className="mt-1 border-[#2d332d]/30 data-[state=checked]:bg-[#2d332d] data-[state=checked]:border-[#2d332d]"
                />
                <div className="flex-1">
                  <label
                    htmlFor="bonusHours"
                    className="text-sm text-[#2d332d] cursor-pointer select-none"
                  >
                    Allow Bonus Hours
                  </label>
                  <p className="text-xs text-[#2d332d]/60 mt-1">
                    As league admin, award bonus hours for achievements (e.g., longest workout, most consistent)
                  </p>
                </div>
              </div>
            </div>

            {/* Stealth Mode */}
            <div className="bg-[#eef0ed] border-[#2d332d]/10 p-4 rounded-3xl">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="stealthMode"
                  checked={allowStealthMode}
                  onCheckedChange={(checked) => setAllowStealthMode(checked as boolean)}
                  className="mt-1 border-[#2d332d]/30 data-[state=checked]:bg-[#2d332d] data-[state=checked]:border-[#2d332d]"
                />
                <div className="flex-1">
                  <label
                    htmlFor="stealthMode"
                    className="text-sm text-[#2d332d] cursor-pointer select-none"
                  >
                    Allow Stealth Mode
                  </label>
                  <p className="text-xs text-[#2d332d]/60 mt-1">
                    Each participant can hide their activity for 3 days during the competition
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Right External Buttons - Similar to Dashboard */}
      <div className="fixed bottom-8 right-4 z-[60] max-w-md mx-auto">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onBack}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
            >
              <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-[10px] text-center">Back</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={handleCreate}
              disabled={!leagueName.trim() || allowedSports.length === 0}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-[10px] text-center">Create</span>
          </div>
        </div>
      </div>
    </div>
  );
}