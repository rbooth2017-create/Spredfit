import { ReactNode } from "react";
import { motion } from "motion/react";

interface FloatingContentProps {
  children: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actionButton?: ReactNode;
}

export function FloatingContent({ children, onBack, backLabel = "Back", actionButton }: FloatingContentProps) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4 pt-20 pb-40 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating content container */}
      <motion.div
        className="w-full max-w-[440px] bg-[#9ca895]/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden relative"
        initial={{ scale: 0.95, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 40 }}
        transition={{ 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{
          maxHeight: "calc(100vh - 12rem)",
        }}
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto h-full scrollbar-hide">
          {children}
        </div>
      </motion.div>

      {/* Navigation buttons */}
      {onBack && (
        <motion.button
          onClick={onBack}
          className="fixed bottom-8 left-4 w-20 h-20 rounded-full bg-[#2d2d2d] text-white shadow-lg flex flex-col items-center justify-center gap-1 hover:bg-[#3d3d3d] transition-colors z-[60]"
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 20 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-[10px]">{backLabel}</span>
        </motion.button>
      )}

      {/* Optional action button */}
      {actionButton && (
        <motion.div
          className="fixed bottom-8 right-4 z-[60]"
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 20 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {actionButton}
        </motion.div>
      )}
    </motion.div>
  );
}