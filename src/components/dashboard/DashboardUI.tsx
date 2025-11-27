import { useAuth } from "../../utils/auth";
import { memo } from "react";
import {
  UserCircle,
  Activity,
  Settings,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Sparkles,
  Coffee,
  Share2,
  Play,
  PenLine,
  Trophy,
  Users,
  Award,
  Flame,
  Calendar,
  Bike,
  Waves,
  Dumbbell,
  Heart,
  Zap,
  Link,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import logo from "figma:asset/acd126c619660e3932cb554ee937e18cc6986211.png";

// Types
interface DashboardHeaderProps {
  onModalOpen: (modal: string) => void;
}

interface ActivityCarouselProps {
  activities: any[];
  currentLeague: any;
  onActivityClick: (activity: any) => void;
  getSportIcon: (sport?: string) => any;
  isExpanded?: boolean;
}

interface MainActionCardsProps {
  onModalOpen: (modal: string) => void;
}

interface NavigationSidebarProps {
  onModalOpen: (modal: string) => void;
  hideButtons?: boolean;
}

/**
 * DashboardHeader Component
 * 
 * Renders the top header section with:
 * - User name (right aligned)
 * - Coffee and Share App buttons
 */
function DashboardHeaderComponent({ onModalOpen }: DashboardHeaderProps) {
  const { user } = useAuth();

  const handleShareApp = async () => {
    const shareData = {
      text: 'Join my fitness league',
      url: 'https://www.spredfit.com'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`Join my fitness league\n\nhttps://www.spredfit.com`);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        console.error('Error copying:', err);
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <div className="mb-6 flex-shrink-0 relative z-[60]">
      {/* User Name - right aligned */}
      <div className="flex items-center justify-end mb-3">
        <div>
         <h1 className="text-2xl text-[#eef0ed]">
            {user?.username ? (
              user.username
            ) : (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white/50">Loading...</span>
              </span>
            )}
          </h1>
        </div>
      </div>
      
      {/* Share App button - right aligned */}
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleShareApp}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-full hover:bg-white/10 transition-all min-w-[50px]"
        >
          <Share2 className="w-5 h-5 text-white" strokeWidth={2} />
          <span className="text-[9px] text-white text-center leading-tight">Share<br/>App</span>
        </button>
      </div>
    </div>
  );
}

export const DashboardHeader = memo(DashboardHeaderComponent);

/**
 * ActivityCarousel Component
 * 
 * Renders the circular floating carousel that displays recent activities.
 * Users can scroll horizontally through activities and click to view details.
 */
