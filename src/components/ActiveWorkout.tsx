import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Clock, MapPin, Pause, Play, Square, ChevronDown, ChevronUp, Activity, Lock, Unlock, ChevronRight, Navigation, Wifi, WifiOff } from "lucide-react";
import { getSportIcon } from "./sportIcons";
import { toast } from "sonner";

interface ActiveWorkoutProps {
  sport: string;
  onComplete: (duration: number, distance: number, route?: Array<[number, number]>) => void;
  onCancel: () => void;
}

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export function ActiveWorkout({ sport, onComplete, onCancel }: ActiveWorkoutProps) {
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const mainSliderRef = useRef<HTMLDivElement>(null);
  const widgetSliderRef = useRef<HTMLDivElement>(null);
  const activeSliderRef = useRef<HTMLDivElement | null>(null);
  
  // GPS tracking state
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsPermission, setGpsPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0); // meters per second
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);
  const lastPositionRef = useRef<GPSPosition | null>(null);
  const watchIdRef = useRef<number | null>(null);
  
  const SportIcon = getSportIcon(sport);
  const isDistanceTracking = sport === "Running" || sport === "Cycling";

  // Calculate distance between two GPS coordinates using Haversine formula
  const calculateDistance = (pos1: GPSPosition, pos2: GPSPosition): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Request GPS permission and start tracking
  useEffect(() => {
    if (!isDistanceTracking) return;

    const requestGPSPermission = async () => {
      if (!navigator.geolocation) {
        toast.error("GPS Not Available", {
          description: "Your device doesn't support GPS tracking",
          duration: 3000,
        });
        return;
      }

      try {
        // Request permission by attempting to get position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGpsPermission('granted');
            setGpsEnabled(true);
            toast.success("📍 GPS Connected", {
              description: "Tracking your outdoor workout",
              duration: 2000,
            });
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setGpsPermission('denied');
              toast.error("GPS Permission Denied", {
                description: "Using simulated tracking instead",
                duration: 3000,
              });
            } else {
              toast.error("GPS Error", {
                description: "Unable to get location. Using simulated tracking.",
                duration: 3000,
              });
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error("GPS error:", error);
      }
    };

    requestGPSPermission();
  }, [isDistanceTracking]);

  // Start GPS tracking when running
  useEffect(() => {
    if (!isDistanceTracking || !gpsEnabled || gpsPermission !== 'granted') return;

    if (isRunning) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPos: GPSPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          setCurrentPosition(newPos);
          setGpsAccuracy(position.coords.accuracy);
          
          // Store route coordinate if accuracy is good
          if (position.coords.accuracy < 50) {
            setRouteCoordinates(prev => [...prev, [newPos.latitude, newPos.longitude]]);
          }
          
          // Update speed from GPS if available
          if (position.coords.speed !== null && position.coords.speed >= 0) {
            setCurrentSpeed(position.coords.speed);
          }

          // Calculate distance if we have a previous position
          if (lastPositionRef.current) {
            // Only count movement if accuracy is reasonable and positions are different
            if (position.coords.accuracy < 50) {
              const distanceIncrement = calculateDistance(lastPositionRef.current, newPos);
              
              // Filter out GPS jitter (only add if movement is significant)
              if (distanceIncrement > 0.001 && distanceIncrement < 0.1) {
                setDistance(prev => prev + distanceIncrement);
                
                // Calculate speed from position change if GPS speed not available
                if (position.coords.speed === null) {
                  const timeDiff = (newPos.timestamp - lastPositionRef.current.timestamp) / 1000; // seconds
                  if (timeDiff > 0) {
                    const speedMps = (distanceIncrement * 1000) / timeDiff; // meters per second
                    setCurrentSpeed(speedMps);
                  }
                }
              }
            }
          }

          lastPositionRef.current = newPos;
        },
        (error) => {
          console.error("GPS watch error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setGpsEnabled(false);
            setGpsPermission('denied');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isRunning, isDistanceTracking, gpsEnabled, gpsPermission]);

  // Timer and fallback simulated tracking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        
        // Use simulated distance only if GPS is not enabled
        if (isDistanceTracking && !gpsEnabled) {
          setDistance(prev => {
            const increment = sport === "Running" ? 0.0033 : 0.0083; // ~12km/h for running, ~30km/h for cycling
            return prev + increment;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isDistanceTracking, sport, gpsEnabled]);

  // Handle slide to unlock - reset with spring animation if not dragged all the way
  useEffect(() => {
    if (!isDragging && slidePosition < 100 && slidePosition > 0) {
      // Spring-based animation back to start
      let velocity = 0;
      const stiffness = 0.3;
      const damping = 0.7;
      
      const animate = () => {
        setSlidePosition(prev => {
          const force = -prev * stiffness;
          velocity = (velocity + force) * damping;
          const newPos = prev + velocity;
          
          // Stop when close enough to zero
          if (Math.abs(newPos) < 0.1 && Math.abs(velocity) < 0.1) {
            return 0;
          }
          
          requestAnimationFrame(animate);
          return Math.max(0, newPos);
        });
      };
      
      animate();
    }
  }, [isDragging, slidePosition]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (km: number) => {
    return km.toFixed(2);
  };

  const formatSpeed = (metersPerSecond: number): string => {
    const kmh = metersPerSecond * 3.6;
    return kmh.toFixed(1);
  };

  const formatPace = (metersPerSecond: number): string => {
    if (metersPerSecond === 0) return "--:--";
    const minutesPerKm = 1000 / (metersPerSecond * 60);
    const mins = Math.floor(minutesPerKm);
    const secs = Math.floor((minutesPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    if (isLocked) {
      toast.error("Workout is Locked", {
        description: "Unlock to complete the workout",
        duration: 2000,
      });
      return;
    }
    const hours = elapsedSeconds / 3600;
    // Pass route coordinates if we have GPS data
    const route = routeCoordinates.length > 0 ? routeCoordinates : undefined;
    onComplete(hours, distance, route);
  };

  const handlePauseToggle = () => {
    if (isLocked) {
      toast.error("Workout is Locked", {
        description: "Unlock to pause the workout",
        duration: 2000,
      });
      return;
    }
    setIsRunning(!isRunning);
  };

  const toggleLock = () => {
    if (!isLocked) {
      // Locking is instant
      setIsLocked(true);
      setSlidePosition(0);
      toast.success("🔒 Workout Locked", {
        description: "Slide to unlock",
        duration: 2000,
      });
    }
  };

  const handleSlideStart = (sliderRef: React.RefObject<HTMLDivElement>) => (e: React.MouseEvent | React.TouchEvent) => {
    if (isLocked) {
      activeSliderRef.current = sliderRef.current;
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleSlideMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !isLocked || !activeSliderRef.current) return;
    
    const slider = activeSliderRef.current;
    const rect = slider.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    // Get the knob element to determine its width
    const knob = slider.querySelector('[data-slider-knob]') as HTMLElement;
    const knobWidth = knob ? knob.offsetWidth : 0;
    
    // Calculate position within the track
    const relativeX = clientX - rect.left;
    
    // The knob can travel from 0 to (trackWidth - knobWidth)
    const maxTravel = rect.width - knobWidth;
    
    // Clamp the position
    const clampedX = Math.max(0, Math.min(maxTravel, relativeX));
    
    // Calculate percentage (0-100)
    const percentage = maxTravel > 0 ? (clampedX / maxTravel) * 100 : 0;
    
    setSlidePosition(percentage);
    
    // Unlock when slider reaches 95% (knob is near the right edge)
    if (percentage >= 95) {
      setIsLocked(false);
      setIsDragging(false);
      setSlidePosition(0);
      activeSliderRef.current = null;
      toast.success("🔓 Workout Unlocked", {
        description: "You can now pause or complete the workout",
        duration: 2000,
      });
    }
  };

  const handleSlideEnd = () => {
    setIsDragging(false);
    activeSliderRef.current = null;
  };

  // Global mouse/touch move and up handlers
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleSlideMove);
      document.addEventListener('mouseup', handleSlideEnd);
      document.addEventListener('touchmove', handleSlideMove);
      document.addEventListener('touchend', handleSlideEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleSlideMove);
        document.removeEventListener('mouseup', handleSlideEnd);
        document.removeEventListener('touchmove', handleSlideMove);
        document.removeEventListener('touchend', handleSlideEnd);
      };
    }
  }, [isDragging, isLocked]);

  return (
    <div className="relative min-h-screen bg-[#86a088] text-[#2d332d] pb-24">
      {/* Halftone pattern overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
        <div className="relative w-full max-w-2xl" style={{ top: '-20vh', transform: 'scale(2.5)' }}>
          <svg className="w-full h-auto" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.9" className="dot-pulsate">
              {Array.from({ length: 40 }).map((_, row) => {
                return Array.from({ length: 40 }).map((_, col) => {
                  const x = (col / 39) * 400;
                  const y = (row / 39) * 400;
                  const dx = x - 200;
                  const dy = y - 200;
                  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                  const maxRadius = 180;
                  if (distanceFromCenter > maxRadius) return null;
                  const normalizedDistance = distanceFromCenter / maxRadius;
                  let dotRadius;
                  if (normalizedDistance < 0.3) {
                    dotRadius = 2.5 - (normalizedDistance * 2);
                  } else if (normalizedDistance < 0.6) {
                    dotRadius = 1.8 - (normalizedDistance * 1.5);
                  } else {
                    dotRadius = 0.8 - ((normalizedDistance - 0.6) * 1.5);
                  }
                  dotRadius = Math.max(0.3, dotRadius);
                  return (
                    <circle
                      key={`${row}-${col}`}
                      cx={x}
                      cy={y}
                      r={dotRadius}
                      fill="#2d332d"
                    />
                  );
                });
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Lock Screen Simulator Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowLockScreen(!showLockScreen)}
          variant="outline"
          size="sm"
          className="bg-[#eef0ed]/90 backdrop-blur-sm border-[#2d332d]/20 text-[#2d332d] hover:bg-[#eef0ed]"
        >
          {showLockScreen ? 'Hide' : 'Show'} Lock Screen Widget
        </Button>
      </div>

      {/* Lock Screen Widget Simulation */}
      {showLockScreen && (
        <div className="fixed inset-0 z-40 bg-black/95 flex items-start justify-center pt-20">
          <div className="w-full max-w-md px-6">
            <div className="text-center mb-8">
              <p className="text-6xl mb-2 text-white">14:32</p>
              <p className="text-slate-400">Wednesday, November 5</p>
            </div>
            
            {/* Floating Widget */}
            <Card className="bg-[#9ca895] border-[#2d332d]/20 p-6 shadow-2xl rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#2d332d] flex items-center justify-center">
                  <SportIcon className="w-5 h-5 text-[#9ca895]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-lg text-[#2d332d]">SPREDfit Active</p>
                  <p className="text-sm text-[#2d332d]/70">{sport}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-3xl text-[#2d332d] mb-1">{formatTime(elapsedSeconds)}</p>
                  <p className="text-xs text-[#2d332d]/60">Duration</p>
                </div>
                {isDistanceTracking && (
                  <div>
                    <p className="text-3xl text-[#7a8872] mb-1">{formatDistance(distance)}</p>
                    <p className="text-xs text-[#2d332d]/60">Kilometers</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#2d332d]/20">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#7a8872] animate-pulse' : 'bg-[#2d332d]/40'}`} />
                  <p className="text-xs text-[#2d332d]/70">{isRunning ? 'Recording' : 'Paused'}</p>
                  {isDistanceTracking && gpsEnabled && (
                    <Navigation className="w-3 h-3 text-[#7a8872] ml-1" />
                  )}
                </div>
                
                {/* Lock Toggle */}
                {isLocked ? (
                  <div 
                    ref={widgetSliderRef}
                    className="relative h-9 w-44 bg-[#2d332d]/20 rounded-full overflow-visible cursor-grab active:cursor-grabbing border border-[#2d332d]/30 shadow-inner"
                    onMouseDown={handleSlideStart(widgetSliderRef)}
                    onTouchStart={handleSlideStart(widgetSliderRef)}
                  >
                    {/* Animated chevrons background */}
                    <div className="absolute inset-0 flex items-center justify-end pr-12 gap-0.5 pointer-events-none opacity-40">
                      <ChevronRight className="w-3 h-3 text-[#2d332d] animate-pulse" style={{ animationDelay: '0ms' }} />
                      <ChevronRight className="w-3 h-3 text-[#2d332d] animate-pulse" style={{ animationDelay: '150ms' }} />
                      <ChevronRight className="w-3 h-3 text-[#2d332d] animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                    
                    {/* Progress fill with gradient */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#7a8872]/40 rounded-full transition-all duration-75"
                      style={{ 
                        width: slidePosition > 0 ? `calc(${slidePosition}% * 0.68 + 56px)` : '0%',
                        opacity: slidePosition > 0 ? 1 : 0
                      }}
                    />
                    
                    {/* Slider knob with improved styling */}
                    <div 
                      data-slider-knob
                      className="absolute top-0.5 bottom-0.5 w-14 bg-[#2d332d] rounded-full flex items-center justify-center shadow-xl border-2 border-[#2d332d]/50 transition-all duration-75"
                      style={{ 
                        left: `calc(${slidePosition}% * 0.68)`,
                        transform: `scale(${isDragging ? 1.05 : 1})`,
                        boxShadow: isDragging ? '0 0 20px rgba(45, 51, 45, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <Lock className="w-3.5 h-3.5 text-[#9ca895] drop-shadow" />
                      <ChevronRight className="w-3 h-3 text-[#9ca895]/80 ml-0.5" />
                    </div>
                    
                    {/* Text label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs text-[#2d332d]/60" style={{ opacity: slidePosition > 50 ? 0 : 1, transition: 'opacity 150ms' }}>
                        slide
                      </span>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={toggleLock}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 gap-2 text-[#2d332d]/70 hover:text-[#2d332d] hover:bg-[#2d332d]/10"
                  >
                    <Unlock className="w-3 h-3" />
                    <span className="text-xs">Unlocked</span>
                  </Button>
                )}
              </div>

              {/* Control Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handlePauseToggle}
                  disabled={isLocked}
                  className={`w-full h-12 ${
                    isRunning
                      ? 'bg-[#2d332d]/30 hover:bg-[#2d332d]/40'
                      : 'bg-[#7a8872] hover:bg-[#7a8872]/90'
                  } text-[#2d332d] rounded-full justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" strokeWidth={2.5} />
                      <span className="text-sm">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" strokeWidth={2.5} />
                      <span className="text-sm">Resume</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleComplete}
                  disabled={isLocked}
                  className="w-full h-12 bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] rounded-full justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm">Complete Workout</span>
                </Button>
              </div>
            </Card>

            <div className="text-center mt-6">
              <Button
                onClick={() => setShowLockScreen(false)}
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                <ChevronUp className="w-5 h-5 mr-2" />
                Swipe up to return to app
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Active Workout Screen */}
      <div className="relative">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2d332d] flex items-center justify-center">
                <SportIcon className="w-6 h-6 text-[#eef0ed]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl text-[#2d332d]">{sport}</h1>
                <p className="text-sm text-[#2d332d]/60">In Progress</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isRunning ? 'bg-[#2d332d] border border-[#2d332d]' : 'bg-[#2d332d]/40 border border-[#2d332d]/40'}`}>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#eef0ed] animate-pulse' : 'bg-[#eef0ed]/60'}`} />
              <p className="text-xs text-[#eef0ed]">{isRunning ? 'Recording' : 'Paused'}</p>
            </div>
          </div>

          {/* GPS Status Banner */}
          {isDistanceTracking && (
            <div className="pb-2">
              <div className={`flex items-center justify-between px-4 py-2 rounded-lg border ${
                gpsEnabled && gpsPermission === 'granted'
                  ? 'bg-[#2d332d]/10 border-[#2d332d]/20'
                  : 'bg-[#eef0ed]/50 border-[#2d332d]/10'
              }`}>
                <div className="flex items-center gap-2">
                  {gpsEnabled && gpsPermission === 'granted' ? (
                    <>
                      <Navigation className="w-4 h-4 text-[#2d332d]" />
                      <span className="text-xs text-[#2d332d]">GPS Active</span>
                    </>
                  ) : gpsPermission === 'denied' ? (
                    <>
                      <WifiOff className="w-4 h-4 text-[#2d332d]/60" />
                      <span className="text-xs text-[#2d332d]/60">GPS Disabled - Simulated</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 text-[#2d332d]" />
                      <span className="text-xs text-[#2d332d]">Requesting GPS...</span>
                    </>
                  )}
                </div>
                {gpsAccuracy !== null && gpsEnabled && (
                  <span className="text-xs text-[#2d332d]">
                    ±{gpsAccuracy.toFixed(0)}m
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats Display */}
        <div className="px-6 space-y-4 pb-64">
          {/* Time - Large Display */}
          <Card className="bg-[#eef0ed] border-none p-6 rounded-2xl shadow-none">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[#2d332d]" />
                <p className="text-[#2d332d]/60 text-sm">Duration</p>
              </div>
              <p className="text-5xl tracking-wider mb-1 text-[#2d332d]">
                {formatTime(elapsedSeconds)}
              </p>
              <p className="text-[#2d332d]/40 text-xs">{(elapsedSeconds / 3600).toFixed(2)} hours</p>
            </div>
          </Card>

          {/* Distance - If applicable */}
          {isDistanceTracking && (
            <>
              <Card className="bg-[#eef0ed] border-none p-6 rounded-2xl shadow-none">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-[#2d332d]" />
                    <p className="text-[#2d332d]/60 text-sm">Distance</p>
                    {gpsEnabled && <Navigation className="w-3 h-3 text-[#2d332d]" />}
                  </div>
                  <p className="text-5xl tracking-wider mb-1 text-[#2d332d]">
                    {formatDistance(distance)}
                  </p>
                  <p className="text-[#2d332d]/40 text-xs">
                    kilometers {!gpsEnabled && '(simulated)'}
                  </p>
                </div>
              </Card>

              {/* Current Speed/Pace */}
              {gpsEnabled && currentSpeed > 0 && (
                <Card className="bg-[#eef0ed] border-none p-6 rounded-2xl shadow-none">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center border-r border-[#2d332d]/10">
                      <p className="text-[#2d332d]/60 text-xs mb-1">Current Speed</p>
                      <p className="text-3xl text-[#2d332d]">{formatSpeed(currentSpeed)}</p>
                      <p className="text-[#2d332d]/40 text-xs">km/h</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#2d332d]/60 text-xs mb-1">Current Pace</p>
                      <p className="text-3xl text-[#2d332d]">{formatPace(currentSpeed)}</p>
                      <p className="text-[#2d332d]/40 text-xs">min/km</p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#eef0ed] border-none p-4 rounded-2xl shadow-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2d332d] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#eef0ed]" />
                </div>
                <div>
                  <p className="text-[#2d332d]/60 text-xs">Avg Pace</p>
                  <p className="text-[#2d332d] text-lg">
                    {isDistanceTracking && distance > 0 
                      ? `${((elapsedSeconds / 60) / distance).toFixed(1)} min/km`
                      : '--'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#eef0ed] border-none p-4 rounded-2xl shadow-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2d332d] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#eef0ed]" />
                </div>
                <div>
                  <p className="text-[#2d332d]/60 text-xs">Calories</p>
                  <p className="text-[#2d332d] text-lg">{Math.round(elapsedSeconds * 0.15)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#86a088] via-[#86a088] to-transparent pt-8 pb-8 px-6">
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Lock Status Banner */}
            {isLocked && (
              <div className="bg-[#2d332d]/20 border border-[#2d332d]/30 rounded-xl p-3 flex items-center justify-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-[#2d332d]" />
                <p className="text-sm text-[#2d332d]">Workout is locked - Slide to unlock</p>
              </div>
            )}

            {/* Lock Toggle Button */}
            {isLocked ? (
              <div 
                ref={mainSliderRef}
                className="relative h-16 bg-[#eef0ed]/50 border-2 border-[#2d332d]/20 rounded-2xl overflow-visible cursor-grab active:cursor-grabbing"
                onMouseDown={handleSlideStart(mainSliderRef)}
                onTouchStart={handleSlideStart(mainSliderRef)}
              >
                {/* Animated chevrons background */}
                <div className="absolute inset-0 flex items-center justify-end pr-32 gap-1 pointer-events-none opacity-30">
                  <ChevronRight className="w-6 h-6 text-[#2d332d] animate-pulse" style={{ animationDelay: '0ms' }} />
                  <ChevronRight className="w-6 h-6 text-[#2d332d] animate-pulse" style={{ animationDelay: '150ms' }} />
                  <ChevronRight className="w-6 h-6 text-[#2d332d] animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                
                {/* Progress fill */}
                <div 
                  className="absolute inset-y-0 left-0 bg-[#2d332d]/10 rounded-2xl transition-all duration-75"
                  style={{ 
                    width: slidePosition > 0 ? `calc(${slidePosition}% * 0.60 + 144px)` : '0%',
                    opacity: slidePosition > 0 ? 1 : 0
                  }}
                />
                
                {/* Slider knob */}
                <div 
                  data-slider-knob
                  className="absolute top-1.5 bottom-1.5 w-36 bg-[#2d332d] rounded-xl flex items-center justify-center gap-2 border-2 border-[#2d332d] transition-all duration-75"
                  style={{ 
                    left: `calc(${slidePosition}% * 0.60)`,
                    transform: `scale(${isDragging ? 1.02 : 1})`
                  }}
                >
                  <Lock className="w-5 h-5 text-[#eef0ed]" />
                  <span className="text-[#eef0ed]">Slide</span>
                  <ChevronRight className="w-5 h-5 text-[#eef0ed]/90" />
                </div>
                
                {/* Text label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span 
                    className="text-[#2d332d]/60"
                    style={{ opacity: slidePosition > 40 ? 0 : 1, transition: 'opacity 150ms' }}
                  >
                    Slide to Unlock
                  </span>
                </div>
              </div>
            ) : (
              <Button
                onClick={toggleLock}
                variant="outline"
                className="w-full h-12 gap-2 bg-[#eef0ed]/50 border-[#2d332d]/20 text-[#2d332d] hover:bg-[#eef0ed] hover:text-[#2d332d] rounded-xl shadow-none"
              >
                <Unlock className="w-5 h-5" />
                <span>Lock Workout</span>
              </Button>
            )}

            {/* Pause/Resume Button */}
            <Button
              onClick={handlePauseToggle}
              disabled={isLocked}
              className={`w-full h-16 ${
                isRunning
                  ? 'bg-[#2d332d] hover:bg-[#2d332d]/90'
                  : 'bg-[#2d332d] hover:bg-[#2d332d]/90'
              } text-[#eef0ed] rounded-2xl justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-none border-none`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" strokeWidth={2.5} />
                  <span className="text-lg">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" strokeWidth={2.5} />
                  <span className="text-lg">Resume</span>
                </>
              )}
            </Button>

            {/* Complete Button */}
            <Button
              onClick={handleComplete}
              disabled={isLocked}
              className="w-full h-16 bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#eef0ed] rounded-2xl justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-none border-none"
            >
              <Square className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-lg">Complete Workout</span>
            </Button>

            {/* Cancel Button */}
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#2d332d]/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}