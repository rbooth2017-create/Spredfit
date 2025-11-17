import { X, Calendar, Clock, MapPin, Activity, Bike, Waves, Dumbbell, Heart, Zap, Play, SkipForward, Edit } from "lucide-react";
import { Button } from "../ui/button";

interface PlannedWorkoutDetailModalProps {
  onClose: () => void;
  onStartWorkout: () => void;
  onViewFullPlan?: () => void;
  plannedWorkout?: {
    sport: string;
    duration: number; // minutes
    distance: number; // km
    type: string; // title/name
    time: string;
    notes?: string;
  } | null;
}

export function PlannedWorkoutDetailModal({ onClose, onStartWorkout, onViewFullPlan, plannedWorkout }: PlannedWorkoutDetailModalProps) {
  // If no planned workout, don't show the modal
  if (!plannedWorkout) {
    return null;
  }

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

  const Icon = getSportIcon(plannedWorkout.sport);

  return (
    <div className="w-[90vw] h-[90vw] max-w-[500px] max-h-[500px] rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center text-center w-full h-full justify-center space-y-3 overflow-y-auto px-4 scrollbar-hide">
        {/* Sport Icon */}
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
          <Icon className="w-8 h-8 text-white" strokeWidth={2} />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-white text-xl mb-1">{plannedWorkout.type}</h3>
          <p className="text-white/70 text-sm">{plannedWorkout.sport}</p>
          <p className="text-white/60 text-xs mt-1">{plannedWorkout.time}</p>
        </div>

        {/* Key Stats */}
        <div className="flex gap-4 justify-center">
          <div className="flex flex-col items-center">
            <Clock className="w-5 h-5 text-white/70 mb-1" />
            <p className="text-white text-lg">{plannedWorkout.duration}min</p>
          </div>
          <div className="w-px bg-white/30"></div>
          <div className="flex flex-col items-center">
            <MapPin className="w-5 h-5 text-white/70 mb-1" />
            <p className="text-white text-lg">{plannedWorkout.distance}km</p>
          </div>
        </div>

        {/* Description - only show if notes exist */}
        {plannedWorkout.notes && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 max-w-[280px]">
            <p className="text-white/90 text-xs leading-relaxed">{plannedWorkout.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}