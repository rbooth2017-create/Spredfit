import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../utils/auth";
import { useApp } from "../utils/AppContext";
import { useDashboardState } from "../hooks/useDashboardState";
import { APIClient } from "../utils/api";
import { toast } from "sonner";
import { PersonStanding, Bike, Waves, Dumbbell, Heart, Zap, Users, MoreHorizontal, Activity, Trophy } from "lucide-react";
import { AnimatedBackground } from "./dashboard/AnimatedBackground";
import { DashboardHeader, ActivityCarousel, MainActionCards, NavigationSidebar } from "./dashboard/DashboardUI";
import { WorkoutPhotoModal } from "./dashboard/WorkoutPhotoModal";
import { ExternalModalButtons } from "./dashboard/ExternalModalButtons";
import { PlannedWorkoutCircle } from "./dashboard/PlannedWorkoutCircle";
import { PlannedWorkoutExternalButtons } from "./dashboard/PlannedWorkoutExternalButtons";
import { TodaysActivityExternalButtons } from "./dashboard/TodaysActivityExternalButtons";
import { ExpandViewToggle } from "./dashboard/ExpandViewToggle";
import { useDashboardHandlers } from "../hooks/useDashboardHandlers";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";
import { Tutorial } from "./Tutorial";
import { StartWorkoutModal } from "./dashboard-modals/StartWorkoutModal";
import { AboutModal } from "./dashboard-modals/AboutModal";
import { LogWorkoutModal } from "./dashboard-modals/LogWorkoutModal";
import { LeaderboardModal } from "./dashboard-modals/LeaderboardModal";
import { LeaguesModal } from "./dashboard-modals/LeaguesModal";
import { ProfileModal } from "./dashboard-modals/ProfileModal";
import { SettingsModal } from "./dashboard-modals/SettingsModal";
import { MetricsModal } from "./dashboard-modals/MetricsModal";
import { ActivityFeedModal, ActivityFeedExternalButtons } from "./dashboard-modals/ActivityFeedModal";
import { ActivityDetailModal } from "./dashboard-modals/ActivityDetailModal";
import { ChatModal } from "./dashboard-modals/ChatModal";
import { TrainingPlansModal } from "./dashboard-modals/TrainingPlansModal";
import { CoffeeModal } from "./dashboard-modals/CoffeeModal";
import { TodaysActivityModal } from "./dashboard-modals/TodaysActivityModal";
import { PlannedWorkoutDetailModal } from "./dashboard-modals/PlannedWorkoutDetailModal";

// Dashboard Component - Main application view
interface DashboardProps {
  onLogWorkout?: () => void;
  onStartWorkout?: () => void;
  onLeaderboard?: () => void;
  onLeagues?: () => void;
  onProfile?: () => void;
  onSignOut?: () => void;
  onActivityFeed?: () => void;
  onTrainingPlans?: () => void;
  onChat?: () => void;
  onDealFinder?: () => void;
  onBrandedStore?: () => void;
  isLoginBackground?: boolean;
}

// Training plan data (keeping for future implementation)
const trainingPlan = {
  name: "Marathon Prep",
  completed: 7,
  total: 12,
  nextWorkout: "Long Run"
};

