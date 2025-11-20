import { memo } from "react";
import { Navigation, Check, Camera, Play, Pause, Activity, Lock, Unlock, ChevronRight, ChevronLeft, Square } from "lucide-react";

interface Sport {
  name: string;
  icon: any;
}

interface StartWorkoutModalProps {
  modalStep: number;
  setModalStep: (step: number) => void;
  sports: Sport[];
  selectedSport: string | null;
  setSelectedSport: (sport: string | null) => void;
  gpsSearching: boolean;
  setGpsSearching: (searching: boolean) => void;
  gpsConnected: boolean;
  setGpsConnected: (connected: boolean) => void;
  workoutTime: number;
  formatTime: (seconds: number) => string;
  recordedDistance: number;
  recordedPace: string;
  isWorkoutRunning: boolean;
  showLockScreen: boolean;
  setShowLockScreen: (show: boolean) => void;
  handlePauseToggle: () => void;
  handleCompleteWorkout: () => void;
  showPhotoUpload: boolean;
  setShowPhotoUpload: (show: boolean) => void;
  isLocked: boolean;
  sliderRef: React.RefObject<HTMLDivElement>;
  slidePosition: number;
  isDragging: boolean;
  handleSlideStart: (e: React.MouseEvent | React.TouchEvent) => void;
  toggleLock: () => void;
  onClose: () => void;
}

