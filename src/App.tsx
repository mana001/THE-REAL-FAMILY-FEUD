/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { StudioHeader } from './components/StudioHeader';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { HuddleChatPanel } from './components/HuddleChatPanel';
import { FamilyIcon } from './components/FamilyIcon';

import { FeudBoard } from './components/FeudBoard';
import { BuzzerFaceoff } from './components/BuzzerFaceoff';
import { FastMoney } from './components/FastMoney';
import { FamilyRosterPanel } from './components/FamilyRosterPanel';
import { CategorySelectScreen } from './components/CategorySelectScreen';
import { FirstPlayerSelectScreen } from './components/FirstPlayerSelectScreen';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { GameOverModal } from './components/GameOverModal';
import { HostAnswerLogBubble } from './components/HostAnswerLogBubble';
import { ButterflyIcon } from './components/ButterflyIcon';
import { Pause, Play, Crown, Clock } from 'lucide-react';

import { DEFAULT_SURVEY_QUESTIONS } from './data/defaultQuestions';
import {
  GameState,
  SurveyQuestion,
  CurrentPlayer,
  FamilyMember,
  HuddleMessage,
} from './types';
import { soundManager } from './utils/soundEffects';

export default function App() {
  const [roomCode, setRoomCode] = useState('FEUD-9000');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isHostVerified, setIsHostVerified] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasClickedProceedToRoundSummary, setHasClickedProceedToRoundSummary] = useState(false);

  // Active Player Identity & Saved Profile for Role Toggling
  const [savedPlayerProfile, setSavedPlayerProfile] = useState<CurrentPlayer>({
    id: `p_${Date.now()}`,
    name: 'Player 1',
    avatar: '👨‍👩‍👧‍👦',
    role: 'team1_member',
    teamId: 'team1',
    isCaptain: true,
  });

  const [currentPlayer, setCurrentPlayer] = useState<CurrentPlayer>({
    id: `p_${Date.now()}`,
    name: 'Player 1',
    avatar: '👨‍👩‍👧‍👦',
    role: 'team1_member',
    teamId: 'team1',
    isCaptain: true,
  });

  const handleVerifyHost = () => {
    setIsHostVerified(true);
    setCurrentPlayer((prev) => ({
      ...prev,
      name: 'Game Host 🎤',
      avatar: '🎤',
      role: 'host',
      teamId: undefined,
    }));
  };

  // Instant Role Toggle between Player Mode and Host Mode
  const handleToggleRoleMode = () => {
    if (isHostVerified || currentPlayer.role === 'host') {
      // Switch from Host Mode back to Player Mode
      setIsHostVerified(false);
      const targetPlayer = savedPlayerProfile || {
        id: `p_player`,
        name: 'Player 1',
        avatar: '👨‍👩‍👧‍👦',
        role: 'team1_member',
        teamId: 'team1',
        isCaptain: true,
      };
      setCurrentPlayer(targetPlayer);
      soundManager.playClick();
    } else {
      // Switch from Player Mode to Host Mode
      if (currentPlayer.role !== 'host') {
        setSavedPlayerProfile(currentPlayer);
      }
      setIsHostVerified(true);
      setCurrentPlayer({
        id: 'host_studio_user',
        name: 'Game Host 🎤',
        avatar: '🎤',
        role: 'host',
        teamId: undefined,
      });
      soundManager.playDing();
    }
  };

  // Core Game State
  const [gameState, setGameState] = useState<GameState>({
    mode: 'multiplayer',
    stage: 'role_select',
    currentRoundIndex: 0,
    questions: DEFAULT_SURVEY_QUESTIONS,
    currentQuestion: DEFAULT_SURVEY_QUESTIONS[0],
    team1: {
      id: 'team1',
      name: 'The Millers',
      score: 0,
      color: 'amber',
      avatar: '👨‍👩‍👧‍👦',
      members: [],
    },
    team2: {
      id: 'team2',
      name: 'The Johnsons',
      score: 0,
      color: 'blue',
      avatar: '🚀',
      members: [],
    },
    team1TurnIdx: 0,
    team2TurnIdx: 0,
    activeMemberId: 'm1',
    controlTeamId: null,
    roundBankedPoints: 0,
    strikes: 0,
    faceoffWinnerTeamId: null,
    faceoffBuzzedTeamId: null,
    stealAttempted: false,
    stealSuccess: null,
    fastMoneyEntries: [],
    fastMoneyTotalPoints: 0,
    fastMoneyWon: null,
    winningTeamId: null,
    settings: {
      totalRounds: 3,
      enableSound: true,
      enableFastMoney: true,
      aiDifficulty: 'medium',
      roomCode: 'FEUD-9000',
    },
    hostBanter: 'Steve Harvey: Welcome to Family Feud! Log in from your phone and enter the showdown!',
    huddleMessages: [
      {
        id: 'msg_init',
        senderName: 'Steve Harvey (Host)',
        senderAvatar: '🎙️',
        senderTeamId: 'audience',
        text: 'Welcome families! Connect from your phone to play along live!',
        timestamp: '12:00 PM',
        isCheer: true,
      },
    ],
  });

  // Automatically trigger suspense music during active gameplay stages
  useEffect(() => {
    if (['faceoff', 'playing', 'steal', 'fast_money_1', 'fast_money_2'].includes(gameState.stage)) {
      soundManager.startSuspenseMusic();
    } else {
      soundManager.stopSuspenseMusic();
    }
  }, [gameState.stage]);

  // Sound Toggle Handler
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  // Real-Time Multi-Device Room State Synchronization Polling
  useEffect(() => {
    let isSubscribed = true;

    const pollRoomState = async () => {
      try {
        const res = await fetch(`/api/room/${roomCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.roomState && isSubscribed) {
            setGameState(data.roomState);
          }
        }
      } catch (err) {
        // Fallback gracefully on fetch error
      }
    };

    pollRoomState();
    const interval = setInterval(pollRoomState, 800);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [roomCode]);

  // Dispatch Action to Express Server Room Manager
  const sendRoomAction = async (action: string, payload: any = {}) => {
    try {
      const res = await fetch('/api/room/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, action, payload }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.roomState) {
          setGameState(data.roomState);
        }
      }
    } catch (err) {
      console.error('Error sending room action:', err);
    }
  };

  // Join Room from Role Selection Screen
  const handleJoinRoom = async (
    player: CurrentPlayer,
    team1Members: FamilyMember[],
    team2Members: FamilyMember[],
    code: string,
    team1Name?: string,
    team2Name?: string,
    team1Avatar?: string,
    team2Avatar?: string
  ) => {
    if (player.role !== 'host') {
      setSavedPlayerProfile(player);
    }
    setCurrentPlayer(player);
    setRoomCode(code);

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: code,
          player,
          team1Members,
          team2Members,
          team1Name,
          team2Name,
          team1Avatar,
          team2Avatar,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.roomState) {
          setGameState(data.roomState);
          // Start game from role selection
          sendRoomAction('start_game');
        }
      }
    } catch (err) {
      console.error('Error joining room:', err);
    }

    soundManager.playWinFanfare();
  };

  // Calculate current round multiplier
  const currentMultiplier =
    gameState.currentRoundIndex === 2 ? 2 : gameState.currentRoundIndex >= 3 ? 3 : 1;

  // Handle Face-off Buzzing
  const handleFaceoffBuzz = (teamId: 'team1' | 'team2') => {
    soundManager.playFaceoffBuzzer();
    sendRoomAction('buzz', { teamId, playerName: currentPlayer.name });
  };

  // Handle Face-off Winner decision (Play or Pass)
  const handleFaceoffWinner = (winnerTeamId: 'team1' | 'team2', passOrPlay: 'play' | 'pass') => {
    sendRoomAction('pass_or_play', { winnerTeamId, passOrPlay });
  };

  // Single Unified Function to handle general chat messages and game guess submissions
  const handleUserSubmission = (
    inputText: string,
    options?: {
      isCheer?: boolean;
      isGuessOnly?: boolean;
      playerName?: string;
      teamId?: 'team1' | 'team2';
    }
  ) => {
    const text = (inputText || '').trim();
    if (!text) return;

    const playerName = options?.playerName || currentPlayer.name;
    const teamId = options?.teamId || currentPlayer.teamId || gameState.controlTeamId || 'team1';

    // 1. Process General Chat Message (unless flagged as guess-only submission)
    if (!options?.isGuessOnly) {
      const optimisticMsg: HuddleMessage = {
        id: `msg_${Date.now()}`,
        senderName: playerName,
        senderAvatar: currentPlayer.avatar,
        senderTeamId: currentPlayer.role === 'host' ? 'host' : (teamId || 'audience'),
        senderRole: currentPlayer.role,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCheer: options?.isCheer,
      };

      setGameState((prev) => ({
        ...prev,
        huddleMessages: [...(prev.huddleMessages || []), optimisticMsg].slice(-50),
      }));

      sendRoomAction('send_chat', {
        senderName: playerName,
        senderAvatar: currentPlayer.avatar,
        senderTeamId: currentPlayer.role === 'host' ? 'host' : (teamId || 'audience'),
        senderRole: currentPlayer.role,
        text,
        isCheer: options?.isCheer,
      });
    }

    // 2. Process Game Guess Submission
    const isGuessStage = ['playing', 'steal', 'faceoff'].includes(gameState.stage);
    const isExplicitGuess = Boolean(options?.isGuessOnly);

    if (isExplicitGuess || (isGuessStage && !options?.isCheer)) {
      sendRoomAction('submit_guess', {
        guessText: text,
        playerName,
        teamId,
      });
    }
  };

  // Unified delegates
  const handleSubmitGuess = (guessText: string, playerName?: string, teamId?: 'team1' | 'team2') => {
    handleUserSubmission(guessText, { isGuessOnly: true, playerName, teamId });
  };

  const handleSendMessage = (text: string, isCheer?: boolean) => {
    handleUserSubmission(text, { isCheer });
  };

  const handleRevealAnswer = (answerId: string) => {
    sendRoomAction('host_reveal_answer', { answerId });
  };

  // Add Strike (X)
  const handleAddStrike = () => {
    soundManager.playBuzzer();
    sendRoomAction('submit_guess', {
      guessText: 'INCORRECT_GUESS_STRIKE',
      playerName: currentPlayer.name,
      teamId: currentPlayer.teamId || 'team1',
    });
  };

  // Directly Award Banked Points to a Team & Advance Round
  const handleAwardPointsToTeam = (teamId: 'team1' | 'team2') => {
    sendRoomAction('award_points', { teamId });
  };

  // Kick member mid game
  const handleKickMember = (teamId: 'team1' | 'team2', memberId: string) => {
    sendRoomAction('kick_member', { teamId, memberId });
  };

  // Advance to Next Round or Fast Money
  const handleNextRound = () => {
    sendRoomAction('next_round');
  };

  // Complete Fast Money
  const handleCompleteFastMoney = (won: boolean, totalPoints: number) => {
    setGameState((prev) => ({
      ...prev,
      fastMoneyWon: won,
      fastMoneyTotalPoints: totalPoints,
      stage: 'game_over',
    }));
  };

  // AI Survey Questions Generator Callback
  const handleAIQuestionsGenerated = (newQuestions: SurveyQuestion[]) => {
    sendRoomAction('reset_game');
    soundManager.playWinFanfare();
  };

  // Compute Turn Info
  const activeTeam = gameState.controlTeamId === 'team1' ? gameState.team1 : gameState.controlTeamId === 'team2' ? gameState.team2 : null;
  const activeTurnMember = activeTeam
    ? gameState.controlTeamId === 'team1'
      ? activeTeam.members[gameState.team1TurnIdx % activeTeam.members.length]
      : activeTeam.members[gameState.team2TurnIdx % activeTeam.members.length]
    : null;

  const isYourTurn = activeTurnMember && activeTurnMember.name.includes(currentPlayer.name);

  const isHost = currentPlayer.role === 'host' || currentPlayer.teamId === 'host';

  // Determine if current user belongs to Family 1 or Family 2 (Hosts NEVER belong to family 1 or 2)
  const isTeam1Member =
    !isHost &&
    (currentPlayer.role === 'team1_member' ||
      currentPlayer.teamId === 'team1' ||
      Boolean(
        gameState.team1?.members &&
        gameState.team1.members.some(
          (m) => m.id === currentPlayer.id
        )
      ));

  const isTeam2Member =
    !isHost &&
    (currentPlayer.role === 'team2_member' ||
      currentPlayer.teamId === 'team2' ||
      Boolean(
        gameState.team2?.members &&
        gameState.team2.members.some(
          (m) => m.id === currentPlayer.id
        )
      ));

  // Determine which team currently has active control/turn to answer on the board
  let currentTurnTeamId: 'team1' | 'team2' | null = null;

  if (gameState.stage === 'playing' || gameState.stage === 'steal') {
    currentTurnTeamId = gameState.controlTeamId || null;
  } else if (gameState.stage === 'faceoff') {
    const faceoffPhase = gameState.faceoffPhase || 'waiting_buzz';
    if (faceoffPhase === 'answering' && gameState.faceoffBuzzedTeamId) {
      currentTurnTeamId = gameState.faceoffBuzzedTeamId;
    } else if (faceoffPhase === 'opp_steal' && gameState.faceoffBuzzedTeamId) {
      currentTurnTeamId = gameState.faceoffBuzzedTeamId === 'team1' ? 'team2' : 'team1';
    } else {
      currentTurnTeamId = null;
    }
  }

  // Chat is strictly disabled ONLY for members of the family whose turn it currently is to answer on the board!
  // Game Host can ALWAYS type in chat when ANY family is playing!
  const isChatDisabledForUser =
    !isHost &&
    Boolean(
      (isTeam1Member && currentTurnTeamId === 'team1') ||
      (isTeam2Member && currentTurnTeamId === 'team2')
    );

  const winnerTeam = gameState.winningTeamId === 'team2' ? gameState.team2 : gameState.team1;
  const loserTeam = gameState.winningTeamId === 'team2' ? gameState.team1 : gameState.team2;

  useEffect(() => {
    if (gameState.stage !== 'round_end') {
      setHasClickedProceedToRoundSummary(false);
    }
  }, [gameState.stage, gameState.currentRoundIndex]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      {/* Studio Header */}
      <StudioHeader
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onGoHome={() => {
          sendRoomAction('go_home');
          setGameState((prev) => ({ ...prev, stage: 'role_select' }));
        }}
        onResetGame={() => sendRoomAction('reset_game')}
        onUpdateSettings={(countdownSeconds, totalRounds) => {
          if (!isHostVerified) return;
          sendRoomAction('update_settings', { countdownSeconds, totalRounds });
        }}
        onSkipRound={() => {
          if (!isHostVerified) return;
          sendRoomAction('skip_round');
        }}
        onTogglePause={() => {
          if (!isHostVerified) return;
          sendRoomAction('toggle_pause');
        }}
        isPaused={gameState.isPaused}
        gameMode={gameState.mode}
        stage={gameState.stage}
        team1={gameState.team1}
        team2={gameState.team2}
        currentRoundIndex={gameState.currentRoundIndex}
        settings={gameState.settings}
        roomCode={gameState.settings?.roomCode || roomCode}
        isHostVerified={isHostVerified}
        onVerifyHost={handleVerifyHost}
        onToggleRole={handleToggleRoleMode}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {/* ROLE SELECTION & ROOM LOBBY */}
        {gameState.stage === 'role_select' && (
          <RoleSelectScreen
            onJoinRoom={handleJoinRoom}
            isHostVerified={isHostVerified}
            onVerifyHost={handleVerifyHost}
          />
        )}

        {/* ACTIVE GAMEPLAY BOARD VIEWS */}
        {gameState.stage !== 'role_select' && (
          <div className="w-full flex flex-col items-center justify-center">
            {/* FIRST PLAYER SELECTION STAGE */}
            {gameState.stage === 'player_select' && (
              <FirstPlayerSelectScreen
                team1={gameState.team1}
                team2={gameState.team2}
                currentPlayer={currentPlayer}
                firstPlayerTeam1Id={gameState.firstPlayerTeam1Id}
                firstPlayerTeam2Id={gameState.firstPlayerTeam2Id}
                onSelectFirstPlayer={(teamId, memberId) =>
                  sendRoomAction('select_first_player', { teamId, memberId })
                }
                onConfirmFirstPlayers={() => sendRoomAction('confirm_first_players')}
              />
            )}

            {/* CATEGORY SELECTION STAGE (HOST SELECTIONS) */}
            {gameState.stage === 'category_select' && (
              <CategorySelectScreen
                questions={gameState.questions && gameState.questions.length > 0 ? gameState.questions : DEFAULT_SURVEY_QUESTIONS}
                currentRoundIndex={gameState.currentRoundIndex}
                currentPlayer={currentPlayer}
                team1={gameState.team1}
                team2={gameState.team2}
                onSelectCategory={(questionId, categoryName) =>
                  sendRoomAction('select_category', { questionId, categoryName })
                }
                onOpenVote={() =>
                  sendRoomAction('send_chat', {
                    senderName: currentPlayer.name,
                    senderAvatar: currentPlayer.avatar,
                    senderTeamId: 'host',
                    senderRole: 'host',
                    text: '[OPEN THE VOTE]',
                  })
                }
              />
            )}

            {/* FACEOFF BUZZER SHOWDOWN */}
            {gameState.stage === 'faceoff' && gameState.currentQuestion && (
              <BuzzerFaceoff
                question={gameState.currentQuestion}
                team1={gameState.team1}
                team2={gameState.team2}
                currentPlayer={currentPlayer}
                serverBuzzedTeamId={gameState.faceoffBuzzedTeamId}
                onFaceoffBuzz={handleFaceoffBuzz}
                onRevealAnswer={handleRevealAnswer}
                onFaceoffWinner={handleFaceoffWinner}
                onSubmitGuess={handleSubmitGuess}
                countdownSeconds={gameState.settings?.countdownSeconds ?? 30}
                isHostVerified={isHost || isHostVerified}
                onKickMember={handleKickMember}
                onSetMemberTurn={(teamId, memberIdx) => sendRoomAction('host_set_member_turn', { teamId, memberIdx })}
                team1RoundPoints={gameState.team1RoundPoints}
                team2RoundPoints={gameState.team2RoundPoints}
              />
            )}

            {/* MAIN FEUD BOARD (PLAYING, STEAL, & UNREVEALED ROUND_END VIEW) */}
            {((gameState.stage === 'playing' || gameState.stage === 'steal') ||
              (gameState.stage === 'round_end' && !hasClickedProceedToRoundSummary)) &&
              gameState.currentQuestion && (
                <FeudBoard
                  question={gameState.currentQuestion}
                  roundBankedPoints={gameState.roundBankedPoints}
                  strikes={gameState.strikes}
                  team1={gameState.team1}
                  team2={gameState.team2}
                  controlTeamId={gameState.controlTeamId}
                  stage={gameState.stage}
                  currentPlayer={currentPlayer}
                  team1TurnIdx={gameState.team1TurnIdx}
                  team2TurnIdx={gameState.team2TurnIdx}
                  team1RoundPoints={gameState.team1RoundPoints}
                  team2RoundPoints={gameState.team2RoundPoints}
                  lastRoundWinnerTeamId={gameState.lastRoundWinnerTeamId}
                  lastAwardedPoints={gameState.lastAwardedPoints}
                  onRevealAnswer={handleRevealAnswer}
                  onAddStrike={handleAddStrike}
                  onSubmitGuess={handleSubmitGuess}
                  onAwardPointsToTeam={handleAwardPointsToTeam}
                  multiplier={currentMultiplier}
                  currentRoundIndex={gameState.currentRoundIndex}
                  totalRounds={gameState.settings?.totalRounds ?? 3}
                  countdownSeconds={gameState.settings?.countdownSeconds ?? 30}
                  isHostVerified={isHost || isHostVerified}
                  onKickMember={handleKickMember}
                  isPaused={gameState.isPaused}
                  isStealAcknowledged={gameState.isStealAcknowledged}
                  onAcknowledgeSteal={() => sendRoomAction('acknowledge_steal')}
                  onHostAddPoints={(teamId, points, target) => sendRoomAction('host_add_points', { teamId, points, target })}
                  onHostSetControl={(teamId) => sendRoomAction('host_set_control', { teamId })}
                  onHostSetMemberTurn={(teamId, memberIdx) => sendRoomAction('host_set_member_turn', { teamId, memberIdx })}
                  onHostSubtractStrike={() => sendRoomAction('host_subtract_strike')}
                  onHostClearStrikes={() => sendRoomAction('host_clear_strikes')}
                  onProceedToRoundEndSummary={() => setHasClickedProceedToRoundSummary(true)}
                />
              )}
          </div>
        )}

        {/* FLOATING BLUE SIDE BUBBLE CHAT PANEL */}
        {gameState.stage !== 'role_select' && (
          <HuddleChatPanel
            player={currentPlayer}
            messages={gameState.huddleMessages}
            onSendMessage={handleSendMessage}
            isChatDisabled={isChatDisabledForUser}
            activePoll={gameState.activePoll}
            controlTeamId={gameState.controlTeamId}
            stage={gameState.stage}
            team1={gameState.team1}
            team2={gameState.team2}
            onVote={(optionIndex) =>
              sendRoomAction('vote_poll', { optionIndex, playerId: currentPlayer.id })
            }
            onOpenChange={setIsChatOpen}
          />
        )}

        {/* HOST PRIVATE LIVE ANSWER LOG BUBBLE ON THE LEFT */}
        {gameState.stage !== 'role_select' && !isChatOpen && (
          <HostAnswerLogBubble
            currentPlayer={currentPlayer}
            isHostVerified={isHostVerified}
            guessLogs={gameState.guessLogs || []}
            onHostAddPoints={(teamId, points) => sendRoomAction('host_add_points', { teamId, points })}
            onClearLogs={() => sendRoomAction('clear_logs')}
          />
        )}

        {/* GAME PAUSED OVERLAY (STRICTLY FOR PLAYERS ONLY - HOST GETS CHAT MSG) */}
        {gameState.isPaused && !isHost && !isHostVerified && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border-4 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto mb-4">
                <Pause className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-300 uppercase tracking-wide mb-2 flex items-center justify-center gap-2">
                <span>GAME IS PAUSED BY BUTTERFLY</span>
                <ButterflyIcon className="w-7 h-7 text-amber-400 inline" />
              </h2>
              <p className="text-sm text-slate-300 font-medium mb-4">
                Take a quick break! The host has paused the live game. Studio Chat is still open below to talk with everyone!
              </p>
            </motion.div>
          </div>
        )}

        {/* ROUND END SUMMARY CARD (APPEARS ONLY WHEN PROCEED IS CLICKED) */}
        {gameState.stage === 'round_end' && hasClickedProceedToRoundSummary && (
          <div className="w-full max-w-xl bg-slate-900 border-4 border-amber-500 p-8 rounded-3xl text-center shadow-2xl my-6">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 uppercase tracking-wide">
              Round {gameState.currentRoundIndex + 1} Complete!
            </h2>

            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 my-6 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <FamilyIcon iconKey={gameState.team1.avatar} size="md" />
                <div className="font-extrabold text-amber-300 text-sm mt-1">{gameState.team1.name}</div>
                <div className="font-mono text-2xl font-black text-amber-400">{gameState.team1.score} PTS</div>
              </div>

              <div className="text-amber-500 font-black">VS</div>

              <div className="flex flex-col items-center">
                <FamilyIcon iconKey={gameState.team2.avatar} size="md" />
                <div className="font-extrabold text-blue-300 text-sm mt-1">{gameState.team2.name}</div>
                <div className="font-mono text-2xl font-black text-blue-400">{gameState.team2.score} PTS</div>
              </div>
            </div>

            {isHost ? (
              <button
                onClick={handleNextRound}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-base rounded-2xl shadow-xl transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-300"
              >
                <Crown className="w-5 h-5 text-slate-950" />
                <span>ADVANCE TO NEXT ROUND (HOST)</span>
              </button>
            ) : (
              <div className="w-full py-3.5 bg-slate-950 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-inner">
                <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <span>Waiting for Host BUTTERFLY to advance to next round...</span>
              </div>
            )}
          </div>
        )}

        {/* FAST MONEY ROUND */}
        {gameState.stage.includes('fast_money') && (
          <FastMoney
            questions={gameState.questions.slice(0, 5)}
            onCompleteFastMoney={handleCompleteFastMoney}
          />
        )}

        {/* GAME OVER MODAL */}
        {gameState.stage === 'game_over' && (
          <GameOverModal
            winnerTeam={winnerTeam}
            loserTeam={loserTeam}
            fastMoneyWon={gameState.fastMoneyWon}
            fastMoneyPoints={gameState.fastMoneyTotalPoints}
            onPlayAgain={() => sendRoomAction('reset_game')}
          />
        )}
      </main>

      {/* Gemini AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onQuestionsGenerated={handleAIQuestionsGenerated}
      />
    </div>
  );
}
