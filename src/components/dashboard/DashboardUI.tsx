import { useAuth } from "../../utils/auth";
import { useState, memo, useRef } from "react";
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
  currentUser?: any; 
  membershipStatus?: any; 
  onReaction?: (workoutId: string, reactionType: string) => Promise<void>; 
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
 */
function DashboardHeaderComponent({ onModalOpen }: DashboardHeaderProps) {
  const { user } = useAuth();

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
    </div>
  );
}

export const DashboardHeader = memo(DashboardHeaderComponent);

/**
 * LeagueStatsDisplay Component
 * 
 * Displays the current league name and total workout time from all members
 */
interface LeagueStatsDisplayProps {
  currentLeague: any;
  totalLeagueTime: number; // in minutes
}

function LeagueStatsDisplayComponent({ 
  currentLeague, 
  totalLeagueTime 
}: LeagueStatsDisplayProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  console.log('LeagueStatsDisplay - currentLeague:', currentLeague, 'totalLeagueTime:', totalLeagueTime);

  if (!currentLeague) {
    console.log('❌ No currentLeague set');
    return null;
  }
  console.log('✅ Showing league stats for:', currentLeague.name);

  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center pt-10 pointer-events-none">
      <div className="bg-black/40 backdrop-blur-md rounded-full w-40 h-40 flex items-center justify-center border-2 border-white/20 shadow-lg">
       <div className="text-center">
  <p className="text-[#eef0ed]/70 text-xs mb-2">
    <span className="font-semibold">{currentLeague.name}</span>
  </p>
  <p className="text-[#eef0ed] text-2xl font-bold">
    <span className="text-blue-400">{formatTime(totalLeagueTime)}</span>
  </p>
</div>
      </div>
    </div>
  );
}

