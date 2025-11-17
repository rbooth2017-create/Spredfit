import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, MapPin, Zap, Calendar, Flame, Trophy, Target, Mountain, Activity, Filter } from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FloatingContent } from "./FloatingContent";
import { getSportIcon } from "./sportIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface MetricsProps {
  onBack: () => void;
}

type TimePeriod = "week" | "month" | "year" | "all";
type SportFilter = "all" | "Running" | "Cycling" | "Swimming" | "Strength" | "Yoga" | "Team Sports";

// Mock data generation (kept same as original)
const generateMockData = (period: TimePeriod, sportFilter: SportFilter) => {
  const sportMultiplier = sportFilter === "all" ? 1 : sportFilter === "Running" ? 0.4 : sportFilter === "Cycling" ? 0.6 : 0.3;
  
  if (period === "week") {
    return {
      current: [
        { label: "Mon", time: 60 * sportMultiplier, distance: 8.5 * sportMultiplier, calories: 420, workouts: 1 },
        { label: "Tue", time: 45 * sportMultiplier, distance: 6.2 * sportMultiplier, calories: 310, workouts: 1 },
        { label: "Wed", time: 75 * sportMultiplier, distance: 12.1 * sportMultiplier, calories: 580, workouts: 1 },
        { label: "Thu", time: 0, distance: 0, calories: 0, workouts: 0 },
        { label: "Fri", time: 90 * sportMultiplier, distance: 15.3 * sportMultiplier, calories: 720, workouts: 2 },
        { label: "Sat", time: 120 * sportMultiplier, distance: 45.8 * sportMultiplier, calories: 890, workouts: 1 },
        { label: "Sun", time: 50 * sportMultiplier, distance: 9.1 * sportMultiplier, calories: 470, workouts: 1 },
      ],
      totals: {
        time: 440 * sportMultiplier,
        distance: 97.0 * sportMultiplier,
        avgSpeed: 10.2,
        calories: 3390,
        elevation: 1080,
        workouts: 7,
      },
      previousTotals: {
        time: 345 * sportMultiplier,
        distance: 75.2 * sportMultiplier,
        avgSpeed: 10.1,
        calories: 2850,
        elevation: 915,
        workouts: 6,
      },
    };
  } else if (period === "month") {
    return {
      current: [
        { label: "Week 1", time: 320 * sportMultiplier, distance: 65.4 * sportMultiplier, calories: 2850, workouts: 5 },
        { label: "Week 2", time: 280 * sportMultiplier, distance: 58.2 * sportMultiplier, calories: 2450, workouts: 4 },
        { label: "Week 3", time: 410 * sportMultiplier, distance: 82.1 * sportMultiplier, calories: 3620, workouts: 6 },
        { label: "Week 4", time: 440 * sportMultiplier, distance: 97.0 * sportMultiplier, calories: 3890, workouts: 7 },
      ],
      totals: {
        time: 1450 * sportMultiplier,
        distance: 302.7 * sportMultiplier,
        avgSpeed: 12.5,
        calories: 12810,
        elevation: 4330,
        workouts: 22,
      },
      previousTotals: {
        time: 1195 * sportMultiplier,
        distance: 238.2 * sportMultiplier,
        avgSpeed: 11.9,
        calories: 10340,
        elevation: 3330,
        workouts: 19,
      },
    };
  } else {
    return {
      current: [
        { label: "Jan", time: 980 * sportMultiplier, distance: 198.5 * sportMultiplier, calories: 8520, workouts: 18 },
        { label: "Feb", time: 1120 * sportMultiplier, distance: 225.3 * sportMultiplier, calories: 9680, workouts: 20 },
        { label: "Mar", time: 1280 * sportMultiplier, distance: 268.9 * sportMultiplier, calories: 11250, workouts: 24 },
        { label: "Apr", time: 1350 * sportMultiplier, distance: 285.6 * sportMultiplier, calories: 11820, workouts: 25 },
        { label: "May", time: 1520 * sportMultiplier, distance: 321.4 * sportMultiplier, calories: 13280, workouts: 28 },
        { label: "Jun", time: 1480 * sportMultiplier, distance: 312.8 * sportMultiplier, calories: 12950, workouts: 27 },
      ],
      totals: {
        time: 7730 * sportMultiplier,
        distance: 1612.5 * sportMultiplier,
        avgSpeed: 12.5,
        calories: 67500,
        elevation: 23200,
        workouts: 142,
      },
      previousTotals: {
        time: 7005 * sportMultiplier,
        distance: 1440.4 * sportMultiplier,
        avgSpeed: 12.3,
        calories: 60895,
        elevation: 20685,
        workouts: 127,
      },
    };
  }
};

const personalRecords = {
  longestRun: { value: 21.1, date: "2025-08-15" },
  longestRide: { value: 87.5, date: "2025-07-20" },
  longestWorkout: { value: 180, date: "2025-09-10" },
  mostCalories: { value: 1250, date: "2025-09-10" },
};

const goals = [
  { id: 1, name: "Run 100km this month", target: 100, current: 58.3, unit: "km", sport: "Running" },
  { id: 2, name: "Complete 20 workouts", target: 20, current: 14, unit: "workouts", sport: "all" },
  { id: 3, name: "Burn 15,000 calories", target: 15000, current: 12680, unit: "cal", sport: "all" },
];

