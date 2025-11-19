import { useState } from "react";
import { Hash, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FloatingContent } from "./FloatingContent";
import { APIClient } from "../utils/api";
import { useAuth } from "../utils/auth";
import { toast } from "sonner";

interface JoinLeagueProps {
  onBack: () => void;
  onJoin: (leagueId: string) => void;
}

export function JoinLeague({ onBack, onJoin }: JoinLeagueProps) {
  const [leagueCode, setLeagueCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { session } = useAuth();

  const handleJoinByCode = async () => {
    if (!leagueCode.trim()) return;
    
    if (!session?.access_token) {
      toast.error('You must be logged in to join a league');
      return;
    }

    setIsJoining(true);
    
    try {
      const api = new APIClient(session.access_token);
      await api.joinLeague(leagueCode);
      toast.success('Successfully joined league!');
      onJoin(leagueCode);
    } catch (error: any) {
      toast.error(error.message || 'Failed to join league');
    } finally {
      setIsJoining(false);
    }
  };

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

        {/* Code Button */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="flex flex-col items-center gap-1.5">
            <button
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-none bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
            >
              <Hash className="w-6 h-6" strokeWidth={2} />
            </button>
            <span className="text-[10px] text-[#2d332d]">Code</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="mb-32">
          <div>
            <h3 className="text-base text-[#2d332d] mb-3">Enter League Code</h3>
            <div className="bg-[#eef0ed] rounded-3xl p-6">
              <p className="text-sm text-[#2d332d]/60 mb-4">
                Have a league code? Enter it below to join instantly.
              </p>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="ABC123"
                  value={leagueCode}
                  onChange={(e) => setLeagueCode(e.target.value.toUpperCase())}
                  className="bg-[#8a9881]/20 border-[#2d332d]/20 text-[#2d332d] placeholder:text-[#2d332d]/40 h-12 text-center tracking-wider"
                  maxLength={6}
                />
                
                <Button
                  onClick={handleJoinByCode}
                  disabled={!leagueCode.trim() || isJoining}
                  className="w-full h-12 bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? 'Joining...' : 'Join League'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FloatingContent>
  );
}