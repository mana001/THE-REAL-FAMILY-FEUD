import React from 'react';
import { X, Crown, Users, UserCheck, UserX, Zap } from 'lucide-react';
import { Team } from '../types';
import { FamilyIcon } from './FamilyIcon';

interface FamilyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  isHostVerified?: boolean;
  onKickMember?: (teamId: string, memberId: string) => void;
  onSetMemberTurn?: (teamId: 'team1' | 'team2', memberIdx: number) => void;
  activeTurnIdx?: number;
  isControlTeam?: boolean;
}

export const FamilyMembersModal: React.FC<FamilyMembersModalProps> = ({
  isOpen,
  onClose,
  team,
  isHostVerified = false,
  onKickMember,
  onSetMemberTurn,
  activeTurnIdx = 0,
  isControlTeam = false,
}) => {
  if (!isOpen || !team) return null;

  const currentTurnMemberIdx = team.members.length > 0 ? activeTurnIdx % team.members.length : -1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-amber-500/30 pb-4 mb-4">
          <FamilyIcon iconKey={team.avatar} size="lg" />
          <div>
            <h3 className="text-xl font-black text-amber-200 uppercase tracking-wider">
              {team.name}
            </h3>
            <p className="text-xs text-amber-400/80 font-bold flex items-center gap-1.5 mt-0.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{team.members.length} Family Members • {team.score} PTS</span>
            </p>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {team.members.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-semibold italic">
              No registered members in this family.
            </div>
          ) : (
            team.members.map((member, idx) => {
              const isActiveTurn = isControlTeam && idx === currentTurnMemberIdx;
              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-3 rounded-2xl bg-slate-950 border transition ${
                    isActiveTurn
                      ? 'border-amber-400 ring-1 ring-amber-400/50 bg-amber-950/30'
                      : 'border-amber-500/20 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{member.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-100">
                        <span>{member.name}</span>
                        {idx === 0 && (
                          <Crown className="w-4 h-4 text-amber-400 shrink-0" title="Family Captain" />
                        )}
                        {isActiveTurn && (
                          <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse ml-1 shadow-sm">
                            <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />
                            <span>Current Turn</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {idx === 0 ? 'Captain' : 'Family Member'}
                      </span>
                    </div>
                  </div>

                <div className="flex items-center gap-2">
                  {member.isCPU ? (
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      CPU
                    </span>
                  ) : (
                    !isActiveTurn && (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span>PLAYER</span>
                      </span>
                    )
                  )}

                  {/* SET TURN BUTTON FOR VERIFIED HOST */}
                  {isHostVerified && onSetMemberTurn && (
                    <button
                      type="button"
                      onClick={() => onSetMemberTurn(team.id as 'team1' | 'team2', idx)}
                      className={`px-2 py-1 rounded-lg font-black text-[10px] uppercase transition active:scale-95 cursor-pointer flex items-center gap-1 ${
                        idx === currentTurnMemberIdx
                          ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow'
                          : 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300'
                      }`}
                      title="Set as current active turn player"
                    >
                      <span>{idx === currentTurnMemberIdx ? '🎯 Turn' : 'Set Turn'}</span>
                    </button>
                  )}

                  {/* KICK MEMBER BUTTON FOR VERIFIED HOST */}
                  {isHostVerified && onKickMember && (
                    <button
                      type="button"
                      onClick={() => onKickMember(team.id, member.id)}
                      className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 font-black text-[10px] uppercase rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1"
                      title="Kick member from room"
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

        {/* Footer info */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 uppercase tracking-wider transition cursor-pointer"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};

