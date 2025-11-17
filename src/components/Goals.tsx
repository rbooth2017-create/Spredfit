import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Plus, Target, Clock, MapPin, Flame, Mountain, Activity, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FloatingContent } from "./FloatingContent";

interface GoalsProps {
  onBack: () => void;
}

type GoalType = "time" | "distance" | "calories" | "elevation" | "workouts";
type GoalSport = "all" | "Running" | "Cycling" | "Swimming" | "Strength" | "Yoga" | "Team Sports";

interface Goal {
  id: number;
  name: string;
  type: GoalType;
  target: number;
  current: number;
  unit: string;
  sport: GoalSport;
  timeframe: "week" | "month" | "year";
}

// Mock goals data
const initialGoals: Goal[] = [
  { id: 1, name: "Run 100km this month", type: "distance", target: 100, current: 58.3, unit: "km", sport: "Running", timeframe: "month" },
  { id: 2, name: "Complete 20 workouts", type: "workouts", target: 20, current: 14, unit: "workouts", sport: "all", timeframe: "month" },
  { id: 3, name: "Burn 15,000 calories", type: "calories", target: 15000, current: 12680, unit: "cal", sport: "all", timeframe: "month" },
  { id: 4, name: "Climb 5,000m elevation", type: "elevation", target: 5000, current: 4380, unit: "m", sport: "all", timeframe: "month" },
];

const getGoalIcon = (type: GoalType) => {
  switch (type) {
    case "time":
      return Clock;
    case "distance":
      return MapPin;
    case "calories":
      return Flame;
    case "elevation":
      return Mountain;
    case "workouts":
      return Activity;
  }
};

const getGoalColor = (type: GoalType) => {
  switch (type) {
    case "time":
      return "text-emerald-400";
    case "distance":
      return "text-teal-400";
    case "calories":
      return "text-orange-400";
    case "elevation":
      return "text-purple-400";
    case "workouts":
      return "text-blue-400";
  }
};

