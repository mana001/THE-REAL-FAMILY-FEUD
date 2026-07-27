import React from 'react';
import { Users, Crown, ArrowRight, UserCheck, UserX } from 'lucide-react';
import { FamilyMember, Team } from '../types';
import { FamilyIcon } from './FamilyIcon';

interface FamilyRosterPanelProps {
  team1: Team;
  team2: Team;
  team1TurnIdx: number;
  team2TurnIdx: number;
  controlTeamId: 'team1' | 'team2' | null;
  activeMemberId: string | null;
  currentUserId?: string;
  isHost?: boolean;
  onKickMember?: (teamId: 'team1' | 'team2', memberId: string) => void;
}

export const FamilyRosterPanel: React.FC<FamilyRosterPanelProps> = ({
  team1,
  team2,
  team1TurnIdx,
  team2TurnIdx,
  controlTeamId,
  activeMemberId,
  currentUserId,
  isHost = false,
  onKickMember,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      {/* Team 1 Roster Panel */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all shadow-lg ${
          controlTeamId === 'team1'
            ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <FamilyIcon iconKey={team1.avatar} size="sm" />
            <span className="font-extrabold text-amber-300 text-sm uppercase tracking-wider">
              {team1.name}
            </span>
          </div>
          <span className="bg-amber-500/20 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
            {team1.score} PTS
          </span>
        </div>

        {/* Members Lineup */}
        <div className="space-y-1.5">
          {team1.members.length === 0 ? (
            <div className="text-center py-2 text-slate-500 text-xs italic">No family members registered</div>
          ) : (
            team1.members.map((member, idx) => {
              const isTurn = controlTeamId === 'team1' && idx === team1TurnIdx;

              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isTurn
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md scale-102'
                      : 'bg-slate-950 text-slate-300 border border-amber-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{member.avatar}</span>
                    <span className="truncate">{member.name}</span>
                    {idx === 0 && (
                      <Crown className={`w-3.5 h-3.5 shrink-0 ${isTurn ? 'text-slate-950' : 'text-amber-400'}`} />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isTurn && (
                      <span className="bg-slate-950 text-amber-300 text-[10px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse">
                        YOUR TURN!
                      </span>
                    )}
                    {member.isCPU && !isTurn && (
                      <span className="text-[10px] text-slate-500 font-normal">CPU</span>
                    )}
                    {isHost && onKickMember && (
                      <button
                        type="button"
                        onClick={() => onKickMember('team1', member.id)}
                        className="px-1.5 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 rounded font-mono text-[9px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition active:scale-95"
                        title={`Kick ${member.name}`}
                      >
                        <UserX className="w-3 h-3 text-red-400" />
                        <span>Kick</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Team 2 Roster Panel */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all shadow-lg ${
          controlTeamId === 'team2'
            ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-blue-500/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <FamilyIcon iconKey={team2.avatar} size="sm" />
            <span className="font-extrabold text-blue-300 text-sm uppercase tracking-wider">
              {team2.name}
            </span>
          </div>
          <span className="bg-blue-500/20 text-blue-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
            {team2.score} PTS
          </span>
        </div>

        {/* Members Lineup */}
        <div className="space-y-1.5">
          {team2.members.length === 0 ? (
            <div className="text-center py-2 text-slate-500 text-xs italic">No family members registered</div>
          ) : (
            team2.members.map((member, idx) => {
              const isTurn = controlTeamId === 'team2' && idx === team2TurnIdx;

              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isTurn
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-102'
                      : 'bg-slate-950 text-slate-300 border border-blue-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{member.avatar}</span>
                    <span className="truncate">{member.name}</span>
                    {idx === 0 && <Crown className={`w-3.5 h-3.5 shrink-0 ${isTurn ? 'text-white' : 'text-blue-400'}`} />}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isTurn && (
                      <span className="bg-slate-950 text-blue-300 text-[10px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse">
                        YOUR TURN!
                      </span>
                    )}
                    {member.isCPU && !isTurn && (
                      <span className="text-[10px] text-slate-500 font-normal">CPU</span>
                    )}
                    {isHost && onKickMember && (
                      <button
                        type="button"
                        onClick={() => onKickMember('team2', member.id)}
                        className="px-1.5 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 rounded font-mono text-[9px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition active:scale-95"
                        title={`Kick ${member.name}`}
                      >
                        <UserX className="w-3 h-3 text-red-400" />
                        <span>Kick</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
