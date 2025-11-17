import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Smile, Paperclip, MoreVertical, Phone, Video, Image as ImageIcon, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FloatingContent } from "./FloatingContent";

interface ChatConversationProps {
  onBack: () => void;
  conversationId: string;
  isGroup: boolean;
  name: string;
  avatar: string;
  members?: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
  type?: "text" | "workout" | "image";
  workoutData?: {
    sport: string;
    duration: number;
    distance?: number;
  };
}

// Empty messages - will be populated from backend
const mockMessages: Message[] = [];

// Empty group messages - will be populated from backend
const mockGroupMessages: Message[] = [];

export function ChatConversation({ onBack, conversationId, isGroup, name, avatar, members }: ChatConversationProps) {
  const [messages, setMessages] = useState<Message[]>(isGroup ? mockGroupMessages : mockMessages);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: "current",
      senderName: "You",
      senderAvatar: "",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const showAvatar = !message.isCurrentUser && (index === 0 || messages[index - 1].senderId !== message.senderId);
    const showName = isGroup && !message.isCurrentUser && showAvatar;

    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${message.isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar (only for other users, and only when sender changes) */}
        {!message.isCurrentUser && (
          <div className="flex-shrink-0">
            {showAvatar ? (
              <Avatar className="w-8 h-8 border border-[#2d332d]/10">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback className="bg-[#9ca895] text-[#2d332d] text-xs">
                  {message.senderName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${message.isCurrentUser ? "items-end" : "items-start"} max-w-[70%]`}>
          {showName && (
            <p className="text-xs text-[#2d332d]/60 mb-1 ml-3">{message.senderName}</p>
          )}
          
          {message.type === "workout" && message.workoutData ? (
            <Card className={`p-3 ${
              message.isCurrentUser
                ? "bg-[#2d332d] border-[#2d332d]"
                : "bg-[#9ca895] border-[#2d332d]/10"
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${
                  message.isCurrentUser ? "bg-white/20" : "bg-[#2d332d]/20"
                } flex items-center justify-center`}>
                  <span className="text-xl">🏃</span>
                </div>
                <div>
                  <p className={`${message.isCurrentUser ? "text-[#9ca895]" : "text-[#2d332d]"}`}>
                    {message.workoutData.sport}
                  </p>
                  <p className={`text-xs ${message.isCurrentUser ? "text-[#9ca895]/80" : "text-[#2d332d]/60"}`}>
                    {message.workoutData.duration} min
                    {message.workoutData.distance && ` • ${message.workoutData.distance} km`}
                  </p>
                </div>
              </div>
              {message.text && (
                <p className={`text-sm ${message.isCurrentUser ? "text-[#9ca895]" : "text-[#2d332d]"}`}>
                  {message.text}
                </p>
              )}
            </Card>
          ) : (
            <div
              className={`rounded-2xl px-4 py-2.5 ${
                message.isCurrentUser
                  ? "bg-[#2d332d] text-[#9ca895]"
                  : "bg-[#9ca895] text-[#2d332d]"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}
          
          <p className={`text-xs text-[#2d332d]/40 mt-1 ${message.isCurrentUser ? "mr-3" : "ml-3"}`}>
            {message.timestamp}
          </p>
        </div>
      </div>
    );
  };

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2d332d]/10 bg-[#eef0ed] rounded-t-[32px]">
          <div className="flex items-center gap-4">
            {/* Avatar & Info */}
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-12 h-12 border-2 border-[#2d332d]/10">
                <AvatarImage src={avatar} />
                <AvatarFallback className={isGroup 
                  ? "bg-[#7a8872]"
                  : "bg-[#9ca895]"
                }>
                  {isGroup ? (
                    <Users className="w-6 h-6 text-[#eef0ed]" />
                  ) : (
                    name.slice(0, 2).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-[#2d332d]">{name}</h2>
                <p className="text-xs text-[#2d332d]/60">
                  {isGroup ? `${members} members` : "Active now"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isGroup && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] h-8 w-8"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] h-8 w-8"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] h-8 w-8"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-[#2d332d]/10 bg-[#eef0ed] rounded-b-[32px]">
          <div className="flex items-end gap-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] h-10 w-10"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] h-10 w-10"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-[#9ca895] border-[#2d332d]/10 text-[#2d332d] placeholder:text-[#2d332d]/40 pr-12 min-h-[44px] rounded-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#eef0ed] h-8 w-8"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] h-11 w-11 p-0 rounded-full disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </FloatingContent>
  );
}