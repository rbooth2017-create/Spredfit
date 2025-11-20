import { memo } from "react";
import { Calendar } from "lucide-react";

interface Activity {
  id: string;
  sport: string;
  duration?: number;
  distance?: number;
  date: string;
  notes?: string;
  photo?: string;
}

interface TodaysActivityModalProps {
  activity: Activity | null;
}

/**
 * TodaysActivityModal Component
 * 
 * Displays today's planned workout activity with background image
 */
function TodaysActivityModalComponent({ activity }: TodaysActivityModalProps) {
  if (!activity) {
    return (
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
        <div className="flex flex-col items-center text-center w-full px-6">
          <div className="mb-4">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
          </div>
          
          <h2 className="text-white text-xl mb-4">No Activities Planned</h2>
          
          <p className="text-white/70 text-sm leading-relaxed">
            Use the automatic generator or manually create to view here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 h-96 rounded-full border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden relative">
      {/* Background Image at 20% opacity */}
      {activity.photo && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${activity.photo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2
          }}
        />
      )}
      
      {/* Content overlay */}
      <div className="flex flex-col items-center text-center w-full px-6 relative z-10">
        <h2 className="text-white text-xl mb-2">{activity.sport}</h2>
        
        {activity.duration && (
          <p className="text-white/90 text-lg mb-1">{activity.duration} min</p>
        )}
        
        {activity.distance && (
          <p className="text-white/90 text-lg mb-4">{activity.distance} km</p>
        )}
        
        {activity.notes && (
          <p className="text-white/70 text-sm leading-relaxed max-w-[250px]">
            {activity.notes}
          </p>
        )}
      </div>
    </div>
  );
}

export const TodaysActivityModal = memo(TodaysActivityModalComponent);