export function Goals({ onBack }: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<GoalType>("distance");
  const [formTarget, setFormTarget] = useState("");
  const [formSport, setFormSport] = useState<GoalSport>("all");
  const [formTimeframe, setFormTimeframe] = useState<"week" | "month" | "year">("month");

  const resetForm = () => {
    setFormName("");
    setFormType("distance");
    setFormTarget("");
    setFormSport("all");
    setFormTimeframe("month");
  };

  const getUnitForType = (type: GoalType): string => {
    switch (type) {
      case "time":
        return "minutes";
      case "distance":
        return "km";
      case "calories":
        return "cal";
      case "elevation":
        return "m";
      case "workouts":
        return "workouts";
    }
  };

  const handleAddGoal = () => {
    if (!formName.trim()) {
      toast.error("Please enter a goal name");
      return;
    }
    if (!formTarget || parseFloat(formTarget) <= 0) {
      toast.error("Please enter a valid target value");
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      name: formName,
      type: formType,
      target: parseFloat(formTarget),
      current: 0,
      unit: getUnitForType(formType),
      sport: formSport,
      timeframe: formTimeframe,
    };

    setGoals([...goals, newGoal]);
    toast.success("Goal added successfully!");
    setShowAddDialog(false);
    resetForm();
  };

  const handleEditGoal = () => {
    if (!editingGoal) return;
    
    if (!formName.trim()) {
      toast.error("Please enter a goal name");
      return;
    }
    if (!formTarget || parseFloat(formTarget) <= 0) {
      toast.error("Please enter a valid target value");
      return;
    }

    const updatedGoals = goals.map((goal) =>
      goal.id === editingGoal.id
        ? {
            ...goal,
            name: formName,
            type: formType,
            target: parseFloat(formTarget),
            unit: getUnitForType(formType),
            sport: formSport,
            timeframe: formTimeframe,
          }
        : goal
    );

    setGoals(updatedGoals);
    toast.success("Goal updated successfully!");
    setEditingGoal(null);
    resetForm();
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormName(goal.name);
    setFormType(goal.type);
    setFormTarget(goal.target.toString());
    setFormSport(goal.sport);
    setFormTimeframe(goal.timeframe);
  };

  const handleDeleteGoal = () => {
    if (!goalToDelete) return;
    
    setGoals(goals.filter((goal) => goal.id !== goalToDelete.id));
    toast.success("Goal deleted successfully!");
    setShowDeleteDialog(false);
    setGoalToDelete(null);
  };

  const openDeleteDialog = (goal: Goal) => {
    setGoalToDelete(goal);
    setShowDeleteDialog(true);
  };

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#2d332d] mb-0.5">Fitness Tracking</p>
              <h1 className="text-xl text-[#2d332d]">My Goals</h1>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="ghost"
              size="icon"
              className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#8a9881]/30 h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Goals List - Scrollable */}
        <div className="mb-32">
          <h3 className="text-base text-[#2d332d] mb-3">Active Goals</h3>
          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="bg-[#eef0ed] rounded-3xl p-12">
                <div className="text-center">
                  <Target className="w-16 h-16 text-[#2d332d]/30 mx-auto mb-4" />
                  <h3 className="text-xl text-[#2d332d] mb-2">No goals yet</h3>
                  <p className="text-[#2d332d]/60 mb-6">Create your first goal to start tracking your progress</p>
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#eef0ed] gap-2 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Goal
                  </Button>
                </div>
              </div>
            ) : (
              goals.map((goal) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                const isComplete = percentage >= 100;
                const Icon = getGoalIcon(goal.type);

                return (
                  <div key={goal.id} className="bg-[#eef0ed] rounded-3xl p-5 border border-[#2d332d]/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl bg-[#9ca895] flex items-center justify-center mt-1`}>
                          <Icon className={`w-5 h-5 text-[#2d332d]`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#2d332d] mb-1">{goal.name}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-[#9ca895] text-[#2d332d] border-[#2d332d]/10 text-xs">
                              {goal.sport}
                            </Badge>
                            <Badge className="bg-[#9ca895] text-[#2d332d] border-[#2d332d]/10 text-xs">
                              {goal.timeframe === "week" ? "Weekly" : goal.timeframe === "month" ? "Monthly" : "Yearly"}
                            </Badge>
                            {isComplete && (
                              <Badge className="bg-[#2d332d]/20 text-[#2d332d] border-[#2d332d]/30 text-xs">
                                Complete!
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button
                          onClick={() => openEditDialog(goal)}
                          variant="ghost"
                          size="icon"
                          className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] h-8 w-8"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(goal)}
                          variant="ghost"
                          size="icon"
                          className="text-[#2d332d]/60 hover:text-red-600 hover:bg-red-100 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="ml-13">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#2d332d]/60">
                          {goal.current.toFixed(goal.type === "workouts" ? 0 : 1)} / {goal.target} {goal.unit}
                        </span>
                        <span className={`text-sm ${isComplete ? "text-[#2d332d]" : "text-[#2d332d]/60"}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showAddDialog || editingGoal !== null} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingGoal(null);
          resetForm();
        }
      }}>
        <DialogContent className="bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#2d332d]">
              {editingGoal ? "Edit Goal" : "Add New Goal"}
            </DialogTitle>
            <DialogDescription className="text-[#2d332d]/70">
              {editingGoal ? "Update your goal details below" : "Create a new fitness goal to track your progress"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Goal Name */}
            <div>
              <Label htmlFor="goal-name" className="text-[#2d332d] mb-2 block">
                Goal Name
              </Label>
              <Input
                id="goal-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Run 100km this month"
                className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d] placeholder:text-[#2d332d]/40"
              />
            </div>

            {/* Goal Type */}
            <div>
              <Label htmlFor="goal-type" className="text-[#2d332d] mb-2 block">
                Goal Type
              </Label>
              <Select value={formType} onValueChange={(value) => setFormType(value as GoalType)}>
                <SelectTrigger className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#eef0ed] border-[#2d332d]/20">
                  <SelectItem value="distance" className="text-[#2d332d]">Distance (km)</SelectItem>
                  <SelectItem value="time" className="text-[#2d332d]">Time (minutes)</SelectItem>
                  <SelectItem value="calories" className="text-[#2d332d]">Calories</SelectItem>
                  <SelectItem value="elevation" className="text-[#2d332d]">Elevation (m)</SelectItem>
                  <SelectItem value="workouts" className="text-[#2d332d]">Workouts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Value */}
            <div>
              <Label htmlFor="goal-target" className="text-[#2d332d] mb-2 block">
                Target ({getUnitForType(formType)})
              </Label>
              <Input
                id="goal-target"
                type="number"
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                placeholder="Enter target value"
                className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d] placeholder:text-[#2d332d]/40"
              />
            </div>

            {/* Sport */}
            <div>
              <Label htmlFor="goal-sport" className="text-[#2d332d] mb-2 block">
                Sport
              </Label>
              <Select value={formSport} onValueChange={(value) => setFormSport(value as GoalSport)}>
                <SelectTrigger className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#eef0ed] border-[#2d332d]/20">
                  <SelectItem value="all" className="text-[#2d332d]">All Sports</SelectItem>
                  <SelectItem value="Running" className="text-[#2d332d]">Running</SelectItem>
                  <SelectItem value="Cycling" className="text-[#2d332d]">Cycling</SelectItem>
                  <SelectItem value="Swimming" className="text-[#2d332d]">Swimming</SelectItem>
                  <SelectItem value="Strength" className="text-[#2d332d]">Strength</SelectItem>
                  <SelectItem value="Yoga" className="text-[#2d332d]">Yoga</SelectItem>
                  <SelectItem value="Team Sports" className="text-[#2d332d]">Team Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe */}
            <div>
              <Label htmlFor="goal-timeframe" className="text-[#2d332d] mb-2 block">
                Timeframe
              </Label>
              <Select value={formTimeframe} onValueChange={(value) => setFormTimeframe(value as "week" | "month" | "year")}>
                <SelectTrigger className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#eef0ed] border-[#2d332d]/20">
                  <SelectItem value="week" className="text-[#2d332d]">This Week</SelectItem>
                  <SelectItem value="month" className="text-[#2d332d]">This Month</SelectItem>
                  <SelectItem value="year" className="text-[#2d332d]">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => {
                setShowAddDialog(false);
                setEditingGoal(null);
                resetForm();
              }}
              variant="outline"
              className="flex-1 border-[#2d332d]/20 text-[#2d332d] hover:bg-[#9ca895] hover:text-[#2d332d]"
            >
              Cancel
            </Button>
            <Button
              onClick={editingGoal ? handleEditGoal : handleAddGoal}
              className="flex-1 bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#eef0ed]"
            >
              {editingGoal ? "Update Goal" : "Add Goal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d]">
          <DialogHeader>
            <DialogTitle className="text-[#2d332d]">Delete Goal</DialogTitle>
            <DialogDescription className="text-[#2d332d]/70">
              Are you sure you want to delete "{goalToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setGoalToDelete(null);
              }}
              variant="outline"
              className="flex-1 border-[#2d332d]/20 text-[#2d332d] hover:bg-[#9ca895] hover:text-[#2d332d]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteGoal}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FloatingContent>
  );
}
