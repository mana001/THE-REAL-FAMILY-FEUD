import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCheck, MessageSquare, Crown, Zap, ShieldAlert } from 'lucide-react';
import { Team, CurrentPlayer, SurveyQuestion } from '../types';
import { FamilyIcon } from './FamilyIcon';

interface FirstPlayerSelectScreenProps {
  team1: Team;
  team2: Team;
  currentPlayer: CurrentPlayer;
  question?: SurveyQuestion | null;
  firstPlayerTeam1Id?: string | null;
  firstPlayerTeam2Id?: string | null;
  onConfirmFirstPlayers: (p1Id: string, p2Id: string) => void;
  onOpenChat?: () => void;
}

export const FirstPlayerSelectScreen: React.FC<FirstPlayerSelectScreenProps> = ({
  team1,
  team2,
  currentPlayer,
  question,
  firstPlayerTeam1Id,
  firstPlayerTeam2Id,
  onConfirmFirstPlayers,
  onOpenChat,
}) => {
  const isHost = currentPlayer.role === 'host' || currentPlayer.teamId === 'host';

  const [selectedP1, setSelectedP1] = useState<string>(
    firstPlayerTeam1Id || (team1.members && team1.members[0] ? team1.members[0].id : '')
  );
  const [selectedP2, setSelectedP2] = useState<string>(
    firstPlayerTeam2Id || (team2.members && team2.members[0] ? team2.members[0].id : '')
  );

  const p1Member = (team1.members || []).find((m) => m.id === selectedP1) || team1.members?.[0];
  const p2Member = (team2.members || []).find((m) => m.id === selectedP2) || team2.members?.[0];

  const handleConfirm = () => {
    const finalP1 = p1Member?.id || 'm1';
    const finalP2 = p2Member?.id || 'm2';
    onConfirmFirstPlayers(finalP1, finalP2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 px-3 py-4 text-center">
      {/* Header Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-2 border-amber-500/50 p-6 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col items-center gap-3 relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/50 px-4 py-1.5 rounded-full text-amber-300 font-extrabold text-xs uppercase tracking-widest">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>PRE-FACEOFF PLAYER SELECTION</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 uppercase tracking-wide">
          EACH FAMILY CHOOSE YOUR FIRST PLAYER
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
          {isHost ? (
            <span className="text-amber-200 font-bold">
              👑 YOU ARE THE GAME HOST! Consult with both families in the Studio Chat to decide who steps up to the podium, then select each team's representative below!
            </span>
          ) : (
            <span className="text-slate-300">
              💬 Discuss with <strong className="text-amber-300">The Game Host</strong> in the Studio Chat about who will represent your family in the Buzzer Faceoff!
            </span>
          )}
        </p>

        {question && (
          <div className="bg-slate-950/80 border border-amber-500/30 px-4 py-2 rounded-xl text-amber-300 text-xs font-bold mt-1">
            Round Category: <span className="text-white font-extrabold">{question.category || 'General Survey'}</span>
          </div>
        )}

        {onOpenChat && (
          <button
            type="button"
            onClick={onOpenChat}
            className="mt-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg border border-blue-400/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Open Studio Chat To Discuss Players</span>
          </button>
        )}
      </motion.div>

      {/* Two Family Roster Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 Selection */}
        <div className="bg-gradient-to-b from-amber-950/40 to-slate-900/90 border-2 border-amber-500/50 p-5 rounded-2xl flex flex-col justify-between text-left shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2">
                <FamilyIcon iconKey={team1.avatar} size="md" />
                <div>
                  <h3 className="font-extrabold text-amber-300 text-base">{team1.name}</h3>
                  <span className="text-[10px] text-amber-400/80 uppercase tracking-widest font-bold">
                    Red Podium • {team1.members?.length || 0} Members
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-500/30">
                {team1.score} PTS
              </span>
            </div>

            <p className="text-xs font-bold text-amber-200/80 mb-2 uppercase tracking-wider">
              {isHost ? 'Select First Faceoff Player:' : 'Selected First Player:'}
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(team1.members || []).map((m) => {
                const isSelected = p1Member?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => isHost && setSelectedP1(m.id)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    } ${isHost ? 'cursor-pointer hover:border-amber-400/80' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{m.avatar}</span>
                      <div>
                        <span className="font-extrabold text-xs block">{m.name}</span>
                        {m.role === 'captain' && (
                          <span className="text-[9px] text-amber-400 font-bold uppercase">Captain</span>
                        )}
                      </div>
                    </div>
                    {isSelected && <UserCheck className="w-5 h-5 text-amber-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team 2 Selection */}
        <div className="bg-gradient-to-b from-blue-950/40 to-slate-900/90 border-2 border-blue-500/50 p-5 rounded-2xl flex flex-col justify-between text-left shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-blue-500/30 pb-3">
              <div className="flex items-center gap-2">
                <FamilyIcon iconKey={team2.avatar} size="md" />
                <div>
                  <h3 className="font-extrabold text-blue-300 text-base">{team2.name}</h3>
                  <span className="text-[10px] text-blue-400/80 uppercase tracking-widest font-bold">
                    Blue Podium • {team2.members?.length || 0} Members
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-blue-400 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-500/30">
                {team2.score} PTS
              </span>
            </div>

            <p className="text-xs font-bold text-blue-200/80 mb-2 uppercase tracking-wider">
              {isHost ? 'Select First Faceoff Player:' : 'Selected First Player:'}
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(team2.members || []).map((m) => {
                const isSelected = p2Member?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => isHost && setSelectedP2(m.id)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    } ${isHost ? 'cursor-pointer hover:border-blue-400/80' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{m.avatar}</span>
                      <div>
                        <span className="font-extrabold text-xs block">{m.name}</span>
                        {m.role === 'captain' && (
                          <span className="text-[9px] text-blue-400 font-bold uppercase">Captain</span>
                        )}
                      </div>
                    </div>
                    {isSelected && <UserCheck className="w-5 h-5 text-blue-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Host Action vs Audience Notice */}
      {isHost ? (
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full max-w-xl py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
          <span>CONFIRM FIRST PLAYERS & START BUZZER FACEOFF 🔔</span>
        </button>
      ) : (
        <div className="bg-slate-900/80 border border-amber-500/30 px-5 py-3 rounded-2xl text-amber-200 text-xs font-bold flex items-center gap-2 mt-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Game Host is chatting with families to lock in the first players for the faceoff!</span>
        </div>
      )}
    </div>
  );
};
