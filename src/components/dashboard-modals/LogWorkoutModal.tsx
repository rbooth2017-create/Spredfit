import { memo, useState, useRef } from "react";
import { ArrowLeft, Check, Camera, X } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useApp } from "../../utils/AppContext";
import { APIClient } from "../../utils/api";

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
  logDate: string;
  setLogDate: (date: string) => void;
  logTitle: string;
  setLogTitle: (title: string) => void;
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
  accessToken?: string | null;
}

function LogWorkoutModalComponent({
  modalStep,
  setModalStep,
  sports,
  selectedSport,
  setSelectedSport,
  logDate,
  setLogDate,
  logTitle,
  setLogTitle,
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
  accessToken,
}: LogWorkoutModalProps) {
  const { createWorkout, currentLeague, refreshActivities } = useApp();
  const [saving, setSaving] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 handlePhotoUpload triggered');
    
    const file = event.target.files?.[0];
    console.log('📦 File from input:', file);
    
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📊 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      toast.error('Image must be less than 5MB');
      return;
    }

    console.log('✅ File validation passed');
    setUploading(true);
    
    try {
      console.log('🔵 Creating API client with token:', accessToken ? 'Present' : 'Missing');
      const api = new APIClient(accessToken || null);
      
      console.log('🔵 Calling uploadWorkoutPhoto...');
      const photoUrl = await api.uploadWorkoutPhoto(file);
      
      console.log('✅ Photo uploaded! URL:', photoUrl);
      setUploadedPhoto(photoUrl);
      
      // Update the saved workout with the photo
      if (savedWorkoutId) {
        console.log('🔵 Updating workout', savedWorkoutId, 'with photo');
        await api.updateWorkout(savedWorkoutId, {
          type: selectedSport!,
          title: logTitle.trim() || null,
          duration: (parseInt(logHours) || 0) * 60 + (parseInt(logMinutes) || 0),
          distance: selectedSport === 'Swimming' ? (parseFloat(logDistance) || 0) / 1000 : (parseFloat(logDistance) || 0),
          created_at: new Date(logDate).toISOString(),
          notes: logNotes,
          photo_url: photoUrl,
        });
        console.log('✅ Workout updated with photo');
        await refreshActivities();
      } else {
        console.log('⚠️ No savedWorkoutId - photo uploaded but not attached to workout');
      }
      
      toast.success('Photo uploaded!');
      setShowPhotoUpload(false);
    } catch (error) {
      console.error('❌ Failed to upload photo:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('Failed to upload photo');
    } finally {
      console.log('🏁 Upload process finished');
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraButtonClick = () => {
    console.log('📷 Camera button clicked');
    console.log('📷 fileInputRef.current:', fileInputRef.current);
    if (fileInputRef.current) {
      console.log('📷 Triggering click on file input');
      fileInputRef.current.click();
    } else {
      console.log('❌ fileInputRef is null!');
    }
  };

  return (
    <>
      {/* Hidden file input - ALWAYS RENDERED */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          console.log('🎯 onChange fired! Files:', e.target.files);
          handlePhotoUpload(e);
        }}
        className="hidden"
        style={{ display: 'none' }}
      />

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
                        setModalStep(2);
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

        {/* Step 2: Date Selection */}
        {modalStep === 2 && selectedSport && (
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            <p className="text-white/70 text-xs">{selectedSport}</p>
            <p className="text-white text-sm">Select Date</p>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-center focus:outline-none focus:ring-2 focus:ring-white/40"
              style={{
                colorScheme: 'dark'
              }}
            />
          </div>
        )}

        {/* Step 3: Title Entry (NEW) */}
        {modalStep === 3 && selectedSport && (
          <div className="flex flex-col items-center text-center space-y-4 w-full px-4">
            <p className="text-white/70 text-xs">{selectedSport}</p>
            <p className="text-white text-sm">Add Title (Optional)</p>
            <input
              type="text"
              value={logTitle}
              onChange={(e) => setLogTitle(e.target.value)}
              placeholder="e.g. Morning Run"
              className="w-full px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-center placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
              maxLength={50}
            />
            <p className="text-white/50 text-xs">Will show in activity feed</p>
          </div>
        )}

        {/* Step 4: Distance Entry */}
        {modalStep === 4 && selectedSport && (
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

        {/* Step 5: Time Entry */}
        {modalStep === 5 && selectedSport && (
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

        {/* Step 6: Notes Entry */}
        {modalStep === 6 && selectedSport && (
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

        {/* Step 7: Review Activity */}
        {modalStep === 7 && selectedSport && !showPhotoUpload && (
          <div className="flex flex-col items-center text-center space-y-4 w-full px-4">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-white mb-1">Workout Logged!</p>
            </div>
            
            <div className="space-y-2 text-left w-full max-w-[200px]">
              {logTitle && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-xs">Title:</span>
                  <span className="text-white text-xs">{logTitle}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Sport:</span>
                <span className="text-white text-xs">{selectedSport}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Date:</span>
                <span className="text-white text-xs">
                  {new Date(logDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
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
              {uploadedPhoto && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-white/70 text-xs block mb-1">Photo:</span>
                  <span className="text-green-400 text-xs">✓ Uploaded</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Upload View */}
        {showPhotoUpload && (
          <div className="flex flex-col items-center text-center space-y-4 w-full px-4">
            <p className="text-white text-sm mb-2">Add Workout Photo</p>
            
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-white/70 text-xs">Uploading...</p>
              </div>
            ) : (
              <button
                onClick={handleCameraButtonClick}
                className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/40 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <Camera className="w-10 h-10 text-white" strokeWidth={1.5} />
              </button>
            )}
            
            <p className="text-white/50 text-xs">Tap to capture or select photo</p>
          </div>
        )}
      </div>

      {/* External Buttons - Step 2: Date Selection */}
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

      {/* External Buttons - Step 3: Title Entry */}
      {modalStep === 3 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(2)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Back</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  if (['Running', 'Cycling', 'Swimming'].includes(selectedSport!)) {
                    setModalStep(4);
                  } else {
                    setModalStep(5);
                  }
                }}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white -scale-x-100" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Next</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 4: Distance Entry */}
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
                onClick={() => setModalStep(5)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white -scale-x-100" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Next</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 5: Time Entry */}
      {modalStep === 5 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  if (selectedSport && ['Running', 'Cycling', 'Swimming'].includes(selectedSport)) {
                    setModalStep(4);
                  } else {
                    setModalStep(3);
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
                onClick={() => setModalStep(6)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white -scale-x-100" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Next</span>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 6: Notes Entry */}
      {modalStep === 6 && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setModalStep(5)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <ArrowLeft className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Back</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={async () => {
                  if (saving) return;
                  
                  setSaving(true);
                  try {
                    const totalMinutes = (parseInt(logHours) || 0) * 60 + (parseInt(logMinutes) || 0);
                    const workoutDate = new Date(logDate);
                    workoutDate.setHours(12, 0, 0, 0);
                    
                    const workoutData = {
                      type: selectedSport!,
                      title: logTitle.trim() || null,
                      duration: totalMinutes,
                      distance: selectedSport === 'Swimming' ? (parseFloat(logDistance) || 0) / 1000 : (parseFloat(logDistance) || 0),
                      created_at: workoutDate.toISOString(),
                      notes: logNotes,
                      leagueId: currentLeague?.id,
                      photo: uploadedPhoto,
                    };
                    
                    let workoutId;
                    if (editingWorkoutId && onUpdate) {
                      await onUpdate(editingWorkoutId, workoutData);
                      workoutId = editingWorkoutId;
                    } else {
                      const result = await createWorkout(workoutData);
                      workoutId = result.id;
                    }
                    
                    setSavedWorkoutId(workoutId);
                    toast.success(editingWorkoutId ? 'Workout Updated!' : 'Workout Logged!');
                    await refreshActivities();
                    setModalStep(7);
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

      {/* External Buttons - Step 7: Review Activity */}
      {modalStep === 7 && !showPhotoUpload && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Camera className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Photo</span>
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

      {/* External Buttons - Photo Upload View */}
      {showPhotoUpload && (
        <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setShowPhotoUpload(false)}
                disabled={uploading}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg disabled:opacity-50"
              >
                <X className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Cancel</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const LogWorkoutModal = memo(LogWorkoutModalComponent);