import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Check, Play, Award, TrendingUp, MessageCircle, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getSportIcon } from "./sportIcons";
import { FloatingContent } from "./FloatingContent";

interface PlanDetailProps {
  planId: string;
  onBack: () => void;
  onLogWorkout: (sport: string) => void;
}

interface Week {
  weekNumber: number;
  workouts: Workout[];
  isCompleted: boolean;
}

interface Workout {
  id: string;
  day: string;
  sport: string;
  duration: number;
  distance?: number;
  description: string;
  isCompleted: boolean;
  isTodaySuggested?: boolean;
}

// Mock plan data
const mockPlan = {
  id: "1",
  name: "Couch to 5K",
  description: "Perfect for beginners! Build up to running 5K continuously in 9 weeks with this proven program.",
  duration: 9,
  workoutsPerWeek: 3,
  level: "Beginner",
  category: "Running",
  author: "Coach Sarah",
  authorAvatar: "",
  followers: 1247,
  isFollowing: true,
  progress: 33,
  totalWorkouts: 27,
  completedWorkouts: 9
};

const mockWeeks: Week[] = [
  {
    weekNumber: 1,
    isCompleted: true,
    workouts: [
      { id: "w1d1", day: "Monday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 60s run / 90s walk (8 times), walk 5 min cooldown", isCompleted: true },
      { id: "w1d2", day: "Wednesday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 60s run / 90s walk (8 times), walk 5 min cooldown", isCompleted: true },
      { id: "w1d3", day: "Friday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 60s run / 90s walk (8 times), walk 5 min cooldown", isCompleted: true }
    ]
  },
  {
    weekNumber: 2,
    isCompleted: true,
    workouts: [
      { id: "w2d1", day: "Monday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 90s run / 2 min walk (6 times), walk 5 min cooldown", isCompleted: true },
      { id: "w2d2", day: "Wednesday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 90s run / 2 min walk (6 times), walk 5 min cooldown", isCompleted: true },
      { id: "w2d3", day: "Friday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 90s run / 2 min walk (6 times), walk 5 min cooldown", isCompleted: true }
    ]
  },
  {
    weekNumber: 3,
    isCompleted: true,
    workouts: [
      { id: "w3d1", day: "Monday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 90s run / 90s walk, 3 min run / 3 min walk (2 times), walk 5 min cooldown", isCompleted: true },
      { id: "w3d2", day: "Wednesday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 90s run / 90s walk, 3 min run / 3 min walk (2 times), walk 5 min cooldown", isCompleted: true },
      { id: "w3d3", day: "Friday", sport: "Running", duration: 30, description: "Walk 5 min warmup, alternate 90s run / 90s walk, 3 min run / 3 min walk (2 times), walk 5 min cooldown", isCompleted: true }
    ]
  },
  {
    weekNumber: 4,
    isCompleted: false,
    workouts: [
      { id: "w4d1", day: "Monday", sport: "Running", duration: 35, description: "Walk 5 min warmup, run 3 min, walk 90s, run 5 min, walk 2.5 min, run 3 min, walk 90s, run 5 min, walk 5 min cooldown", isCompleted: false, isTodaySuggested: true },
      { id: "w4d2", day: "Wednesday", sport: "Running", duration: 35, description: "Walk 5 min warmup, run 3 min, walk 90s, run 5 min, walk 2.5 min, run 3 min, walk 90s, run 5 min, walk 5 min cooldown", isCompleted: false },
      { id: "w4d3", day: "Friday", sport: "Running", duration: 35, description: "Walk 5 min warmup, run 3 min, walk 90s, run 5 min, walk 2.5 min, run 3 min, walk 90s, run 5 min, walk 5 min cooldown", isCompleted: false }
    ]
  },
  {
    weekNumber: 5,
    isCompleted: false,
    workouts: [
      { id: "w5d1", day: "Monday", sport: "Running", duration: 35, description: "Walk 5 min warmup, run 5 min, walk 3 min, run 5 min, walk 3 min, run 5 min, walk 5 min cooldown", isCompleted: false },
      { id: "w5d2", day: "Wednesday", sport: "Running", duration: 35, description: "Walk 5 min warmup, run 8 min, walk 5 min, run 8 min, walk 5 min cooldown", isCompleted: false },
      { id: "w5d3", day: "Friday", sport: "Running", duration: 35, description: "Walk 5 min warmup, run 20 min, walk 5 min cooldown", isCompleted: false }
    ]
  }
];

