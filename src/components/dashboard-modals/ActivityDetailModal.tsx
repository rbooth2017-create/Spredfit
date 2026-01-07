import { memo, useState, useEffect, useRef } from "react";
import { Trophy, MessageCircle, ArrowLeft, PenLine, Trash2, X, Camera } from "lucide-react";
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
  accessToken?: string | null;
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
  accessToken,
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
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(activity.photo);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Load comments and reactions from database
  useEffect(() => {
    if (activity.id && activity.type === 'workout' && api) {
      loadCommentsAndReactions();
    }
  }, [activity.id]);

  const loadCommentsAndReactions = async () => {
    if (!api) return;
    
    setIsLoadingComments(true);
    try {
      const fetchedComments = await api.getWorkoutComments(activity.id);
      setComments(fetchedComments.map(c => ({
        id: c.id,
        userName: c.userName,
        text: c.text,
        userAvatar: c.userAvatar,
        timestamp: c.timestamp
      })));

      const fetchedReactions = await api.getWorkoutReactions(activity.id);
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

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
  
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
  
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Image must be less than 50MB');
      return;
    }
  
    setIsUploadingPhoto(true);
    
    try {
      if (!api) {
        toast.error('API not available');
        return;
      }
  
      // Delete old photo before uploading new one
      if (currentPhoto && currentPhoto.includes('/workout-media/')) {
        console.log('🔵 Deleting old photo:', currentPhoto);
        await api.deleteWorkoutPhoto(currentPhoto);
      }
  
      const photoUrl = await api.uploadWorkoutPhoto(file);
      console.log('✅ New photo uploaded:', photoUrl);
      setCurrentPhoto(photoUrl);
      toast.success('Photo updated!');
    } catch (error) {
      console.error('❌ Failed to upload photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      // Reset file inputs
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = () => {
    if (confirm('Remove this photo?')) {
      setCurrentPhoto(null);
      toast.success('Photo removed');
    }
  };

 const handleSaveChanges = async () => {
  if (!api) return;

  try {
    console.log('💾 Saving changes...');
    console.log('📸 currentPhoto state:', currentPhoto);
    console.log('🎯 Activity ID:', activity.id);
    
    // Get the old photo URL before updating
    const oldPhotoUrl = activity.photo;
    
    const updateResult = await api.updateWorkout(activity.id, {
      type: activity.sport!,
      title: activity.title || null,
      duration: activity.duration || 0,
      distance: activity.distance || 0,
      date: activity.timestamp,
      notes: activity.notes,
      photo_url: currentPhoto,
    });

    console.log('✅ Update result:', { id: updateResult?.id, saved_photo_url: updateResult?.photo_url });

    // Delete old photo AFTER successful database update
    if (oldPhotoUrl && oldPhotoUrl !== currentPhoto && oldPhotoUrl.includes('/workout-media/')) {
      console.log('🗑️  Deleting old photo after successful save:', oldPhotoUrl);
      try {
        await api.deleteWorkoutPhoto(oldPhotoUrl);
        console.log('✅ Old photo deleted from bucket');
      } catch (error) {
        console.error('⚠️  Failed to delete old photo, but changes were saved:', error);
      }
    }

    // Close photo editor modal
    setShowPhotoEditor(false);
    
    // Close activity detail modal and return to dashboard
    onBack();
    
    toast.success('Photo saved!');
  } catch (error) {
    console.error('❌ Failed to save changes:', error);
    toast.error('Failed to save changes');
  }
};
  const handleDeleteActivity = () => {
    if (confirm('Delete this workout? This will also delete any associated photos.')) {
      onDelete?.(activity.id);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!api) {
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
        toast.success('Comment added locally');
        onComment(activity.id);
        return;
      }

      const addedComment = await api.addWorkoutComment(activity.id, newComment.trim());
      
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

    const emojiMap: Record<string, string> = {
      "so-so": "😐",
      "awesome": "😊",
      "mind-blown": "🔥"
    };

    try {
      await api.addWorkoutReaction(activity.id, emojiMap[reactionType]);
      
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

      {/* Hidden photo inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handlePhotoUpload(e)}
        className="hidden"
        style={{ display: 'none' }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handlePhotoUpload(e)}
        className="hidden"
        style={{ display: 'none' }}
      />

      {/* Modal Content */}
      <div 
        className="w-96 h-96 rounded-full bg-transparent backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-2xl overflow-hidden relative"
      >
        {/* Background image at 5% opacity */}
        {activity.type === 'workout' && currentPhoto && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${currentPhoto}?t=${Date.now()})`,
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
              <p className="text-white text-xs truncate">
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
                {activity.title && (
                  <p className="text-white text-lg font-semibold mb-1">{activity.title}</p>
                )}
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

         {/* Photo Editor Popup */}
    {showPhotoEditor && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPhotoEditor(false)}>
        <div className="flex flex-col items-center gap-4">
          {/* Circular Modal */}
          <div 
            className="w-96 h-96 rounded-full bg-transparent backdrop-blur-md border-2 border-white/40 flex flex-col items-center justify-between shadow-2xl overflow-hidden relative p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full flex-shrink-0 z-10">
              <h3 className="text-white text-lg font-semibold">Edit Photo</h3>
              <button 
                onClick={() => setShowPhotoEditor(false)} 
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
    
            {/* Photo Preview - Full Circle Fill */}
            <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
              {currentPhoto ? (
                <img 
                  src={`${currentPhoto}?t=${Date.now()}`}
                  alt="Workout" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white/40 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No photo yet</p>
                </div>
              )}
            </div>
          </div>
    
          {/* Buttons Below Circle */}
          <div className="flex flex-col gap-2 w-80">
                        {/* Upload Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                disabled={isUploadingPhoto}
                className="flex-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-sm disabled:opacity-50"
              >
                {isUploadingPhoto ? 'Uploading...' : 'Camera'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  galleryInputRef.current?.click();
                }}
                disabled={isUploadingPhoto}
                className="flex-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-sm disabled:opacity-50"
              >
                Gallery
              </button>
            </div>
    
            {/* Delete Photo Button */}
            {currentPhoto && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto();
                }}
                className="w-full px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-white transition-colors text-sm"
              >
                Remove Photo
              </button>
            )}
          {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhotoEditor(false);
                }}
                className="flex-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveChanges();
                }}
                className="flex-1 px-4 py-2 rounded-full bg-[#A35139] hover:bg-[#8d3f2d] text-white transition-colors text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Comment Popup */}
      {showCommentPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCommentPopup(false)}>
          <div 
            className="w-96 h-96 rounded-full bg-transparent backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col w-full h-full p-10 max-w-[280px]">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-white text-lg font-semibold">Add Comment</h3>
                <button 
                  onClick={() => setShowCommentPopup(false)} 
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Textarea
                placeholder="Write your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none mb-4 focus:ring-2 focus:ring-white/30"
                disabled={isSubmitting}
              />

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

      {/* External Buttons */}
      <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setShowCommentPopup(true)}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] hover:bg-[#2d2d2d]/90 flex items-center justify-center shadow-lg transition-all border border-white/20"
            >
              <MessageCircle className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-[10px] text-center">Comment</span>
          </div>
      
          {/* Edit/Delete buttons - only for user's own workouts */}
          {activity.userId === currentUserId && activity.type === 'workout' && onEdit && onDelete && (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setShowPhotoEditor(true)}
                  className="w-20 h-20 rounded-full bg-[#2d2d2d] hover:bg-[#2d2d2d]/90 flex items-center justify-center shadow-lg transition-all border border-white/20"
                >
                  <Camera className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center">Photo</span>
              </div>
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
                  onClick={handleDeleteActivity}
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

export const ActivityDetailModal = memo(ActivityDetailModalComponent);