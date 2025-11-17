import { useState } from 'react';

export type ModalType = 'start' | 'log' | 'leaderboard' | 'leagues' | 'profile' | 'settings' | 'metrics' | 'activityFeed' | 'activityDetail' | 'chat' | 'trainingPlans' | null;

export type SettingsScreen = 'main' | 'account' | 'privacy' | 'notifications' | 'units' | 'connectedApps';
export type ProfileScreen = 'view' | 'upload';
export type LeaguesScreen = 'list' | 'create' | 'join' | 'detail';

export function useDashboardState() {
  // Modal states
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [achievementIndex, setAchievementIndex] = useState(0);
  const [leagueIndex, setLeagueIndex] = useState(0);
  const [modalStep, setModalStep] = useState(1);
  
  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  
  // Coffee menu state
  const [showCoffeeMenu, setShowCoffeeMenu] = useState(false);
  
  // Activity states
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [activityFilter, setActivityFilter] = useState<'all' | 'you'>('all');
  
  // Settings states
  const [settingsScreen, setSettingsScreen] = useState<SettingsScreen>('main');
  const [userName, setUserName] = useState('Alex Johnson');
  const [userEmail, setUserEmail] = useState('alex@spredfit.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [connectedApps, setConnectedApps] = useState({
    strava: false,
    appleHealthKit: false,
    googleFitness: false
  });
  
  // Profile states
  const [profileScreen, setProfileScreen] = useState<ProfileScreen>('view');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Leagues states
  const [selectedLeague, setSelectedLeague] = useState<{ name: string; rank: number; totalMembers: number; id?: string } | null>(null);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [joinLeagueCode, setJoinLeagueCode] = useState('');
  const [createdLeagueCode, setCreatedLeagueCode] = useState('');
  const [allowTeams, setAllowTeams] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [doubleUp, setDoubleUp] = useState(false);
  const [duration, setDuration] = useState('1 month');
  const [selectedLeagueSports, setSelectedLeagueSports] = useState<string[]>([
    'Running', 'Cycling', 'Swimming', 'Strength', 'Yoga', 'HIIT', 'Team Sports', 'Other'
  ]);
  const [stealthActivated, setStealthActivated] = useState(false);
  const [doubleUpActivated, setDoubleUpActivated] = useState(false);
  
  // Leaderboard states
  const [leaderboardView, setLeaderboardView] = useState<'individual' | 'team'>('individual');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'total' | 'weekly'>('total');
  
  // Chat states
  const [chatFilter, setChatFilter] = useState<'leagues' | 'teams'>('leagues');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [leagueChats, setLeagueChats] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  
  // Workout states - Log workout
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [logDistance, setLogDistance] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logMinutes, setLogMinutes] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [workoutPhoto, setWorkoutPhoto] = useState<string | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  
  // Workout states - Active workout
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [workoutDistance, setWorkoutDistance] = useState(0);
  const [gpsSearching, setGpsSearching] = useState(false);
  const [gpsConnected, setGpsConnected] = useState(false);
  const [recordedDistance, setRecordedDistance] = useState(0);
  const [recordedPace, setRecordedPace] = useState('0:00');
  
  // Lock screen states
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Training plan states
  const [showPlanPrompt, setShowPlanPrompt] = useState(false);
  const [planPrompt, setPlanPrompt] = useState('');
  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(false);
  const [planAge, setPlanAge] = useState('');
  const [planFitness, setPlanFitness] = useState('');
  const [planTimePerWeek, setPlanTimePerWeek] = useState('');
  const [planGoals, setPlanGoals] = useState('');
  const [planInjuries, setPlanInjuries] = useState('');
  
  // Manual workout creation states
  const [manualWorkoutStep, setManualWorkoutStep] = useState(0);
  const [manualWorkoutSport, setManualWorkoutSport] = useState('');
  const [manualWorkoutDistance, setManualWorkoutDistance] = useState('');
  const [manualWorkoutHours, setManualWorkoutHours] = useState('');
  const [manualWorkoutMinutes, setManualWorkoutMinutes] = useState('');
  const [manualWorkoutNotes, setManualWorkoutNotes] = useState('');
  
  // Planned workout state - stores today's planned workout
  const [plannedWorkout, setPlannedWorkout] = useState<{
    sport: string;
    duration: number; // minutes
    distance: number; // km
    type: string; // title/name
    time: string;
    notes?: string;
  } | null>(null);
  
  // Carousel state
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  
  // UI toggle states
  const [hideUtilityButtons, setHideUtilityButtons] = useState(false);
  const [animationsPaused, setAnimationsPaused] = useState(false);
  
  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => {
    setActiveModal(null);
    setModalStep(1);
    setSelectedSport(null);
    setIsWorkoutRunning(false);
    setWorkoutTime(0);
    setWorkoutDistance(0);

    // Reset log workout states
    setLogDistance('');
    setLogHours('');
    setLogMinutes('');
    setLogNotes('');

    // Reset GPS and tracking states
    setGpsSearching(false);
    setGpsConnected(false);
    setRecordedDistance(0);
    setRecordedPace('0:00');

    // Reset league states
    setSelectedLeague(null);
    setNewLeagueName('');
    setJoinLeagueCode('');

    // Reset leaderboard states
    setLeaderboardView('individual');
    setLeaderboardPeriod('total');

    // Reset activity detail states
    setSelectedActivity(null);
    setCommentText('');

    // Reset chat states
    setSelectedChat(null);
    setMessageText('');

    // Reset training plan states
    setShowPlanPrompt(false);
    setPlanPrompt('');
    setPlanAge('');
    setPlanFitness('');
    setPlanTimePerWeek('');
    setPlanGoals('');
    setPlanInjuries('');
    setHasGeneratedPlan(false);

    // Reset settings states
    setSettingsScreen('main');

    // Reset profile states
    setProfileScreen('view');
    
    // Reset workout photo
    setWorkoutPhoto(null);
    setShowPhotoUpload(false);
  };
  
  return {
    // Modal
    activeModal,
    openModal,
    closeModal,
    setActiveModal,
    achievementIndex,
    setAchievementIndex,
    leagueIndex,
    setLeagueIndex,
    modalStep,
    setModalStep,
    
    // PWA Install
    deferredPrompt,
    setDeferredPrompt,
    showInstallButton,
    setShowInstallButton,
    
    // Coffee menu
    showCoffeeMenu,
    setShowCoffeeMenu,
    
    // Activity
    selectedActivity,
    setSelectedActivity,
    commentText,
    setCommentText,
    activities,
    setActivities,
    activityFilter,
    setActivityFilter,
    
    // Settings
    settingsScreen,
    setSettingsScreen,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    notificationsEnabled,
    setNotificationsEnabled,
    privateProfile,
    setPrivateProfile,
    distanceUnit,
    setDistanceUnit,
    weightUnit,
    setWeightUnit,
    connectedApps,
    setConnectedApps,
    
    // Profile
    profileScreen,
    setProfileScreen,
    selectedPhotoFile,
    setSelectedPhotoFile,
    isUploadingPhoto,
    setIsUploadingPhoto,
    
    // Leagues
    selectedLeague,
    setSelectedLeague,
    newLeagueName,
    setNewLeagueName,
    joinLeagueCode,
    setJoinLeagueCode,
    createdLeagueCode,
    setCreatedLeagueCode,
    allowTeams,
    setAllowTeams,
    isPrivate,
    setIsPrivate,
    stealthMode,
    setStealthMode,
    doubleUp,
    setDoubleUp,
    duration,
    setDuration,
    selectedLeagueSports,
    setSelectedLeagueSports,
    stealthActivated,
    setStealthActivated,
    doubleUpActivated,
    setDoubleUpActivated,
    
    // Leaderboard
    leaderboardView,
    setLeaderboardView,
    leaderboardPeriod,
    setLeaderboardPeriod,
    
    // Chat
    chatFilter,
    setChatFilter,
    selectedChat,
    setSelectedChat,
    messageText,
    setMessageText,
    leagueChats,
    setLeagueChats,
    chatMessages,
    setChatMessages,
    
    // Workout - Log
    selectedSport,
    setSelectedSport,
    logDistance,
    setLogDistance,
    logHours,
    setLogHours,
    logMinutes,
    setLogMinutes,
    logNotes,
    setLogNotes,
    workoutPhoto,
    setWorkoutPhoto,
    showPhotoUpload,
    setShowPhotoUpload,
    
    // Workout - Active
    isWorkoutRunning,
    setIsWorkoutRunning,
    workoutTime,
    setWorkoutTime,
    workoutDistance,
    setWorkoutDistance,
    gpsSearching,
    setGpsSearching,
    gpsConnected,
    setGpsConnected,
    recordedDistance,
    setRecordedDistance,
    recordedPace,
    setRecordedPace,
    
    // Lock screen
    showLockScreen,
    setShowLockScreen,
    isLocked,
    setIsLocked,
    slidePosition,
    setSlidePosition,
    isDragging,
    setIsDragging,
    
    // Training Plans
    showPlanPrompt,
    setShowPlanPrompt,
    planPrompt,
    setPlanPrompt,
    hasGeneratedPlan,
    setHasGeneratedPlan,
    planAge,
    setPlanAge,
    planFitness,
    setPlanFitness,
    planTimePerWeek,
    setPlanTimePerWeek,
    planGoals,
    setPlanGoals,
    planInjuries,
    setPlanInjuries,
    
    // Manual workout creation
    manualWorkoutStep,
    setManualWorkoutStep,
    manualWorkoutSport,
    setManualWorkoutSport,
    manualWorkoutDistance,
    setManualWorkoutDistance,
    manualWorkoutHours,
    setManualWorkoutHours,
    manualWorkoutMinutes,
    setManualWorkoutMinutes,
    manualWorkoutNotes,
    setManualWorkoutNotes,
    
    // Planned workout
    plannedWorkout,
    setPlannedWorkout,
    
    // Carousel
    currentCarouselIndex,
    setCurrentCarouselIndex,
    
    // UI toggle
    hideUtilityButtons,
    setHideUtilityButtons,
    animationsPaused,
    setAnimationsPaused,
  };
}