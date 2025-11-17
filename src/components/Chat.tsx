import { useState } from "react";
import { ArrowLeft, Search, MessageCircle, Users, Send, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FloatingContent } from "./FloatingContent";

interface ChatProps {
  onBack: () => void;
  onOpenConversation: (conversationId: string, isGroup: boolean, name: string, avatar: string, members?: number) => void;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  members?: number;
  isOnline?: boolean;
}

// Empty conversations - will be populated from backend
const mockConversations: Conversation[] = [];

export function Chat({ onBack, onOpenConversation }: ChatProps) {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "direct" | "groups">("all");

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "direct" && !conv.isGroup) ||
                      (activeTab === "groups" && conv.isGroup);
    return matchesSearch && matchesTab;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#2d332d] mb-0.5">Messages</p>
              <h1 className="text-xl text-[#2d332d]">Chats</h1>
            </div>
            {totalUnread > 0 && (
              <div className="flex items-center gap-2">
                <Badge className="bg-[#2d332d] text-[#9ca895]">
                  {totalUnread} new
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2d332d]/40" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#9ca895]/50 border-[#2d332d]/10 text-[#2d332d] placeholder:text-[#2d332d]/40 h-11 rounded-full"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 bg-[#9ca895]/30 border-none rounded-full h-11">
            <TabsTrigger 
              value="all" 
              className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895] data-[state=active]:shadow-none"
            >
              All ({conversations.length})
            </TabsTrigger>
            <TabsTrigger 
              value="direct" 
              className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895] data-[state=active]:shadow-none"
            >
              Direct ({conversations.filter(c => !c.isGroup).length})
            </TabsTrigger>
            <TabsTrigger 
              value="groups" 
              className="text-[#2d332d]/70 rounded-full data-[state=active]:bg-[#2d332d] data-[state=active]:text-[#9ca895] data-[state=active]:shadow-none"
            >
              Groups ({conversations.filter(c => c.isGroup).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Conversations List */}
        <div className="space-y-3 pb-32 mb-6">
          {filteredConversations.length === 0 ? (
            <Card className="bg-[#eef0ed] border-[#2d332d]/10 p-8 rounded-3xl">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-[#2d332d]/30" />
                <p className="text-[#2d332d]/70 mb-2">No messages found</p>
                <p className="text-sm text-[#2d332d]/50">
                  {searchQuery ? "Try a different search" : "Start a conversation with your league members"}
                </p>
              </div>
            </Card>
          ) : (
            filteredConversations.map((conv) => (
              <Card
                key={conv.id}
                onClick={() => onOpenConversation(conv.id, conv.isGroup, conv.name, conv.avatar, conv.members)}
                className="bg-[#eef0ed] border-[#2d332d]/10 p-4 hover:bg-[#9ca895]/30 transition-colors cursor-pointer rounded-3xl"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-[#2d332d]/10">
                      <AvatarImage src={conv.avatar} />
                      <AvatarFallback className={conv.isGroup 
                        ? "bg-[#7a8872]"
                        : "bg-[#8a9881]"
                      }>
                        {conv.isGroup ? (
                          <Users className="w-6 h-6 text-[#eef0ed]" />
                        ) : (
                          <span className="text-[#eef0ed]">{conv.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {!conv.isGroup && conv.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#7a8872] rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#2d332d] truncate">{conv.name}</h3>
                      {conv.isGroup && (
                        <Badge className="bg-[#7a8872]/30 text-[#2d332d] border-[#2d332d]/10 text-xs">
                          {conv.members} members
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#2d332d]/60 truncate">{conv.lastMessage}</p>
                  </div>

                  {/* Timestamp & Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-[#2d332d]/50">{conv.timestamp}</span>
                    {conv.unreadCount > 0 && (
                      <div className="w-6 h-6 rounded-full bg-[#2d332d] flex items-center justify-center">
                        <span className="text-xs text-[#9ca895]">{conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </FloatingContent>
  );
}