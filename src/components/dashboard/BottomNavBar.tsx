import { memo } from "react";
import {
  UserCircle,
  Activity,
  Settings,
  TrendingUp,
  MessageCircle,
  Sparkles,
} from "lucide-react";

interface BottomNavBarProps {
  onModalOpen: (modal: string) => void;
}

/**
 * BottomNavBar Component
 * 
 * Vertical navigation bar on the right side with all 6 main navigation items:
 * - Profile, Activity, Settings, Metrics, Chat, Training
 */
function BottomNavBarComponent({ onModalOpen }: BottomNavBarProps) {
  const navItems = [
    { id: 'profile', icon: UserCircle, label: 'Profile' },
    { id: 'activityFeed', icon: Activity, label: 'Activity', dataTutorial: 'activity-button' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'metrics', icon: TrendingUp, label: 'Metrics', dataTutorial: 'metrics-button' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', dataTutorial: 'chat-button' },
    { id: 'trainingPlans', icon: Sparkles, label: 'Training', dataTutorial: 'training-button' },
  ];

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[70] pointer-events-none">
      {/* Vertical Navigation Bar */}
      <div className="bg-[#2d2d2d]/90 backdrop-blur-md rounded-full px-3 py-3 shadow-2xl pointer-events-auto">
        <div className="flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'trainingPlans') {
                    console.log('🎯 Training button clicked!');
                  }
                  onModalOpen(item.id);
                }}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl hover:bg-white/10 transition-all min-w-[50px]"
                data-tutorial={item.dataTutorial}
              >
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                <span className="text-[9px] text-white">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const BottomNavBar = memo(BottomNavBarComponent);