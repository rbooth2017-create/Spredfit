import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Clock, MapPin, Calendar } from "lucide-react";
import { getSportIcon, getSportGradient } from "./sportIcons";

interface WorkoutDetailProps {
  sport: string;
  onBack: () => void;
  onSave: (data: WorkoutData) => void;
  isEditing?: boolean;
  route?: Array<[number, number]>;
}

export interface WorkoutData {
  sport: string;
  duration: number;
  distance?: number;
  notes: string;
  date: string;
  route?: Array<[number, number]>;
}

const sportsWithDistance = ["Running", "Cycling", "Swimming"];

export function WorkoutDetail({ sport, onBack, onSave, isEditing = false, route }: WorkoutDetailProps) {
  // If editing, pre-populate with mock data (in real app, this would come from props)
  const [duration, setDuration] = useState(isEditing ? "45" : "");
  const [distance, setDistance] = useState(isEditing ? "8.2" : "");
  const [notes, setNotes] = useState(isEditing ? "Great morning run!" : "");
  const [date, setDate] = useState(isEditing ? "2025-11-03" : new Date().toISOString().split("T")[0]);

  const hasDistance = sportsWithDistance.includes(sport);

  const handleSave = () => {
    const workoutData: WorkoutData = {
      sport,
      duration: parseFloat(duration) || 0,
      distance: hasDistance ? parseFloat(distance) || 0 : undefined,
      notes,
      date,
    };
    
    onSave(workoutData);
  };

  const SportIcon = getSportIcon(sport);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#a88e86] text-[#2d332d]">
      {/* Halftone Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #2d332d 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 py-8 pb-24 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <h1 className="text-3xl text-[#2d332d]">{isEditing ? 'Edit' : 'Log'} {sport}</h1>
        </div>

        {/* Sport Icon Card */}
        <Card className="p-6 bg-[#eef0ed] border-none mb-6 rounded-2xl shadow-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2d332d]">
              <SportIcon className="w-8 h-8 text-[#eef0ed]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl text-[#2d332d]">{sport}</h2>
              <p className="text-[#2d332d]/60">Enter your workout details</p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <div className="space-y-6">
          {/* Date */}
          <Card className="p-5 bg-[#eef0ed] border-none rounded-2xl shadow-none">
            <Label htmlFor="date" className="text-[#2d332d] flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#2d332d]" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d]"
            />
          </Card>

          {/* Duration */}
          <Card className="p-5 bg-[#eef0ed] border-none rounded-2xl shadow-none">
            <Label htmlFor="duration" className="text-[#2d332d] flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#2d332d]" />
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              placeholder="45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d]"
              min="0"
              step="1"
            />
          </Card>

          {/* Distance (only for certain sports) */}
          {hasDistance && (
            <Card className="p-5 bg-[#eef0ed] border-none rounded-2xl shadow-none">
              <Label htmlFor="distance" className="text-[#2d332d] flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#2d332d]" />
                Distance (km)
              </Label>
              <Input
                id="distance"
                type="number"
                placeholder="10.5"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d]"
                min="0"
                step="0.1"
              />
            </Card>
          )}

          {/* Notes */}
          <Card className="p-5 bg-[#eef0ed] border-none rounded-2xl shadow-none">
            <Label htmlFor="notes" className="text-[#2d332d] mb-3 block">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="How did the workout feel? Any achievements?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d] min-h-[120px] resize-none placeholder:text-[#2d332d]/40"
            />
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!duration}
            className="w-full h-14 bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#eef0ed] rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-none border-none"
          >
            {isEditing ? 'Update Workout' : 'Save Workout'}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-center text-[#2d332d]/60 mt-6 text-sm">
          {hasDistance
            ? "Enter your workout time and distance to log this activity"
            : "Enter your workout time to log this activity"}
        </p>
      </div>

      {/* Back Button - Fixed Bottom Right */}
      <div className="fixed bottom-8 right-4 z-50">
        <Button
          onClick={onBack}
          size="icon"
          className="w-20 h-20 rounded-full bg-[#2d2d2d] hover:bg-[#2d2d2d]/90 text-white shadow-lg"
        >
          <ArrowLeft className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
}