export const LeagueStatsDisplay = memo(LeagueStatsDisplayComponent);

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
  currentUser,
  membershipStatus,
  onReaction,
}: ActivityCarouselProps) {
  const [showAchievements, setShowAchievements] = useState(true);
  const [showOnlyMyExercises, setShowOnlyMyExercises] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const filteredActivities = activities.filter(activity => {
    // Filter achievements based on toggle
    if (!showAchievements && (activity.type === 'achievement' || activity.type === 'streak' || activity.type === 'pr')) {
      return false;
    }
    
    // Filter to only your exercises AND achievements
    if (showOnlyMyExercises) {
      if (activity.userId !== currentUser?.id) {
        return false;
      }
    }

    // Hide achievements/streaks/PRs when in stealth mode
    if (membershipStatus?.inStealthMode && (activity.type === "achievement" || activity.type === "streak" || activity.type === "pr") && activity.userId === currentUser?.id) {
      return false;
    }
  
    // Hide workouts created during stealth period (ONLY YOUR OWN)
    if (activity.type === 'workout' && membershipStatus?.stealthUntil && activity.userId === currentUser?.id) {
      const stealthEnd = new Date(membershipStatus.stealthUntil);
      const stealthStart = new Date(stealthEnd.getTime() - 3 * 24 * 60 * 60 * 1000);
      const workoutDate = new Date(activity.date || activity.time);
      
      if (workoutDate >= stealthStart && workoutDate <= stealthEnd) {
        return false;
      }
    }
    
    return true;
  });

  const displayedActivities = filteredActivities.slice(0, visibleCount);

  console.log(`📊 Displaying ${displayedActivities.length} of ${filteredActivities.length} total activities`);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollLeft = element.scrollLeft;
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;
    
    // Load more when within 500px of the end
    if (scrollLeft + clientWidth >= scrollWidth - 500) {
      if (visibleCount < filteredActivities.length) {
        console.log(`🔄 Loading more... Current: ${visibleCount}, Total available: ${filteredActivities.length}`);
        setVisibleCount(prev => Math.min(prev + 30, filteredActivities.length));
      }
    }
  };
  
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      
      {/* Carousel Container - Centered */}
      <div 
        className="relative overflow-hidden rounded-full border-2 border-white/40"
        style={{
          width: '380px',
          height: '380px'
        }}
        data-tutorial="activity-carousel"
      >
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
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
            {displayedActivities.map((activity) => {
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
              } else if (activity.type === 'pr') {
                activityLabel = 'Personal Record';
                Icon = Zap;
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
                  style={{ width: '380px', minWidth: '380px' }}
                  onClick={() => {
                    console.log('🔍 Activity clicked:', activity);
                    onActivityClick(activity);
                  }}
                >
                  {/* Background Image at 10% opacity */}
                  {activity.type === 'workout' && (
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${activity.photo || `/workout/workout-${(activity.sport || '').toLowerCase().replace(/\s+/g, '-')}.png`})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.5
                      }}
                    />
                  )}
                  
                  {/* Content */}
                  <div className="relative z-10 px-6">
                    {/* 1. Sport Icon */}
                    <div className="mb-3">
                      <Icon className={`w-12 h-12 mx-auto ${
                        activity.type === 'streak' ? 'text-orange-400' : 
                        activity.type === 'achievement' ? 'text-yellow-400' : 
                        activity.type === 'pr' ? 'text-purple-400' :
                        'text-[#eef0ed]'
                      }`} strokeWidth={1.5} />
                    </div>
                    
                    {/* 2. Username and Title */}
                    <div className="mb-2">
                      <p className="text-[#eef0ed] font-semibold text-xl">{activity.userName}</p>
                      {activity.type === 'workout' && activity.title && (
                        <h2 className="text-[#eef0ed] font-semibold text-xl">{activity.title}</h2>
                      )}
                      {activity.type === 'workout' && !activity.title && (
                        <h2 className="text-[#eef0ed] font-semibold text-xl">{activity.sport}</h2>
                      )}
                      {activity.type !== 'workout' && (
                        <h2 className="text-[#eef0ed] font-semibold text-xl">{activityLabel}</h2>
                      )}
                    </div>
                    
                    {/* 2.5. Date */}
                    <p className="text-[#eef0ed]/60 mb-2 text-xs">
                      {new Date(activity.date || activity.time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    
                    {/* 3. Streak Display */}
                    {activity.type === 'streak' && (
                      <div className="mb-4">
                        <p className="text-orange-400 font-bold text-3xl mb-1">
                          {activity.streak} Day{activity.streak !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[#eef0ed]/80 text-sm">
                          On Fire! 🔥
                        </p>
                      </div>
                    )}
                    
                    {/* 3. Achievement Display */}
                    {activity.type === 'achievement' && (
                      <div className="mb-4">
                        <p className="text-yellow-400 font-bold text-2xl mb-1">
                          {activity.achievement}
                        </p>
                        <p className="text-[#eef0ed]/80 text-sm">
                          Milestone Unlocked! 🏆
                        </p>
                      </div>
                    )}
                    
                    {/* 3. PR Display */}
                    {activity.type === 'pr' && (
                      <div className="mb-4">
                        <p className="text-purple-400 font-bold text-2xl mb-1">
                          {activity.prType === 'distance' 
                            ? `${activity.prValue.toFixed(1)} km` 
                            : `${Math.round(activity.prValue)} min`
                          }
                        </p>
                        <p className="text-[#eef0ed]/80 text-sm mb-1">
                          Longest {activity.sport}!
                        </p>
                        <p className="text-purple-400 text-xs">
                          ⚡ New Record!
                        </p>
                      </div>
                    )}
                    
                    {/* 3. Distance and Time (for workouts only) */}
                    {activity.type === 'workout' && (
                      <p className="text-[#eef0ed]/90 mb-2 font-medium text-base">
                        {activity.distance && activity.distance > 0 
                          ? `${activity.distance} km • ${activity.duration} min`
                          : `${activity.duration} min`
                        }
                      </p>
                    )}
                    
                    {/* 4. Primary League Info (only for workouts) */}
                    {activity.type === 'workout' && activity.primaryLeague ? (
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
                    ) : activity.type === 'workout' ? (
                      <p className="text-[#eef0ed]/70 mb-4 text-sm">
                        {currentLeague?.name || 'No active league'}
                      </p>
                    ) : null}
                    
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
                        
      {/* Heart Reaction Button - Only for workouts */}
{activity.type === 'workout' && onReaction && (
  <button
    onClick={async (e) => {
      e.stopPropagation();
      try {
        await onReaction(activity.id, '❤️');
      } catch (error) {
        console.error('Failed to add reaction:', error);
      }
    }}
    className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center hover:bg-white/20 transition-all"
  >
    <Heart 
      className={`w-6 h-6 transition-all ${
        activity.reactions?.['❤️']?.userReacted 
          ? 'text-pink-500' 
          : 'text-white'
      }`}
      fill={activity.reactions?.['❤️']?.userReacted ? '#ec4899' : 'none'}
      strokeWidth={2}
    />
    {activity.reactions?.['❤️']?.count > 0 && (
      <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
        {activity.reactions['❤️'].count}
      </div>
    )}
  </button>
)}
    </div>
  );
})}
                                    
 
            
            {/* Show message if no activities */}
            {filteredActivities.length === 0 && (
              <div 
                className="flex-shrink-0 h-full flex flex-col items-center justify-center text-center snap-center"
                style={{ width: '380px', minWidth: '380px' }}
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

      {/* Filter Buttons - Left and Right Sides */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowAchievements(!showAchievements);
        }}
        className={`absolute z-[999] px-3 py-1.5 rounded-full text-xs font-medium transition-all border pointer-events-auto ${
          showAchievements
            ? 'bg-white/20 border-white/40 text-white'
            : 'bg-white/5 border-white/20 text-white/50'
        }`}
        style={{ left: '20px', top: 'calc(50% + 160px)' }}
      >
        {showAchievements ? '✓' : '○'} Achievements
      </button>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowOnlyMyExercises(!showOnlyMyExercises);
        }}
        className={`absolute z-[999] px-3 py-1.5 rounded-full text-xs font-medium transition-all border pointer-events-auto ${
          showOnlyMyExercises
            ? 'bg-white/20 border-white/40 text-white'
            : 'bg-white/5 border-white/20 text-white/50'
        }`}
        style={{ right: '20px', top: 'calc(50% + 160px)' }}
      >
        {showOnlyMyExercises ? '✓' : '○'} Just Me
      </button>
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
 * - Share
 */
function NavigationSidebarComponent({ onModalOpen, hideButtons }: NavigationSidebarProps) {
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

  const navItems = [
    { id: 'profile', icon: UserCircle, label: 'Profile', dataTutorial: 'profile-button' },
    { id: 'activityFeed', icon: Activity, label: 'Activity', dataTutorial: 'activity-button' },
    { id: 'settings', icon: Settings, label: 'Settings', dataTutorial: 'settings-button' },
    { id: 'metrics', icon: TrendingUp, label: 'Metrics', dataTutorial: 'metrics-button' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', dataTutorial: 'chat-button' },
    { id: 'share', icon: Share2, label: 'Share', dataTutorial: 'share-button', action: handleShareApp },
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
                  if (item.action) {
                    item.action();
                  } else {
                    if (item.id === 'trainingPlans') {
                      console.log('🎯 Training button clicked!')
                    }
                    onModalOpen(item.id);
                  }
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