export function Dashboard({ onLogWorkout, onStartWorkout, onLeaderboard, onLeagues, onProfile, onSignOut, onActivityFeed, onTrainingPlans, onChat, onDealFinder, onBrandedStore, isLoginBackground }: DashboardProps) {
  const { accessToken, justSignedUp, clearJustSignedUp, user } = useAuth();
  const { leagues, profile, currentLeague, refreshLeagues, refreshProfile, createWorkout } = useApp();
  
  // Tutorial state - show if user just signed up
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial when user just signed up
  useEffect(() => {
    if (justSignedUp) {
      setShowTutorial(true);
    }
  }, [justSignedUp]);
  
  // ✅ USE THE CUSTOM HOOK - All state in one place!
  const state = useDashboardState();
  
  // ✅ Destructure for easier use (backward compatibility)
  const {
    // Modal
    activeModal, openModal, closeModal, setActiveModal,
    achievementIndex, setAchievementIndex,
    leagueIndex, setLeagueIndex,
    modalStep, setModalStep,
    
    // PWA Install
    deferredPrompt, setDeferredPrompt,
    showInstallButton, setShowInstallButton,
    
    // Coffee menu
    showCoffeeMenu, setShowCoffeeMenu,
    
    // Activity
    selectedActivity, setSelectedActivity,
    commentText, setCommentText,
    activities, setActivities,
    activityFilter, setActivityFilter,
    
    // Settings
    settingsScreen, setSettingsScreen,
    userName, setUserName,
    userEmail, setUserEmail,
    notificationsEnabled, setNotificationsEnabled,
    privateProfile, setPrivateProfile,
    distanceUnit, setDistanceUnit,
    weightUnit, setWeightUnit,
    connectedApps, setConnectedApps,
    
    // Profile
    profileScreen, setProfileScreen,
    selectedPhotoFile, setSelectedPhotoFile,
    isUploadingPhoto, setIsUploadingPhoto,
    
    // Leagues
    selectedLeague, setSelectedLeague,
    newLeagueName, setNewLeagueName,
    joinLeagueCode, setJoinLeagueCode,
    createdLeagueCode, setCreatedLeagueCode,
    allowTeams, setAllowTeams,
    isPrivate, setIsPrivate,
    stealthMode, setStealthMode,
    doubleUp, setDoubleUp,
    duration, setDuration,
    selectedLeagueSports, setSelectedLeagueSports,
    stealthActivated, setStealthActivated,
    doubleUpActivated, setDoubleUpActivated,
    
    // Leaderboard
    leaderboardView, setLeaderboardView,
    leaderboardPeriod, setLeaderboardPeriod,
    
    // Chat
    chatFilter, setChatFilter,
    selectedChat, setSelectedChat,
    messageText, setMessageText,
    leagueChats, setLeagueChats,
    chatMessages, setChatMessages,
    
    // Workout - Log
    selectedSport, setSelectedSport,
    logDistance, setLogDistance,
    logHours, setLogHours,
    logMinutes, setLogMinutes,
    logNotes, setLogNotes,
    workoutPhoto, setWorkoutPhoto,
    showPhotoUpload, setShowPhotoUpload,
    
    // Workout - Active
    isWorkoutRunning, setIsWorkoutRunning,
    workoutTime, setWorkoutTime,
    workoutDistance, setWorkoutDistance,
    gpsSearching, setGpsSearching,
    gpsConnected, setGpsConnected,
    recordedDistance, setRecordedDistance,
    recordedPace, setRecordedPace,
    
    // Lock screen
    showLockScreen, setShowLockScreen,
    isLocked, setIsLocked,
    slidePosition, setSlidePosition,
    isDragging, setIsDragging,
    
    // Training Plans
    showPlanPrompt, setShowPlanPrompt,
    planPrompt, setPlanPrompt,
    hasGeneratedPlan, setHasGeneratedPlan,
    planAge, setPlanAge,
    planFitness, setPlanFitness,
    planTimePerWeek, setPlanTimePerWeek,
    planGoals, setPlanGoals,
    planInjuries, setPlanInjuries,
    
    // Manual workout creation
    manualWorkoutStep, setManualWorkoutStep,
    manualWorkoutSport, setManualWorkoutSport,
    manualWorkoutDistance, setManualWorkoutDistance,
    manualWorkoutHours, setManualWorkoutHours,
    manualWorkoutMinutes, setManualWorkoutMinutes,
    manualWorkoutNotes, setManualWorkoutNotes,
    
    // Planned workout
    plannedWorkout, setPlannedWorkout,
    
    // Carousel
    currentCarouselIndex, setCurrentCarouselIndex,
    
    // UI toggle
    hideUtilityButtons, setHideUtilityButtons,
    animationsPaused, setAnimationsPaused,
  } = state;
  
  // Refs that aren't in the hook
  const sliderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GPS tracking state
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);
  const [gpsPositions, setGpsPositions] = useState<GeolocationPosition[]>([]);
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);

  // League states (using leagues from context)
  console.log('🔍 BEFORE useMemo - leagues:', leagues);
  console.log('🔍 BEFORE useMemo - profile:', profile);

  const userLeagues = useMemo(() => {
    const currentUserId = profile?.id;
    
    return leagues.map((league, index) => ({
      name: league.name,
      rank: index + 1,
      totalMembers: league.members?.length || 0,
      id: league.id,
      isManager: league.createdBy === currentUserId,
      code: league.leagueCode
    }));
  }, [leagues, profile]);
  
  // Available sports
  const sports = useMemo(() => [
    { name: 'Running', icon: PersonStanding },
    { name: 'Cycling', icon: Bike },
    { name: 'Swimming', icon: Waves },
    { name: 'Strength', icon: Dumbbell },
    { name: 'Yoga', icon: Heart },
    { name: 'HIIT', icon: Zap },
    { name: 'Team Sports', icon: Users },
    { name: 'Other', icon: MoreHorizontal },
  ], []);

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

            // GPS tracking effect
      useEffect(() => {
        if (gpsSearching && modalStep === 2) {
          console.log('📍 Starting GPS search...');
          
          if ('geolocation' in navigator) {
            // First, explicitly request permission
            if ('permissions' in navigator) {
              navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                console.log('📍 Geolocation permission status:', result.state);
                
                if (result.state === 'denied') {
                  toast.error('Location Access Denied', {
                    description: 'Please enable location in your browser settings',
                    duration: 5000
                  });
                  setGpsSearching(false);
                  setGpsConnected(false);
                  setModalStep(3);
                  return;
                }
              });
            }
      
            let hasConnected = false;
            
            // Minimum 2 second search animation
            const minSearchTimer = setTimeout(() => {
              if (hasConnected) {
                setGpsSearching(false);
                setModalStep(3);
              }
            }, 2000);
      
            // Request current position first to trigger permission prompt
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('📍 Initial GPS position received:', position);
                
                if (!hasConnected) {
                  hasConnected = true;
                  setGpsPositions([position]);
                  setLastPosition(position);
                  setGpsConnected(true);
                  
                  console.log('📍 GPS connected, waiting for minimum search time...');
                  
                  toast.success('GPS Connected!', {
                    description: `Accuracy: ${position.coords.accuracy.toFixed(0)}m`
                  });
                }
              },
              (error) => {
                console.error('❌ GPS error:', error);
                clearTimeout(minSearchTimer);
                
                let errorMessage = 'Unable to access location';
                let errorTitle = 'GPS Unavailable';
                
                if (error.code === 1) {
                  errorTitle = 'Location Permission Denied';
                  errorMessage = 'Please enable location access in your device settings';
                } else if (error.code === 2) {
                  errorMessage = 'Location unavailable - make sure GPS is enabled';
                } else if (error.code === 3) {
                  errorMessage = 'Location request timeout - try again';
                }
                
                toast.error(errorTitle, {
                  description: errorMessage,
                  duration: 5000
                });
                setGpsSearching(false);
                setGpsConnected(false);
                setModalStep(3);
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
              }
            );
      
            // Then start continuous watching
            const watchId = navigator.geolocation.watchPosition(
              (position) => {
                console.log('📍 GPS position update:', position);
                
                if (!hasConnected) {
                  hasConnected = true;
                  setGpsPositions([position]);
                  setLastPosition(position);
                  setGpsConnected(true);
                  
                  console.log('📍 GPS connected, waiting for minimum search time...');
                  
                  toast.success('GPS Connected!', {
                    description: `Accuracy: ${position.coords.accuracy.toFixed(0)}m`
                  });
                } else {
                  setGpsPositions(prev => [...prev, position]);
                }
              },
              (error) => {
                console.error('❌ GPS watch error:', error);
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
              }
            );
            setGpsWatchId(watchId);
      
            return () => {
              clearTimeout(minSearchTimer);
            };
          } else {
            toast.error('GPS not supported on this device');
            setGpsSearching(false);
            setModalStep(3);
          }
        }
      
        return () => {
          if (gpsWatchId !== null) {
            navigator.geolocation.clearWatch(gpsWatchId);
            setGpsWatchId(null);
          }
        };
      }, [gpsSearching, modalStep]);

  // Update recorded pace
  useEffect(() => {
    if (workoutTime > 0 && recordedDistance > 0) {
      const paceMinutes = (workoutTime / 60) / recordedDistance;
      const minutes = Math.floor(paceMinutes);
      const seconds = Math.floor((paceMinutes - minutes) * 60);
      setRecordedPace(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [workoutTime, recordedDistance, setRecordedPace]);
  
  // Load activities when component mounts or when a workout is created
  useEffect(() => {
    async function loadActivities() {
      if (!accessToken) {
        setActivities([]);
        return;
      }
      try {
        const api = new APIClient(accessToken);
        const workouts = await api.getUserWorkouts();
        setActivities(workouts);
      } catch (error) {
        console.error('Failed to load workouts:', error);
        setActivities([]);
      }
    }
    loadActivities();
  }, [accessToken, setActivities]);
  
  // Load chat when league changes
  useEffect(() => {
    async function loadChat() {
      if (!currentLeague || !accessToken) {
        setChatMessages([]);
        return;
      }
      try {
        const api = new APIClient(accessToken);
        const data = await api.getLeagueChat(currentLeague.id);
        setChatMessages(data);
      } catch (error) {
        console.error('Failed to load chat:', error);
        setChatMessages([]);
      }
    }
    loadChat();
  }, [currentLeague, accessToken, setChatMessages]);

  // Use leagues as chat list
  useEffect(() => {
    setLeagueChats(leagues.map(league => ({
      id: league.id,
      name: league.name,
      lastMessage: '',
      time: '',
      unread: 0
    })));
  }, [leagues, setLeagueChats]);

  // Reset profile screen when opening profile modal
  useEffect(() => {
    if (activeModal === 'profile') {
      setProfileScreen('view');
      setSelectedPhotoFile(null);
    }
  }, [activeModal, setProfileScreen, setSelectedPhotoFile]);
  
  const teamChats: any[] = [];

  // ✅ Use custom hooks for handlers and timers
  const handlers = useDashboardHandlers(state);
  useWorkoutTimer(state, {
    handleSlideMove: (e, ref) => handlers.handleSlideMove(e, ref),
    handleSlideEnd: handlers.handleSlideEnd
  }, sliderRef);

  // Destructure handlers for easy access
  const {
    handleFileSelect,
    handleCoffeePayment,
    formatTime,
    toggleLeagueSport,
    toggleLock,
    handleSlideStart,
    handlePauseToggle,
    handleReaction,
    handleComment,
  } = handlers;

  // Override handleCompleteWorkout to save to Supabase
  const handleCompleteWorkout = async () => {
    if (!user || !selectedSport) {
      toast.error('Cannot save workout');
      return;
    }

    try {
      console.log('💾 Saving workout to Supabase...');
      
      // Stop GPS tracking
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        setGpsWatchId(null);
      }

      // Stop workout timer
      setIsWorkoutRunning(false);

      // Save workout to Supabase
      await createWorkout({
        type: selectedSport,
        duration: Math.floor(workoutTime / 60), // Convert seconds to minutes
        distance: gpsConnected ? recordedDistance : 0,
        date: new Date().toISOString(),
        notes: gpsConnected ? `GPS tracked: ${gpsPositions.length} points` : 'Indoor workout',
      });

      toast.success('Workout Saved!', {
        description: `${selectedSport} - ${formatTime(workoutTime)}`,
      });

      // Move to review step
      setModalStep(4);
      
      // Refresh profile and activities
      await refreshProfile();
      
      // Reload activities
      if (accessToken) {
        const api = new APIClient(accessToken);
        const workouts = await api.getUserWorkouts();
        setActivities(workouts);
      }
    } catch (error) {
      console.error('❌ Failed to save workout:', error);
      toast.error('Failed to save workout', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  // Reset GPS data when modal closes
  useEffect(() => {
    if (activeModal !== 'start') {
      setGpsPositions([]);
      setLastPosition(null);
      setRecordedDistance(0);
      setRecordedPace('0:00');
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        setGpsWatchId(null);
      }
    }
  }, [activeModal, gpsWatchId]);

  // Create cover flow items from league activities
  const getSportIcon = (sport?: string) => {
    switch (sport) {
      case 'Running': return Activity;
      case 'Cycling': return Bike;
      case 'Swimming': return Waves;
      case 'Strength': return Dumbbell;
      case 'Yoga': return Heart;
      case 'HIIT': return Zap;
      default: return Trophy;
    }
  };
  
  return (
    <div className="h-screen w-full overflow-hidden relative">
      {/* Animated Background */}
      <AnimatedBackground animationsPaused={animationsPaused} />
      
      {/* Main Content - Constrained max width for desktop */}
      <div className="relative h-full flex flex-col px-4 pt-6 max-w-[440px] mx-auto">
        {/* Header Component - Smooth fade and slide animation when hiding */}
        <div 
          className={`pointer-events-auto transition-all duration-500 ease-in-out ${
            hideUtilityButtons 
              ? 'opacity-0 -translate-y-8 pointer-events-none' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <DashboardHeader onModalOpen={setActiveModal} />
        </div>
      </div>

      {/* Floating Activity Carousel Component */}
      <ActivityCarousel
        activities={activities}
        currentLeague={currentLeague}
        onActivityClick={(activity) => {
          setSelectedActivity(activity);
          setActiveModal('activityDetail');
        }}
        getSportIcon={getSportIcon}
        isExpanded={hideUtilityButtons}
      />

      {/* Main Action Cards Component - Hide when modal is open OR when used as login background */}
      {!activeModal && !isLoginBackground && (
        <MainActionCards onModalOpen={(modal) => {
          console.log('🎯 Opening modal:', modal);
          setActiveModal(modal);
          if (modal === 'leaderboard' || modal === 'leagues') {
            setModalStep(1);
          }
        }} />
      )}

      {/* Navigation Sidebar - Vertical stack on right side - Hide when modal is open OR when used as login background */}
      {!activeModal && !isLoginBackground && (
        <NavigationSidebar 
          onModalOpen={(modal) => {
            console.log('🎯 Opening modal from sidebar:', modal);
            setActiveModal(modal);
          }} 
          hideButtons={hideUtilityButtons}
        />
      )}

      {/* Planned Workout Circle - Bottom Right Corner - Hide when modal is open OR when used as login background */}
      {!activeModal && !isLoginBackground && (
        <PlannedWorkoutCircle 
          plannedWorkout={plannedWorkout}
          onOpenPlanner={() => setActiveModal('todaysActivity')} 
        />
      )}

      {/* Expand View Toggle - Always visible above Today button - Hide when used as login background */}
      {!activeModal && !isLoginBackground && (
        <ExpandViewToggle
          isExpanded={hideUtilityButtons}
          onToggle={() => setHideUtilityButtons(!hideUtilityButtons)}
          animationsPaused={animationsPaused}
          onAnimationToggle={() => setAnimationsPaused(!animationsPaused)}
        />
      )}

      {/* Circular Pop-up Modals */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-start pt-16 justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Start Workout Modal */}
            {activeModal === 'start' && (
              <StartWorkoutModal
                modalStep={modalStep}
                setModalStep={setModalStep}
                sports={sports}
                selectedSport={selectedSport}
                setSelectedSport={setSelectedSport}
                gpsSearching={gpsSearching}
                setGpsSearching={setGpsSearching}
                gpsConnected={gpsConnected}
                setGpsConnected={setGpsConnected}
                workoutTime={workoutTime}
                formatTime={formatTime}
                recordedDistance={recordedDistance}
                recordedPace={recordedPace}
                isWorkoutRunning={isWorkoutRunning}
                showLockScreen={showLockScreen}
                setShowLockScreen={setShowLockScreen}
                handlePauseToggle={handlePauseToggle}
                handleCompleteWorkout={handleCompleteWorkout}
                showPhotoUpload={showPhotoUpload}
                setShowPhotoUpload={setShowPhotoUpload}
                isLocked={isLocked}
                sliderRef={sliderRef}
                slidePosition={slidePosition}
                isDragging={isDragging}
                handleSlideStart={handleSlideStart}
                toggleLock={toggleLock}
                onClose={closeModal}
              />
            )}

            {/* About Modal */}
            {activeModal === 'about' && (
              <AboutModal
                onClose={closeModal}
              />
            )}

            {/* Log Workout Modal */}
            {activeModal === 'log' && (
              <LogWorkoutModal
                modalStep={modalStep}
                setModalStep={setModalStep}
                sports={sports}
                selectedSport={selectedSport}
                setSelectedSport={setSelectedSport}
                logDistance={logDistance}
                setLogDistance={setLogDistance}
                logHours={logHours}
                setLogHours={setLogHours}
                logMinutes={logMinutes}
                setLogMinutes={setLogMinutes}
                logNotes={logNotes}
                setLogNotes={setLogNotes}
                workoutPhoto={workoutPhoto}
                setWorkoutPhoto={setWorkoutPhoto}
                showPhotoUpload={showPhotoUpload}
                setShowPhotoUpload={setShowPhotoUpload}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                onClose={closeModal}
              />
            )}

            {/* Leaderboard Modal */}
            {activeModal === 'leaderboard' && (
              <LeaderboardModal
                modalStep={modalStep}
                setModalStep={setModalStep}
                userLeagues={userLeagues}
                selectedLeague={selectedLeague}
                setSelectedLeague={setSelectedLeague}
                leaderboardView={leaderboardView}
                setLeaderboardView={setLeaderboardView}
                leaderboardPeriod={leaderboardPeriod}
                setLeaderboardPeriod={setLeaderboardPeriod}
              />
            )}

            {/* Leagues Modal */}
            {activeModal === 'leagues' && (
              <LeaguesModal
                modalStep={modalStep}
                setModalStep={setModalStep}
                userLeagues={userLeagues}
                selectedLeague={selectedLeague}
                setSelectedLeague={setSelectedLeague}
                newLeagueName={newLeagueName}
                setNewLeagueName={setNewLeagueName}
                joinLeagueCode={joinLeagueCode}
                setJoinLeagueCode={setJoinLeagueCode}
                createdLeagueCode={createdLeagueCode}
                setCreatedLeagueCode={setCreatedLeagueCode}
                allowTeams={allowTeams}
                setAllowTeams={setAllowTeams}
                isPrivate={isPrivate}
                setIsPrivate={setIsPrivate}
                stealthMode={stealthMode}
                setStealthMode={setStealthMode}
                doubleUp={doubleUp}
                setDoubleUp={setDoubleUp}
                duration={duration}
                setDuration={setDuration}
                sports={sports}
                selectedLeagueSports={selectedLeagueSports}
                toggleLeagueSport={toggleLeagueSport}
                stealthActivated={stealthActivated}
                setStealthActivated={setStealthActivated}
                doubleUpActivated={doubleUpActivated}
                setDoubleUpActivated={setDoubleUpActivated}
                onClose={closeModal}
              />
            )}

            {/* Profile Modal */}
            {activeModal === 'profile' && (
              <ProfileModal
                profile={profile}
                profileScreen={profileScreen}
                setProfileScreen={setProfileScreen}
                selectedPhotoFile={selectedPhotoFile}
                setSelectedPhotoFile={setSelectedPhotoFile}
                isUploadingPhoto={isUploadingPhoto}
                setIsUploadingPhoto={setIsUploadingPhoto}
                accessToken={accessToken}
              />
            )}

            {/* Settings Modal */}
            {activeModal === 'settings' && (
              <SettingsModal
                settingsScreen={settingsScreen}
                setSettingsScreen={setSettingsScreen}
                userName={userName}
                setUserName={setUserName}
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                notificationsEnabled={notificationsEnabled}
                setNotificationsEnabled={setNotificationsEnabled}
                privateProfile={privateProfile}
                setPrivateProfile={setPrivateProfile}
                distanceUnit={distanceUnit}
                setDistanceUnit={setDistanceUnit}
                weightUnit={weightUnit}
                setWeightUnit={setWeightUnit}
                connectedApps={connectedApps}
                setConnectedApps={setConnectedApps}
                onClose={closeModal}
                onSignOut={onSignOut}
              />
            )}

            {/* Metrics Modal */}
            {activeModal === 'metrics' && (
              <MetricsModal />
            )}

            {/* Activity Feed Modal */}
            {activeModal === 'activityFeed' && (
              <ActivityFeedModal
                activities={activities}
                activityFilter={activityFilter}
                setActivityFilter={setActivityFilter}
                onActivityClick={(activity) => {
                  setSelectedActivity(activity);
                  setActiveModal('activityDetail');
                }}
                currentUserId={user?.id}
                onClose={closeModal}
              />
            )}

            {/* Activity Detail Modal */}
            {activeModal === 'activityDetail' && selectedActivity && (
              <ActivityDetailModal
                activity={selectedActivity}
                commentText={commentText}
                setCommentText={setCommentText}
                onReaction={handleReaction}
                onComment={handleComment}
                onBack={closeModal}
                onEdit={(activity) => {
                  console.log('Edit activity:', activity);
                  toast.success('Edit feature coming soon!');
                }}
                onDelete={(activityId) => {
                  console.log('Delete activity:', activityId);
                  toast.success('Delete feature coming soon!');
                }}
              />
            )}

            {/* Chat Modal */}
            {activeModal === 'chat' && (
              <ChatModal
                chatFilter={chatFilter}
                setChatFilter={setChatFilter}
                leagueChats={leagueChats}
                teamChats={teamChats}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                chatMessages={chatMessages}
                messageText={messageText}
                setMessageText={setMessageText}
              />
            )}

            {/* Training Plans Modal */}
            {activeModal === 'trainingPlans' && (
              <TrainingPlansModal
                showPlanPrompt={showPlanPrompt}
                setShowPlanPrompt={setShowPlanPrompt}
                planPrompt={planPrompt}
                setPlanPrompt={setPlanPrompt}
                hasGeneratedPlan={hasGeneratedPlan}
                setHasGeneratedPlan={setHasGeneratedPlan}
                planAge={planAge}
                setPlanAge={setPlanAge}
                planFitness={planFitness}
                setPlanFitness={setPlanFitness}
                planTimePerWeek={planTimePerWeek}
                setPlanTimePerWeek={setPlanTimePerWeek}
                planGoals={planGoals}
                setPlanGoals={setPlanGoals}
                planInjuries={planInjuries}
                setPlanInjuries={setPlanInjuries}
                onClose={closeModal}
              />
            )}

            {/* Coffee Modal */}
            {activeModal === 'coffee' && (
              <CoffeeModal
                showCoffeeMenu={showCoffeeMenu}
                setShowCoffeeMenu={setShowCoffeeMenu}
                handleCoffeePayment={handleCoffeePayment}
                onClose={closeModal}
              />
            )}

            {/* Todays Activity Modal */}
            {activeModal === 'todaysActivity' && (
              <TodaysActivityModal
                plannedWorkout={plannedWorkout}
                setPlannedWorkout={setPlannedWorkout}
                onClose={closeModal}
              />
            )}

            {/* Planned Workout Detail Modal */}
            {activeModal === 'plannedWorkoutDetail' && (
              <PlannedWorkoutDetailModal
                plannedWorkout={plannedWorkout}
                setPlannedWorkout={setPlannedWorkout}
                onClose={closeModal}
              />
            )}
          </div>
        </div>
      )}
      
      {/* External Buttons for Activity Feed Modal */}
      {activeModal === 'activityFeed' && (
        <ActivityFeedExternalButtons
          activityFilter={activityFilter}
          setActivityFilter={setActivityFilter}
        />
      )}
      
      {/* Photo Upload Modal - Circular overlay */}
      {showPhotoUpload && (activeModal === 'log' && modalStep === 5 || activeModal === 'start' && modalStep === 4) && (
        <WorkoutPhotoModal
          workoutPhoto={workoutPhoto}
          fileInputRef={fileInputRef}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}
      
      {/* Hidden file input for workout photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Tutorial Component */}
      {showTutorial && (
        <Tutorial 
          onClose={() => {
            setShowTutorial(false);
            clearJustSignedUp();
            toast.success('Tutorial completed! You\'re ready to go 🎉');
          }} 
        />
      )}
    </div>
  );
}