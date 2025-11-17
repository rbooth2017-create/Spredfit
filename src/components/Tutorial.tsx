import { useState, useEffect } from "react";
import { ChevronRight, X, Play, PenLine, Trophy, Users, Activity, TrendingUp, MessageCircle, Sparkles } from "lucide-react";

interface TutorialProps {
  onClose: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string; // CSS selector for element to highlight
  icon?: any;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SPREDfit!',
    description: 'Let\'s take a quick tour to show you how to compete with friends through fitness.',
    targetSelector: '',
  },
  {
    id: 'record',
    title: 'Record Workouts',
    description: 'Start a live workout with GPS tracking, timer, and distance recording.',
    targetSelector: '[data-tutorial="record-button"]',
    icon: Play,
  },
  {
    id: 'log',
    title: 'Log Workouts',
    description: 'Manually log completed workouts with distance, duration, and photos.',
    targetSelector: '[data-tutorial="log-button"]',
    icon: PenLine,
  },
  {
    id: 'leaderboard',
    title: 'View Leaderboard',
    description: 'Check your ranking and see who\'s leading in your leagues.',
    targetSelector: '[data-tutorial="leaderboard-button"]',
    icon: Trophy,
  },
  {
    id: 'leagues',
    title: 'Join & Create Leagues',
    description: 'Create private leagues with friends or join existing ones.',
    targetSelector: '[data-tutorial="leagues-button"]',
    icon: Users,
  },
  {
    id: 'activity-feed',
    title: 'Activity Feed',
    description: 'View recent workouts from league members and react with emojis.',
    targetSelector: '[data-tutorial="activity-button"]',
    icon: Activity,
  },
  {
    id: 'metrics',
    title: 'Track Your Metrics',
    description: 'View detailed stats, graphs, and insights about your fitness journey.',
    targetSelector: '[data-tutorial="metrics-button"]',
    icon: TrendingUp,
  },
  {
    id: 'chat',
    title: 'League Chat',
    description: 'Chat with your league members and share motivation.',
    targetSelector: '[data-tutorial="chat-button"]',
    icon: MessageCircle,
  },
  {
    id: 'training',
    title: 'AI Training Plans',
    description: 'Generate personalized training plans with AI based on your goals.',
    targetSelector: '[data-tutorial="training-button"]',
    icon: Sparkles,
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    description: 'Start logging workouts to climb the leaderboard. Good luck! 🎉',
    targetSelector: '',
  },
];

export function Tutorial({ onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const Icon = step.icon;

  // Update highlight position when step changes
  useEffect(() => {
    if (step.targetSelector) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.querySelector(step.targetSelector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightRect(rect);
        } else {
          setHighlightRect(null);
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setHighlightRect(null);
    }
  }, [currentStep, step.targetSelector]);

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[100]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="tutorial-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 12}
                  y={highlightRect.top - 12}
                  width={highlightRect.width + 24}
                  height={highlightRect.height + 24}
                  rx="50%"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#tutorial-spotlight-mask)"
          />
        </svg>

        {/* Pulsing highlight around target element */}
        {highlightRect && (
          <div
            className="absolute pointer-events-none transition-all duration-500 ease-out"
            style={{
              left: `${highlightRect.left - 16}px`,
              top: `${highlightRect.top - 16}px`,
              width: `${highlightRect.width + 32}px`,
              height: `${highlightRect.height + 32}px`,
            }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-white/60" />
          </div>
        )}

        {/* Floating Circle Modal Content */}
        <div className="fixed inset-0 flex items-center justify-center p-4 pb-32 pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl pointer-events-auto">
            <div className="flex flex-col items-center text-center space-y-4 w-full px-4">
              {/* Icon circle */}
              {Icon && (
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-2">
                  <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
              )}

              {/* Title */}
              <h2 className="text-white text-lg">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed max-w-[280px]">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-white'
                        : index < currentStep
                        ? 'w-2 bg-white/50'
                        : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Step counter */}
              <p className="text-white/50 text-xs">
                {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>
          </div>
        </div>

        {/* External Navigation Buttons - Bottom Right */}
        <div className="fixed bottom-8 right-4 z-[60]">
          <div className="flex flex-col gap-3">
            {/* Skip/Close button */}
            {!isLastStep && (
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={onClose}
                  className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
                >
                  <X className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center">Skip</span>
              </div>
            )}

            {/* Back button (only show if not first step) */}
            {!isFirstStep && (
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleBack}
                  className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
                >
                  <ChevronRight className="w-7 h-7 text-white rotate-180" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center">Back</span>
              </div>
            )}

            {/* Next/Done button */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleNext}
                className="w-20 h-20 rounded-full bg-white text-[#2d2d2d] flex items-center justify-center transition-all shadow-lg hover:bg-white/90"
              >
                <ChevronRight className="w-7 h-7" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">
                {isLastStep ? 'Done' : 'Next'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
