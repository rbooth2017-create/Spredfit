import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowLeft, Link2 } from "lucide-react";
import { sportConfigs, orderedSports } from "./sportIcons";
import { FloatingContent } from "./FloatingContent";

interface LogWorkoutProps {
  onBack: () => void;
  onSelectSport: (sport: string) => void;
}

const sports = orderedSports.map((sportName) => ({
  name: sportName,
  ...sportConfigs[sportName],
}));

export function LogWorkout({ onBack, onSelectSport }: LogWorkoutProps) {
  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div>
            <p className="text-[10px] text-[#2d332d] mb-0.5">Track Activity</p>
            <h1 className="text-xl text-[#2d332d]">Log Workout</h1>
          </div>
        </div>

        <p className="text-[#2d332d]/70 mb-8">Select your activity type</p>

        {/* Sports Grid */}
        <div className="grid grid-cols-2 gap-4 mb-32">
          {sports.map((sport) => {
            const Icon = sport.icon;
            return (
              <div
                key={sport.name}
                onClick={() => onSelectSport(sport.name)}
                className="p-6 cursor-pointer hover:bg-[#9ca895]/30 transition-all rounded-2xl bg-[#eef0ed]"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2d332d]">
                    <Icon className="w-8 h-8 text-[#eef0ed]" strokeWidth={2.5} />
                  </div>
                  <span className="text-lg text-[#2d332d]">{sport.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sync with Third Party Apps */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="w-full h-14 border-2 border-[#2d332d]/30 hover:border-[#2d332d] bg-transparent hover:bg-[#2d332d]/10 text-[#2d332d] hover:text-[#2d332d] rounded-2xl gap-3 shadow-none"
          >
            <Link2 className="w-5 h-5" strokeWidth={2} />
            <span className="text-lg">Sync with Third Party Apps</span>
          </Button>
          <p className="text-center text-[#2d332d]/60 mt-3 text-xs">
            Connect Strava, Apple HealthKit & Google Fitness
          </p>
        </div>

        {/* Bottom hint text */}
        <p className="text-center text-[#2d332d]/60 mt-4 text-sm mb-32">
          Track your activity and compete with friends
        </p>
      </div>
    </FloatingContent>
  );
}