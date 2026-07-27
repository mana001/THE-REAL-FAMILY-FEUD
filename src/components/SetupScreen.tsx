import React, { useState } from 'react';
import { Trophy, Users, Bot, Tv, Sparkles, Play, Shield } from 'lucide-react';
import { GameMode, Team, GameSettings } from '../types';
import { FamilyIcon, ELEGANT_FAMILY_ICONS } from './FamilyIcon';

interface SetupScreenProps {
  onStartGame: (
    team1: Team,
    team2: Team,
    gameMode: GameMode,
    settings: GameSettings
  ) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
  const [team1Name, setTeam1Name] = useState('The Millers');
  const [team1Avatar, setTeam1Avatar] = useState('royal_shell');

  const [team2Name, setTeam2Name] = useState('The Johnsons');
  const [team2Avatar, setTeam2Avatar] = useState('monarch_crown');

  const [mode, setMode] = useState<GameMode>('classic');
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [enableFastMoney, setEnableFastMoney] = useState<boolean>(true);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();

    const t1: Team = {
      id: 'team1',
      name: team1Name.trim() || 'Team Red',
      score: 0,
      color: 'amber',
      avatar: team1Avatar,
      members: [
        { id: 'm1', name: 'Player 1 (You)', avatar: team1Avatar, role: 'captain', teamId: 'team1' },
        { id: 'm2', name: 'Uncle Bob', avatar: '🦁', role: 'member', teamId: 'team1', isCPU: true },
        { id: 'm3', name: 'Chloe', avatar: '👑', role: 'member', teamId: 'team1', isCPU: true },
      ],
    };

    const t2: Team = {
      id: 'team2',
      name: mode === 'solo' ? 'The AI Bytes' : team2Name.trim() || 'Team Blue',
      score: 0,
      color: 'blue',
      avatar: mode === 'solo' ? '🤖' : team2Avatar,
      members: [
        { id: 'm4', name: 'Mark', avatar: mode === 'solo' ? '🤖' : team2Avatar, role: 'captain', teamId: 'team2', isCPU: true },
        { id: 'm5', name: 'Aunt May', avatar: '🦉', role: 'member', teamId: 'team2', isCPU: true },
        { id: 'm6', name: 'Cousin Leo', avatar: '⚡', role: 'member', teamId: 'team2', isCPU: true },
      ],
    };

    const settings: GameSettings = {
      totalRounds,
      enableSound: true,
      enableFastMoney,
      aiDifficulty: 'medium',
      roomCode: 'FEUD-9000',
    };

    onStartGame(t1, t2, mode, settings);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border-4 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
        {/* Glowing Top Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest mb-3 shadow-lg">
            <Trophy className="w-5 h-5 fill-slate-950" />
            <span>UNDERTOPIA FEUD 🐌 STUDIO SETUP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-amber-100 drop-shadow">
            Create Your Teams & Choose Game Mode
          </h1>
        </div>

        <form onSubmit={handleLaunch} className="space-y-8">
          {/* Game Mode Selector */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-3">
              1. Select Game Mode:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Classic Team Battle */}
              <button
                type="button"
                onClick={() => setMode('classic')}
                className={`p-4 rounded-2xl border-2 transition text-left cursor-pointer flex flex-col justify-between ${
                  mode === 'classic'
                    ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-6 h-6 text-amber-400" />
                  {mode === 'classic' && <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />}
                </div>
                <h3 className="font-extrabold text-amber-100 text-base">Classic Team Battle</h3>
                <p className="text-xs text-slate-400 mt-1">
                  2 Teams pass & play face-offs, steals, and Fast Money round!
                </p>
              </button>

              {/* Solo Vs AI */}
              <button
                type="button"
                onClick={() => setMode('solo')}
                className={`p-4 rounded-2xl border-2 transition text-left cursor-pointer flex flex-col justify-between ${
                  mode === 'solo'
                    ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-400/40 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Bot className="w-6 h-6 text-blue-400" />
                  {mode === 'solo' && <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />}
                </div>
                <h3 className="font-extrabold text-amber-100 text-base">Single Player vs AI</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Play solo against AI team "The Bytes" with smart answer guesses!
                </p>
              </button>

              {/* Host TV Mode */}
              <button
                type="button"
                onClick={() => setMode('host_tv')}
                className={`p-4 rounded-2xl border-2 transition text-left cursor-pointer flex flex-col justify-between ${
                  mode === 'host_tv'
                    ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-400/40 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Tv className="w-6 h-6 text-indigo-400" />
                  {mode === 'host_tv' && <span className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />}
                </div>
                <h3 className="font-extrabold text-amber-100 text-base">Host TV Mode</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Display clean TV view for family while host controls screen!
                </p>
              </button>
            </div>
          </div>

          {/* Team Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team 1 Config */}
            <div className="bg-slate-900/80 border border-amber-500/40 p-5 rounded-2xl space-y-4">
              <h3 className="font-black text-amber-300 text-sm uppercase tracking-wider">
                Team 1 Configuration
              </h3>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Team Name:</label>
                <input
                  type="text"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 text-amber-100 font-bold text-sm px-4 py-2.5 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  Choose Elegant Family Emblem:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {ELEGANT_FAMILY_ICONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTeam1Avatar(item.id)}
                      title={`${item.label} - ${item.desc}`}
                      className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                        team1Avatar === item.id
                          ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-lg ring-2 ring-amber-400/50'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <FamilyIcon iconKey={item.id} size="sm" />
                      <span className="text-[8px] font-bold text-amber-200 truncate w-full text-center mt-1">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Team 2 Config */}
            <div className="bg-slate-900/80 border border-blue-500/40 p-5 rounded-2xl space-y-4">
              <h3 className="font-black text-blue-300 text-sm uppercase tracking-wider">
                {mode === 'solo' ? 'Opponent (AI Team)' : 'Team 2 Configuration'}
              </h3>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Team Name:</label>
                <input
                  type="text"
                  value={mode === 'solo' ? 'The AI Bytes' : team2Name}
                  disabled={mode === 'solo'}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-500/40 focus:border-blue-400 text-blue-100 font-bold text-sm px-4 py-2.5 rounded-xl outline-none disabled:opacity-60"
                />
              </div>

              {mode !== 'solo' && (
                <div>
                  <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
                    Choose Elegant Family Emblem:
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ELEGANT_FAMILY_ICONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTeam2Avatar(item.id)}
                        title={`${item.label} - ${item.desc}`}
                        className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                          team2Avatar === item.id
                            ? 'bg-blue-500/30 border-blue-400 scale-105 shadow-lg ring-2 ring-blue-400/50'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <FamilyIcon iconKey={item.id} size="sm" />
                        <span className="text-[8px] font-bold text-blue-200 truncate w-full text-center mt-1">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Options */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">Total Main Rounds:</span>
              <button
                type="button"
                onClick={() => setTotalRounds(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  totalRounds === 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                3 Rounds
              </button>
              <button
                type="button"
                onClick={() => setTotalRounds(4)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  totalRounds === 4 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                4 Rounds
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-amber-300">
              <input
                type="checkbox"
                checked={enableFastMoney}
                onChange={(e) => setEnableFastMoney(e.target.checked)}
                className="w-4 h-4 rounded border-amber-500 accent-amber-500"
              />
              <span>Include Fast Money Round ($20,000)</span>
            </label>
          </div>

          {/* Launch Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg rounded-2xl shadow-xl transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>START GAME SHOW</span>
          </button>
        </form>
      </div>
    </div>
  );
};