function StartWorkoutModalComponent({
  modalStep,
  setModalStep,
  sports,
  selectedSport,
  setSelectedSport,
  gpsSearching,
  setGpsSearching,
  gpsConnected,
  setGpsConnected,
  workoutTime,
  formatTime,
  recordedDistance,
  recordedPace,
  isWorkoutRunning,
  showLockScreen,
  setShowLockScreen,
  handlePauseToggle,
  handleCompleteWorkout,
  showPhotoUpload,
  setShowPhotoUpload,
  isLocked,
  sliderRef,
  slidePosition,
  isDragging,
  handleSlideStart,
  toggleLock,
  onClose,
}: StartWorkoutModalProps) {
  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl">
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
                        // Check if sport needs GPS (outdoor sports)
                        if (['Running', 'Cycling', 'Swimming', 'Team Sports'].includes(sport.name)) {
                          setGpsSearching(true);
                          setModalStep(2); // GPS searching
                        } else {
                          setGpsConnected(false);
                          setModalStep(3); // Skip GPS, go straight to recording
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

        {/* Step 2: GPS Searching */}
        {modalStep === 2 && selectedSport && gpsSearching && (
          <div className="flex flex-col items-center text-center space-y-6">
            <p className="text-white/70 text-xs">{selectedSport}</p>
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center animate-pulse">
                <Navigation className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
              <div className="absolute -inset-4 border-2 border-white/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            </div>
            <p className="text-white text-sm">Searching for GPS signal...</p>
            <button
              onClick={() => {
                setGpsSearching(false);
                setGpsConnected(false);
                setModalStep(3);
              }}
              className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs border border-white/20 hover:bg-white/20 transition-all"
            >
              Skip GPS
            </button>
          </div>
        )}

        {/* Step 3: Recording */}
        {modalStep === 3 && selectedSport && (
          <div className="flex flex-col items-center text-center space-y-4">
            <p className="text-white/70 text-xs mb-2">{selectedSport}</p>
            
            {/* Time Display */}
            <div className="mb-2">
              <p className="text-5xl text-white">{formatTime(workoutTime)}</p>
            </div>

            {/* Distance and Pace (only for GPS-enabled sports) */}
            {gpsConnected && (
              <div className="flex gap-6 mb-2">
                <div>
                  <p className="text-white/50 text-[10px] mb-0.5">Distance</p>
                  <p className="text-white text-lg">{recordedDistance.toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-white/50 text-[10px] mb-0.5">Pace</p>
                  <p className="text-white text-lg">{recordedPace} /km</p>
                </div>
              </div>
            )}

            {/* Lock Screen Widget Button */}
            <div className="mb-2">
              <button
                onClick={() => setShowLockScreen(!showLockScreen)}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs border border-white/20 hover:bg-white/20 transition-all"
              >
                {showLockScreen ? 'Hide' : 'Show'} Lock Widget
              </button>
            </div>

            <div className="flex gap-3">
              {!isWorkoutRunning ? (
                <button
                  onClick={handlePauseToggle}
                  className="w-16 h-16 rounded-full bg-[#2d2d2d] text-white flex items-center justify-center shadow-lg border border-white/20"
                >
                  <Play className="w-7 h-7" />
                </button>
              ) : (
                <button
                  onClick={handlePauseToggle}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shadow-lg border border-white/30"
                >
                  <Pause className="w-7 h-7" />
                </button>
              )}
              <button
                onClick={handleCompleteWorkout}
                className="w-16 h-16 rounded-full bg-white text-[#2d332d] flex items-center justify-center shadow-lg"
              >
                <Check className="w-7 h-7" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Workout Complete - Review Activity */}
        {modalStep === 4 && selectedSport && (
          <div className="flex flex-col items-center text-center space-y-4 w-full px-4">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-white mb-1">Workout Complete!</p>
            </div>
            
            <div className="space-y-2 text-left w-full max-w-[200px]">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Sport:</span>
                <span className="text-white text-xs">{selectedSport}</span>
              </div>
              {gpsConnected && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-xs">Distance:</span>
                  <span className="text-white text-xs">{recordedDistance.toFixed(2)} km</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Duration:</span>
                <span className="text-white text-xs">{formatTime(workoutTime)}</span>
              </div>
              {gpsConnected && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-xs">Avg Pace:</span>
                  <span className="text-white text-xs">{recordedPace} /km</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lock Screen Widget for Recording Workout */}
      {modalStep === 3 && showLockScreen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center">
            {/* Time Display */}
            <div className="text-center mb-8">
              <p className="text-7xl mb-1 text-white">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
              <p className="text-white/60 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            
            {/* Circular Widget */}
            <div className="relative w-[340px] h-[340px] bg-white/10 backdrop-blur-sm rounded-full shadow-2xl border-8 border-white/20 flex flex-col items-center justify-center p-10">
              {/* Sport Icon */}
              <div className="w-14 h-14 rounded-full bg-[#2d2d2d] flex items-center justify-center mb-4 shadow-lg border border-white/20">
                <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>

              {/* Sport Name */}
              <p className="text-sm text-white/70 mb-3">{selectedSport}</p>

              {/* Large Timer Display */}
              <p className="text-4xl text-white mb-1 tracking-tight">{formatTime(workoutTime)}</p>

              {/* Distance and Pace */}
              {gpsConnected && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-lg text-white">{recordedDistance.toFixed(2)}</p>
                    <p className="text-[9px] text-white/60">KM</p>
                  </div>
                  <div className="w-px h-6 bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-lg text-white">{recordedPace}</p>
                    <p className="text-[9px] text-white/60">/KM</p>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isWorkoutRunning ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/10 backdrop-blur-sm'} border border-white/30`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isWorkoutRunning ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
                  <p className="text-[10px] text-white">{isWorkoutRunning ? 'Recording' : 'Paused'}</p>
                </div>
                {gpsConnected && (
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <Navigation className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Lock Status or Slider */}
              {isLocked ? (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3 text-white/60" />
                    <p className="text-[10px] text-white/60">Slide to unlock</p>
                  </div>
                  <div 
                    ref={sliderRef}
                    className="relative h-12 w-full bg-white/10 backdrop-blur-sm rounded-full overflow-visible cursor-grab active:cursor-grabbing border-2 border-white/20 shadow-inner"
                    onMouseDown={handleSlideStart}
                    onTouchStart={handleSlideStart}
                  >
                    <div className="absolute inset-0 flex items-center justify-end pr-12 gap-0.5 pointer-events-none opacity-30">
                      <ChevronRight className="w-4 h-4 text-white animate-pulse" style={{ animationDelay: '0ms' }} />
                      <ChevronRight className="w-4 h-4 text-white animate-pulse" style={{ animationDelay: '150ms' }} />
                      <ChevronRight className="w-4 h-4 text-white animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                    
                    <div 
                      className="absolute inset-y-0 left-0 bg-white/30 backdrop-blur-sm rounded-full transition-all duration-75"
                      style={{ 
                        width: slidePosition > 0 ? `calc(${slidePosition}% * 0.68 + 48px)` : '0%',
                        opacity: slidePosition > 0 ? 1 : 0
                      }}
                    />
                    
                    <div 
                      data-slider-knob
                      className="absolute top-1 bottom-1 w-10 bg-[#2d2d2d] rounded-full flex items-center justify-center shadow-2xl transition-all duration-75 border border-white/20"
                      style={{ 
                        left: `calc(${slidePosition}% * 0.68 + 4px)`,
                        transform: `scale(${isDragging ? 1.08 : 1})`,
                        boxShadow: isDragging ? '0 0 20px rgba(255, 255, 255, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      <Lock className="w-4 h-4 text-white drop-shadow" />
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-white/50" style={{ opacity: slidePosition > 40 ? 0 : 1, transition: 'opacity 150ms' }}>
                        Slide
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <Unlock className="w-3 h-3 text-white/70" />
                  <p className="text-[10px] text-white/60">Unlocked</p>
                  <button
                    onClick={toggleLock}
                    className="ml-1 px-2 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-[9px] text-white border border-white/20 transition-all"
                  >
                    Lock
                  </button>
                </div>
              )}

            </div>

            {/* Control Buttons Below Circle */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePauseToggle}
                disabled={isLocked}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 shadow-xl transition-all border ${
                  isWorkoutRunning
                    ? 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30'
                    : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/40'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {isWorkoutRunning ? (
                  <>
                    <Pause className="w-7 h-7" strokeWidth={2.5} />
                    <span className="text-[9px]">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-7 h-7" strokeWidth={2.5} />
                    <span className="text-[9px]">Resume</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCompleteWorkout}
                disabled={isLocked}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] hover:bg-[#2d2d2d]/90 text-white flex flex-col items-center justify-center gap-1 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/20"
              >
                <Square className="w-7 h-7" strokeWidth={2.5} />
                <span className="text-[9px]">End</span>
              </button>
            </div>

            {/* Return Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => setShowLockScreen(false)}
                className="text-white/60 hover:text-white flex items-center gap-2 text-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Step 4: Review Activity */}
{modalStep === 4 && (
  <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
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
)}
    </>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const StartWorkoutModal = memo(StartWorkoutModalComponent);