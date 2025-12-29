import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import Archived from "./Archived";
import { Archive } from 'lucide-react';

const ChatsList = () => {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, archiveUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  const activeChats = chats.filter((c) => !c.isArchived);

  return (
    <>
      <Archived />

      {activeChats.length === 0 ? (
        <NoChatsFound />
      ) : (
        activeChats.map((chat) => (
          <div
            key={chat.id}
            className="relative bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors group"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(chat.id) ? "online" : "offline"}`}>
                <div className="size-12 rounded-full overflow-hidden relative">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} className="size-full object-cover" />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); archiveUser(chat.id); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700/30 p-2 rounded-full"
              title="Archive chat"
            >
              <Archive size={16} color="#e2e8f0" />
            </button>
          </div>
        ))
      )}
    </>
  );
}
export default ChatsList;
