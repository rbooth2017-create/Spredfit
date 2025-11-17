import { memo } from "react";
import { Sparkles, ChevronLeft, Plus, Edit, Check } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";

interface TrainingPlansModalProps {
  hasGeneratedPlan: boolean;
  setHasGeneratedPlan: (value: boolean) => void;
  showPlanPrompt: boolean;
  setShowPlanPrompt: (value: boolean) => void;
  planAge: string;
  setPlanAge: (value: string) => void;
  planFitness: string;
  setPlanFitness: (value: string) => void;
  planTimePerWeek: string;
  setPlanTimePerWeek: (value: string) => void;
  planGoals: string;
  setPlanGoals: (value: string) => void;
  planInjuries: string;
  setPlanInjuries: (value: string) => void;
  onClose: () => void;
  // Manual workout creation props
  sports: Array<{ name: string; icon: any }>;
  manualWorkoutStep?: number;
  setManualWorkoutStep?: (step: number) => void;
  manualWorkoutSport?: string;
  setManualWorkoutSport?: (sport: string) => void;
  manualWorkoutDistance?: string;
  setManualWorkoutDistance?: (distance: string) => void;
  manualWorkoutHours?: string;
  setManualWorkoutHours?: (hours: string) => void;
  manualWorkoutMinutes?: string;
  setManualWorkoutMinutes?: (minutes: string) => void;
  manualWorkoutNotes?: string;
  setManualWorkoutNotes?: (notes: string) => void;
  onSavePlannedWorkout?: (workout: {
    sport: string;
    duration: number;
    distance: number;
    type: string;
    notes?: string;
  }) => void;
}

