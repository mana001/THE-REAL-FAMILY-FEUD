import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, MessageSquarePlus, Send, Lock, X, Sparkles, MessageCircle, Vote, CheckCircle2, Paperclip, Smile } from 'lucide-react';
import { CurrentPlayer, HuddleMessage, ActivePoll, Team } from '../types';
import { soundManager } from '../utils/soundEffects';
import { ButterflyIcon } from './ButterflyIcon';

interface HuddleChatPanelProps {
  player: CurrentPlayer;
  messages: HuddleMessage[];
  onSendMessage: (text: string, isCheer?: boolean) => void;
  isChatDisabled?: boolean;
  activePoll?: ActivePoll | null;
  controlTeamId?: string | null;
  stage?: string;
  team1?: Team;
  team2?: Team;
  onVote?: (optionIndex: number) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

const CHEER_PRESETS = [
  'Good Answer! 👏',
  'Survey Says! 🛎️',
  'You Got This Team! 🍀',
  'Pass or Play? 🤔',
  'Steal Point! ⚡',
];

export const HuddleChatPanel: React.FC<HuddleChatPanelProps> = ({
  player,
  messages,
  onSendMessage,
  isChatDisabled = false,
  activePoll,
  controlTeamId,
  stage,
  team1,
  team2,
  onVote,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const lastMsgCountRef = useRef(messages.length);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track unread messages & play ping sound when drawer is closed
  useEffect(() => {
    if (messages.length > lastMsgCountRef.current) {
      const newMsgsCount = messages.length - lastMsgCountRef.current;
      if (!isOpen) {
        setUnreadCount((prev) => prev + newMsgsCount);
        soundManager.playDing();
      }
    }
    lastMsgCountRef.current = messages.length;
  }, [messages, isOpen]);

  const handleToggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) setUnreadCount(0);
    onOpenChange?.(next);
  };

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    if (chatContainerRef.current && isOpen) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, activePoll]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isChatDisabled || !inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  const handleCheerClick = (cheerText: string) => {
    if (isChatDisabled) return;
    soundManager.playDing();
    onSendMessage(cheerText, true);
  };

  const isHost = player.role === 'host' || player.teamId === 'host';
  let canUserVote = false;
  if (activePoll) {
    if (activePoll.allowedTeamId === 'all' || activePoll.allowedTeamId === 'both' || isHost) {
      canUserVote = true;
    } else if (activePoll.allowedTeamId === player.teamId) {
      canUserVote = true;
    }
  }

  const hasUserVoted = activePoll && activePoll.voterIds ? activePoll.voterIds.includes(player.id) : false;

  return (
    <>
      {/* FLOATING SIDE BUBBLE BUTTON (Hidden when Chat Drawer is Open) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
          <button
            type="button"
            onClick={handleToggleOpen}
            className="relative group flex items-center justify-center p-3.5 sm:p-4 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all transform active:scale-95 cursor-pointer bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 hover:from-blue-600 hover:to-amber-400 text-white border-2 border-amber-300"
            title="Toggle Studio Chat"
          >
            <div className="relative flex items-center justify-center">
              <MessageSquarePlus className="w-6 h-6 text-amber-200 drop-shadow-md" />
              <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>

            {(unreadCount > 0 || (activePoll && !hasUserVoted)) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border-2 border-slate-950 shadow-lg animate-bounce">
                {activePoll && !hasUserVoted ? 'POLL' : unreadCount}
              </span>
            )}

            <span className="hidden sm:inline-block absolute right-16 bg-slate-950/90 text-blue-200 border border-blue-500/40 text-[11px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md pointer-events-none">
              Studio Chat 💬
            </span>
          </button>
        </div>
      )}

      {/* MODERN CHAT OVERLAY DRAWER STUCK & DOCKED TO ABSOLUTE BOTTOM EDGE */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-4 sm:bottom-0 z-50 w-full sm:w-[400px] h-[500px] sm:h-[540px] max-h-[85vh] sm:max-h-[80vh] bg-slate-950/40 backdrop-blur-md border-t-2 sm:border-2 border-blue-500/50 rounded-t-3xl sm:rounded-3xl shadow-[0_16px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 text-left">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-950/70 via-slate-900/70 to-blue-950/70 backdrop-blur-md px-4 py-3 border-b border-blue-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>Studio & Family Chat</span>
                </h3>
                <p className="text-[10px] text-blue-300 font-bold">
                  {player.name} ({player.role})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ACTIVE CHAT POLL */}
          {activePoll && (
            <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b-2 border-amber-500/60 p-3 shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Vote className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>{activePoll.title}</span>
                </span>
                <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  {activePoll.voterIds ? activePoll.voterIds.length : 0} Votes
                </span>
              </div>

              <div className="space-y-1.5">
                {activePoll.options.map((opt, idx) => {
                  const votesCount = activePoll.votes ? activePoll.votes[idx] || 0 : 0;
                  const totalVotes = activePoll.voterIds ? Math.max(1, activePoll.voterIds.length) : 1;
                  const pct = Math.round((votesCount / totalVotes) * 100);

                  return (
                    <div key={opt} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                        <span>{opt}</span>
                        <span className="text-amber-400">{votesCount} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-amber-500/30">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {canUserVote && !hasUserVoted && onVote && (
                        <button
                          type="button"
                          onClick={() => onVote(idx)}
                          className="w-full mt-1 py-1 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 text-amber-300 font-extrabold text-[10px] uppercase rounded-lg transition active:scale-95 cursor-pointer"
                        >
                          Vote for {opt}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {hasUserVoted && (
                <div className="text-[10px] font-bold text-emerald-400 text-center flex items-center justify-center gap-1 pt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Your vote has been recorded!</span>
                </div>
              )}
            </div>
          )}

          {/* Locked Chat Banner */}
          {isChatDisabled && (
            <div className="bg-red-950/90 border-b border-red-500/60 p-2.5 text-xs text-red-200 font-bold flex items-center gap-2 shrink-0">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>Chat is locked during your family's turn to answer on the board!</span>
            </div>
          )}

          {/* Quick Cheer Soundboard Bar */}
          <div className="bg-slate-950/90 border-b border-slate-800 p-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
            {CHEER_PRESETS.map((cheer) => (
              <button
                key={cheer}
                type="button"
                onClick={() => handleCheerClick(cheer)}
                disabled={isChatDisabled}
                className={`px-3 py-1 text-[11px] font-extrabold rounded-full transition shrink-0 flex items-center gap-1 ${
                  isChatDisabled
                    ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
                    : 'bg-blue-950/90 border border-blue-500/40 hover:bg-blue-600 hover:text-white text-blue-200 cursor-pointer active:scale-95 shadow-sm'
                }`}
              >
                <span>{cheer}</span>
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-3 overflow-y-auto space-y-3 bg-transparent scrollbar-thin scrollbar-thumb-blue-500/40"
          >
            {messages.length === 0 ? (
              <div className="text-slate-500 text-center py-12 text-xs font-semibold">
                No chat messages yet. Send a cheer or shout out to the audience!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderName === player.name;
                const isHostMsg =
                  msg.senderRole === 'host' ||
                  msg.senderTeamId === 'host' ||
                  (msg.senderName && (
                    msg.senderName.toUpperCase().includes('HOST') ||
                    msg.senderName.toUpperCase().includes('BUTTERFLY') ||
                    msg.senderName.toUpperCase().includes('STEVE')
                  ));

                const isTeam1Msg = msg.senderTeamId === 'team1';
                const isTeam2Msg = msg.senderTeamId === 'team2';

                const alignLeft = isHostMsg ? true : !isMe;
                const displayName = isHostMsg ? 'BUTTERFLY' : msg.senderName;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${alignLeft ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-0.5 px-1">
                      {isHostMsg ? (
                        <ButterflyIcon className="w-4 h-4 text-amber-400" />
                      ) : (
                        <span>{msg.senderAvatar}</span>
                      )}
                      
                      <span className={
                        isHostMsg ? 'text-amber-300 font-black' :
                        isTeam1Msg ? 'text-amber-300 font-extrabold' :
                        isTeam2Msg ? 'text-blue-300 font-extrabold' :
                        isMe ? 'text-emerald-300 font-bold' : 'text-slate-300 font-bold'
                      }>
                        {displayName}
                      </span>

                      {isHostMsg && (
                        <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow">
                          <ButterflyIcon className="w-2.5 h-2.5 text-slate-950" /> HOST
                        </span>
                      )}

                      {isTeam1Msg && !isHostMsg && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-[8px] px-1.5 py-0.2 rounded uppercase">
                          {team1?.name || 'Family 1'}
                        </span>
                      )}

                      {isTeam2Msg && !isHostMsg && (
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 font-extrabold text-[8px] px-1.5 py-0.2 rounded uppercase">
                          {team2?.name || 'Family 2'}
                        </span>
                      )}

                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>

                    {/* DISTINCT COLORFUL MESSAGE BUBBLES FOR EACH SENDER ROLE */}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium max-w-[85%] shadow-lg break-words leading-relaxed ${
                        isHostMsg
                          ? 'bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 text-amber-100 font-semibold border-2 border-amber-400/80 shadow-[0_4px_20px_rgba(245,158,11,0.25)] rounded-tl-xs'
                          : isTeam1Msg
                          ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/60 text-amber-100 shadow-[0_2px_12px_rgba(245,158,11,0.2)] rounded-tl-xs'
                          : isTeam2Msg
                          ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-500/60 text-blue-100 shadow-[0_2px_12px_rgba(59,130,246,0.2)] rounded-tl-xs'
                          : msg.isCheer
                          ? 'bg-amber-500/20 border border-amber-400/60 text-amber-100 rounded-tr-xs'
                          : isMe
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-md'
                          : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DOCKED FLUSH BOTTOM INPUT BAR (WHATSAPP / IMESSAGE STYLED WITH SAFE-AREA PADDING) */}
          <div className="sticky bottom-0 inset-x-0 w-full bg-slate-950 border-t border-slate-800/80 p-2 sm:p-2.5 pb-[calc(8px+env(safe-area-inset-bottom,8px))] z-10 flex items-end gap-1.5 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
            {/* Attachment / Cheer Quick Action Button */}
            <button
              type="button"
              onClick={() => handleCheerClick('👏 High Five!')}
              disabled={isChatDisabled}
              className="p-2.5 rounded-full text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition shrink-0 cursor-pointer disabled:opacity-40"
              title="Quick Cheer"
            >
              <Smile className="w-5 h-5 text-amber-400" />
            </button>

            {/* Auto-expanding Text Area / Field */}
            <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-1.5">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                disabled={isChatDisabled}
                placeholder={
                  isChatDisabled
                    ? '🔒 Chat locked during turn...'
                    : 'Type a message or [OPEN THE VOTE]...'
                }
                className={`w-full text-xs font-medium px-4 py-2.5 rounded-2xl outline-none resize-none max-h-[100px] leading-relaxed transition ${
                  isChatDisabled
                    ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900/90 border border-blue-500/40 focus:border-blue-400 text-white placeholder:text-slate-500 shadow-inner'
                }`}
              />

              {/* Prominent Send Icon Button */}
              <button
                type="submit"
                disabled={isChatDisabled || !inputText.trim()}
                className={`p-3 rounded-full font-black transition flex items-center justify-center shrink-0 shadow-lg ${
                  isChatDisabled || !inputText.trim()
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white cursor-pointer active:scale-95 shadow-blue-500/20 ring-2 ring-amber-400/30'
                }`}
              >
                {isChatDisabled ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
