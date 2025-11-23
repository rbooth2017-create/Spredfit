import { memo, useState, useEffect } from "react";
import { Trophy, Meh, Smile, MessageCircle, ArrowLeft, PenLine, Trash2, Send, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { HeadOnFireIcon } from "../HeadOnFireIcon";
import type { APIClient } from "../../utils/api";

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userInitials: string;
  timestamp: string;
  type: string;
  sport?: string;
  duration?: number;
  distance?: number;
  notes?: string;
  achievement?: string;
  photo?: string;
  userReaction?: string;
  comments: Array<{
    id: string;
    userName: string;
    text: string;
    userAvatar?: string;
    timestamp?: string;
  }>;
  [key: string]: any;
}

interface ActivityDetailModalProps {
  activity: Activity;
  commentText: string;
  setCommentText: (text: string) => void;
  onReaction: (activityId: string, reaction: string) => void;
  onComment: (activityId: string) => void;
  onBack: () => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  currentUserId?: string;
  api?: APIClient | null;
}

function ActivityDetailModalComponent({
  activity,
  commentText,
  setCommentText,
  onReaction,
  onComment,
  onBack,
  onEdit,
  onDelete,
  currentUserId,
  api,
}: ActivityDetailModalProps) {
  const [comments, setComments] = useState(activity.comments || []);
  const [reactions, setReactions] = useState(activity.reactions || {
    "so-so": 0,
    "awesome": 0,
    "mind-blown": 0
  });
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Load comments and reactions from database
useEffect(() => {
  if (activity.id && activity.type === 'workout' && api) {
    loadCommentsAndReactions();
  }
}, [activity.id]); // Remove api from dependencies

  const loadCommentsAndReactions = async () => {
    if (!api) return;
    
    setIsLoadingComments(true);
    try {
      // Load comments
      const fetchedComments = await api.getWorkoutComments(activity.id);
      setComments(fetchedComments.map(c => ({
        id: c.id,
        userName: c.userName,
        text: c.text,
        userAvatar: c.userAvatar,
        timestamp: c.timestamp
      })));

      // Load reactions - map to your existing format
      const fetchedReactions = await api.getWorkoutReactions(activity.id);
      // Convert from emoji format to your so-so/awesome/mind-blown format
      const mappedReactions = {
        "so-so": fetchedReactions['😐']?.count || 0,
        "awesome": fetchedReactions['😊']?.count || 0,
        "mind-blown": fetchedReactions['🔥']?.count || 0
      };
      setReactions(mappedReactions);
    } catch (error) {
      console.error('Failed to load comments/reactions:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    console.log('🔵 handleAddComment called', { 
      api: !!api, 
      activityId: activity.id, 
      comment: newComment.trim() 
    });

    setIsSubmitting(true);
    try {
      if (!api) {
        console.warn('⚠️ No API available, using fallback');
        // Fallback if API not available - add locally and call parent callback
        const localComment = {
          id: Date.now().toString(),
          userName: 'You',
          text: newComment.trim(),
          userAvatar: '',
          timestamp: new Date().toLocaleTimeString()
        };
        setComments([...comments, localComment]);
        setNewComment('');
        setShowCommentPopup(false);
        toast.success('Comment added locally (not saved to database)');
        onComment(activity.id);
        return;
      }

      // Add to Supabase via API
      console.log('📤 Calling api.addWorkoutComment...');
      const addedComment = await api.addWorkoutComment(activity.id, newComment.trim());
      console.log('✅ Comment added to Supabase:', addedComment);
      
      setComments([...comments, {
        id: addedComment.id,
        userName: addedComment.userName,
        text: addedComment.text,
        userAvatar: addedComment.userAvatar,
        timestamp: addedComment.timestamp
      }]);
      setNewComment('');
      setShowCommentPopup(false);
      toast.success('Comment added!');
      onComment(activity.id);
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      toast.error(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!api) {
      onReaction(activity.id, reactionType);
      return;
    }

    // Map your reaction types to emoji format
    const emojiMap: Record<string, string> = {
      "so-so": "😐",
      "awesome": "😊",
      "mind-blown": "🔥"
    };

    try {
      await api.addWorkoutReaction(activity.id, emojiMap[reactionType]);
      
      // Reload reactions to get updated counts
      const fetchedReactions = await api.getWorkoutReactions(activity.id);
      const mappedReactions = {
        "so-so": fetchedReactions['😐']?.count || 0,
        "awesome": fetchedReactions['😊']?.count || 0,
        "mind-blown": fetchedReactions['🔥']?.count || 0
      };
      setReactions(mappedReactions);
      
      onReaction(activity.id, reactionType);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  return (
    <>
      <style>{`
        .activity-detail-scrollable::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      {/* Modal Content */}
      <div 
        className="w-96 h-96 rounded-full bg-transparent backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-2xl overflow-hidden relative"
      >
        {/* Background image at 5% opacity */}
        {activity.type === 'workout' && activity.photo && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${activity.photo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.15
            }}
          />
        )}
        
        <div className="flex flex-col w-full h-full p-10 max-w-[280px] relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Avatar className="w-9 h-9 border-2 border-white/40">
              <AvatarImage src={activity.userAvatar} />
              <AvatarFallback className="bg-[#2d332d]/80 text-white text-xs">
                {activity.userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p 
                className="text-white text-xs truncate cursor-pointer hover:text-white/80 transition-colors"
                onClick={() => {
                  console.log('🔍 Activity Detail Modal - User clicked');
                  console.log('Activity:', activity);
                }}
              >
                {activity.userName}
              </p>
              <p className="text-white/60 text-[9px]">{activity.timestamp}</p>
            </div>
          </div>

          {/* Activity Content - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0 activity-detail-scrollable"
          >
            {/* Workout Info */}
            {activity.type === 'workout' && activity.sport && (
              <div className="space-y-1">
                <p className="text-white text-base">{activity.sport}</p>
                <p className="text-white/70 text-sm">
                  {activity.duration} min
                  {activity.distance && ` • ${activity.distance} km`}
                </p>
                {activity.notes && (
                  <p className="text-white/80 text-xs mt-2">{activity.notes}</p>
                )}
              </div>
            )}

            {/* Achievement Info */}
            {activity.type === 'achievement' && (
              <div className="bg-white/20 rounded-2xl p-3 border border-white/30">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-white flex-shrink-0" />
                  <p className="text-white text-xs">{activity.achievement}</p>
                </div>
              </div>
            )}
          </div>

          {/* Comments Display Box */}
          <div className="flex-shrink-0 mb-2">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 h-24 overflow-y-auto">
              {isLoadingComments ? (
                <div className="text-white/60 text-[10px] text-center py-2">Loading comments...</div>
              ) : comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {comment.userAvatar && (
                          <Avatar className="w-3 h-3">
                            <AvatarImage src={comment.userAvatar} />
                            <AvatarFallback className="bg-white/20 text-white text-[6px]">
                              {comment.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <p className="text-white/80 text-[10px] font-medium">{comment.userName}</p>
                        {comment.timestamp && (
                          <p className="text-white/40 text-[8px] ml-auto">{comment.timestamp}</p>
                        )}
                      </div>
                      <p className="text-white/70 text-[9px] ml-4">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/40 text-[10px] text-center py-6">No comments yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Popup - Circle Style */}
      {showCommentPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCommentPopup(false)}>
          <div 
            className="w-96 h-96 rounded-full bg-transparent backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col w-full h-full p-10 max-w-[280px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-white text-lg font-semibold">Add Comment</h3>
                <button 
                  onClick={() => setShowCommentPopup(false)} 
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Textarea */}
              <Textarea
                placeholder="Write your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none mb-4 focus:ring-2 focus:ring-white/30"
                disabled={isSubmitting}
              />

              {/* Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowCommentPopup(false);
                    setNewComment('');
                  }}
                  className="flex-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex-1 px-4 py-2 rounded-full bg-[#A35139] hover:bg-[#8d3f2d] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors text-sm"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* External Buttons - Bottom Right */}
      <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-3">
          {/* Add Comment button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setShowCommentPopup(true)}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] hover:bg-[#2d2d2d]/90 flex items-center justify-center shadow-lg transition-all border border-white/20"
            >
              <MessageCircle className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-[10px] text-center">Add Comment</span>
          </div>
      
          {/* Edit/Delete buttons - only for user's own workouts */}
          {activity.userId === currentUserId && activity.type === 'workout' && onEdit && onDelete && (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => onEdit(activity)}
                  className="w-20 h-20 rounded-full bg-[#2d2d2d] hover:bg-[#2d2d2d]/90 flex items-center justify-center shadow-lg transition-all border border-white/20"
                >
                  <PenLine className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center">Edit</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => {
                    if (confirm('Delete this workout?')) {
                      onDelete(activity.id);
                    }
                  }}
                  className="w-20 h-20 rounded-full bg-[#2d2d2d] hover:bg-[#2d2d2d]/90 flex items-center justify-center shadow-lg transition-all border border-white/20"
                >
                  <Trash2 className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center">Delete</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const ActivityDetailModal = memo(ActivityDetailModalComponent);