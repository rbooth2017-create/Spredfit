import { useState } from "react";
import { ArrowLeft, Meh, Smile, MessageCircle, Share2, Trophy, Zap, TrendingUp, Award, Flame } from "lucide-react";
import { HeadOnFireIcon } from "./HeadOnFireIcon";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { getSportIcon, getSportGradient } from "./sportIcons";
import { FloatingContent } from "./FloatingContent";
import { getUserDisplayName } from '../utils/auth';

interface ActivityFeedProps {
  onBack: () => void;
  onUserClick?: (userId: number, userName: string, userAvatar: string, userInitials: string) => void;
}

type ReactionType = "so-so" | "awesome" | "mind-blown" | null;

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userInitials: string;
  type: "workout" | "achievement" | "streak" | "plan_complete";
  timestamp: string;
  sport?: string;
  duration?: number;
  distance?: number;
  notes?: string;
  achievement?: string;
  reactions: {
    "so-so": number;
    "awesome": number;
    "mind-blown": number;
  };
  comments: Comment[];
  userReaction: ReactionType;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export function ActivityFeed({ onBack, onUserClick }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "friends" | "leagues">("all");
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  const handleReaction = (activityId: string, reaction: ReactionType) => {
    setActivities(activities.map(activity => {
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
  };

  const handleComment = (activityId: string) => {
    const text = commentText[activityId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: "current",
      userName: "You",
      userAvatar: "",
      text,
      timestamp: "Just now"
    };

    setActivities(activities.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          comments: [...activity.comments, newComment]
        };
      }
      return activity;
    }));

    setCommentText({ ...commentText, [activityId]: "" });
  };

  const toggleComments = (activityId: string) => {
    setShowComments({ ...showComments, [activityId]: !showComments[activityId] });
  };

  const getTotalReactions = (reactions: Activity["reactions"]) => {
    return reactions["so-so"] + reactions["awesome"] + reactions["mind-blown"];
  };

  const renderActivity = (activity: Activity) => {
    const SportIcon = activity.sport ? getSportIcon(activity.sport) : Trophy;

    return (
      <div key={activity.id} className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/5">
        {/* User Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            onClick={() => onUserClick && onUserClick(parseInt(activity.userId), activity.userName, activity.userAvatar, activity.userInitials)}
            className="cursor-pointer"
          >
            <Avatar className="w-10 h-10 border-2 border-[#7a8872]">
              <AvatarImage src={activity.userAvatar} />
              <AvatarFallback className="bg-[#2d332d] text-[#9ca895]">
                {activity.userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <p
              onClick={() => onUserClick && onUserClick(parseInt(activity.userId), activity.userName, activity.userAvatar, activity.userInitials)}
              className="text-[#2d332d] hover:text-[#2d332d]/70 transition-colors cursor-pointer text-sm"
            >
              {activity.userName}
            </p>
            <p className="text-xs text-[#2d332d]/60">{activity.timestamp}</p>
          </div>
        </div>

        {/* Activity Content */}
        {activity.type === "workout" && activity.sport && (
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#2d332d] flex items-center justify-center">
                <SportIcon className="w-5 h-5 text-[#9ca895]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#2d332d] text-sm">{activity.sport}</h3>
                <div className="flex gap-3 text-xs text-[#2d332d]/70">
                  <span>{activity.duration} min</span>
                  {activity.distance && <span>• {activity.distance} km</span>}
                </div>
              </div>
            </div>
            {activity.notes && (
              <p className="text-[#2d332d]/90 text-sm ml-13">{activity.notes}</p>
            )}
          </div>
        )}

        {(activity.type === "achievement" || activity.type === "streak" || activity.type === "plan_complete") && (
          <div className="mb-3 p-3 rounded-2xl bg-[#9ca895] border border-[#2d332d]/10">
            <div className="flex items-center gap-3">
              {activity.type === "streak" && <Flame className="w-7 h-7 text-[#2d332d]" />}
              {activity.type === "achievement" && <Trophy className="w-7 h-7 text-[#2d332d]" />}
              {activity.type === "plan_complete" && <Award className="w-7 h-7 text-[#2d332d]" />}
              <p className="text-[#2d332d] text-sm">{activity.achievement}</p>
            </div>
          </div>
        )}

        {/* Reactions Summary */}
        {getTotalReactions(activity.reactions) > 0 && (
          <div className="flex items-center gap-2 pt-2 pb-2 text-xs text-[#2d332d]/60">
            {activity.reactions["so-so"] > 0 && (
              <span className="flex items-center gap-1">
                <Meh className="w-3.5 h-3.5 text-[#2d332d]/60" />
                {activity.reactions["so-so"]}
              </span>
            )}
            {activity.reactions["awesome"] > 0 && (
              <span className="flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 fill-[#2d332d] text-[#2d332d]" />
                {activity.reactions["awesome"]}
              </span>
            )}
            {activity.reactions["mind-blown"] > 0 && (
              <span className="flex items-center gap-1">
                <HeadOnFireIcon className="w-3.5 h-3.5 text-[#2d332d]" />
                {activity.reactions["mind-blown"]}
              </span>
            )}
            <span>• {getTotalReactions(activity.reactions)} reaction{getTotalReactions(activity.reactions) !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#2d332d]/10">
          {/* Reactions */}
          <div className="flex items-center gap-1">
            <Button
              onClick={() => handleReaction(activity.id, "so-so")}
              variant="ghost"
              size="sm"
              className={`gap-1 h-8 rounded-full ${activity.userReaction === "so-so" ? 'text-[#2d332d] hover:text-[#2d332d]/80 bg-[#9ca895]' : 'text-[#2d332d]/60 hover:text-[#2d332d]'} hover:bg-[#9ca895]`}
              title="Yeah so so"
            >
              <Meh className={`w-4 h-4`} />
            </Button>
            <Button
              onClick={() => handleReaction(activity.id, "awesome")}
              variant="ghost"
              size="sm"
              className={`gap-1 h-8 rounded-full ${activity.userReaction === "awesome" ? 'text-[#2d332d] hover:text-[#2d332d]/80 bg-[#9ca895]' : 'text-[#2d332d]/60 hover:text-[#2d332d]'} hover:bg-[#9ca895]`}
              title="Awesome"
            >
              <Smile className={`w-4 h-4 ${activity.userReaction === "awesome" ? 'fill-[#2d332d]' : ''}`} />
            </Button>
            <Button
              onClick={() => handleReaction(activity.id, "mind-blown")}
              variant="ghost"
              size="sm"
              className={`gap-1 h-8 rounded-full ${activity.userReaction === "mind-blown" ? 'text-[#2d332d] hover:text-[#2d332d]/80 bg-[#9ca895]' : 'text-[#2d332d]/60 hover:text-[#2d332d]'} hover:bg-[#9ca895]`}
              title="Mind blown"
            >
              <HeadOnFireIcon className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => toggleComments(activity.id)}
            variant="ghost"
            size="sm"
            className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] gap-2 h-8 rounded-full"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{activity.comments.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] gap-2 ml-auto h-8 rounded-full"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments[activity.id] && (
          <div className="mt-4 pt-4 border-t border-[#2d332d]/10 space-y-3">
            {activity.comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="w-8 h-8 border border-[#7a8872] flex-shrink-0">
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback className="bg-[#7a8872] text-[#2d332d] text-xs">
                    {comment.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-[#9ca895] rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-[#2d332d]">{comment.userName}</p>
                    <span className="text-[10px] text-[#2d332d]/60">• {comment.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#2d332d]/90">{comment.text}</p>
                </div>
              </div>
            ))}

            {/* Add Comment */}
            <div className="flex gap-2 mt-3">
              <Textarea
                placeholder="Add a comment..."
                value={commentText[activity.id] || ""}
                onChange={(e) => setCommentText({ ...commentText, [activity.id]: e.target.value })}
                className="bg-[#9ca895] border-[#2d332d]/10 text-[#2d332d] text-sm min-h-[60px] rounded-2xl placeholder:text-[#2d332d]/40"
              />
              <Button
                onClick={() => handleComment(activity.id)}
                disabled={!commentText[activity.id]?.trim()}
                className="bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] self-end rounded-full h-9 px-4"
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div>
            <h1 className="text-xl text-[#2d332d]">Activity Feed</h1>
            <p className="text-[10px] text-[#2d332d]/70">See what your friends are up to</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#9ca895]/30 border-none rounded-full">
            <TabsTrigger value="all" className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895]">
              All Activity
            </TabsTrigger>
            <TabsTrigger value="friends" className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895]">
              Friends
            </TabsTrigger>
            <TabsTrigger value="leagues" className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895]">
              My Leagues
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Activity List */}
        <div className="space-y-4 pb-32 mb-6">
          {activities.map(activity => renderActivity(activity))}
        </div>

        {/* Load More */}
        <Button
          className="w-full h-14 bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] border border-[#2d332d]/10 rounded-full transition-all"
        >
          Load More Activities
        </Button>
      </div>
    </FloatingContent>
  );
}