export function PlanDetail({ planId, onBack, onLogWorkout }: PlanDetailProps) {
  const [plan] = useState(mockPlan);
  const [weeks, setWeeks] = useState<Week[]>(mockWeeks);
  const [activeTab, setActiveTab] = useState<"overview" | "schedule">("schedule");

  const handleCompleteWorkout = (workoutId: string) => {
    setWeeks(weeks.map(week => ({
      ...week,
      workouts: week.workouts.map(workout =>
        workout.id === workoutId ? { ...workout, isCompleted: !workout.isCompleted } : workout
      ),
      isCompleted: week.workouts.every(w => w.id === workoutId ? !w.isCompleted : w.isCompleted)
    })));
  };

  const todayWorkout = weeks
    .flatMap(week => week.workouts)
    .find(workout => workout.isTodaySuggested);

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div>
            <h1 className="text-xl text-[#2d332d]">{plan.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-[#7a8872] text-[#eef0ed] border-[#2d332d]/10">
                {plan.level}
              </Badge>
              <Badge className="bg-[#9ca895] text-[#2d332d] border-[#2d332d]/10">
                {plan.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Today's Suggested Workout */}
        {todayWorkout && (
          <Card className="mb-6 p-5 bg-[#7a8872]/30 border-[#2d332d]/10 rounded-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-[#2d332d]" />
              <h3 className="text-[#2d332d]">Today's Workout</h3>
            </div>
            <div className="bg-[#eef0ed] rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#2d332d] flex items-center justify-center">
                  {(() => {
                    const Icon = getSportIcon(todayWorkout.sport);
                    return <Icon className="w-5 h-5 text-[#9ca895]" />;
                  })()}
                </div>
                <div>
                  <p className="text-[#2d332d]">{todayWorkout.sport}</p>
                  <p className="text-sm text-[#2d332d]/60">{todayWorkout.duration} minutes</p>
                </div>
              </div>
              <p className="text-sm text-[#2d332d]/70 mb-3">{todayWorkout.description}</p>
              <Button
                onClick={() => onLogWorkout(todayWorkout.sport)}
                className="w-full bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] gap-2 rounded-full"
              >
                <Play className="w-4 h-4" />
                Start Workout
              </Button>
            </div>
          </Card>
        )}

        {/* Progress Overview */}
        <Card className="mb-6 p-5 bg-[#eef0ed] border-[#2d332d]/10 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#2d332d]">Your Progress</h3>
            <span className="text-sm text-[#2d332d]">{plan.progress}% Complete</span>
          </div>
          <Progress value={plan.progress} className="mb-4" />
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#9ca895]/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#2d332d]" />
                <span className="text-xs text-[#2d332d]/60">Completed</span>
              </div>
              <p className="text-[#2d332d]">{plan.completedWorkouts}/{plan.totalWorkouts}</p>
            </div>
            <div className="bg-[#9ca895]/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[#2d332d]" />
                <span className="text-xs text-[#2d332d]/60">Duration</span>
              </div>
              <p className="text-[#2d332d]">{plan.duration} weeks</p>
            </div>
            <div className="bg-[#9ca895]/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-[#2d332d]" />
                <span className="text-xs text-[#2d332d]/60">Followers</span>
              </div>
              <p className="text-[#2d332d]">{plan.followers}</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-32">
          <TabsList className="grid w-full grid-cols-2 bg-[#9ca895]/30 border-none rounded-full">
            <TabsTrigger value="schedule" className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895]">
              Weekly Schedule
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895]">
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="bg-[#eef0ed] border-[#2d332d]/10 p-5 mb-4 rounded-3xl">
              <h3 className="text-[#2d332d] mb-3">About This Plan</h3>
              <p className="text-[#2d332d]/70 mb-4">{plan.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#2d332d]" />
                  <div>
                    <p className="text-[#2d332d]">{plan.workoutsPerWeek} workouts per week</p>
                    <p className="text-xs text-[#2d332d]/60">Consistent training schedule</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#2d332d]" />
                  <div>
                    <p className="text-[#2d332d]">Progressive difficulty</p>
                    <p className="text-xs text-[#2d332d]/60">Gradually builds your fitness</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2d332d]/10">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-[#2d332d]/10">
                    <AvatarImage src={plan.authorAvatar} />
                    <AvatarFallback className="bg-[#9ca895] text-[#2d332d]">
                      {plan.author.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-[#2d332d]/60">Created by</p>
                    <p className="text-[#2d332d]">{plan.author}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6 space-y-4">
            {weeks.map((week) => (
              <Card key={week.weekNumber} className="bg-[#eef0ed] border-[#2d332d]/10 p-5 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[#2d332d]">Week {week.weekNumber}</h3>
                    {week.isCompleted && (
                      <Badge className="bg-[#7a8872]/30 text-[#2d332d] border-[#2d332d]/10">
                        <Check className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {week.workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className={`p-4 rounded-2xl border transition-colors ${
                        workout.isCompleted
                          ? "bg-[#7a8872]/20 border-[#2d332d]/10"
                          : workout.isTodaySuggested
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : "bg-[#9ca895]/30 border-[#2d332d]/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          workout.isCompleted
                            ? "bg-[#7a8872]"
                            : workout.isTodaySuggested
                            ? "bg-yellow-500"
                            : "bg-[#9ca895]"
                        }`}>
                          {workout.isCompleted ? (
                            <Check className="w-5 h-5 text-[#eef0ed]" />
                          ) : (
                            (() => {
                              const Icon = getSportIcon(workout.sport);
                              return <Icon className="w-5 h-5 text-[#2d332d]" />;
                            })()
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[#2d332d]">{workout.day}</p>
                            <span className="text-[#2d332d]/30">•</span>
                            <p className="text-sm text-[#2d332d]/60">{workout.duration} min</p>
                          </div>
                          <p className="text-sm text-[#2d332d]/70">{workout.description}</p>
                        </div>
                        <Button
                          onClick={() => handleCompleteWorkout(workout.id)}
                          size="sm"
                          variant={workout.isCompleted ? "outline" : "default"}
                          className={workout.isCompleted
                            ? "border-[#2d332d]/20 text-[#2d332d] rounded-full"
                            : "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] rounded-full"
                          }
                        >
                          {workout.isCompleted ? "Done" : "Mark Complete"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </FloatingContent>
  );
}
