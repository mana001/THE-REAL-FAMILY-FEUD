import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Tv, UserCheck, Play, Plus, Trash2, Smartphone, KeyRound, Edit3, Shield, Crown, Sparkles, X, Check, UserPlus, BookOpen } from 'lucide-react';
import { CurrentPlayer, FamilyMember, PlayerRole } from '../types';
import { FamilyIcon, ELEGANT_FAMILY_ICONS } from './FamilyIcon';
import { GameTutorialModal } from './GameTutorialModal';

interface RoleSelectScreenProps {
  onJoinRoom: (
    player: CurrentPlayer,
    team1Members: FamilyMember[],
    team2Members: FamilyMember[],
    roomCode: string,
    team1Name?: string,
    team2Name?: string,
    team1Avatar?: string,
    team2Avatar?: string
  ) => void;
  isHostVerified?: boolean;
  onVerifyHost?: () => void;
}

// Emojis for family members to choose from
export const MEMBER_EMOJIS = [
  '🐌', '👑', '🦁', '🐻', '🚀', '⚡', '🌮', '🤖', '🦊', '🦉',
  '💎', '🍿', '🐚', '🐙', '🐉', '🧜‍♀️', '⚓', '🔮', '🌟', '🎯',
  '🎨', '🔥', '🏆', '🎉', '🎸', '⚽', '🍕', '🦄', '🎭', '👨‍👩‍👧‍👦'
];

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  onJoinRoom,
  isHostVerified = false,
  onVerifyHost,
}) => {
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('team1_member');
  const [roomCode, setRoomCode] = useState('FEUD-9000');
  const [showHostPasscodeModal, setShowHostPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Family names & elegant icons
  const [team1Name, setTeam1Name] = useState('The Millers');
  const [team1Avatar, setTeam1Avatar] = useState('royal_shell');

  const [team2Name, setTeam2Name] = useState('The Johnsons');
  const [team2Avatar, setTeam2Avatar] = useState('monarch_crown');

  // Rosters start empty!
  const [team1Members, setTeam1Members] = useState<FamilyMember[]>([]);
  const [team2Members, setTeam2Members] = useState<FamilyMember[]>([]);

  // Track if THIS player device/session has added a member (Strict 1 member per player rule)
  const [myAddedMember, setMyAddedMember] = useState<{
    teamId: 'team1' | 'team2';
    memberId: string;
  } | null>(null);

  // Validation Error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // State for modal window adding a member to Family 1 or Family 2
  const [addingToTeam, setAddingToTeam] = useState<'team1' | 'team2' | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmoji, setNewMemberEmoji] = useState('🐌');

  // State for editing an existing member
  const [editingMember, setEditingMember] = useState<{
    teamId: 'team1' | 'team2';
    memberId: string;
    name: string;
    avatar: string;
  } | null>(null);

  // State for toggling family customization (Name & Emblem)
  const [isLocalHostUnlocked, setIsLocalHostUnlocked] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showFamilyCustomizer, setShowFamilyCustomizer] = useState<'team1' | 'team2' | null>(null);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim().toUpperCase() === 'HOST') {
      if (onVerifyHost) onVerifyHost();
      setIsLocalHostUnlocked(true);
      setSelectedRole('host');
      setShowHostPasscodeModal(false);
      setPasscodeError(false);
      setPasscodeInput('');
    } else {
      setPasscodeError(true);
    }
  };

  // Click family card action: selects role and pops open Add Member window if not added yet
  const handleSelectFamily = (teamId: 'team1' | 'team2') => {
    setSelectedRole(teamId === 'team1' ? 'team1_member' : 'team2_member');

    // If player has NOT added a member yet, automatically pop open the Add Member window
    if (!myAddedMember && selectedRole !== 'host') {
      setAddingToTeam(teamId);
      setNewMemberEmoji(teamId === 'team1' ? '🐌' : '🔱');
      setNewMemberName('');
    }
  };

  const handleSelectHost = () => {
    if (isLocalHostUnlocked) {
      setSelectedRole('host');
    } else {
      setShowHostPasscodeModal(true);
    }
  };

  const handleOpenAddMemberModal = (teamId: 'team1' | 'team2') => {
    const isHost = selectedRole === 'host' || isHostVerified;

    if (isHost) {
      // Host is allowed to add test members to either team anytime!
      setAddingToTeam(teamId);
      setNewMemberEmoji(teamId === 'team1' ? '🐌' : '🔱');
      const teamList = teamId === 'team1' ? team1Members : team2Members;
      setNewMemberName(`Player ${teamList.length + 1}`);
      setValidationError(null);
      return;
    }

    if (myAddedMember) {
      if (myAddedMember.teamId === teamId) {
        // Open edit modal for user's existing member
        const myMem = (teamId === 'team1' ? team1Members : team2Members).find(
          (m) => m.id === myAddedMember.memberId
        );
        if (myMem) {
          setEditingMember({
            teamId,
            memberId: myMem.id,
            name: myMem.name,
            avatar: myMem.avatar,
          });
          return;
        }
      } else {
        setValidationError('⚠️ You have already added a member to the other family! Remove yourself first if you want to switch families.');
        return;
      }
    }

    setAddingToTeam(teamId);
    setNewMemberEmoji(teamId === 'team1' ? '🐌' : '🔱');
    setNewMemberName('');
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingToTeam || !newMemberName.trim()) return;

    const isHost = selectedRole === 'host' || isHostVerified;

    // Strict Check: Regular players can only add 1 member once
    if (!isHost && myAddedMember) {
      setValidationError('⚠️ You can only add yourself once per game session!');
      setAddingToTeam(null);
      return;
    }

    const currentList = addingToTeam === 'team1' ? team1Members : team2Members;
    const isFirstMember = currentList.length === 0;

    const newMember: FamilyMember = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newMemberName.trim(),
      avatar: newMemberEmoji,
      role: isFirstMember ? 'captain' : 'member',
      teamId: addingToTeam,
      isCPU: false,
    };

    if (addingToTeam === 'team1') {
      setTeam1Members((prev) => [...prev, newMember]);
      if (!isHost) setSelectedRole('team1_member');
    } else {
      setTeam2Members((prev) => [...prev, newMember]);
      if (!isHost) setSelectedRole('team2_member');
    }

    if (!isHost) {
      setMyAddedMember({ teamId: addingToTeam, memberId: newMember.id });
    }

    setNewMemberName('');
    setAddingToTeam(null);
    setValidationError(null);
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'host') return;
    if (!editingMember || !editingMember.name.trim()) return;

    const { teamId, memberId, name, avatar } = editingMember;

    if (teamId === 'team1') {
      setTeam1Members(
        team1Members.map((m) => (m.id === memberId ? { ...m, name: name.trim(), avatar } : m))
      );
    } else {
      setTeam2Members(
        team2Members.map((m) => (m.id === memberId ? { ...m, name: name.trim(), avatar } : m))
      );
    }

    setEditingMember(null);
  };

  const handleRemoveMember = (teamId: 'team1' | 'team2', memberId: string) => {
    if (selectedRole === 'host') return;

    // Reset myAddedMember if I am deleting myself
    if (myAddedMember && myAddedMember.memberId === memberId) {
      setMyAddedMember(null);
    }

    if (teamId === 'team1') {
      const next = team1Members.filter((m) => m.id !== memberId);
      if (next.length > 0) {
        next[0] = { ...next[0], role: 'captain' };
      }
      setTeam1Members(next);
    } else {
      const next = team2Members.filter((m) => m.id !== memberId);
      if (next.length > 0) {
        next[0] = { ...next[0], role: 'captain' };
      }
      setTeam2Members(next);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    const isHostLaunching = selectedRole === 'host' || isHostVerified;

    if (!isHostLaunching && selectedRole !== 'host') {
      setValidationError('⚠️ ONLY THE GAME HOST CAN LAUNCH THE SHOWDOWN. Please ask the Game Host to launch or verify as Host using the HOSTING OPTION.');
      return;
    }

    let updatedT1 = [...team1Members];
    let updatedT2 = [...team2Members];

    // Testing fallback: Auto-seed 1 member per team if host is launching empty
    if (updatedT1.length === 0) {
      updatedT1 = [{
        id: 'm1_test',
        name: 'Miller Captain',
        avatar: '🐌',
        role: 'captain',
        teamId: 'team1',
        isCPU: false,
      }];
    }

    if (updatedT2.length === 0) {
      updatedT2 = [{
        id: 'm2_test',
        name: 'Johnson Captain',
        avatar: '🔱',
        role: 'captain',
        teamId: 'team2',
        isCPU: false,
      }];
    }

    setValidationError(null);

    let playerObjName = 'Game Host 🎤';
    let playerObjAvatar = '🎤';

    const isHostRole = selectedRole === 'host' || isHostVerified;

    if (isHostRole) {
      playerObjName = 'Game Host 🎤';
      playerObjAvatar = '🎤';
    } else if (selectedRole === 'team1_member') {
      const myMem = updatedT1.find((m) => m.id === myAddedMember?.memberId) || updatedT1[0];
      playerObjName = myMem?.name || 'Miller Player';
      playerObjAvatar = myMem?.avatar || '🐌';
    } else if (selectedRole === 'team2_member') {
      const myMem = updatedT2.find((m) => m.id === myAddedMember?.memberId) || updatedT2[0];
      playerObjName = myMem?.name || 'Johnson Player';
      playerObjAvatar = myMem?.avatar || '🔱';
    }

    const player: CurrentPlayer = {
      id: isHostRole ? `host_${Date.now()}` : (myAddedMember?.memberId || `p_${Date.now()}`),
      name: playerObjName,
      avatar: playerObjAvatar,
      role: isHostRole ? 'host' : selectedRole,
      teamId: selectedRole === 'team1_member' ? 'team1' : selectedRole === 'team2_member' ? 'team2' : undefined,
      isCaptain: isHostRole ? false : true,
    };

    onJoinRoom(
      player,
      updatedT1,
      updatedT2,
      roomCode,
      team1Name.trim() || 'Family 1',
      team2Name.trim() || 'Family 2',
      team1Avatar,
      team2Avatar
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-2 sm:px-4">
      <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border-4 border-amber-500 rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden text-left">
        {/* Top Header Title */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-4 py-1 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-widest mb-2 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>UNDERTOPIA FEUD 🐌 REAL-TIME SHOWDOWN</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-amber-100 drop-shadow">
            Family & Host Setup
          </h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
            Tap a family to join, add your name & emoji, then let the Game Host start the show!
          </p>
        </div>

        {/* Validation Error Alert Banner */}
        {validationError && (
          <div className="bg-red-950/95 border-2 border-red-500 text-red-200 p-3 rounded-2xl mb-4 font-black text-xs flex items-center justify-between shadow-xl animate-shake">
            <span>{validationError}</span>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-red-300 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">

          {/* 3 ROLE OPTIONS GRID (Family 1, Family 2, Game Host Overseer) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

            {/* FAMILY 1 CARD */}
            <div
              className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                selectedRole === 'team1_member'
                  ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                  : 'bg-slate-900/80 border-amber-500/30 hover:border-amber-400/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FamilyIcon iconKey={team1Avatar} size="sm" />
                    <div>
                      <h3 className="font-black text-amber-300 text-base flex items-center gap-1.5">
                        <span>{team1Name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!(selectedRole === 'host' || isHostVerified)) {
                              setValidationError('⚠️ Only the Game Host can edit family names and emblems!');
                              return;
                            }
                            setShowFamilyCustomizer(showFamilyCustomizer === 'team1' ? null : 'team1');
                          }}
                          className="text-slate-400 hover:text-amber-300 p-1 cursor-pointer"
                          title={selectedRole === 'host' || isHostVerified ? "Rename or change emblem" : "Only Game Host can edit family names"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </h3>
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase">Red Podium</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectFamily('team1')}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                      selectedRole === 'team1_member'
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                    }`}
                  >
                    {selectedRole === 'team1_member' ? 'Selected' : 'Select'}
                  </button>
                </div>

                {/* Inline Family Name & Emblem Customizer Drawer */}
                {showFamilyCustomizer === 'team1' && (
                  <div className="my-2 p-2.5 bg-slate-950 border border-amber-500/40 rounded-xl space-y-2">
                    <div>
                      <label className="text-[9px] font-bold text-amber-300 block mb-1">Family 1 Name:</label>
                      <input
                        type="text"
                        value={team1Name}
                        onChange={(e) => setTeam1Name(e.target.value)}
                        className="w-full bg-slate-900 border border-amber-500/40 text-amber-100 text-xs font-bold px-2.5 py-1 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-amber-300 block mb-1">Emblem:</label>
                      <div className="grid grid-cols-5 gap-1">
                        {ELEGANT_FAMILY_ICONS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTeam1Avatar(item.id)}
                            className={`p-1 rounded-lg border flex items-center justify-center cursor-pointer ${
                              team1Avatar === item.id ? 'bg-amber-500/40 border-amber-400' : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            <FamilyIcon iconKey={item.id} size="sm" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Roster Members Summary List */}
                <div className="mt-3 pt-2 border-t border-amber-500/20">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-200 mb-1.5">
                    <span>Roster ({team1Members.length} Members)</span>
                    {myAddedMember?.teamId === 'team1' ? (
                      <span className="text-[10px] bg-green-950 text-green-300 font-extrabold px-2 py-0.5 rounded-full border border-green-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400" /> You Added
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin pr-1">
                    {team1Members.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">No members added yet.</p>
                    ) : (
                      team1Members.map((m) => (
                        <div
                          key={m.id}
                          className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-bold ${
                            m.id === myAddedMember?.memberId
                              ? 'bg-amber-500/20 border border-amber-400/60 text-amber-100'
                              : 'bg-slate-950/80 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{m.avatar}</span>
                            <span className="truncate">{m.name}</span>
                            {m.id === myAddedMember?.memberId && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded">YOU</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMember('team1', m.id)}
                            className="text-slate-500 hover:text-red-400 p-0.5 ml-1 shrink-0 cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button: Add Member to Family 1 */}
              <div className="mt-3 pt-2">
                {selectedRole === 'host' || isHostVerified ? (
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberModal('team1')}
                    className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Add Test Member (Host)</span>
                  </button>
                ) : myAddedMember?.teamId === 'team1' ? (
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberModal('team1')}
                    className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Your Member Details</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberModal('team1')}
                    disabled={Boolean(myAddedMember && myAddedMember.teamId !== 'team1')}
                    className={`w-full py-2.5 font-black text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-1.5 ${
                      myAddedMember && myAddedMember.teamId !== 'team1'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 cursor-pointer active:scale-95'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Me To {team1Name}</span>
                  </button>
                )}
              </div>
            </div>

            {/* FAMILY 2 CARD */}
            <div
              className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                selectedRole === 'team2_member'
                  ? 'bg-blue-950/90 border-blue-400 ring-2 ring-blue-400/50 shadow-xl'
                  : 'bg-slate-900/80 border-blue-500/30 hover:border-blue-400/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FamilyIcon iconKey={team2Avatar} size="sm" />
                    <div>
                      <h3 className="font-black text-blue-300 text-base flex items-center gap-1.5">
                        <span>{team2Name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!(selectedRole === 'host' || isHostVerified)) {
                              setValidationError('⚠️ Only the Game Host can edit family names and emblems!');
                              return;
                            }
                            setShowFamilyCustomizer(showFamilyCustomizer === 'team2' ? null : 'team2');
                          }}
                          className="text-slate-400 hover:text-blue-300 p-1 cursor-pointer"
                          title={selectedRole === 'host' || isHostVerified ? "Rename or change emblem" : "Only Game Host can edit family names"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </h3>
                      <span className="text-[10px] text-blue-400 font-extrabold uppercase">Blue Podium</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectFamily('team2')}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                      selectedRole === 'team2_member'
                        ? 'bg-blue-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-blue-300 hover:bg-slate-700'
                    }`}
                  >
                    {selectedRole === 'team2_member' ? 'Selected' : 'Select'}
                  </button>
                </div>

                {/* Inline Family Name & Emblem Customizer Drawer */}
                {showFamilyCustomizer === 'team2' && (
                  <div className="my-2 p-2.5 bg-slate-950 border border-blue-500/40 rounded-xl space-y-2">
                    <div>
                      <label className="text-[9px] font-bold text-blue-300 block mb-1">Family 2 Name:</label>
                      <input
                        type="text"
                        value={team2Name}
                        onChange={(e) => setTeam2Name(e.target.value)}
                        className="w-full bg-slate-900 border border-blue-500/40 text-blue-100 text-xs font-bold px-2.5 py-1 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-blue-300 block mb-1">Emblem:</label>
                      <div className="grid grid-cols-5 gap-1">
                        {ELEGANT_FAMILY_ICONS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTeam2Avatar(item.id)}
                            className={`p-1 rounded-lg border flex items-center justify-center cursor-pointer ${
                              team2Avatar === item.id ? 'bg-blue-500/40 border-blue-400' : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            <FamilyIcon iconKey={item.id} size="sm" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Roster Members Summary List */}
                <div className="mt-3 pt-2 border-t border-blue-500/20">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-200 mb-1.5">
                    <span>Roster ({team2Members.length} Members)</span>
                    {myAddedMember?.teamId === 'team2' ? (
                      <span className="text-[10px] bg-green-950 text-green-300 font-extrabold px-2 py-0.5 rounded-full border border-green-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400" /> You Added
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin pr-1">
                    {team2Members.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">No members added yet.</p>
                    ) : (
                      team2Members.map((m) => (
                        <div
                          key={m.id}
                          className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-bold ${
                            m.id === myAddedMember?.memberId
                              ? 'bg-blue-500/20 border border-blue-400/60 text-blue-100'
                              : 'bg-slate-950/80 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{m.avatar}</span>
                            <span className="truncate">{m.name}</span>
                            {m.id === myAddedMember?.memberId && (
                              <span className="text-[9px] bg-blue-400 text-slate-950 font-black px-1 rounded">YOU</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMember('team2', m.id)}
                            className="text-slate-500 hover:text-red-400 p-0.5 ml-1 shrink-0 cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button: Add Member to Family 2 */}
              <div className="mt-3 pt-2">
                {selectedRole === 'host' || isHostVerified ? (
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberModal('team2')}
                    className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/60 text-blue-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                    <span>+ Add Test Member (Host)</span>
                  </button>
                ) : myAddedMember?.teamId === 'team2' ? (
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberModal('team2')}
                    className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/60 text-blue-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Edit Your Member Details</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberModal('team2')}
                    disabled={Boolean(myAddedMember && myAddedMember.teamId !== 'team2')}
                    className={`w-full py-2.5 font-black text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-1.5 ${
                      myAddedMember && myAddedMember.teamId !== 'team2'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Me To {team2Name}</span>
                  </button>
                )}
              </div>
            </div>

            {/* GAME HOST CARD (3RD OPTION) */}
            <div
              className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                selectedRole === 'host'
                  ? 'bg-gradient-to-b from-amber-950/90 to-yellow-950/90 border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                  : 'bg-slate-900/80 border-amber-500/30 hover:border-amber-400/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center font-bold text-amber-300">
                      🎤
                    </div>
                    <div>
                      <h3 className="font-black text-amber-300 text-base flex items-center gap-1.5">
                        <span>GAME HOST</span>
                      </h3>
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">Official Game Host</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectHost}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                      selectedRole === 'host'
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                    }`}
                  >
                    {selectedRole === 'host' ? 'Selected' : isLocalHostUnlocked ? 'Select' : 'Unlock Host'}
                  </button>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-500/20 space-y-2">
                  <p className="text-xs text-slate-300 font-medium leading-snug">
                    Oversee the entire game board, reveal survey answers, select round categories, and award points.
                  </p>

                  <div className="bg-slate-950/90 p-2.5 rounded-xl border border-amber-500/30 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Not in any family</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Only Game Host chooses round categories</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <UserPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Can edit families & add test members</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2">
                <button
                  type="button"
                  onClick={handleSelectHost}
                  className={`w-full py-2.5 font-black text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === 'host'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>{selectedRole === 'host' ? '✓ Game Host Active' : isLocalHostUnlocked ? 'Select Game Host' : 'Enter Host Code (HOST)'}</span>
                </button>
              </div>
            </div>
          </div>



          {/* LAUNCH SHOWDOWN BUTTON (HOST ONLY) */}
          {selectedRole === 'host' || isHostVerified ? (
            <button
              type="submit"
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>LAUNCH UNDERTOPIA FEUD 🐌 SHOWDOWN (GAME HOST)</span>
            </button>
          ) : (
            <div className="space-y-1.5 text-center">
              <button
                type="button"
                onClick={() => setShowHostPasscodeModal(true)}
                className="w-full py-3.5 bg-slate-900 border-2 border-amber-500/30 text-slate-300 font-extrabold text-xs sm:text-sm rounded-2xl cursor-pointer hover:border-amber-400 hover:text-amber-300 transition flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>🔒 WAITING FOR GAME HOST TO LAUNCH SHOWDOWN... (HOST CODE)</span>
              </button>
            </div>
          )}
        </form>

        {/* POPUP MODAL WINDOW TO ADD MEMBER (SPACE-SAVING MOBILE OVERLAY) */}
          {addingToTeam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
              <div
                className={`w-full max-w-md bg-slate-900 border-2 ${
                  addingToTeam === 'team1' ? 'border-amber-400' : 'border-blue-400'
                } rounded-3xl p-5 shadow-2xl space-y-4 text-left`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className={`w-5 h-5 ${addingToTeam === 'team1' ? 'text-amber-400' : 'text-blue-400'}`} />
                    <div>
                      <h3 className="font-black text-white text-sm sm:text-base uppercase tracking-wider">
                        {selectedRole === 'host' || isHostVerified
                          ? `Add Test Member To ${addingToTeam === 'team1' ? team1Name : team2Name}`
                          : `Add Yourself To ${addingToTeam === 'team1' ? team1Name : team2Name}`}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {selectedRole === 'host' || isHostVerified
                          ? 'Game Host can add test players to either family.'
                          : 'You can add 1 member per phone/device.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAddingToTeam(null)}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {selectedRole === 'host' || isHostVerified ? 'Player Name / Nickname:' : 'Your Name / Nickname:'}
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Grandma Rose, Uncle Bob..."
                    className={`w-full font-bold text-sm px-3.5 py-2.5 rounded-xl outline-none transition ${
                      addingToTeam === 'team1'
                        ? 'bg-slate-950 border border-amber-500/50 text-amber-100 focus:border-amber-400'
                        : 'bg-slate-950 border border-blue-500/50 text-blue-100 focus:border-blue-400'
                    }`}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Choose Avatar Emoji:</label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-950 rounded-2xl border border-slate-800 scrollbar-thin">
                    {MEMBER_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewMemberEmoji(emoji)}
                        className={`text-xl p-2 rounded-xl border flex items-center justify-center transition active:scale-95 ${
                          newMemberEmoji === emoji
                            ? addingToTeam === 'team1'
                              ? 'bg-amber-500/40 border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/50'
                              : 'bg-blue-500/40 border-blue-400 scale-110 shadow-md ring-2 ring-blue-400/50'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddingToTeam(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMemberSubmit}
                    disabled={!newMemberName.trim()}
                    className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 ${
                      !newMemberName.trim()
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : addingToTeam === 'team1'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-400'
                    }`}
                  >
                    Save & Join Family
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT MEMBER MODAL */}
          {editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-black text-amber-300 text-sm uppercase">
                  <span>Edit Your Member Details</span>
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Member Name:</label>
                  <input
                    type="text"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full bg-slate-950 border border-amber-500/50 text-amber-100 font-bold text-sm px-3 py-2 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Select Emoji:</label>
                  <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-950 rounded-2xl border border-slate-800 scrollbar-thin">
                    {MEMBER_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setEditingMember({ ...editingMember, avatar: emoji })}
                        className={`text-xl p-2 rounded-xl border flex items-center justify-center transition ${
                          editingMember.avatar === emoji
                            ? 'bg-amber-500/30 border-amber-400 scale-110 ring-2 ring-amber-400/50'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateMemberSubmit}
                    className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Host Passcode Unlock Modal */}
          {showHostPasscodeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <form onSubmit={handlePasscodeSubmit} className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
                <div className="flex items-center justify-between font-black text-amber-300 text-sm uppercase">
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>Enter Host Passcode</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHostPasscodeModal(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {passcodeError && (
                  <p className="text-xs font-bold text-red-400 bg-red-950/80 p-2 rounded-lg border border-red-500/40">
                    Incorrect Passcode. Please try again.
                  </p>
                )}

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">Passcode:</label>
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => {
                      setPasscodeInput(e.target.value);
                      setPasscodeError(false);
                    }}
                    placeholder="Enter Passcode"
                    className="w-full bg-slate-950 border-2 border-amber-500/60 text-amber-100 font-mono font-black text-center text-lg py-2 rounded-xl outline-none"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Unlock HOSTING OPTION
                </button>
              </form>
            </div>
          )}
        </div>

        {/* TUTORIAL & HOW TO PLAY OPTION UNDER THE MENU CARD */}
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsTutorialOpen(true)}
            className="px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-extrabold text-xs rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>📖 How to Play & Game Tutorial</span>
          </button>
        </div>

        <GameTutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />
      </div>
    );
  };
