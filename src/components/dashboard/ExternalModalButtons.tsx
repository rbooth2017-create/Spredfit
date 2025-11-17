import { memo } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ExternalModalButtonsProps {
  settingsScreen: string;
  setSettingsScreen: (screen: string) => void;
  closeModal: () => void;
}

/**
 * ExternalModalButtons Component
 * 
 * Renders the floating Back/Save buttons that appear outside the Settings modal.
 * These buttons are positioned in the bottom-right corner and have different behavior
 * based on which settings screen is active.
 */
function ExternalModalButtonsComponent({ 
  settingsScreen, 
  setSettingsScreen,
  closeModal 
}: ExternalModalButtonsProps) {
  return (
    <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-3">
        {/* Back Button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => {
              if (settingsScreen !== 'main') {
                setSettingsScreen('main');
              } else {
                closeModal();
              }
            }}
            className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
          >
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <span className="text-white text-xs text-center">Back</span>
        </div>

        {/* Save Button - Only show when NOT on main settings menu */}
        {settingsScreen !== 'main' && (
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                toast.success('Settings saved successfully');
                closeModal();
              }}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
            >
              <Check className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-xs text-center">Save</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const ExternalModalButtons = memo(ExternalModalButtonsComponent);