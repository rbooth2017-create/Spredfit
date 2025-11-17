import { useEffect } from "react";

/**
 * useWorkoutTimer Hook
 * 
 * Manages all timer-based useEffect hooks for workout tracking:
 * - Workout timer interval
 * - GPS searching simulation
 * - Distance and pace tracking
 * - Lock screen slider event listeners
 * - Slider spring animation
 * - PWA install prompt listener
 */
export function useWorkoutTimer(
  state: any,
  handlers: {
    handleSlideMove: (e: MouseEvent | TouchEvent, sliderRef: React.RefObject<HTMLDivElement>) => void;
    handleSlideEnd: () => void;
  },
  sliderRef: React.RefObject<HTMLDivElement>
) {
  const {
    isWorkoutRunning,
    setWorkoutTime,
    gpsSearching,
    setGpsSearching,
    setGpsConnected,
    setModalStep,
    gpsConnected,
    setRecordedDistance,
    workoutTime,
    recordedDistance,
    setRecordedPace,
    isDragging,
    isLocked,
    slidePosition,
    setSlidePosition,
    setDeferredPrompt,
    setShowInstallButton,
  } = state;

  // Start workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutRunning) {
      interval = setInterval(() => {
        setWorkoutTime((prev: number) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutRunning, setWorkoutTime]);

  // GPS searching simulation
  useEffect(() => {
    if (gpsSearching) {
      const timeout = setTimeout(() => {
        setGpsSearching(false);
        setGpsConnected(true);
        setModalStep(3); // Go to recording screen
      }, 2500); // 2.5 seconds to find GPS signal
      return () => clearTimeout(timeout);
    }
  }, [gpsSearching, setGpsSearching, setGpsConnected, setModalStep]);

  // Track distance and pace during recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutRunning && gpsConnected) {
      interval = setInterval(() => {
        // Simulate distance increase (roughly 10km/h pace = 0.0028km per second)
        setRecordedDistance((prev: number) => prev + 0.0028);
        
        // Calculate pace (min/km) based on time and distance
        if (recordedDistance > 0) {
          const totalMinutes = workoutTime / 60;
          const paceMinutes = totalMinutes / recordedDistance;
          const paceMin = Math.floor(paceMinutes);
          const paceSec = Math.floor((paceMinutes - paceMin) * 60);
          setRecordedPace(`${paceMin}:${paceSec.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutRunning, gpsConnected, workoutTime, recordedDistance, setRecordedDistance, setRecordedPace]);

  // Global mouse/touch move and up handlers for slider
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => handlers.handleSlideMove(e, sliderRef);
      const handleEnd = handlers.handleSlideEnd;

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, isLocked, handlers, sliderRef]);

  // Spring animation for slider reset
  useEffect(() => {
    if (!isDragging && slidePosition < 100 && slidePosition > 0) {
      let velocity = 0;
      const stiffness = 0.3;
      const damping = 0.7;
      
      const animate = () => {
        setSlidePosition((prev: number) => {
          const force = -prev * stiffness;
          velocity = (velocity + force) * damping;
          const newPos = prev + velocity;
          
          if (Math.abs(newPos) < 0.1 && Math.abs(velocity) < 0.1) {
            return 0;
          }
          
          requestAnimationFrame(animate);
          return Math.max(0, newPos);
        });
      };
      
      animate();
    }
  }, [isDragging, slidePosition, setSlidePosition]);

  // Handle PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [setDeferredPrompt, setShowInstallButton]);
}
