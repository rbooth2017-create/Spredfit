import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Settings, ChevronLeft, ChevronRight, Shield, Target, Calendar, BarChart3, UserCircle, Clock, LogOut, Camera, MessageCircle, Sparkles } from "lucide-react";
import { getSportIcon } from "./sportIcons";
import { CoverFlowScroll } from "./CoverFlowScroll";
import { FloatingContent } from "./FloatingContent";

interface ProfileProps {
  onBack: () => void;
  onSettings: () => void;
  onManageLeagues: () => void;
  onManageGoals: () => void;
  onEditWorkout?: (workoutId: number, sport: string) => void;
  onMetrics: () => void;
  onActivityFeed?: () => void;
  onUploadPhoto?: () => void;
  onSignOut?: () => void;
  onChat?: () => void;
  onTrainingPlans?: () => void;
}

// Mock workout data
const workoutEntries = [
  { id: 1, date: "2025-11-03", sport: "Running", duration: 45, distance: 8.2, calories: 420, time: "07:30 AM" },
  { id: 2, date: "2025-11-02", sport: "Cycling", duration: 90, distance: 32.5, calories: 680, time: "06:00 PM" },
  { id: 3, date: "2025-11-02", sport: "Swimming", duration: 30, distance: 1.5, calories: 310, time: "08:00 AM" },
  { id: 4, date: "2025-11-01", sport: "Running", duration: 60, distance: 10.5, calories: 550, time: "07:00 AM" },
  { id: 5, date: "2025-10-31", sport: "Strength", duration: 75, distance: 0, calories: 420, time: "05:30 PM" },
];

const stats = {
  totalWorkouts: 28,
  totalHours: 42.5,
  totalDistance: 287.3,
  currentStreak: 12,
};

const userLeagues = [
  { id: "1", name: "Team Alpha Challenge", rank: 2, totalMembers: 12 },
  { id: "2", name: "Morning Warriors", rank: 1, totalMembers: 8 },
  { id: "3", name: "City Runners", rank: 5, totalMembers: 24 }
];

export function Profile({ onBack, onSettings, onManageLeagues, onManageGoals, onEditWorkout, onMetrics, onActivityFeed, onUploadPhoto, onSignOut, onChat, onTrainingPlans }: ProfileProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % userLeagues.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % userLeagues.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + userLeagues.length) % userLeagues.length);
  };

  const coverFlowItems = workoutEntries.slice(0, 5).map((workout) => ({
    id: `workout-${workout.id}`,
    type: 'activity' as const,
    title: workout.sport,
    subtitle: workout.date,
    value: `${workout.duration}`,
    icon: getSportIcon(workout.sport),
    onClick: onActivityFeed
  }));

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#2d332d] mb-0.5">Your Profile</p>
              <h1 className="text-xl text-[#2d332d]">Alex Rivera</h1>
            </div>
            <Button
              onClick={onSettings}
              variant="ghost"
              size="icon"
              className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#8a9881]/30 h-8 w-8 rounded-full"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[#eef0ed] rounded-3xl p-6 mb-4 border border-[#2d332d]/10">
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-3">
              <Avatar className="w-24 h-24 border-4 border-[#2d332d]/10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-[#2d332d] text-[#9ca895] text-3xl">AR</AvatarFallback>
              </Avatar>
              {onUploadPhoto && (
                <Button
                  onClick={onUploadPhoto}
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895]"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <h2 className="text-2xl text-[#2d332d] mb-1">Alex Rivera</h2>
            <p className="text-sm text-[#2d332d]/60">@alexrivera • Joined March 2024</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <p className="text-2xl text-[#2d332d]">{stats.totalWorkouts}</p>
              <p className="text-xs text-[#2d332d]/60">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#2d332d]">{stats.totalHours}h</p>
              <p className="text-xs text-[#2d332d]/60">Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#2d332d]">{stats.totalDistance}km</p>
              <p className="text-xs text-[#2d332d]/60">Distance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#2d332d]">{stats.currentStreak}</p>
              <p className="text-xs text-[#2d332d]/60">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Leagues Carousel */}
        <div className="bg-[#eef0ed] rounded-3xl p-5 mb-4 border border-[#2d332d]/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#2d332d]">My Leagues</h3>
            <Button
              onClick={onManageLeagues}
              variant="ghost"
              className="text-xs text-[#2d332d]/60 hover:text-[#2d332d] h-7 rounded-full"
            >
              View All
            </Button>
          </div>
          
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {userLeagues.map((league) => (
                  <div key={league.id} className="w-full flex-shrink-0">
                    <div className="bg-[#9ca895] rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[#2d332d]">{league.name}</h4>
                        <div className="bg-[#2d332d] text-[#9ca895] px-3 py-1 rounded-full text-xs">
                          Rank #{league.rank}
                        </div>
                      </div>
                      <p className="text-xs text-[#2d332d]/60">{league.totalMembers} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {userLeagues.length > 1 && (
              <>
                <Button
                  onClick={prevSlide}
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#2d332d]/80 hover:bg-[#2d332d] text-[#9ca895]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={nextSlide}
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#2d332d]/80 hover:bg-[#2d332d] text-[#9ca895]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          
          <div className="flex justify-center gap-1.5 mt-3">
            {userLeagues.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === carouselIndex
                    ? "w-6 bg-[#2d332d]"
                    : "w-1.5 bg-[#2d332d]/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Recent Activities with CoverFlow */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#2d332d]">Recent Activities</h3>
            <Button
              onClick={onActivityFeed}
              variant="ghost"
              className="text-xs text-[#2d332d]/60 hover:text-[#2d332d] h-7 rounded-full"
            >
              View All
            </Button>
          </div>
          <CoverFlowScroll items={coverFlowItems} />
        </div>

        {/* Circular Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-32">
          <Button
            onClick={onMetrics}
            className="flex flex-col items-center gap-2 h-24 bg-[#eef0ed] hover:bg-[#9ca895] border border-[#2d332d]/10 rounded-3xl"
          >
            <BarChart3 className="w-6 h-6 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]">Metrics</span>
          </Button>

          <Button
            onClick={onManageGoals}
            className="flex flex-col items-center gap-2 h-24 bg-[#eef0ed] hover:bg-[#9ca895] border border-[#2d332d]/10 rounded-3xl"
          >
            <Target className="w-6 h-6 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]">Goals</span>
          </Button>

          <Button
            onClick={onChat}
            className="flex flex-col items-center gap-2 h-24 bg-[#eef0ed] hover:bg-[#9ca895] border border-[#2d332d]/10 rounded-3xl"
          >
            <MessageCircle className="w-6 h-6 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]">Chat</span>
          </Button>

          <Button
            onClick={onManageLeagues}
            className="flex flex-col items-center gap-2 h-24 bg-[#eef0ed] hover:bg-[#9ca895] border border-[#2d332d]/10 rounded-3xl"
          >
            <Shield className="w-6 h-6 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]">Leagues</span>
          </Button>

          <Button
            onClick={onTrainingPlans}
            className="flex flex-col items-center gap-2 h-24 bg-[#eef0ed] hover:bg-[#9ca895] border border-[#2d332d]/10 rounded-3xl"
          >
            <Sparkles className="w-6 h-6 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]">Plans</span>
          </Button>

          <Button
            onClick={onActivityFeed}
            className="flex flex-col items-center gap-2 h-24 bg-[#eef0ed] hover:bg-[#9ca895] border border-[#2d332d]/10 rounded-3xl"
          >
            <Clock className="w-6 h-6 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]">Activity</span>
          </Button>
        </div>
      </div>
    </FloatingContent>
  );
}
