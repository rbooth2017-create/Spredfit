import { memo } from "react";
import { Camera, ArrowLeft } from "lucide-react";

interface WorkoutPhotoModalProps {
  workoutPhoto: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onClose: () => void;
}

/**
 * WorkoutPhotoModal Component
 * 
 * Circular modal overlay for uploading workout photos.
 * Shared between Log Workout and Start Workout modals.
 */
function WorkoutPhotoModalComponent({ 
  workoutPhoto, 
  fileInputRef,
  onClose 
}: WorkoutPhotoModalProps) {
  return (
    <>
      {/* Photo Upload Modal - Circular overlay */}
      <div 
        className="fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center w-full">
            <p className="text-white text-sm mb-6">Upload Photo</p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 mb-4 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:bg-[#2d332d]/60 transition-all group"
            >
              {workoutPhoto ? (
                <img src={workoutPhoto} alt="Workout" className="w-full h-full object-cover rounded-full" />
              ) : (
                <Camera className="w-12 h-12 text-white/60 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
              )}
            </button>
            
            <p className="text-white/70 text-[10px] mb-6 px-4">
              Tap to select a photo from your device
            </p>
            
            {workoutPhoto && (
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-[#7a8872] hover:bg-[#7a8872]/90 text-white text-xs transition-all"
              >
                Save Photo
              </button>
            )}
          </div>
        </div>
        
        {/* Back Button - Bottom Right */}
        <div className="fixed bottom-8 right-4 z-[70]">
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onClose}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
            >
              <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-xs text-center">Back</span>
          </div>
        </div>
      </div>
    </>
  );
}

export const WorkoutPhotoModal = memo(WorkoutPhotoModalComponent);