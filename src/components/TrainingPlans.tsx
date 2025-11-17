import { useState } from "react";
import { ArrowLeft, Plus, Search, Clock, Calendar, Trophy, TrendingUp, Play, Check, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FloatingContent } from "./FloatingContent";

interface TrainingPlansProps {
  onBack: () => void;
  onCreatePlan: () => void;
  onViewPlan: (planId: string) => void;
}

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  workoutsPerWeek: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  author: string;
  authorAvatar: string;
  followers: number;
  isFollowing: boolean;
  progress?: number; // 0-100 percentage
}

// Mock training plans
const mockPlans: TrainingPlan[] = [
  {
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
    isFollowing: false
  },
  {
    id: "2",
    name: "10K Training Plan",
    description: "Take your running to the next level. Designed for runners who can comfortably run 5K.",
    duration: 12,
    workoutsPerWeek: 4,
    level: "Intermediate",
    category: "Running",
    author: "Marcus J.",
    authorAvatar: "",
    followers: 892,
    isFollowing: true,
    progress: 45
  },
  {
    id: "3",
    name: "Marathon Prep",
    description: "Complete 16-week marathon training plan with a mix of long runs, tempo runs, and recovery days.",
    duration: 16,
    workoutsPerWeek: 5,
    level: "Advanced",
    category: "Running",
    author: "Elite Runners Club",
    authorAvatar: "",
    followers: 2341,
    isFollowing: false
  },
  {
    id: "4",
    name: "Beginner Strength",
    description: "Build a solid foundation with this 8-week strength training program. 3 full-body workouts per week.",
    duration: 8,
    workoutsPerWeek: 3,
    level: "Beginner",
    category: "Strength",
    author: "FitLife Academy",
    authorAvatar: "",
    followers: 1567,
    isFollowing: false
  },
  {
    id: "5",
    name: "Cycling Endurance",
    description: "Improve your cycling endurance over 10 weeks. Perfect for century ride preparation.",
    duration: 10,
    workoutsPerWeek: 4,
    level: "Intermediate",
    category: "Cycling",
    author: "Bike Warriors",
    authorAvatar: "",
    followers: 743,
    isFollowing: true,
    progress: 20
  },
  {
    id: "6",
    name: "Triathlon Sprint",
    description: "Get race-ready for your first sprint triathlon with this comprehensive 12-week training plan.",
    duration: 12,
    workoutsPerWeek: 6,
    level: "Intermediate",
    category: "Multi-Sport",
    author: "Tri Club Pro",
    authorAvatar: "",
    followers: 1089,
    isFollowing: false
  }
];