export function Metrics({ onBack }: MetricsProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");
  const data = generateMockData(timePeriod, sportFilter);

  const timeChange = data.previousTotals.time > 0
    ? ((data.totals.time - data.previousTotals.time) / data.previousTotals.time) * 100
    : 0;
  const distanceChange = data.previousTotals.distance > 0
    ? ((data.totals.distance - data.previousTotals.distance) / data.previousTotals.distance) * 100
    : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatChange = (change: number) => {
    const absChange = Math.abs(change);
    const sign = change >= 0 ? "+" : "-";
    return `${sign}${absChange.toFixed(1)}%`;
  };

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div>
            <p className="text-[10px] text-[#2d332d] mb-0.5">Performance Stats</p>
            <h1 className="text-xl text-[#2d332d]">Metrics</h1>
          </div>
        </div>

        {/* Sport Filter */}
        <div className="bg-[#eef0ed] rounded-3xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[#2d332d]" />
            <Select value={sportFilter} onValueChange={(value) => setSportFilter(value as SportFilter)}>
              <SelectTrigger className="flex-1 bg-[#9ca895] border-[#2d332d]/10 text-[#2d332d] rounded-full">
                <SelectValue placeholder="Filter by sport" />
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
        </div>

        {/* Time Period Selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {(["week", "month", "year", "all"] as TimePeriod[]).map((period) => (
            <Button
              key={period}
              onClick={() => setTimePeriod(period)}
              variant={timePeriod === period ? "default" : "outline"}
              className={`h-11 rounded-full ${
                timePeriod === period
                  ? "bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#eef0ed]"
                  : "border-[#2d332d]/20 bg-[#eef0ed] hover:bg-[#9ca895] text-[#2d332d]"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#2d332d]" />
              <p className="text-xs text-[#2d332d]/60">Time</p>
            </div>
            <p className="text-2xl text-[#2d332d] mb-1">{formatTime(data.totals.time)}</p>
            {data.previousTotals.time > 0 && (
              <div className={`flex items-center gap-1 text-xs ${timeChange >= 0 ? "text-[#2d332d]" : "text-red-600"}`}>
                {timeChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{formatChange(timeChange)}</span>
              </div>
            )}
          </div>

          <div className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/10">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#2d332d]" />
              <p className="text-xs text-[#2d332d]/60">Distance</p>
            </div>
            <p className="text-2xl text-[#2d332d] mb-1">{data.totals.distance.toFixed(1)} km</p>
            {data.previousTotals.distance > 0 && (
              <div className={`flex items-center gap-1 text-xs ${distanceChange >= 0 ? "text-[#2d332d]" : "text-red-600"}`}>
                {distanceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{formatChange(distanceChange)}</span>
              </div>
            )}
          </div>

          <div className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#2d332d]" />
              <p className="text-xs text-[#2d332d]/60">Workouts</p>
            </div>
            <p className="text-2xl text-[#2d332d] mb-1">{data.totals.workouts}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#eef0ed] rounded-3xl p-5 mb-6 border border-[#2d332d]/10">
          <h3 className="text-[#2d332d] mb-4">Activity Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.current}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d332d" opacity={0.1} />
              <XAxis dataKey="label" stroke="#2d332d" fontSize={12} />
              <YAxis stroke="#2d332d" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#eef0ed', 
                  border: '1px solid #2d332d', 
                  borderRadius: '12px',
                  color: '#2d332d'
                }} 
              />
              <Bar dataKey="time" fill="#2d332d" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Section */}
        <div className="bg-[#eef0ed] rounded-3xl p-5 mb-6 border border-[#2d332d]/10">
          <h3 className="text-[#2d332d] mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Goals
          </h3>
          <div className="space-y-4">
            {goals.filter(goal => sportFilter === "all" || goal.sport === sportFilter || goal.sport === "all").map((goal) => {
              const percentage = Math.min((goal.current / goal.target) * 100, 100);
              const isComplete = percentage >= 100;
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#2d332d] text-sm">{goal.name}</span>
                    <Badge className={`${isComplete ? 'bg-[#2d332d]/20 text-[#2d332d]' : 'bg-[#9ca895] text-[#2d332d]'}`}>
                      {isComplete ? 'Complete!' : `${goal.current.toFixed(0)}/${goal.target}`}
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-[#eef0ed] rounded-3xl p-5 mb-32 border border-[#2d332d]/10">
          <h3 className="text-[#2d332d] mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Personal Records
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#9ca895] rounded-xl p-3">
              <p className="text-xs text-[#2d332d]/60 mb-1">Longest Run</p>
              <p className="text-xl text-[#2d332d]">{personalRecords.longestRun.value} km</p>
              <p className="text-xs text-[#2d332d]/40">{new Date(personalRecords.longestRun.date).toLocaleDateString()}</p>
            </div>
            <div className="bg-[#9ca895] rounded-xl p-3">
              <p className="text-xs text-[#2d332d]/60 mb-1">Longest Ride</p>
              <p className="text-xl text-[#2d332d]">{personalRecords.longestRide.value} km</p>
              <p className="text-xs text-[#2d332d]/40">{new Date(personalRecords.longestRide.date).toLocaleDateString()}</p>
            </div>
            <div className="bg-[#9ca895] rounded-xl p-3">
              <p className="text-xs text-[#2d332d]/60 mb-1">Longest Workout</p>
              <p className="text-xl text-[#2d332d]">{personalRecords.longestWorkout.value} min</p>
              <p className="text-xs text-[#2d332d]/40">{new Date(personalRecords.longestWorkout.date).toLocaleDateString()}</p>
            </div>
            <div className="bg-[#9ca895] rounded-xl p-3">
              <p className="text-xs text-[#2d332d]/60 mb-1">Most Calories</p>
              <p className="text-xl text-[#2d332d]">{personalRecords.mostCalories.value} cal</p>
              <p className="text-xs text-[#2d332d]/40">{new Date(personalRecords.mostCalories.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </FloatingContent>
  );
}