function ActivityCarouselComponent({ 
  activities, 
  currentLeague, 
  onActivityClick,
  getSportIcon,
  isExpanded,
}: ActivityCarouselProps) {
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 z-10">
      <div className="w-full h-full">
        {/* Full width square container with padding */}
        <div className="w-full h-full relative overflow-hidden" data-tutorial="activity-carousel">
          <div 
            className="overflow-x-auto absolute inset-0 flex items-center px-4"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style>{`
              .overflow-x-auto::-webkit-scrollbar { 
                display: none; 
              }
            `}</style>
            <div className="flex snap-x snap-mandatory h-full gap-4">
              {activities.map((activity) => {
                // Determine what to show based on activity type
                let activityLabel = '';
                let Icon = Activity;
                
                if (activity.type === 'workout') {
                  activityLabel = activity.sport || 'Workout';
                  Icon = getSportIcon(activity.sport);
                } else if (activity.type === 'achievement') {
                  activityLabel = activity.achievement || 'Achievement';
                  Icon = Award;
                } else if (activity.type === 'streak') {
                  activityLabel = 'Streak';
                  Icon = Flame;
                } else if (activity.type === 'plan_complete') {
                  activityLabel = 'Training Plan';
                  Icon = Calendar;
                }
                
                // Get last 3 comments
                const recentComments = (activity.comments || []).slice(-3);
                
                return (
                  <div 
                    key={activity.id} 
                    className="flex-shrink-0 h-full flex flex-col items-center justify-center text-center snap-center cursor-pointer relative rounded-2xl overflow-hidden"
                    style={{ width: 'calc(100vw - 4rem)' }}
                    onClick={() => {
                      console.log('🔍 Activity clicked:', activity);
                      onActivityClick(activity);
                    }}
                  >
                    {/* Background Image at 10% opacity */}
                    {activity.photo && (
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${activity.photo})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: 0.1
                        }}
                      />
                    )}
                    
                    {/* Content */}
                    <div className="relative z-10 px-6">
                      {/* 1. Sport Icon */}
                      <div className="mb-3">
                        <Icon className="w-12 h-12 text-[#eef0ed] mx-auto" strokeWidth={1.5} />
                      </div>
                      
                      {/* 2. User Name */}
                      <h2 className="text-[#eef0ed] mb-2 font-semibold text-xl">
                        {activity.userName}
                      </h2>
                      
                      {/* 3. Distance and Time (or just time) */}
                      {activity.type === 'workout' && (
                        <p className="text-[#eef0ed]/90 mb-2 font-medium text-base">
                          {activity.distance && activity.distance > 0 
                            ? `${activity.distance} km • ${activity.duration} min`
                            : `${activity.duration} min`
                          }
                        </p>
                      )}
                      
                      {/* 4. Primary League Info */}
                      {activity.primaryLeague ? (
                        <div className="mb-4">
                          {/* League Name */}
                          <p className="text-[#eef0ed]/70 mb-2 text-sm">
                            {activity.primaryLeague.leagueName}
                          </p>
                          
                          {/* League Position */}
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-[#eef0ed] font-semibold text-base">
                              #{activity.primaryLeague.rank}
                            </p>
                            <span className="text-[#eef0ed]/60 text-xs">
                              of {activity.primaryLeague.totalMembers}
                            </span>
                          </div>
                          
                          {/* Show if counts for multiple leagues */}
                          {activity.applicableLeagues && activity.applicableLeagues.length > 1 && (
                            <p className="text-[#eef0ed]/50 text-[10px] mt-1">
                              +{activity.applicableLeagues.length - 1} more league{activity.applicableLeagues.length > 2 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      ) : (
                        /* Fallback - show current league or no league message */
                        <p className="text-[#eef0ed]/70 mb-4 text-sm">
                          {currentLeague?.name || 'No active league'}
                        </p>
                      )}

                      {/* 5. Last 3 Comments */}
                      {recentComments.length > 0 && (
                        <div className="mt-4 space-y-2 max-w-xs mx-auto">
                          {recentComments.map((comment) => (
                            <div key={comment.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-left">
                              <p className="text-[#FFFFFF] text-xs font-semibold">{comment.userName}</p>
                              <p className="text-[#FFFFFF]/80 text-[10px] line-clamp-2">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Show message if no activities */}
              {activities.length === 0 && (
                <div 
                  className="flex-shrink-0 h-full flex flex-col items-center justify-center text-center snap-center"
                  style={{ width: 'calc(100vw - 4rem)' }}
                >
                  <div className="mb-2">
                    <Activity className="w-8 h-8 text-[#eef0ed] mx-auto" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-[#eef0ed] mb-1 text-2xl">No Activity Yet</h2>
                  <p className="text-[#eef0ed]/60 px-4 text-xs">
                    Log a workout to see activity in your league
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export const ActivityCarousel = memo(ActivityCarouselComponent);

/**
 * MainActionCards Component
 * 
 * Renders the 4 main circular action buttons:
 * - Record (Start workout)
 * - Log (Manual workout entry)
 * - Board (Leaderboard)
 * - Leagues (League management)
 */
function MainActionCardsComponent({ onModalOpen }: MainActionCardsProps) {
  return (
    <div className="absolute bottom-8 left-0 right-0 z-[80] pointer-events-none">
      <div className="max-w-md mx-auto px-4">
        <div className="grid grid-cols-3 gap-3 w-fit pointer-events-auto mx-auto">
          {/* Single Row - Board, Leagues, Record, Log */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                console.log('🏆 Leaderboard button clicked!');
                onModalOpen('leaderboard');
              }}
              className="w-20 h-20 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center transition-all shadow-none relative overflow-hidden"
              data-tutorial="leaderboard-button"
            >
              <Trophy className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-xs text-[#eef0ed]">Board</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                console.log('👥 Leagues button clicked!');
                onModalOpen('leagues');
              }}
              className="w-20 h-20 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center transition-all shadow-none relative overflow-hidden"
              data-tutorial="leagues-button"
            >
              <Users className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-xs text-[#eef0ed]">Leagues</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => onModalOpen('log')}
              className="w-20 h-20 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center transition-all shadow-none relative overflow-hidden"
              data-tutorial="log-button"
            >
              <PenLine className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-xs text-[#eef0ed]">Log</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export const MainActionCards = memo(MainActionCardsComponent);

/**
 * NavigationSidebar Component
 * 
 * Renders the sidebar navigation with:
 * - Logo at top
 * - Profile
 * - Activity
 * - Settings
 * - Metrics
 * - Chat
 * - Training
 */
function NavigationSidebarComponent({ onModalOpen, hideButtons }: NavigationSidebarProps) {
  const navItems = [
    { id: 'profile', icon: UserCircle, label: 'Profile', dataTutorial: 'profile-button' },
    { id: 'activityFeed', icon: Activity, label: 'Activity', dataTutorial: 'activity-button' },
    { id: 'settings', icon: Settings, label: 'Settings', dataTutorial: 'settings-button' },
    { id: 'metrics', icon: TrendingUp, label: 'Metrics', dataTutorial: 'metrics-button' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', dataTutorial: 'chat-button' },
  ];

  return (
    <div 
      className={`absolute left-0 top-0 z-[70] pointer-events-none transition-all duration-500 ease-in-out ${
        hideButtons 
          ? 'opacity-0 -translate-x-8 pointer-events-none' 
          : 'opacity-100 translate-x-0'
      }`}
    >
      {/* Vertical Navigation Bar with Logo */}
      <div className="rounded-full px-3 py-4 pointer-events-auto">
        <div className="flex flex-col items-center gap-1">
          {/* Logo at the top */}
          <button 
            onClick={() => onModalOpen('about')}
            className="mb-2 px-2 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="SPREDfit" className="h-10 w-auto" />
          </button>
          
          {/* Navigation buttons */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'trainingPlans') {
                    console.log('🎯 Training button clicked!')
                  }
                  onModalOpen(item.id);
                }}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-full hover:bg-white/10 transition-all min-w-[50px]"
                data-tutorial={item.dataTutorial}
              >
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                <span className="text-[9px] text-white">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const NavigationSidebar = memo(NavigationSidebarComponent);