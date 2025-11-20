import { useState } from "react";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import { FloatingContent } from "./FloatingContent";

interface UploadWorkoutPhotoProps {
  workoutId: string | null;
  onBack: () => void;
  onSkip: () => void;
  workoutSport: string;
}

export function UploadWorkoutPhoto({ workoutId, onBack, onSkip, workoutSport }: UploadWorkoutPhotoProps) {
  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#2d332d] mb-0.5">Workout Complete</p>
              <h1 className="text-xl text-[#2d332d]">Great Job!</h1>
            </div>
            <Button
              onClick={onSkip}
              variant="ghost"
              size="icon"
              className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-white/30 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Workout Summary Card */}
        <div className="mb-6">
          <div className="p-8 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/20">
            <div className="flex flex-col items-center gap-6">
              <div className="w-40 h-40 rounded-2xl bg-[#2d332d]/80 flex items-center justify-center overflow-hidden ring-4 ring-white/20">
                <Check className="w-20 h-20 text-[#eef0ed]" />
              </div>

              <div className="text-center">
                <h2 className="text-lg text-white">{workoutSport}</h2>
                <p className="text-sm text-white/70 mt-1">
                  Workout logged successfully
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pb-8 pt-32">
          <Button
            onClick={onSkip}
            className="w-full h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full shadow-none border border-white/20"
          >
            Done
          </Button>
        </div>
      </div>
    </FloatingContent>
  );
}