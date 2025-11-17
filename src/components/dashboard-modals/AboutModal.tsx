import { X } from "lucide-react";

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="w-[90vw] max-w-[440px] h-[90vw] max-h-[440px] rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center p-12 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="text-center max-w-[260px]">
          <h2 className="text-2xl text-[#eef0ed] mb-4">About SPREDfit</h2>
          
          <p className="text-[#eef0ed]/90 text-xs mb-3 leading-relaxed">
            SPREDfit is a passion project built in our spare time. We wanted to create an app that's enjoyable to use, intuitive, yet packed with powerful features for fitness enthusiasts.
          </p>
          
          <p className="text-[#eef0ed]/90 text-xs mb-3 leading-relaxed">
            As an unfunded hobby project, everything you see here has been crafted with love and dedication outside of our day jobs.
          </p>
          
          <p className="text-[#eef0ed]/90 text-xs mb-4 leading-relaxed">
            We'd love to hear your feedback and suggestions! Feel free to reach out to us at:
          </p>
          
          <a 
            href="mailto:info@spredfit.com"
            className="inline-block px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs hover:bg-white/30 transition-all"
          >
            info@spredfit.com
          </a>
        </div>
      </div>
    </div>
  );
}