export function TrainingPlans({ onBack, onCreatePlan, onViewPlan }: TrainingPlansProps) {
  const [plans, setPlans] = useState<TrainingPlan[]>(mockPlans);
  const [activeTab, setActiveTab] = useState<"browse" | "following" | "my-plans">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const handleFollow = (planId: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          isFollowing: !plan.isFollowing,
          followers: plan.isFollowing ? plan.followers - 1 : plan.followers + 1
        };
      }
      return plan;
    }));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-[#7a8872]/30 text-[#2d332d] border-[#2d332d]/10";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "Advanced":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      default:
        return "bg-[#9ca895]/30 text-[#2d332d] border-[#2d332d]/10";
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "all" || plan.level === selectedLevel;
    const matchesTab = activeTab === "browse" || (activeTab === "following" && plan.isFollowing);
    return matchesSearch && matchesLevel && matchesTab;
  });

  const renderPlanCard = (plan: TrainingPlan) => (
    <Card
      key={plan.id}
      className="bg-[#eef0ed] border-[#2d332d]/10 p-5 hover:border-[#2d332d]/30 transition-colors cursor-pointer rounded-3xl"
      onClick={() => onViewPlan(plan.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl text-[#2d332d] mb-2">{plan.name}</h3>
          <p className="text-sm text-[#2d332d]/60 mb-3">{plan.description}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-[#9ca895]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]/60">Duration</span>
          </div>
          <p className="text-[#2d332d]">{plan.duration} weeks</p>
        </div>
        <div className="bg-[#9ca895]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]/60">Per Week</span>
          </div>
          <p className="text-[#2d332d]">{plan.workoutsPerWeek}x</p>
        </div>
        <div className="bg-[#9ca895]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#2d332d]" />
            <span className="text-xs text-[#2d332d]/60">Followers</span>
          </div>
          <p className="text-[#2d332d]">{plan.followers}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={getLevelColor(plan.level)}>
          {plan.level}
        </Badge>
        <Badge className="bg-[#9ca895] text-[#2d332d] border-[#2d332d]/10">
          {plan.category}
        </Badge>
      </div>

      {/* Progress Bar (if following) */}
      {plan.isFollowing && plan.progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#2d332d]/60">Progress</span>
            <span className="text-xs text-[#2d332d]">{plan.progress}%</span>
          </div>
          <div className="w-full bg-[#9ca895]/30 rounded-full h-2">
            <div
              className="bg-[#2d332d] h-2 rounded-full transition-all"
              style={{ width: `${plan.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Author & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-[#2d332d]/10">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 border border-[#2d332d]/10">
            <AvatarImage src={plan.authorAvatar} />
            <AvatarFallback className="bg-[#9ca895] text-[#2d332d] text-xs">
              {plan.author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-[#2d332d]/60">{plan.author}</span>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleFollow(plan.id);
          }}
          size="sm"
          variant={plan.isFollowing ? "outline" : "default"}
          className={plan.isFollowing 
            ? "border-[#2d332d]/20 text-[#2d332d] hover:bg-[#9ca895]/30 rounded-full"
            : "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] rounded-full"
          }
        >
          {plan.isFollowing ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Following
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              Start Plan
            </>
          )}
        </Button>
      </div>
    </Card>
  );

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#2d332d]">Training Plans</h1>
              <p className="text-[10px] text-[#2d332d]/60">Follow structured programs</p>
            </div>
            <Button
              onClick={onCreatePlan}
              size="icon"
              className="bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] h-8 w-8 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2d332d]/40" />
            <Input
              type="text"
              placeholder="Search training plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#9ca895]/30 border-[#2d332d]/10 text-[#2d332d] h-11 rounded-full placeholder:text-[#2d332d]/40"
            />
          </div>

          {/* Level Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "Beginner", "Intermediate", "Advanced"].map(level => (
              <Button
                key={level}
                onClick={() => setSelectedLevel(level)}
                size="sm"
                variant={selectedLevel === level ? "default" : "outline"}
                className={selectedLevel === level
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] rounded-full"
                  : "border-[#2d332d]/20 hover:bg-[#9ca895]/30 text-[#2d332d] rounded-full"
                }
              >
                {level === "all" ? "All Levels" : level}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#9ca895]/30 border-none rounded-full">
            <TabsTrigger value="browse" className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895]">
              Browse All
            </TabsTrigger>
            <TabsTrigger value="following" className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895]">
              Following ({plans.filter(p => p.isFollowing).length})
            </TabsTrigger>
            <TabsTrigger value="my-plans" className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895]">
              My Plans
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Plans List */}
        <div className="space-y-4 pb-32">
          {filteredPlans.length === 0 ? (
            <Card className="bg-[#eef0ed] border-[#2d332d]/10 p-8 rounded-3xl">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-[#2d332d]/30" />
                <p className="text-[#2d332d]/70 mb-2">
                  {activeTab === "following" ? "You're not following any plans yet" : "No plans found"}
                </p>
                <p className="text-sm text-[#2d332d]/50">
                  {activeTab === "following" 
                    ? "Start following a training plan to see it here"
                    : "Try adjusting your search or filters"
                  }
                </p>
              </div>
            </Card>
          ) : (
            filteredPlans.map(plan => renderPlanCard(plan))
          )}
        </div>
      </div>
    </FloatingContent>
  );
}
