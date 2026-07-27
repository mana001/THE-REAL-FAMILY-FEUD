import React, { useState } from 'react';
import { Volume2, VolumeX, RefreshCw, Trophy, X, Check, KeyRound, Home, Settings, SkipForward, Crown, Pause, Play, UserCheck, Repeat } from 'lucide-react';
import { GameMode, GameStage, Team, GameSettings } from '../types';
import { FamilyIcon } from './FamilyIcon';
import { FamilyMembersModal } from './FamilyMembersModal';
import { ButterflyIcon } from './ButterflyIcon';
import { soundManager } from '../utils/soundEffects';

interface StudioHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome: () => void;
  onResetGame: () => void;
  onUpdateSettings?: (countdownSeconds: number, totalRounds: number) => void;
  onSkipRound?: () => void;
  onTogglePause?: () => void;
  isPaused?: boolean;
  gameMode: GameMode;
  stage: GameStage;
  team1: Team;
  team2: Team;
  currentRoundIndex: number;
  settings?: GameSettings;
  roomCode?: string;
  isHostVerified?: boolean;
  onVerifyHost?: () => void;
  onGenerateRoomCode?: () => void;
  onToggleRole?: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onGoHome,
  onResetGame,
  onUpdateSettings,
  onSkipRound,
  onTogglePause,
  isPaused = false,
  gameMode,
  stage,
  team1,
  team2,
  currentRoundIndex,
  settings,
  roomCode = 'FEUD-9000',
  isHostVerified = false,
  onVerifyHost,
  onGenerateRoomCode,
  onToggleRole,
}) => {
  const [selectedTeamModal, setSelectedTeamModal] = useState<Team | null>(null);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [hostCodeInput, setHostCodeInput] = useState('');
  const [hostError, setHostError] = useState<string | null>(null);

  const [countdownInput, setCountdownInput] = useState<number>(settings?.countdownSeconds ?? 30);
  const [totalRoundsInput, setTotalRoundsInput] = useState<number>(settings?.totalRounds ?? 3);

  const handleVerifyHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostCodeInput.trim().toUpperCase() === 'HOST') {
      soundManager.playDing();
      if (onVerifyHost) onVerifyHost();
      setIsHostModalOpen(false);
      setHostError(null);
      setHostCodeInput('');
    } else {
      soundManager.playBuzzer();
      setHostError('Incorrect host passcode. Please try again.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSettings) {
      onUpdateSettings(countdownInput, totalRoundsInput);
    }
    setIsSettingsModalOpen(false);
  };

  return (
    <header className="relative z-20 w-full bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 border-b border-amber-500/30 shadow-2xl px-4 py-3">
      {/* Studio Lights Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 animate-pulse" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Game Title Logo & Room Code */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={onGoHome}>
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-gradient-to-b from-blue-900 to-slate-900 border-2 border-amber-400 text-amber-300 px-4 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
              <span className="font-extrabold tracking-wider text-base sm:text-lg uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent drop-shadow flex items-center gap-1">
                Undertopia Feud 🐌
              </span>
            </div>
          </div>

          {/* Round Indicator Pill */}
          {stage !== 'role_select' && stage !== 'game_over' && (
            <div className="bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {stage.includes('fast_money') ? (
                <span className="text-amber-400 font-bold uppercase tracking-wider">Fast Money Round</span>
              ) : (
                <span>
                  Round <strong className="text-amber-300">{currentRoundIndex + 1}</strong> of {settings?.totalRounds || 3}
                </span>
              )}
            </div>
          )}
        </div>



        {/* Control Action Buttons */}
        <div className="flex items-center gap-2">
          {/* HOME Button */}
          <button
            id="home-btn"
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg border border-blue-400/30 transition active:scale-95 cursor-pointer"
            title="Restart Game & Return to Start"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">HOME</span>
          </button>

          {/* Host Skip Round Button */}
          {isHostVerified && onSkipRound && stage !== 'role_select' && stage !== 'game_over' && (
            <button
              id="skip-round-btn"
              onClick={onSkipRound}
              className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 font-black text-xs uppercase rounded-lg shadow transition active:scale-95 cursor-pointer flex items-center gap-1"
              title="Skip Current Round"
            >
              <SkipForward className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline">SKIP ROUND</span>
            </button>
          )}

          {/* Host Pause Toggle Button */}
          {isHostVerified && onTogglePause && stage !== 'role_select' && stage !== 'game_over' && (
            <button
              id="host-pause-btn"
              onClick={onTogglePause}
              className={`px-2.5 py-1.5 font-black text-xs uppercase rounded-lg shadow transition active:scale-95 cursor-pointer flex items-center gap-1 border ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 animate-pulse'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-300'
              }`}
              title={isPaused ? 'Resume Game' : 'Pause Game'}
            >
              {isPaused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-slate-950" />}
              <span className="hidden sm:inline">{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>
          )}

          {/* Host Settings Button (Dynamic Countdown & Rounds) */}
          {isHostVerified && (
            <button
              id="host-settings-btn"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              title="Change Countdown Timer & Total Rounds"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Settings</span>
            </button>
          )}

          {/* Sound Mute Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
              soundEnabled
                ? 'bg-blue-900/50 border-blue-500/40 text-blue-300 hover:bg-blue-800/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Role Toggle Button for Studio AI Preview Testing */}
          {onToggleRole && (
            <button
              id="header-role-toggle-btn"
              onClick={onToggleRole}
              className={`px-3 py-1.5 rounded-lg border text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95 ${
                isHostVerified
                  ? 'bg-amber-500 text-slate-950 border-amber-300 hover:bg-amber-400'
                  : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900'
              }`}
              title="Click to instantly switch between Player Mode and Host Mode"
            >
              <Repeat className="w-3.5 h-3.5 animate-spin-slow shrink-0" />
              <span className="hidden sm:inline">ROLE:</span>
              <span className="uppercase font-extrabold">{isHostVerified ? 'HOST 🎤' : 'PLAYER 👤'}</span>
            </button>
          )}

          {/* Host Verification Button */}
          <button
            id="host-hat-btn"
            onClick={() => setIsHostModalOpen(true)}
            className={`p-2 px-3 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              isHostVerified
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
            }`}
            title={isHostVerified ? 'Verified BUTTERFLY' : 'Identify as BUTTERFLY'}
          >
            <Crown className={`w-4 h-4 ${isHostVerified ? 'text-slate-950' : 'text-amber-400'}`} />
            {isHostVerified ? (
              <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
                BUTTERFLY <ButterflyIcon className="w-3.5 h-3.5 text-slate-950" />
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Roster Modal */}
      <FamilyMembersModal
        isOpen={!!selectedTeamModal}
        onClose={() => setSelectedTeamModal(null)}
        team={selectedTeamModal}
      />

      {/* Host Settings Modal (Countdown & Total Rounds) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-400 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3 mb-4">
              <div className="p-2.5 bg-amber-500/20 border border-amber-400/50 rounded-2xl text-amber-400">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-amber-200 text-base uppercase tracking-wider">
                  BUTTERFLY Live Game Settings
                </h3>
                <p className="text-xs text-slate-400">Adjust countdown timer & total rounds during the match</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Countdown Timer:
                  </label>
                  <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2 py-1 rounded border border-amber-500/30">
                    {countdownInput === 0 ? 'NO COUNTDOWN' : `${countdownInput} SECONDS`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={countdownInput}
                  onChange={(e) => setCountdownInput(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                  <span>0s (Off)</span>
                  <span>10s</span>
                  <span>20s</span>
                  <span>30s</span>
                  <span>40s</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Total Rounds:
                  </label>
                  <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2 py-1 rounded border border-amber-500/30">
                    {totalRoundsInput} ROUNDS
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={totalRoundsInput}
                  onChange={(e) => setTotalRoundsInput(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                  <span>3 Rounds</span>
                  <span>5 Rounds</span>
                  <span>7 Rounds</span>
                  <span>10 Rounds</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg transition active:scale-95 cursor-pointer"
              >
                Apply BUTTERFLY Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Host Verification Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-400 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                setIsHostModalOpen(false);
                setHostError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3 mb-4">
              <div className="p-2.5 bg-amber-500/20 border border-amber-400/50 rounded-2xl text-amber-400">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-amber-200 text-base uppercase tracking-wider">
                  BUTTERFLY Verification
                </h3>
                <p className="text-xs text-slate-400">Enter passcode (HOST) to claim host controls</p>
              </div>
            </div>

            {isHostVerified ? (
              <div className="text-center py-4 space-y-3">
                <div className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-2xl font-black text-xs uppercase">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="flex items-center gap-1">
                    YOU ARE VERIFIED AS BUTTERFLY <ButterflyIcon className="w-4 h-4 text-amber-300" />!
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  You hold host privileges for Undertopia Feud Showdown.
                </p>
                <button
                  type="button"
                  onClick={() => setIsHostModalOpen(false)}
                  className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyHostSubmit} className="space-y-4">
                {hostError && (
                  <div className="p-3 bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold rounded-xl animate-shake">
                    {hostError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
                    BUTTERFLY Passcode Code:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={hostCodeInput}
                      onChange={(e) => setHostCodeInput(e.target.value)}
                      placeholder="Enter Passcode"
                      className="w-full bg-slate-950 border-2 border-amber-400 text-amber-200 font-mono font-black text-center text-lg py-2.5 px-4 rounded-xl outline-none tracking-widest uppercase placeholder:text-slate-600"
                      autoFocus
                    />
                    <KeyRound className="w-5 h-5 text-amber-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg cursor-pointer transition active:scale-95"
                >
                  Verify BUTTERFLY Passcode
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

