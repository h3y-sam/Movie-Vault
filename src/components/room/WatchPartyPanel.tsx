'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoomStore } from '@/store/roomStore';
import { Send, Users, MessageSquare, ChevronLeft, ChevronRight, Crown, UserX, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REACTION_EMOJIS = ['❤️', '😂', '😮', '🔥', '💯', '👏', '😭', '👍'];

interface WatchPartyPanelProps {
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
  onKickMember?: (memberId: string) => void;
  onLeaveRoom?: () => void;
}

export default function WatchPartyPanel({ onSendMessage, onSendReaction, onKickMember, onLeaveRoom }: WatchPartyPanelProps) {
  const {
    members,
    messages,
    myId,
    isHost,
    isPanelOpen,
    setPanelOpen,
    activeTab,
    setActiveTab,
    roomCode,
  } = useRoomStore();

  const [copied, setCopied] = useState(false);
  const handleCopyLink = async () => {
    if (!roomCode) return;
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomCode}`
      : `/room/${roomCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat' && isPanelOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isPanelOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="relative flex h-full">
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setPanelOpen(!isPanelOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-50 p-2 rounded-l-xl bg-[#0d111d] border-l border-y border-white/10 hover:text-white text-gray-400 hover:bg-[#161c2e] transition-all"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {isPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Main Container */}
      <AnimatePresence initial={false}>
        {isPanelOpen && (
          <motion.div
            className="w-80 md:w-96 h-full flex flex-col border-l border-white/10 bg-[#07090f] overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? 320 : 384, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header Tabs */}
            <div className="flex border-b border-white/10 bg-[#0d111d]">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all border-b-2 ${
                  activeTab === 'chat'
                    ? 'border-sv-red text-white bg-sv-red/5'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
                {messages.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-sv-red text-white text-[10px]">
                    {messages.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all border-b-2 ${
                  activeTab === 'members'
                    ? 'border-sv-red text-white bg-sv-red/5'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                People
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px]">
                  {members.length}
                </span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {activeTab === 'chat' ? (
                <div className="flex flex-col gap-3 h-full justify-end">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-55 text-sv-red" />
                        <p className="text-sm font-semibold text-gray-400">Welcome to the Watch Party!</p>
                        <p className="text-xs text-gray-500 mt-1">Send a message to start conversing.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.memberId === myId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2.5 items-start ${isMe ? 'flex-row-reverse' : ''}`}
                          >
                            {/* Avatar */}
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                              style={{ background: `${msg.memberColor}15`, border: `1px solid ${msg.memberColor}` }}
                            >
                              {msg.memberAvatar}
                            </div>
                            
                            {/* Content Bubble */}
                            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : ''}`}>
                              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: msg.memberColor }}>
                                {msg.memberName}
                                {msg.isHost && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                              </span>
                              <div
                                className="mt-1 px-3.5 py-2 rounded-2xl text-sm leading-relaxed text-white break-words"
                                style={{
                                  background: isMe ? 'linear-gradient(135deg, #e11d48, #9f1239)' : 'rgba(255,255,255,0.06)',
                                  borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                }}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>
              ) : (
                /* Member List View */
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Active Members ({members.length})
                    </div>
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2.5 rounded-xl transition-colors bg-white/5 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                            style={{ background: `${member.color}15`, border: `1px solid ${member.color}` }}
                          >
                            {member.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white flex items-center gap-1">
                              {member.name}
                              {member.isHost && <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <span>{member.id === myId ? 'You' : 'In Room'}</span>
                              {member.isHost && (
                                <>
                                  <span className="text-gray-600">•</span>
                                  <span className="text-[9px] font-bold text-yellow-500/80 uppercase tracking-wider">Host/Admin</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {/* Kick button — only visible to host, not for themselves */}
                          {isHost && member.id !== myId && !member.isHost && onKickMember && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${member.name} from the room?`)) {
                                  onKickMember(member.id);
                                }
                              }}
                              title={`Remove ${member.name}`}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Share Link & Exit Room actions at the bottom of People Tab */}
                  <div className="mt-auto pt-4 border-t border-white/5 space-y-3 shrink-0">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                      <div className="text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sv-red" />
                        <span>Invite Friends</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2.5">
                        Share this code or link with friends to watch together.
                      </p>
                      <div className="flex items-center gap-2 bg-black/45 border border-white/10 rounded-lg p-1.5">
                        <span className="text-xs font-mono text-gray-300 truncate flex-1 pl-1">
                          {roomCode}
                        </span>
                        <button
                          onClick={handleCopyLink}
                          className="px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                          style={{
                            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(225,29,72,0.15)',
                            color: copied ? '#22c55e' : '#e11d48',
                          }}
                        >
                          {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </div>

                    {onLeaveRoom && (
                      <button
                        onClick={onLeaveRoom}
                        className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-red-500/15 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Exit Watch Room</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Emoji Reactions Bar */}
            <div className="px-4 py-2 bg-[#0d111d] border-t border-white/10 flex justify-between gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSendReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform py-1 px-1.5 rounded-lg hover:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Message Form */}
            {activeTab === 'chat' && (
              <div className="p-4 bg-[#0d111d] border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Send message..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none border border-white/10 bg-white/5 transition-all focus:border-sv-red"
                />
                <button
                  onClick={handleSend}
                  className="p-2.5 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Emoji bar (shown when panel is closed or on mobile) */}
      {!isPanelOpen && (
        <div className="absolute right-4 bottom-24 flex flex-col gap-2 bg-black/85 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl z-55">
          {REACTION_EMOJIS.slice(0, 4).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              className="w-10 h-10 flex items-center justify-center text-xl rounded-full hover:bg-white/10 hover:scale-110 active:scale-95 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