function TrainingPlansModalComponent({
  hasGeneratedPlan,
  setHasGeneratedPlan,
  showPlanPrompt,
  setShowPlanPrompt,
  planAge,
  setPlanAge,
  planFitness,
  setPlanFitness,
  planTimePerWeek,
  setPlanTimePerWeek,
  planGoals,
  setPlanGoals,
  planInjuries,
  setPlanInjuries,
  onClose,
  sports,
  manualWorkoutStep = 0,
  setManualWorkoutStep = () => {},
  manualWorkoutSport = '',
  setManualWorkoutSport = () => {},
  manualWorkoutDistance = '',
  setManualWorkoutDistance = () => {},
  manualWorkoutHours = '',
  setManualWorkoutHours = () => {},
  manualWorkoutMinutes = '',
  setManualWorkoutMinutes = () => {},
  manualWorkoutNotes = '',
  setManualWorkoutNotes = () => {},
  onSavePlannedWorkout = () => {},
}: TrainingPlansModalProps) {
  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
        <div className="flex flex-col w-full h-full p-6">
          {/* Show no plans message if no plan exists and prompt not shown */}
          {!hasGeneratedPlan && !showPlanPrompt && manualWorkoutStep === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <Sparkles className="w-12 h-12 text-white/60 mb-3" strokeWidth={1.5} />
              <p className="text-white text-sm mb-2">No Current Plans</p>
              <p className="text-white/40 text-xs px-4">
                Generate an AI-powered training plan or add a workout manually
              </p>
            </div>
          )}

          {/* Manual Workout Creation - Step 1: Sport Selection */}
          {manualWorkoutStep === 1 && (
            <div className="flex flex-col items-center text-center">
              <p className="text-white text-sm mb-6">Select Sport</p>
              <div className="grid grid-cols-3 gap-4 max-w-[220px]">
                {sports.map((sport) => {
                  const IconComponent = sport.icon;
                  return (
                    <div key={sport.name} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => {
                          setManualWorkoutSport(sport.name);
                          setManualWorkoutStep(2);
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

          {/* Manual Workout Creation - Step 2: Time & Distance */}
          {manualWorkoutStep === 2 && (
            <>
              <div className="mb-4 flex-shrink-0 text-center">
                <p className="text-white text-sm">Workout Details</p>
                <p className="text-white/60 text-xs mt-1">{manualWorkoutSport}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 min-h-0 pr-2">
                {/* Workout Title/Type */}
                <div>
                  <label className="text-white/60 text-[10px] mb-2 block">Workout Title</label>
                  <input
                    type="text"
                    value={manualWorkoutNotes}
                    onChange={(e) => setManualWorkoutNotes(e.target.value)}
                    placeholder={`e.g., Easy ${manualWorkoutSport}, Tempo Run...`}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="text-white/60 text-[10px] mb-2 block">Duration</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={manualWorkoutHours}
                        onChange={(e) => setManualWorkoutHours(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5 text-white text-center placeholder:text-white/40 focus:outline-none focus:border-white/40"
                      />
                      <p className="text-white/40 text-[10px] text-center mt-1">Hours</p>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={manualWorkoutMinutes}
                        onChange={(e) => setManualWorkoutMinutes(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5 text-white text-center placeholder:text-white/40 focus:outline-none focus:border-white/40"
                      />
                      <p className="text-white/40 text-[10px] text-center mt-1">Minutes</p>
                    </div>
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <label className="text-white/60 text-[10px] mb-2 block">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualWorkoutDistance}
                    onChange={(e) => setManualWorkoutDistance(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5 text-white text-center placeholder:text-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
            </>
          )}

          {/* Show prompt input screen */}
          {showPlanPrompt && !hasGeneratedPlan && (
            <>
              {/* Header */}
              <div className="mb-4 flex-shrink-0 text-center">
                <p className="text-white text-sm">Generate Training Plan</p>
              </div>

              {/* Form fields - scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0 pr-2">
                <p className="text-white/70 text-xs mb-3">
                  Tell us about yourself to create a personalized plan:
                </p>
                
                {/* Age */}
                <div>
                  <label className="text-white/60 text-[10px] mb-1.5 block">Age</label>
                  <input
                    type="number"
                    value={planAge}
                    onChange={(e) => setPlanAge(e.target.value)}
                    placeholder="e.g., 28"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>

                {/* Current Fitness Level */}
                <div>
                  <label className="text-white/60 text-[10px] mb-1.5 block">Current Fitness Level</label>
                  <select
                    value={planFitness}
                    onChange={(e) => setPlanFitness(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/40"
                  >
                    <option value="" className="bg-[#2d332d]">Select level...</option>
                    <option value="beginner" className="bg-[#2d332d]">Beginner</option>
                    <option value="intermediate" className="bg-[#2d332d]">Intermediate</option>
                    <option value="advanced" className="bg-[#2d332d]">Advanced</option>
                    <option value="athlete" className="bg-[#2d332d]">Athlete</option>
                  </select>
                </div>

                {/* Time Available Per Week */}
                <div>
                  <label className="text-white/60 text-[10px] mb-1.5 block">Time Available Per Week</label>
                  <input
                    type="text"
                    value={planTimePerWeek}
                    onChange={(e) => setPlanTimePerWeek(e.target.value)}
                    placeholder="e.g., 5-6 hours"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>

                {/* Goals */}
                <div>
                  <label className="text-white/60 text-[10px] mb-1.5 block">Fitness Goals</label>
                  <Textarea
                    value={planGoals}
                    onChange={(e) => setPlanGoals(e.target.value)}
                    placeholder="e.g., Run a 10k, build muscle, lose weight..."
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none h-20"
                  />
                </div>

                {/* Current Injuries */}
                <div>
                  <label className="text-white/60 text-[10px] mb-1.5 block">Current Injuries or Limitations</label>
                  <Textarea
                    value={planInjuries}
                    onChange={(e) => setPlanInjuries(e.target.value)}
                    placeholder="e.g., Knee pain, lower back issues, or 'None'"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none h-16"
                  />
                </div>
              </div>
            </>
          )}

          {/* Show generated plan */}
          {hasGeneratedPlan && (
            <>
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <p className="text-white text-sm">Your Training Plan</p>
                <button
                  onClick={() => {
                    setHasGeneratedPlan(false);
                    setShowPlanPrompt(false);
                  }}
                  className="text-white/60 hover:text-white text-xs transition-colors"
                >
                  New Plan
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <p className="text-white text-xs mb-2">Week 1-2: Foundation</p>
                  <ul className="space-y-1.5">
                    <li className="text-white/70 text-[10px] leading-relaxed">• 3x weekly runs (20-30 min easy pace)</li>
                    <li className="text-white/70 text-[10px] leading-relaxed">• 2x strength training sessions</li>
                    <li className="text-white/70 text-[10px] leading-relaxed">• 1x rest or active recovery</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <p className="text-white text-xs mb-2">Week 3-4: Build</p>
                  <ul className="space-y-1.5">
                    <li className="text-white/70 text-[10px] leading-relaxed">• 4x weekly runs (25-40 min varied pace)</li>
                    <li className="text-white/70 text-[10px] leading-relaxed">• Include 1x interval training</li>
                    <li className="text-white/70 text-[10px] leading-relaxed">• 2x strength training sessions</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <p className="text-white text-xs mb-2">Week 5-6: Peak</p>
                  <ul className="space-y-1.5">
                    <li className="text-white/70 text-[10px] leading-relaxed">• 4x weekly runs (30-50 min)</li>
                    <li className="text-white/70 text-[10px] leading-relaxed">• 2x interval or tempo runs</li>
                    <li className="text-white/70 text-[10px] leading-relaxed">• 1x long run (60+ min)</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* External Buttons - Bottom Right */}
      <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-3">
          {/* Back Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                if (manualWorkoutStep === 2) {
                  setManualWorkoutStep(1);
                } else if (manualWorkoutStep === 1) {
                  setManualWorkoutStep(0);
                  setManualWorkoutSport('');
                } else if (showPlanPrompt && !hasGeneratedPlan) {
                  setShowPlanPrompt(false);
                  setPlanAge('');
                  setPlanFitness('');
                  setPlanTimePerWeek('');
                  setPlanGoals('');
                  setPlanInjuries('');
                } else {
                  onClose();
                }
              }}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
            >
              <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-[10px] text-center">Back</span>
          </div>

          {/* AI Generate Button - Only on main screen */}
          {!hasGeneratedPlan && !showPlanPrompt && manualWorkoutStep === 0 && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  console.log('🎯 Generate button clicked!');
                  setShowPlanPrompt(true);
                }}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all border-2 border-white/40 hover:bg-white/30 shadow-lg"
              >
                <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Generate</span>
            </div>
          )}

          {/* Add Manual Workout Button - Only on main screen */}
          {!hasGeneratedPlan && !showPlanPrompt && manualWorkoutStep === 0 && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  console.log('🎯 Add Workout button clicked!');
                  setManualWorkoutStep(1);
                }}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
              >
                <Plus className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Add Workout</span>
            </div>
          )}

          {/* Save Manual Workout Button - On step 2 */}
          {manualWorkoutStep === 2 && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  const hours = parseInt(manualWorkoutHours || '0');
                  const minutes = parseInt(manualWorkoutMinutes || '0');
                  const totalMinutes = (hours * 60) + minutes;
                  const distance = parseFloat(manualWorkoutDistance || '0');
                  const title = manualWorkoutNotes || `${manualWorkoutSport} Workout`;
                  
                  if (totalMinutes > 0 || distance > 0) {
                    // Save the planned workout first
                    onSavePlannedWorkout({
                      sport: manualWorkoutSport || '',
                      duration: totalMinutes,
                      distance: distance,
                      type: title,
                      notes: '',
                    });
                    
                    toast.success('Workout added to your plan!');
                    
                    // Reset manual workout state
                    setManualWorkoutStep(0);
                    setManualWorkoutSport('');
                    setManualWorkoutDistance('');
                    setManualWorkoutHours('');
                    setManualWorkoutMinutes('');
                    setManualWorkoutNotes('');
                    
                    // Close modal and return to dashboard
                    onClose();
                  } else {
                    toast.error('Please enter duration or distance');
                  }
                }}
                className="w-20 h-20 rounded-full bg-[#8C7A64] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#7A6A56] shadow-lg"
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Save</span>
            </div>
          )}

          {/* Generate AI Plan Button - On prompt screen */}
          {showPlanPrompt && !hasGeneratedPlan && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  if (planAge && planFitness && planTimePerWeek && planGoals) {
                    setHasGeneratedPlan(true);
                    toast.success('Training plan generated!');
                  } else {
                    toast.error('Please fill in all required fields');
                  }
                }}
                className="w-20 h-20 rounded-full bg-[#8C7A64] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#7A6A56] shadow-lg"
              >
                <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">Generate</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const TrainingPlansModal = memo(TrainingPlansModalComponent);