import { memo } from "react";
import { Calendar, Dumbbell, Activity, Bike, Waves, Heart, Zap } from "lucide-react";

interface PlannedWorkoutCircleProps {
  onOpenPlanner?: () => void;
  plannedWorkout?: {
    sport: string;
    duration: number; // minutes
    distance: number; // km
    type: string; // title/name
    time: string;
    notes?: string;
  } | null;
}

function PlannedWorkoutCircleComponent({ onOpenPlanner, plannedWorkout }: PlannedWorkoutCircleProps) {
  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'Running': return Activity;
      case 'Cycling': return Bike;
      case 'Swimming': return Waves;
      case 'Strength': return Dumbbell;
      case 'Yoga': return Heart;
      case 'HIIT': return Zap;
      default: return Activity;
    }
  };

  // Show empty state if no planned workout
  if (!plannedWorkout) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[70] pointer-events-none">
        <div className="max-w-[440px] mx-auto px-4 pb-6 pointer-events-auto">
          <div className="flex justify-end">
            <button
              onClick={onOpenPlanner}
              className="relative group"
            >
              {/* Main Circle */}
              <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col items-center justify-center shadow-lg cursor-pointer">
                {/* Calendar Icon */}
                <Calendar className="w-6 h-6 text-white/70 mb-2" strokeWidth={2} />
                
                {/* No workout text */}
                <p className="text-white/60 text-[9px] leading-tight text-center px-2">
                  No planned<br />workouts
                </p>
              </div>

              {/* Label below */}
              <div className="mt-1.5 text-center">
                <span className="text-white/60 text-[10px]">Today</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Icon = getSportIcon(plannedWorkout.sport);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] pointer-events-none">
      <div className="max-w-[440px] mx-auto px-4 pb-6 pointer-events-auto">
        <div className="flex justify-end">
          <button
            onClick={onOpenPlanner}
            className="relative group"
          >
            {/* Main Circle */}
            <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col items-center justify-center shadow-lg">
              {/* Calendar Icon at top */}
              <Calendar className="w-4 h-4 text-white/70 mb-1" strokeWidth={2} />
              
              {/* Sport Icon - larger */}
              <Icon className="w-6 h-6 text-white mb-1" strokeWidth={2} />
              
              {/* Workout Type */}
              <p className="text-white text-[9px] leading-tight text-center px-2">
                {plannedWorkout.type}
              </p>
              
              {/* Duration/Distance */}
              <p className="text-white/60 text-[8px] mt-0.5">
                {plannedWorkout.duration}min · {plannedWorkout.distance}km
              </p>
            </div>

            {/* Label below */}
            <div className="mt-1.5 text-center">
              <span className="text-white text-[10px] block">Today</span>
              <span className="text-white/60 text-[9px]">{plannedWorkout.time}</span>
            </div>

            {/* Pulse animation for emphasis */}
            <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse group-hover:animate-none"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

export const PlannedWorkoutCircle = memo(PlannedWorkoutCircleComponent);