import { memo, useState } from "react";
import { ArrowLeft, Check, Camera } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useApp } from "../../utils/AppContext";

interface Sport {
  name: string;
  icon: any;
}

interface LogWorkoutModalProps {
  modalStep: number;
  setModalStep: (step: number) => void;
  sports: Sport[];
  selectedSport: string | null;
  setSelectedSport: (sport: string | null) => void;
  logDistance: string;
  setLogDistance: (distance: string) => void;
  logHours: string;
  setLogHours: (hours: string) => void;
  logMinutes: string;
  setLogMinutes: (minutes: string) => void;
  logNotes: string;
  setLogNotes: (notes: string) => void;
  showPhotoUpload: boolean;
  setShowPhotoUpload: (show: boolean) => void;
  editingWorkoutId?: string | null;
  onUpdate?: (id: string, data: any) => Promise<void>;
  onClose: () => void;
}

function LogWorkoutModalComponent({
  modalStep,
  setModalStep,
  sports,
  selectedSport,
  setSelectedSport,
  logDistance,
  setLogDistance,
  logHours,
  setLogHours,
  logMinutes,
  setLogMinutes,
  logNotes,
  setLogNotes,
  showPhotoUpload,
  setShowPhotoUpload,
  editingWorkoutId,
  onUpdate,
  onClose,
}: LogWorkoutModalProps) {
  const { createWorkout, currentLeague, refreshActivities } = useApp();
  const [saving, setSaving] = useState(false);

  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl">
        {/* Step 1: Sport Selection */}
        {modalStep === 1 && (
          <div className="flex flex-col items-center text-center">
            <p className="text-white text-sm mb-6">Select Sport</p>
            <div className="grid grid-cols-3 gap-4 max-w-[220px]">
              {sports.map((sport) => {
                const IconComponent = sport.icon;
                return (
                  <div key={sport.name} className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedSport(sport.name);
                        // Check if sport needs distance
                        if (['Running', 'Cycling', 'Swimming'].includes(sport.name)) {
                          setModalStep(2); // Go to distance entry
                        } else {
                          setModalStep(3); // Skip to time entry
                        }
                      }}
                      className="w-14 h-14 rounded-full bg-transparent backdrop-blur-sm hover:bg-white/10 flex items-center justify-center transition-all border border-white/20"
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </button>
                    <span className="text-white/70 text-[10px]">{sport.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Distance Entry (for Running, Cycling, Swimming) */}
        {modalStep === 2 && selectedSport && (
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            <p className="text-white/70 text-xs">{selectedSport}</p>
            <p className="text-white text-sm">Enter Distance</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={logDistance}
                onChange={(e) => setLogDistance(e.target.value)}
                placeholder="0.0"
                className="w-24 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-center placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                step="0.1"
                min="0"
              />
              <span className="text-white text-sm">
                {selectedSport === 'Swimming' ? 'm' : 'km'}
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Time Entry */}
        {modalStep === 3 && selectedSport && (
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            <p className="text-white/70 text-xs">{selectedSport}</p>
            <p className="text-white text-sm">Enter Duration</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={logHours}
                onChange={(e) => setLogHours(e.target.value)}
                placeholder="0"
                className="w-16 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-center placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                min="0"
              />
              <span className="text-white text-sm">h</span>
              <input
                type="number"
                value={logMinutes}
                onChange={(e) => setLogMinutes(e.target.value)}
                placeholder="0"
                className="w-16 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-center placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                min="0"
                max="59"
              />
              <span className="text-white text-sm">min</span>
            </div>
          </div>
        )}

        {/* Step 4: Notes Entry */}
        {modalStep === 4 && selectedSport && (
          <div className="flex flex-col items-center text-center space-y-4 w-full px-4">
            <p className="text-white/70 text-xs">{selectedSport}</p>
            <p className="text-white text-sm">Add Notes (Optional)</p>
            <textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="How did it feel?"
              className="w-full h-24 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none text-sm"
              maxLength={150}
            />
          </div>
        )}

        {/* Step 5: Review Activity */}
        {modalStep === 5 && selectedSport && (
          <div className="flex flex-col items-center text-center space-y-4 w-full px-4">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-white mb-1">Workout Logged!</p>
            </div>
            
            <div className="space-y-2 text-left w-full max-w-[200px]">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Sport:</span>
                <span className="text-white text-xs">{selectedSport}</span>
              </div>
              {logDistance && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-xs">Distance:</span>
                  <span className="text-white text-xs">{logDistance}{selectedSport === 'Swimming' ? 'm' : 'km'}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Duration:</span>
                <span className="text-white text-xs">
                  {logHours ? `${logHours}h ` : ''}{logMinutes}min
                </span>
              </div>
              {logNotes && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-white/70 text-xs block mb-1">Notes:</span>
                  <span className="text-white text-xs">{logNotes}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* External Buttons - Step 2: Distance Entry */}
      {modalStep === 2 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(1)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Back</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(3)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white -scale-x-100" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Next</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 3: Time Entry */}
      {modalStep === 3 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  // Go back to distance entry for sports that have it, otherwise go to sport selection
                  if (selectedSport && ['Running', 'Cycling', 'Swimming'].includes(selectedSport)) {
                    setModalStep(2);
                  } else {
                    setModalStep(1);
                  }
                }}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Back</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(4)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white -scale-x-100" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Next</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 4: Notes Entry */}
      {modalStep === 4 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(3)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Back</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={async () => {
                  if (saving) return; // Prevent double-click
                  
                  setSaving(true);
                  try {
                    const totalMinutes = (parseInt(logHours) || 0) * 60 + (parseInt(logMinutes) || 0);
                    const workoutData = {
                      type: selectedSport!,
                      duration: totalMinutes,
                      distance: parseFloat(logDistance) || 0,
                      date: new Date().toISOString(),
                      notes: logNotes,
                      leagueId: currentLeague?.id,
                    };
                    
                    if (editingWorkoutId && onUpdate) {
                      await onUpdate(editingWorkoutId, workoutData);
                    } else {
                      await createWorkout(workoutData);
                    }
                    
                    toast.success(editingWorkoutId ? 'Workout Updated!' : 'Workout Logged!');
                    await refreshActivities();
                    setModalStep(5);
                  } catch (error) {
                    console.error("Failed to save workout:", error);
                    toast.error("Failed to save workout");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">{saving ? 'Saving...' : 'Save'}</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 5: Review Activity */}
      {modalStep === 5 && !showPhotoUpload && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Camera className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Add Photo</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Done</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const LogWorkoutModal = memo(LogWorkoutModalComponent);