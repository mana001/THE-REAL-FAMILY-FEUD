export interface SurveyAnswer {
  id: string;
  text: string;
  points: number;
  revealed?: boolean;
  playerNum?: 1 | 2; // For fast money attribution
}

export interface SurveyQuestion {
  id: string;
  question: string;
  answers: SurveyAnswer[];
  multiplier?: number; // 1x, 2x, 3x
  category?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: 'captain' | 'member';
  teamId: 'team1' | 'team2';
  isCPU?: boolean;
  isReady?: boolean;
  scoreContrib?: number;
}

export interface Team {
  id: 'team1' | 'team2';
  name: string;
  score: number;
  color: string; // tailwind color or hex
  avatar: string;
  members: FamilyMember[];
  strikeCount?: number;
}

export type PlayerRole = 'team1_member' | 'team2_member' | 'audience' | 'host';

export interface CurrentPlayer {
  id: string;
  name: string;
  avatar: string;
  role: PlayerRole;
  teamId?: 'team1' | 'team2';
  isCaptain?: boolean;
}

export type GameMode = 'classic' | 'multiplayer' | 'host_tv';

export type GameStage =
  | 'role_select'
  | 'lobby'
  | 'category_select'
  | 'player_select'
  | 'faceoff'
  | 'playing'
  | 'steal'
  | 'round_end'
  | 'fast_money_intro'
  | 'fast_money_p1'
  | 'fast_money_p2'
  | 'fast_money_summary'
  | 'game_over';

export interface ChatPollOption {
  text: string;
  count: number;
}

export interface ActivePoll {
  id: string;
  title: string;
  options: string[];
  allowedTeamId?: 'team1' | 'team2' | 'both' | 'all';
  votes?: Record<string, any> | number[];
  voterIds?: string[];
  isOpen?: boolean;
}

export interface ChatPoll {
  id: string;
  title: string;
  options: string[];
  allowedTeamId?: 'team1' | 'team2' | 'all';
  votes: Record<string, string>; // userId or name -> optionText
  isOpen: boolean;
}

export interface FastMoneyEntry {
  questionId: string;
  questionText: string;
  player1Answer?: string;
  player1Points?: number;
  player2Answer?: string;
  player2Points?: number;
}

export interface GameSettings {
  totalRounds: number; // 3 to 10
  countdownSeconds?: number; // 0 (No countdown) to 60s
  enableSound: boolean;
  enableFastMoney: boolean;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  roomCode: string;
  customTopic?: string;
}

export interface HuddleMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderTeamId: 'team1' | 'team2' | 'audience' | 'host';
  senderRole?: PlayerRole;
  text: string;
  timestamp: string;
  isCheer?: boolean;
}

export interface GuessLog {
  id: string;
  playerName: string;
  teamId?: 'team1' | 'team2' | 'audience' | 'host';
  guessText: string;
  matched: boolean;
  points: number;
  timestamp: string;
  stage?: string;
}

export interface GameState {
  mode: GameMode;
  stage: GameStage;
  currentRoundIndex: number;
  questions: SurveyQuestion[];
  currentQuestion: SurveyQuestion | null;
  team1: Team;
  team2: Team;
  team1TurnIdx: number;
  team2TurnIdx: number;
  activeMemberId: string | null;
  controlTeamId: 'team1' | 'team2' | null;
  roundBankedPoints: number;
  strikes: number; // 0, 1, 2, 3
  faceoffWinnerTeamId: 'team1' | 'team2' | null;
  faceoffBuzzedTeamId: 'team1' | 'team2' | null;
  faceoffPhase?: 'waiting_buzz' | 'answering' | 'decision' | 'opp_steal';
  faceoffGuessResult?: {
    answerText: string;
    points: number;
    isTopAnswer: boolean;
  } | null;
  stealAttempted: boolean;
  stealSuccess: boolean | null;
  fastMoneyEntries: FastMoneyEntry[];
  fastMoneyTotalPoints: number;
  fastMoneyWon: boolean | null;
  winningTeamId: 'team1' | 'team2' | null;
  settings: GameSettings;
  hostBanter: string | null;
  huddleMessages: HuddleMessage[];
  guessLogs?: GuessLog[];
  activePoll?: ChatPoll | null;
  isPaused?: boolean;
  isStealAcknowledged?: boolean;
  firstPlayerTeam1Id?: string | null;
  firstPlayerTeam2Id?: string | null;
  team1RoundPoints?: number;
  team2RoundPoints?: number;
  lastRoundWinnerTeamId?: 'team1' | 'team2' | null;
  lastAwardedPoints?: number;
}
