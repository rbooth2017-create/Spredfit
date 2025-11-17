import { useCallback } from "react";
import { toast } from "sonner@2.0.3";

/**
 * useDashboardHandlers Hook
 * 
 * Centralizes all event handler functions for the Dashboard component.
 * Returns memoized callbacks to prevent unnecessary re-renders.
 */
export function useDashboardHandlers(state: any) {
  const {
    setWorkoutPhoto,
    setShowPhotoUpload,
    setShowCoffeeMenu,
    setLeagueIndex,
    setSelectedLeagueSports,
    setIsLocked,
    setSlidePosition,
    setIsDragging,
    setActivities,
    setSelectedActivity,
    setCommentText,
    setDeferredPrompt,
    setShowInstallButton,
    setIsWorkoutRunning,
    setModalStep,
    activities,
    selectedActivity,
    commentText,
    deferredPrompt,
    isLocked,
    isDragging,
  } = state;

  // Handle file selection for workout photo
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWorkoutPhoto(reader.result as string);
        setShowPhotoUpload(false);
        toast.success('Photo Added!', {
          description: 'Your workout photo has been saved',
        });
      };
      reader.readAsDataURL(file);
    }
  }, [setWorkoutPhoto, setShowPhotoUpload]);

  // Handle PayPal payment
  const handleCoffeePayment = useCallback((amount: number, description: string) => {
    setShowCoffeeMenu(false);
    
    // Use PayPal.me link for simple payments
    // Replace 'YourPayPalUsername' with your actual PayPal.me username
    const paypalUsername = 'YourPayPalUsername'; // TODO: Replace with actual PayPal.me username
    const paypalUrl = `https://www.paypal.com/paypalme/${paypalUsername}/${amount}USD`;
    
    // Open PayPal in new window
    window.open(paypalUrl, '_blank', 'width=600,height=700');
    
    toast.success(`Opening PayPal for ${description}`, {
      description: `Please complete your $${amount} payment in the new window`,
    });
  }, [setShowCoffeeMenu]);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Toggle sport selection for league
  const toggleLeagueSport = useCallback((sportName: string) => {
    setSelectedLeagueSports((prev: string[]) => {
      if (prev.includes(sportName)) {
        // Don't allow deselecting if it's the last sport
        if (prev.length === 1) {
          toast.error('At least one sport required');
          return prev;
        }
        return prev.filter(s => s !== sportName);
      } else {
        return [...prev, sportName];
      }
    });
  }, [setSelectedLeagueSports]);

  // Lock screen - toggle lock
  const toggleLock = useCallback(() => {
    if (!isLocked) {
      setIsLocked(true);
      setSlidePosition(0);
      toast.success('🔒 Workout Locked', {
        description: 'Slide to unlock',
        duration: 2000,
      });
    }
  }, [isLocked, setIsLocked, setSlidePosition]);

  // Lock screen - handle slide start
  const handleSlideStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isLocked) {
      setIsDragging(true);
      e.preventDefault();
    }
  }, [isLocked, setIsDragging]);

  // Lock screen - handle slide move
  const handleSlideMove = useCallback((e: MouseEvent | TouchEvent, sliderRef: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !isLocked || !sliderRef.current) return;
    
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    const knob = slider.querySelector('[data-slider-knob]') as HTMLElement;
    const knobWidth = knob ? knob.offsetWidth : 0;
    
    const relativeX = clientX - rect.left;
    const maxTravel = rect.width - knobWidth;
    const clampedX = Math.max(0, Math.min(maxTravel, relativeX));
    const percentage = maxTravel > 0 ? (clampedX / maxTravel) * 100 : 0;
    
    setSlidePosition(percentage);
    
    if (percentage >= 95) {
      setIsLocked(false);
      setIsDragging(false);
      setSlidePosition(0);
      toast.success('🔓 Workout Unlocked', {
        description: 'You can now pause or complete the workout',
        duration: 2000,
      });
    }
  }, [isDragging, isLocked, setSlidePosition, setIsLocked, setIsDragging]);

  // Lock screen - handle slide end
  const handleSlideEnd = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  // Workout - pause/resume toggle
  const handlePauseToggle = useCallback(() => {
    if (isLocked) {
      toast.error('Workout is Locked', {
        description: 'Unlock to pause the workout',
        duration: 2000,
      });
      return;
    }
    setIsWorkoutRunning((prev: boolean) => !prev);
  }, [isLocked, setIsWorkoutRunning]);

  // Workout - complete workout
  const handleCompleteWorkout = useCallback(() => {
    if (isLocked) {
      toast.error('Workout is Locked', {
        description: 'Unlock to complete the workout',
        duration: 2000,
      });
      return;
    }
    setIsWorkoutRunning(false);
    toast.success('Workout Completed!');
    setModalStep(4);
  }, [isLocked, setIsWorkoutRunning, setModalStep]);

  // PWA - handle install click
  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  }, [deferredPrompt, setDeferredPrompt, setShowInstallButton]);

  // League navigation - next
  const nextLeague = useCallback((userLeagues: any[]) => {
    setLeagueIndex((prev: number) => (prev + 1) % userLeagues.length);
  }, [setLeagueIndex]);

  // League navigation - previous
  const prevLeague = useCallback((userLeagues: any[]) => {
    setLeagueIndex((prev: number) => (prev - 1 + userLeagues.length) % userLeagues.length);
  }, [setLeagueIndex]);

  // Activity - handle reaction
  const handleReaction = useCallback((activityId: string, reaction: "so-so" | "awesome" | "mind-blown") => {
    setActivities(activities.map((activity: any) => {
      if (activity.id === activityId) {
        const newReactions = { ...activity.reactions };
        
        // Remove old reaction if exists
        if (activity.userReaction) {
          newReactions[activity.userReaction] = Math.max(0, newReactions[activity.userReaction] - 1);
        }
        
        // Add new reaction if not the same as current (toggle off if same)
        const newUserReaction = activity.userReaction === reaction ? null : reaction;
        if (newUserReaction) {
          newReactions[newUserReaction] = newReactions[newUserReaction] + 1;
        }
        
        return {
          ...activity,
          reactions: newReactions,
          userReaction: newUserReaction
        };
      }
      return activity;
    }));
    
    // Update selected activity
    if (selectedActivity?.id === activityId) {
      setSelectedActivity({
        ...selectedActivity,
        reactions: activities.find((a: any) => a.id === activityId)?.reactions,
        userReaction: activities.find((a: any) => a.id === activityId)?.userReaction === reaction ? null : reaction
      });
    }
  }, [activities, selectedActivity, setActivities, setSelectedActivity]);

  // Activity - handle comment
  const handleComment = useCallback((activityId: string) => {
    const text = commentText.trim();
    if (!text) return;

    const newComment = {
      id: `c${Date.now()}`,
      userId: "current",
      userName: "You",
      userAvatar: "",
      text,
      timestamp: "Just now"
    };

    setActivities(activities.map((activity: any) => {
      if (activity.id === activityId) {
        return {
          ...activity,
          comments: [...activity.comments, newComment]
        };
      }
      return activity;
    }));

    // Update selected activity
    if (selectedActivity?.id === activityId) {
      setSelectedActivity({
        ...selectedActivity,
        comments: [...selectedActivity.comments, newComment]
      });
    }

    setCommentText('');
    toast.success('Comment added!');
  }, [commentText, activities, selectedActivity, setActivities, setSelectedActivity, setCommentText]);

  return {
    handleFileSelect,
    handleCoffeePayment,
    formatTime,
    toggleLeagueSport,
    toggleLock,
    handleSlideStart,
    handleSlideMove,
    handleSlideEnd,
    handlePauseToggle,
    handleCompleteWorkout,
    handleInstallClick,
    nextLeague,
    prevLeague,
    handleReaction,
    handleComment,
  };
}
