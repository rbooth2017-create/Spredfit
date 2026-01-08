import { memo } from "react";
import { Users, UserCircle } from "lucide-react";

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  sport: string;
  timestamp: string;
  type: string;
  [key: string]: any;
}

interface ActivityFeedModalProps {
  activities: Activity[];
  activityFilter: 'all' | 'you';
  setActivityFilter: (filter: 'all' | 'you') => void;
  onActivityClick: (activity: Activity) => void;
  currentUserId?: string; // ✅ Add this
}

function ActivityFeedModalComponent({
  activities,
  activityFilter,
  setActivityFilter,
  onActivityClick,
  currentUserId, // ✅ Add this
}: ActivityFeedModalProps) {
  return (
    <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center text-center w-full px-4">
        <p className="text-white text-sm mb-3">Recent Activity</p>
        
        <div className="space-y-2 w-full max-h-60 overflow-y-auto scrollbar-hide">
          {activities.length === 0 ? (
            <p className="text-white/50 text-xs italic">No activities yet. Log a workout to get started!</p>
          ) : (
            activities
              .filter(activity => activity.type === 'workout' && (activityFilter === 'all' || activity.userId === currentUserId))
              .slice(0, 100)
              .map((activity) => (
                  <button
                  key={activity.id}
                  onClick={() => onActivityClick(activity)}
                  className={`w-full p-2.5 rounded-3xl transition-all text-left cursor-pointer ${
                    activity.userId === currentUserId ? 'bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30' : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <p className="text-white text-xs pointer-events-none">
                    <span className="font-medium">{activity.userName}</span>
                    {activity.type === 'workout' && activity.title ? (
                      <> - <span className="italic">{activity.title}</span></>
                    ) : (
                      <> - {activity.sport}</>
                    )}
                    {activity.type === 'workout' && activity.duration && (
                      <span className="text-white/70"> • {activity.duration} min</span>
                    )}
                    <span className="text-white/60"> • {new Date(activity.date || activity.time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </p>
                </button>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const ActivityFeedModal = memo(ActivityFeedModalComponent);

// Export separate component for external buttons
interface ActivityFeedExternalButtonsProps {
  activityFilter: 'all' | 'you';
  setActivityFilter: (filter: 'all' | 'you') => void;
}

function ActivityFeedExternalButtonsComponent({ 
  activityFilter, 
  setActivityFilter 
}: ActivityFeedExternalButtonsProps) {
  return (
    <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => {
              console.log('🔄 All button clicked, current filter:', activityFilter);
              setActivityFilter('all');
            }}
            className={`w-20 h-20 rounded-full ${
              activityFilter === 'all'
                ? 'bg-white/20 backdrop-blur-sm border-2 border-white/40 hover:bg-white/30'
                : 'bg-[#2d2d2d] border border-white/20 hover:bg-[#2d2d2d]/90'
            } flex items-center justify-center transition-all shadow-lg`}
          >
            <Users className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <span className="text-white text-[10px] text-center">All</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => {
              console.log('🔄 You button clicked, current filter:', activityFilter);
              setActivityFilter('you');
            }}
            className={`w-20 h-20 rounded-full ${
              activityFilter === 'you'
                ? 'bg-white/20 backdrop-blur-sm border-2 border-white/40 hover:bg-white/30'
                : 'bg-[#2d2d2d] border border-white/20 hover:bg-[#2d2d2d]/90'
            } flex items-center justify-center transition-all shadow-lg`}
          >
            <UserCircle className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <span className="text-white text-[10px] text-center">You</span>
        </div>
      </div>
    </div>
  );
}

export const ActivityFeedExternalButtons = memo(ActivityFeedExternalButtonsComponent);