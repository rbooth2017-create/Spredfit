import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  dimmed?: boolean;
}

export function AnimatedBackground({ dimmed = false }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Animated background with pulsating dots */}
      <div
        className="fixed inset-0 overflow-hidden transition-opacity duration-500"
        style={{
          opacity: dimmed ? 0.7 : 1,
          animation: mounted ? "backgroundFade 10s ease-in-out infinite alternate" : "none",
        }}
      >
        {/* Halftone dots pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle, #2d332d 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
                animation: mounted ? "pulsate 10s ease-in-out infinite" : "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Dim overlay when content is floating above */}
      {dimmed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
          style={{ zIndex: 5 }}
        />
      )}

      {/* Global animations */}
      <style>{`
        @keyframes backgroundFade {
          0% {
            background-color: #7a8872;
          }
          50% {
            background-color: #8a9882;
          }
          100% {
            background-color: #6a7862;
          }
        }

        @keyframes pulsate {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}
