import { memo } from "react";
import { MessageCircle, ChevronLeft, Send, Trophy, Users } from "lucide-react";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface ChatModalProps {
  chatFilter: 'leagues' | 'teams';
  setChatFilter: (filter: 'leagues' | 'teams') => void;
  leagueChats: Chat[];
  teamChats: Chat[];
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  chatMessages: Record<string, ChatMessage[]>;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => Promise<void>;
}

function ChatModalComponent({
  chatFilter,
  setChatFilter,
  leagueChats,
  teamChats,
  selectedChat,
  setSelectedChat,
  chatMessages,
  messageText,
  setMessageText,
  onSendMessage,
}: ChatModalProps) {
  const getCurrentChatName = () => {
    if (!selectedChat) return '';
    const allChats = [...leagueChats, ...teamChats];
    return allChats.find(chat => chat.id === selectedChat)?.name || '';
  };

  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
        <div className="flex flex-col w-full h-full p-6">
          {/* Show chat list if no chat is selected */}
          {!selectedChat && (
            <>
              <p className="text-white text-sm mb-4 text-center flex-shrink-0">
                {chatFilter === 'leagues' ? 'League Chats' : 'Team Chats'}
              </p>
              
              {/* Chat list */}
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 min-h-0">
                {(chatFilter === 'leagues' ? leagueChats : teamChats).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className="w-full flex items-start gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#2d332d]/40 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-white/70" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-xs truncate">{chat.name}</p>
                        <span className="text-white/50 text-[9px] flex-shrink-0">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-white/60 text-[10px] truncate">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ml-2">
                            <span className="text-white text-[9px]">{chat.unread}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Show message screen if chat is selected */}
          {selectedChat && (
            <>
              {/* Header with back button */}
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2} />
                </button>
                <p className="text-white text-sm truncate flex-1">{getCurrentChatName()}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 min-h-0 mb-3">
                {chatMessages[selectedChat]?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-3xl px-4 py-2.5 ${
                        message.isMe
                          ? 'bg-white/20 backdrop-blur-sm'
                          : 'bg-white/10 backdrop-blur-sm'
                      }`}
                    >
                      {!message.isMe && (
                        <p className="text-white/70 text-[9px] mb-0.5">{message.sender}</p>
                      )}
                      <p className="text-white text-[11px] leading-snug">{message.text}</p>
                      <p className="text-white/40 text-[8px] mt-1">{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && messageText.trim()) {
                      onSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-white/40"
                />
                <button
                  onClick={onSendMessage}
                  disabled={!messageText.trim()}
                  className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-white" strokeWidth={2} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

              {/* External Filter Buttons - Bottom Right */}
        {!selectedChat && (
          <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setChatFilter('leagues')}
                  className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all border shadow-lg ${
                    chatFilter === 'leagues'
                      ? 'bg-[#2d2d2d] border-white/40'
                      : 'bg-[#2d2d2d]/40 border-white/20 hover:bg-[#2d2d2d]/60'
                  }`}
                >
                  <Trophy className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center">Leagues</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setChatFilter('teams')}
                  className={`w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center transition-all border shadow-lg ${
                    chatFilter === 'teams'
                      ? 'bg-[#2d2d2d] border-white/40'
                      : 'bg-[#2d2d2d]/40 border-white/20 hover:bg-[#2d2d2d]/60'
                  }`}
                >
                  <Users className="w-7 h-7 text-white" strokeWidth={2} />
                </button>
                <span className="text-white text-[10px] text-center">Teams</span>
              </div>
            </div>
          </div>
        )}
      </>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const ChatModal = memo(ChatModalComponent);