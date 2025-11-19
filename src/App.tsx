import React, { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { Leaderboard } from "./components/Leaderboard";
// Removed unused legacy components: Profile, ManageLeagues
import { Settings } from "./components/Settings";
import { LogWorkout } from "./components/LogWorkout";
import { ActiveWorkout } from "./components/ActiveWorkout";
import { WorkoutDetail } from "./components/WorkoutDetail";
import { UploadPhoto } from "./components/UploadPhoto";
import { UploadWorkoutPhoto } from "./components/UploadWorkoutPhoto";
import { Leagues } from "./components/Leagues";
import { JoinLeague } from "./components/JoinLeague";
import { CreateLeague } from "./components/CreateLeague";
// Removed ManageLeagues - handled by dashboard modals now
import { UserActivities } from "./components/UserActivities";
import { ActivityFeed } from "./components/ActivityFeed";
import { TrainingPlans } from "./components/TrainingPlans";
import { PlanDetail } from "./components/PlanDetail";
import { Chat } from "./components/Chat";
import { ChatConversation } from "./components/ChatConversation";
import { Metrics } from "./components/Metrics";
import { Goals } from "./components/Goals";
import { DealFinder } from "./components/DealFinder";
import { BrandedStore } from "./components/BrandedStore";
import { Toaster, toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "motion/react";
import { UserCircle, Star, Check, AlertTriangle, Heart, Moon, Stethoscope, ChevronRight, Eye, EyeOff } from "lucide-react";
import logo from "figma:asset/acd126c619660e3932cb554ee937e18cc6986211.png";
import { Checkbox } from "./components/ui/checkbox";
import { AuthProvider, useAuth } from "./utils/auth";
import { AppProvider, useApp } from "./utils/AppContext";
import { ModalProvider } from "./utils/ModalContext";
import { registerServiceWorker, addPWAMetaTags } from "./utils/pwa";
import { initializeNativeApp, isNativeApp } from "./utils/native";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { PWAInstall } from "./components/PWAInstall";

console.log("🟠🟠🟠 APP.TSX FILE LOADED - Top level");
console.log("🟠 Current time:", new Date().toISOString());

type Screen = "onboarding" | "login" | "signup" | "disclaimer" | "dashboard" | "logworkout" | "startworkout" | "activeworkout" | "leaderboard" | "profile" | "settings" | "uploadphoto" | "uploadworkoutphoto" | "workoutdetail" | "leagues" | "joinleague" | "createleague" | "manageleagues" | "useractivities" | "activityfeed" | "trainingplans" | "plandetail" | "chat" | "chatconversation" | "metrics" | "goals" | "dealfinder" | "brandedstore";

interface SelectedUser {
  id: number;
  name: string;
  avatar: string;
  initials: string;
}

interface WorkoutData {
  sport: string;
  duration: number;
  distance?: number;
  date?: string;
  notes?: string;
}

interface LeagueData {
  name: string;
  mode: string;
  startDate: string;
  endDate: string;
  inviteCode?: string;
}

function AppContent() {
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth();

  // Add this debug log
  console.log('🔵 App.tsx: user state:', user);

  const { createWorkout, currentLeague } = useApp();
  
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [previousScreen, setPreviousScreen] = useState<Screen>("dashboard");
  const [selectedSport, setSelectedSport] = useState<string>("Running");
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    isGroup: boolean;
    name: string;
    avatar: string;
    members?: number;
  } | null>(null);
  
  // Track login/signup view
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  
  // Track disclaimer acceptance
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  
  // Auth form state
  const [authLoading2, setAuthLoading2] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
 // Handle login
const handleLogin = async () => {
  console.log('🔵 Login button clicked!');
  console.log('Email:', loginEmail);
  console.log('Password length:', loginPassword.length);
  
  if (!loginEmail || !loginPassword) {
    toast.error("Please fill in all fields");
    return;
  }
  
  setAuthLoading2(true);
  try {
    console.log('🔵 Calling signIn...');
    await signIn(loginEmail, loginPassword, rememberMe);
    console.log('🔵 SignIn successful!');
    toast.success("Welcome back!", {
      description: "Ready to crush your fitness goals?",
    });
    setLoginEmail("");
    setLoginPassword("");
  } catch (error: any) {
    console.error('🔴 Login error:', error);
    toast.error("Login failed", {
      description: error.message || "Please check your credentials",
    });
  } finally {
    setAuthLoading2(false);
  }
};

  // Handle signup
  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setAuthLoading2(true);
    try {
      await signUp(signupEmail, signupPassword, signupName);
      toast.success("Account created!", {
        description: "Let's start your fitness journey!",
      });
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setDisclaimerAccepted(false);
      setDisclaimerChecked(false);
    } catch (error: any) {
      toast.error("Signup failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setAuthLoading2(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    console.log('🔴 handleLogout called from SettingsModal');
    try {
      await signOut();
      setCurrentScreen("dashboard");
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error("Logout failed", {
        description: error.message || "Please try again",
      });
      console.error('🔴 Logout failed', error);
    }
  };
  
  // Page transition wrapper
  const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      key={currentScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 1.5, 
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );

  // Add this BEFORE the "if (!user)" check around line 204:
if (authLoading) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1a1f1a]">
      <div className="text-white">Loading...</div>
    </div>
  );
}

  // Show login modal if not authenticated
  if (!user) {
    return (
      <>
        <Toaster position="top-center" richColors />
        
        {/* Dashboard background */}
        <Dashboard
          onLogWorkout={() => {}}
          onStartWorkout={() => {}}
          onLeaderboard={() => {}}
          onLeagues={() => {}}
          onProfile={() => {}}
          onActivityFeed={() => {}}
          onTrainingPlans={() => {}}
          onChat={() => {}}
          onDealFinder={() => {}}
          onBrandedStore={() => {}}
          onSignOut={() => {}}
          isLoginBackground={true}
        />
        
        {/* Login Modal Overlay */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-48">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl mt-[-100px] sm:mt-0"
          >
            <AnimatePresence mode="wait">
              {authView === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center space-y-6 max-w-[280px]"
                >
                  <div>
                    <p className="text-white/70 text-sm">Ready to crush it?</p>
                  </div>
                  
                  <div className="space-y-3 w-full">
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
                    />
                    
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="mt-0.5 border-white/40 !bg-transparent data-[state=checked]:!bg-transparent data-[state=checked]:border-white data-[state=checked]:text-white"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-white/90 text-[10px] cursor-pointer leading-tight"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>
                </motion.div>
              ) : !disclaimerAccepted ? (
                <motion.div
                  key="disclaimer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center w-full"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mb-2">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  
                  <h3 className="text-white text-xs mb-3">Health & Safety</h3>
                  
                  <div className="space-y-1.5 w-full px-3 max-h-52 overflow-y-auto scrollbar-hide">
                    <div className="w-full p-2 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10">
                      <div className="flex items-start gap-1.5">
                        <Heart className="w-3 h-3 text-white flex-shrink-0 mt-0.5" />
                        <p className="text-white text-[9px] leading-tight text-left">
                          Listen to your body. Start slowly, progress gradually.
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-full p-2 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10">
                      <div className="flex items-start gap-1.5">
                        <Moon className="w-3 h-3 text-white flex-shrink-0 mt-0.5" />
                        <p className="text-white text-[9px] leading-tight text-left">
                          Recovery is essential. Schedule regular rest days.
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-full p-2 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10">
                      <div className="flex items-start gap-1.5">
                        <Stethoscope className="w-3 h-3 text-white flex-shrink-0 mt-0.5" />
                        <p className="text-white text-[9px] leading-tight text-left">
                          Consult a doctor before starting any new program.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center space-y-6 max-w-[280px]"
                >
                  <div>
                    <p className="text-white/70 text-sm">Start your fitness journey today!</p>
                  </div>
                  
                  <div className="space-y-3 w-full">
                    <input
                      type="text"
                      placeholder="Name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
                    />
                    
                    <input
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
                    />
                    
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                        className="w-full h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Auth Action Buttons - Bottom Right - Constrained to mobile viewport */}
          <div className="fixed bottom-0 left-0 right-0 z-[60] flex justify-end pointer-events-none">
            <div className="max-w-[440px] w-full mx-auto px-4 pb-8 pointer-events-auto">
              <div className="flex justify-end">
                <div className="flex flex-col gap-3">
                  {/* Show Sign Up toggle if on login, OR show Back to Login if on signup/disclaimer screen */}
                  {authView === "login" ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setAuthView("signup")}
                        className="w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg p-4 bg-white/5 border-2 border-white/40"
                      >
                        <img src={logo} alt="SPREDfit" className="w-full h-full object-contain" />
                      </button>
                      <span className="text-white text-[10px] text-center">
                        Sign Up
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => {
                          setAuthView("login");
                          setDisclaimerAccepted(false);
                          setDisclaimerChecked(false);
                        }}
                        className="w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg bg-[#2d2d2d] backdrop-blur-sm border border-white/20 hover:bg-[#2d2d2d]/90"
                      >
                        <ChevronRight className="w-7 h-7 text-white rotate-180" strokeWidth={2} />
                      </button>
                      <span className="text-white text-[10px] text-center">
                        Back
                      </span>
                    </div>
                  )}
                  
                  {/* Submit/Accept button */}
                  {authView === "login" ? (
                    <div className="flex flex-col items-center gap-1.5 mt-2">
                      <button
                        onClick={handleLogin}
                        disabled={authLoading2}
                        className="w-20 h-20 rounded-full bg-white text-[#2d332d] flex items-center justify-center transition-all shadow-lg hover:bg-white/90 disabled:opacity-50"
                      >
                        <Check className="w-7 h-7" />
                      </button>
                      <span className="text-white text-[10px] text-center">
                        Log In
                      </span>
                    </div>
                  ) : disclaimerAccepted ? (
                    <div className="flex flex-col items-center gap-1.5 mt-2">
                      <button
                        onClick={handleSignup}
                        disabled={authLoading2}
                        className="w-20 h-20 rounded-full bg-white text-[#2d332d] flex items-center justify-center transition-all shadow-lg hover:bg-white/90 disabled:opacity-50"
                      >
                        <Check className="w-7 h-7" />
                      </button>
                      <span className="text-white text-[10px] text-center">
                        Sign Up
                      </span>
                    </div>
                  ) : (
                    /* Accept button for disclaimer */
                    <div className="flex flex-col items-center gap-1.5 mt-2">
                      <button
                        onClick={() => {
                          if (disclaimerChecked) {
                            setDisclaimerAccepted(true);
                            setDisclaimerChecked(false); // Reset for next time
                          } else {
                            toast.error("Please accept the health & safety disclaimer");
                          }
                        }}
                        disabled={!disclaimerChecked}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                          disclaimerChecked
                            ? "bg-white text-[#2d332d] hover:bg-white/90"
                            : "bg-transparent border-2 border-white/20 text-white/30 cursor-not-allowed"
                        }`}
                      >
                        <Check className="w-7 h-7" />
                      </button>
                      <span className={`text-[10px] text-center transition-colors ${
                        disclaimerChecked ? "text-white" : "text-white/30"
                      }`}>
                        Accept
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Checkbox - Bottom Left for disclaimer only */}
          {authView === "signup" && !disclaimerAccepted && (
            <div className="fixed bottom-8 left-4 z-[60]">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 max-w-[200px]">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="disclaimer"
                    checked={disclaimerChecked}
                    onCheckedChange={(checked) => setDisclaimerChecked(checked as boolean)}
                    className="mt-0.5 border-white/40 !bg-transparent data-[state=checked]:!bg-transparent data-[state=checked]:border-white data-[state=checked]:text-white"
                  />
                  <label
                    htmlFor="disclaimer"
                    className="text-white/90 text-[10px] cursor-pointer leading-tight"
                  >
                    I understand and will exercise responsibly.
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (currentScreen === "chatconversation") {
    if (!selectedConversation) {
      setCurrentScreen("chat");
      return null;
    }
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <ChatConversation
          conversationId={selectedConversation.id}
          isGroup={selectedConversation.isGroup}
          name={selectedConversation.name}
          avatar={selectedConversation.avatar}
          members={selectedConversation.members}
          onBack={() => {
            setSelectedConversation(null);
            setCurrentScreen("chat");
          }}
        />
      </>
    );
  }

  if (currentScreen === "chat") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <Chat
          onBack={() => setCurrentScreen("dashboard")}
          onOpenConversation={(conversationId, isGroup, name, avatar, members) => {
            setSelectedConversation({ id: conversationId, isGroup, name, avatar, members });
            setCurrentScreen("chatconversation");
          }}
        />
      </>
    );
  }

  if (currentScreen === "plandetail") {
    if (!selectedPlanId) {
      setCurrentScreen("trainingplans");
      return null;
    }
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <PlanDetail
          planId={selectedPlanId}
          onBack={() => {
            setSelectedPlanId(null);
            setCurrentScreen("trainingplans");
          }}
          onLogWorkout={(sport) => {
            setSelectedSport(sport);
            setCurrentScreen("activeworkout");
          }}
        />
      </>
    );
  }

  if (currentScreen === "trainingplans") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <TrainingPlans
          onBack={() => setCurrentScreen("dashboard")}
          onCreatePlan={() => {
            // Create plan functionality handled in TrainingPlansModal
          }}
          onViewPlan={(planId) => {
            setSelectedPlanId(planId);
            setCurrentScreen("plandetail");
          }}
        />
      </>
    );
  }

  if (currentScreen === "activityfeed") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <ActivityFeed
          onBack={() => setCurrentScreen("dashboard")}
          onUserClick={(userId, userName, userAvatar, userInitials) => {
            setSelectedUser({ id: userId, name: userName, avatar: userAvatar, initials: userInitials });
            setPreviousScreen("activityfeed");
            setCurrentScreen("useractivities");
          }}
        />
      </>
    );
  }

  if (currentScreen === "useractivities") {
    if (!selectedUser) {
      setCurrentScreen("dashboard");
      return null;
    }
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <UserActivities
          onBack={() => {
            setSelectedUser(null);
            setCurrentScreen(previousScreen);
          }}
          userId={selectedUser.id}
          userName={selectedUser.name}
          userAvatar={selectedUser.avatar}
          userInitials={selectedUser.initials}
        />
      </>
    );
  }

  if (currentScreen === "workoutdetail") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <WorkoutDetail
          sport={selectedSport}
          onBack={() => {
            setEditingWorkoutId(null);
            setCurrentScreen(editingWorkoutId ? "profile" : "logworkout");
          }}
          onSave={async (data: WorkoutData) => {
            if (editingWorkoutId) {
              // Editing existing workout
              await handleUpdateWorkout(editingWorkoutId, data);
              setEditingWorkoutId(null);
              // Stay on useractivities if it's the current user's workout
              if (selectedUser?.id === 1) {
                setCurrentScreen("useractivities");
              } else {
                setCurrentScreen("profile");
              }
            } else {
              // New workout
              await handleWorkoutSave(data);
              setCurrentScreen("uploadworkoutphoto");
            }
          }}
          initialData={editingWorkoutId ? (() => {
            // Find the workout being edited
            const userWorkouts = mockWorkouts.filter(w => w.userId === 1);
            const workout = userWorkouts.find((_, index) => index === editingWorkoutId);
            if (workout) {
              return {
                sport: selectedSport,
                duration: workout.duration,
                distance: workout.distance,
                calories: workout.calories,
                effort: workout.effort,
                notes: workout.description || ""
              };
            }
            return undefined;
          })() : undefined}
          isEditing={editingWorkoutId !== null}
        />
      </>
    );
  }

  if (currentScreen === "uploadphoto") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <UploadPhoto
          onBack={() => setCurrentScreen("settings")}
          currentPhoto="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80"
        />
      </>
    );
  }

  if (currentScreen === "uploadworkoutphoto") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <UploadWorkoutPhoto
          onBack={() => setCurrentScreen("workoutdetail")}
          onSkip={() => {
            // Navigate to user activities (current user's profile activities)
            setSelectedUser({
              id: 1,
              name: "Sarah Chen",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
              initials: "SC"
            });
            setPreviousScreen("dashboard");
            setCurrentScreen("useractivities");
          }}
          workoutSport={selectedSport}
        />
      </>
    );
  }

  if (currentScreen === "settings") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <Settings
          onBack={() => setCurrentScreen("dashboard")}
          onUploadPhoto={() => setCurrentScreen("uploadphoto")}
          onLogout={handleLogout}
        />
      </>
    );
  }

  // Legacy screens - Profile and ManageLeagues are now handled via Dashboard modals
  // Commenting out to prevent 500 errors from missing CoverFlowScroll component
  /*
  if (currentScreen === "manageleagues") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <ManageLeagues
          onBack={() => setCurrentScreen("dashboard")}
          onUserClick={(userId, userName, userAvatar, userInitials) => {
            setSelectedUser({ id: userId, name: userName, avatar: userAvatar, initials: userInitials });
            setPreviousScreen("manageleagues");
            setCurrentScreen("useractivities");
          }}
        />
      </>
    );
  }

  if (currentScreen === "profile") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <Profile
          onBack={() => setCurrentScreen(previousScreen)}
          onSettings={() => setCurrentScreen("settings")}
          onManageLeagues={() => setCurrentScreen("manageleagues")}
          onManageGoals={() => setCurrentScreen("goals")}
          onMetrics={() => setCurrentScreen("metrics")}
          onChat={() => setCurrentScreen("chat")}
          onEditWorkout={(workoutId: number, sport: string) => {
            setEditingWorkoutId(workoutId);
            setSelectedSport(sport);
            setCurrentScreen("workoutdetail");
          }}
        />
      </>
    );
  }
  */

  if (currentScreen === "metrics") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <Metrics
          onBack={() => setCurrentScreen("profile")}
        />
      </>
    );
  }

  if (currentScreen === "goals") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <Goals
          onBack={() => setCurrentScreen("profile")}
        />
      </>
    );
  }

  if (currentScreen === "dealfinder") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <DealFinder
          onBack={() => setCurrentScreen("dashboard")}
        />
      </>
    );
  }

  if (currentScreen === "brandedstore") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <BrandedStore
          onBack={() => setCurrentScreen("dashboard")}
        />
      </>
    );
  }

  if (currentScreen === "createleague") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <CreateLeague
          onBack={() => setCurrentScreen("leagues")}
          onCreate={(data: LeagueData) => {
            console.log("League created:", data);
            // TODO: Save league data
            // Stay on the success screen, user clicks "Back to Leagues" to return
          }}
        />
      </>
    );
  }

  if (currentScreen === "joinleague") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <JoinLeague
          onBack={() => setCurrentScreen("leagues")}
          onJoin={(leagueId) => {
            console.log("Joined league:", leagueId);
            // TODO: Join league
            setCurrentScreen("leagues");
          }}
        />
      </>
    );
  }

  if (currentScreen === "leagues") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <Leagues
          onBack={() => setCurrentScreen("dashboard")}
          onLeagueClick={(leagueId) => {
            console.log("Opening league:", leagueId);
            setCurrentScreen("leaderboard");
          }}
          onJoinLeague={() => setCurrentScreen("joinleague")}
          onCreateLeague={() => setCurrentScreen("createleague")}
        />
      </>
    );
  }

  if (currentScreen === "leaderboard") {
    return (
      <>
        {/* Always-visible animated background */}
        <AnimatedBackground dimmed={true} />
        
        {/* Floating leaderboard content - no PageTransition wrapper */}
        <Leaderboard
          onBack={() => setCurrentScreen("dashboard")}
          onProfile={() => {
            setPreviousScreen("leaderboard");
            setCurrentScreen("profile");
          }}
          onUserClick={(userId, userName, userAvatar, userInitials) => {
            setSelectedUser({ id: userId, name: userName, avatar: userAvatar, initials: userInitials });
            setPreviousScreen("leaderboard");
            setCurrentScreen("useractivities");
          }}
        />
      </>
    );
  }

  if (currentScreen === "activeworkout") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <ActiveWorkout
          sport={selectedSport}
          onComplete={async (duration, distance, route) => {
            console.log("Workout completed:", { sport: selectedSport, duration, distance, route });
            
            // Save workout to backend (creates activity automatically)
            try {
              console.log("=== SAVING ACTIVE WORKOUT TO BACKEND ===");
              console.log("Workout data:", {
                type: selectedSport,
                duration: duration * 60,
                distance: distance || 0,
                date: new Date().toISOString(),
                leagueId: currentLeague?.id || undefined,
              });
              
              const result = await createWorkout({
                type: selectedSport,
                duration: duration * 60, // Convert hours to minutes
                distance: distance || 0,
                date: new Date().toISOString(),
                leagueId: currentLeague?.id || undefined,
              });
              
              console.log("Active workout save result:", result);
              console.log("Workout and activity saved successfully!");
            } catch (error) {
              console.error("=== FAILED TO SAVE ACTIVE WORKOUT ===");
              console.error("Error details:", error);
              toast.error("Failed to save workout", {
                description: error instanceof Error ? error.message : "Please try again",
              });
              return;
            }
            
            // Store route for later use
            if (route) {
              // In a real app, this would be saved to backend with the workout
              console.log("Route tracked with", route.length, "GPS points");
            }
            
            // Show success toast
            toast.success("🎉 Awesome Workout!", {
              description: `${selectedSport} completed! ${duration.toFixed(2)} hours tracked`,
              duration: 3000,
            });
            
            // Navigate to user activities (current user's profile activities)
            setSelectedUser({
              id: 1,
              name: "Sarah Chen",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
              initials: "SC"
            });
            setPreviousScreen("dashboard");
            setCurrentScreen("useractivities");
          }}
          onCancel={() => setCurrentScreen("dashboard")}
        />
      </>
    );
  }

  if (currentScreen === "startworkout") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <LogWorkout
          onBack={() => setCurrentScreen("dashboard")}
          onSelectSport={(sport) => {
            setSelectedSport(sport);
            setCurrentScreen("activeworkout");
          }}
        />
      </>
    );
  }

  if (currentScreen === "logworkout") {
    return (
      <>
        <AnimatedBackground dimmed={true} />
        <LogWorkout
          onBack={() => setCurrentScreen("dashboard")}
          onSelectSport={(sport) => {
            setSelectedSport(sport);
            setCurrentScreen("workoutdetail");
          }}
        />
      </>
    );
  }

  if (currentScreen === "dashboard") {
    return (
      <Dashboard
        onLogWorkout={() => setCurrentScreen("logworkout")}
        onStartWorkout={() => setCurrentScreen("startworkout")}
        onLeaderboard={() => setCurrentScreen("leaderboard")}
        onLeagues={() => setCurrentScreen("leagues")}
        onProfile={() => {
          setPreviousScreen("dashboard");
          setCurrentScreen("profile");
        }}
        onActivityFeed={() => setCurrentScreen("activityfeed")}
        onTrainingPlans={() => setCurrentScreen("trainingplans")}
        onChat={() => setCurrentScreen("chat")}
        onDealFinder={() => setCurrentScreen("dealfinder")}
        onBrandedStore={() => setCurrentScreen("brandedstore")}
        onSignOut={handleLogout}
      />
    );
  }
  
  // Fallback
  return (
    <>
      <Toaster position="top-center" richColors />
      {/* PWA Install Prompt - Shows automatically after 3 seconds if installable */}
      <PWAInstall autoShow={true} />
    </>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize PWA features for iOS mobile support
    try {
      registerServiceWorker();
      addPWAMetaTags();
      console.log('✅ PWA features initialized for iOS');
    } catch (error) {
      console.log('⚠️ PWA initialization skipped:', error);
    }
    
    // Initialize native app features if running in a native environment
    if (isNativeApp()) {
      initializeNativeApp();
      console.log('✅ Native app features initialized');
    }
  }, []);
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {/* Centered container - 440px max-width for mobile dimensions */}
      <div className="w-full max-w-[440px] min-h-screen relative">
        <AuthProvider>
          <AppProvider>
            <ModalProvider>
              <AppContent />
            </ModalProvider>
          </AppProvider>
        </AuthProvider>
      </div>
    </div>
  );
}