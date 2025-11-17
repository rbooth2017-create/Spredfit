import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, TrendingUp, Flame, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { getSportIcon, getSportGradient } from "./sportIcons";
import { FloatingContent } from "./FloatingContent";

interface UserActivitiesProps {
  onBack: () => void;
  userId: number;
  userName: string;
  userAvatar: string;
  userInitials: string;
}

// Empty workout data - will be populated from backend
const getUserWorkouts = (userId: number) => {
  return [];
};

const getUserStats = (userId: number) => {
  return {
    totalWorkouts: 0,
    totalHours: 0,
    totalDistance: 0,
    currentStreak: 0,
  };
};

export function UserActivities({ onBack, userId, userName, userAvatar, userInitials }: UserActivitiesProps) {
  const [visibleWorkouts, setVisibleWorkouts] = useState(10);

  const workoutEntries = getUserWorkouts(userId);
  const stats = getUserStats(userId);

  const displayedWorkouts = workoutEntries.slice(0, visibleWorkouts);
  const hasMoreWorkouts = visibleWorkouts < workoutEntries.length;

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* User Profile Header */}
        <div className="bg-[#eef0ed] rounded-3xl p-6 mb-6 border border-[#2d332d]/10">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20 border-4 border-[#2d332d]/10">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="bg-[#2d332d] text-[#9ca895] text-2xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl text-[#2d332d] mb-1">{userName}</h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#7a8872] text-[#eef0ed] border-[#2d332d]/10">
                  <Flame className="w-3 h-3 mr-1" />
                  {stats.currentStreak} day streak
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#9ca895]/30 rounded-2xl p-3 text-center">
              <p className="text-2xl text-[#2d332d] mb-1">{stats.totalWorkouts}</p>
              <p className="text-xs text-[#2d332d]/60">Workouts</p>
            </div>
            <div className="bg-[#9ca895]/30 rounded-2xl p-3 text-center">
              <p className="text-2xl text-[#2d332d] mb-1">{stats.totalHours}h</p>
              <p className="text-xs text-[#2d332d]/60">Total Time</p>
            </div>
            <div className="bg-[#9ca895]/30 rounded-2xl p-3 text-center">
              <p className="text-2xl text-[#2d332d] mb-1">{stats.totalDistance}km</p>
              <p className="text-xs text-[#2d332d]/60">Distance</p>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-3 pb-32 mb-6">
          <h3 className="text-[#2d332d] mb-4">Recent Activities</h3>
          {displayedWorkouts.map((workout) => {
            const SportIcon = getSportIcon(workout.sport);
            return (
              <div
                key={workout.id}
                className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/10"
              >
                <div className="flex gap-4">
                  {/* Sport Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#2d332d] flex items-center justify-center">
                      <SportIcon className="w-6 h-6 text-[#9ca895]" />
                    </div>
                  </div>

                  {/* Workout Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-[#2d332d] mb-1">{workout.sport}</h4>
                        <p className="text-xs text-[#2d332d]/60">
                          {new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {workout.time}
                        </p>
                      </div>
                      <div className="bg-[#7a8872] px-3 py-1 rounded-full">
                        <span className="text-xs text-[#eef0ed]">{workout.duration} min</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mt-2 text-xs text-[#2d332d]/60">
                      {workout.distance > 0 && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{workout.distance} km</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{workout.calories} cal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMoreWorkouts && (
          <Button
            onClick={() => setVisibleWorkouts(prev => prev + 10)}
            className="w-full h-14 bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#eef0ed] rounded-full shadow-none transition-all active:scale-[0.98]"
          >
            <span className="text-lg">Load More Activities</span>
          </Button>
        )}
      </div>
    </FloatingContent>
  );
}