import React, { useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { ArrowUpRight, ChevronDown, ChevronRight } from 'lucide-react'

const Archived = () => {
  const { chats, setSelectedUser, unarchiveUser } = useChatStore();
  const archived = chats.filter((c) => c.isArchived);
  const [open, setOpen] = useState(false);

  if (archived.length === 0) return null;

  return (
    <div className="mb-3">
      <button
        className="w-full flex items-center justify-between text-slate-300 text-sm mb-2 bg-transparent p-1"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-controls="archived-list"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-medium">Archived</span>
          <span className="ml-2 text-xs text-slate-400">({archived.length})</span>
        </div>
        <div className="text-xs text-slate-400">{open ? 'Hide' : 'Show'}</div>
      </button>

      {open && (
        <div id="archived-list">
          {archived.map((chat) => (
            <div key={chat.id} className="relative bg-slate-800/30 p-3 rounded-lg mb-2 cursor-pointer group" onClick={() => setSelectedUser(chat)}>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="size-10 rounded-full overflow-hidden">
                    <img src={chat.profilePic || '/avatar.png'} alt={chat.fullName} className="size-full object-cover" />
                  </div>
                </div>
                <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); unarchiveUser(chat.id); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700/30 p-2 rounded-full"
                title="Unarchive chat"
              >
                <ArrowUpRight size={16} color="#e2e8f0" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Archived


// smart replies
// contacts
// tags
