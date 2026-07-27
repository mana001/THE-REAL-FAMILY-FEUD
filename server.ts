import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default Survey Questions for Rooms
const DEFAULT_QUESTIONS = [
  {
    id: "q_attic",
    question: "Name something you might find in a cluttered attic or basement.",
    category: "Household",
    answers: [
      { id: "attic_1", text: "Old Photo Albums", points: 38, revealed: false },
      { id: "attic_2", text: "Holiday Decorations", points: 26, revealed: false },
      { id: "attic_3", text: "Vintage Clothes / Costumes", points: 15, revealed: false },
      { id: "attic_4", text: "Old Books / Magazines", points: 11, revealed: false },
      { id: "attic_5", text: "Cobwebs & Spiders", points: 6, revealed: false },
      { id: "attic_6", text: "Unused Furniture", points: 4, revealed: false },
    ],
  },
  {
    id: "q_late_work",
    question: "Name a common excuse people give for being late to work.",
    category: "Workplace",
    answers: [
      { id: "late_1", text: "Heavy Traffic / Road Construction", points: 44, revealed: false },
      { id: "late_2", text: "Alarm Did Not Go Off", points: 28, revealed: false },
      { id: "late_3", text: "Car Trouble / Flat Tire", points: 14, revealed: false },
      { id: "late_4", text: "Doctor / Medical Appointment", points: 8, revealed: false },
      { id: "late_5", text: "Public Transit Delay", points: 4, revealed: false },
      { id: "late_6", text: "Spilled Coffee / Wardrobe Malfunction", points: 2, revealed: false },
    ],
  },
  {
    id: "q_camping",
    question: "Name something you take on a camping trip that you hope you won’t need.",
    category: "Outdoors",
    answers: [
      { id: "camp_1", text: "First Aid Kit / Band-Aids", points: 42, revealed: false },
      { id: "camp_2", text: "Bug Spray / Insect Repellent", points: 24, revealed: false },
      { id: "camp_3", text: "Rain Poncho / Umbrella", points: 18, revealed: false },
      { id: "camp_4", text: "Flashlight / Extra Batteries", points: 9, revealed: false },
      { id: "camp_5", text: "Bear Spray / Horn", points: 5, revealed: false },
      { id: "camp_6", text: "Snake Bite Kit", points: 2, revealed: false },
    ],
  },
  {
    id: "q_movie_theater",
    question: "Name something people buy at a movie theater snack stand.",
    category: "Entertainment",
    answers: [
      { id: "snack_1", text: "Popcorn", points: 52, revealed: false },
      { id: "snack_2", text: "Fountain Soda / Soft Drink", points: 27, revealed: false },
      { id: "snack_3", text: "Candy / Chocolate", points: 12, revealed: false },
      { id: "snack_4", text: "Nachos & Cheese", points: 5, revealed: false },
      { id: "snack_5", text: "Slushie / Icee", points: 3, revealed: false },
      { id: "snack_6", text: "Hot Dog", points: 1, revealed: false },
    ],
  },
  {
    id: "q_superhero",
    question: "Name a power almost every kid wishes they had.",
    category: "Pop Culture",
    answers: [
      { id: "super_1", text: "Flight / Flying", points: 46, revealed: false },
      { id: "super_2", text: "Invisibility", points: 29, revealed: false },
      { id: "super_3", text: "Super Strength", points: 12, revealed: false },
      { id: "super_4", text: "Teleportation", points: 7, revealed: false },
      { id: "super_5", text: "Mind Reading / Telepathy", points: 4, revealed: false },
      { id: "super_6", text: "Time Travel", points: 2, revealed: false },
    ],
  },
];

function matchSurveyAnswer(answers: any[], rawGuess: string) {
  const rawTerm = (rawGuess || "").trim();
  const term = rawTerm.toLowerCase();
  if (!term) return null;

  return answers.find((a: any) => {
    if (a.revealed) return false;
    const ansText = a.text.toLowerCase().trim();
    if (ansText === term) return true;

    // Handle slash/comma/ampersand separated alternatives e.g. "First Aid Kit / Band-Aids"
    const parts = ansText.split(/[\/\,\;\&]/).map((p: string) => p.trim());
    if (parts.some((p: string) => p.length > 1 && (p === term || term.includes(p) || (term.length >= 3 && p.includes(term))))) {
      return true;
    }

    if (term.length >= 3 && (ansText.includes(term) || term.includes(ansText))) {
      return true;
    }

    return false;
  }) || null;
}

// Room State Store for Multi-Device Multi-Player Synchronization
const rooms = new Map<string, any>();

function createDefaultRoomState(code: string) {
  const initialQuestions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
  return {
    code,
    mode: "multiplayer",
    stage: "role_select",
    currentRoundIndex: 0,
    questions: initialQuestions,
    currentQuestion: initialQuestions[0],
    team1: {
      id: "team1",
      name: "The Millers",
      score: 0,
      color: "amber",
      avatar: "👨‍👩‍👧‍👦",
      members: [],
    },
    team2: {
      id: "team2",
      name: "The Johnsons",
      score: 0,
      color: "blue",
      avatar: "🚀",
      members: [],
    },
    team1TurnIdx: 0,
    team2TurnIdx: 0,
    activeMemberId: "m1",
    controlTeamId: null,
    roundBankedPoints: 0,
    strikes: 0,
    faceoffWinnerTeamId: null,
    faceoffBuzzedTeamId: null,
    faceoffPhase: "waiting_buzz",
    faceoffGuessResult: null,
    stealAttempted: false,
    stealSuccess: null,
    fastMoneyEntries: [],
    fastMoneyTotalPoints: 0,
    fastMoneyWon: null,
    winningTeamId: null,
    guessLogs: [],
    team1RoundPoints: 0,
    team2RoundPoints: 0,
    lastRoundWinnerTeamId: null,
    lastAwardedPoints: 0,
    settings: {
      totalRounds: 3,
      enableSound: true,
      enableFastMoney: true,
      aiDifficulty: "medium",
      roomCode: code,
      countdownSeconds: 30,
    },
    hostBanter: "BUTTERFLY: Welcome to Family Feud! Select your family and let's play!",
    activePoll: null,
    isStealAcknowledged: false,
    firstPlayerTeam1Id: null,
    firstPlayerTeam2Id: null,
    huddleMessages: [
      {
        id: "msg_init",
        senderName: "BUTTERFLY",
        senderAvatar: "🦋",
        senderTeamId: "host",
        senderRole: "host",
        text: "LET THE GAME START. I WOB 🐰🍷",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isCheer: true,
      },
    ],
  };
}

function getOrCreateRoom(code: string) {
  const normalizedCode = (code || "FEUD-9000").trim().toUpperCase();
  if (!rooms.has(normalizedCode)) {
    rooms.set(normalizedCode, createDefaultRoomState(normalizedCode));
  }
  return rooms.get(normalizedCode);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "1mb" }));

  let aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // GET Room State Endpoint (For real-time multi-device polling)
  app.get("/api/room/:code", (req, res) => {
    const code = req.params.code;
    const roomState = getOrCreateRoom(code);
    res.json({ success: true, roomState });
  });

  // POST Join Room Endpoint
  app.post("/api/room/join", (req, res) => {
    const { roomCode, player, team1Members, team2Members, team1Name, team2Name, team1Avatar, team2Avatar } = req.body;
    const room = getOrCreateRoom(roomCode);

    if (team1Name) {
      room.team1.name = team1Name;
    }
    if (team2Name) {
      room.team2.name = team2Name;
    }
    if (team1Avatar) {
      room.team1.avatar = team1Avatar;
    }
    if (team2Avatar) {
      room.team2.avatar = team2Avatar;
    }

    if (team1Members && Array.isArray(team1Members)) {
      room.team1.members = team1Members;
    }
    if (team2Members && Array.isArray(team2Members)) {
      room.team2.members = team2Members;
    }

    if (player && player.name) {
      if (player.role === "team1_member") {
        let members = room.team1.members || [];
        const existingIdx = members.findIndex((m: any) => m.name.includes(player.name) || m.id === player.id);
        if (existingIdx >= 0) {
          members[existingIdx] = { ...members[existingIdx], name: `${player.name}`, avatar: player.avatar, isCPU: false };
        } else {
          const isCaptain = members.length === 0;
          members.unshift({ id: player.id, name: `${player.name}`, avatar: player.avatar, role: isCaptain ? "captain" : "member", teamId: "team1", isCPU: false });
        }
        room.team1.members = members;
      } else if (player.role === "team2_member") {
        let members = room.team2.members || [];
        const existingIdx = members.findIndex((m: any) => m.name.includes(player.name) || m.id === player.id);
        if (existingIdx >= 0) {
          members[existingIdx] = { ...members[existingIdx], name: `${player.name}`, avatar: player.avatar, isCPU: false };
        } else {
          const isCaptain = members.length === 0;
          members.unshift({ id: player.id, name: `${player.name}`, avatar: player.avatar, role: isCaptain ? "captain" : "member", teamId: "team2", isCPU: false });
        }
        room.team2.members = members;
      }
    }

    room.hostBanter = `BUTTERFLY: Welcome ${player.name} to the studio stage! Let's play the feud!`;

    res.json({ success: true, roomState: room });
  });

  // POST Room Actions Endpoint (Buzz, Guess, Pass/Play, Next Round, Chat)
  app.post("/api/room/action", (req, res) => {
    const { roomCode, action, payload } = req.body;
    const room = getOrCreateRoom(roomCode);

    if (action === "start_game") {
      room.stage = "category_select";
      room.currentRoundIndex = 0;
      room.strikes = 0;
      room.roundBankedPoints = 0;
      room.team1.score = 0;
      room.team2.score = 0;
      room.team1RoundPoints = 0;
      room.team2RoundPoints = 0;
      room.lastRoundWinnerTeamId = null;
      room.lastAwardedPoints = 0;
      room.controlTeamId = null;
      room.faceoffBuzzedTeamId = null;
      room.faceoffPhase = "waiting_buzz";
      room.activePoll = null;
      room.guessLogs = [];
      room.hostBanter = "BUTTERFLY: New Game Started! Discuss in chat! BUTTERFLY will select the category for Round 1!";
    } else if (action === "clear_logs") {
      room.guessLogs = [];
      room.hostBanter = "BUTTERFLY: Real-Time Answer Feed logs cleared!";
    } else if (action === "select_category") {
      const { questionId, categoryName } = payload;
      const foundQ =
        room.questions.find((q: any) => q.id === questionId) ||
        room.questions[room.currentRoundIndex] ||
        room.questions[0];
      room.currentQuestion = JSON.parse(JSON.stringify(foundQ));
      room.currentQuestion.answers.forEach((a: any) => (a.revealed = false));
      room.stage = "player_select";
      room.team1RoundPoints = 0;
      room.team2RoundPoints = 0;
      room.lastRoundWinnerTeamId = null;
      room.lastAwardedPoints = 0;
      room.faceoffBuzzedTeamId = null;
      room.faceoffPhase = "waiting_buzz";
      room.activePoll = null;
      room.hostBanter = `BUTTERFLY: Category selected - "${categoryName || room.currentQuestion.category}"! Each family choose your first player!`;
    } else if (action === "confirm_first_players") {
      const { p1Id, p2Id } = payload;
      if (p1Id) room.firstPlayerTeam1Id = p1Id;
      if (p2Id) room.firstPlayerTeam2Id = p2Id;
      room.stage = "faceoff";
      room.faceoffBuzzedTeamId = null;
      room.faceoffPhase = "waiting_buzz";
      room.activePoll = null;
      room.hostBanter = "BUTTERFLY: First players locked in! Get ready on your buzzers!";
    } else if (action === "buzz") {
      const { teamId, playerName } = payload;
      if (!room.faceoffBuzzedTeamId) {
        room.faceoffBuzzedTeamId = teamId;
        room.faceoffPhase = "answering";
        const teamName = teamId === "team1" ? room.team1.name : room.team2.name;
        room.hostBanter = `BUTTERFLY: ${playerName} from ${teamName} BUZZED IN FIRST! What's your answer?`;
      }
    } else if (action === "pass_or_play") {
      const { winnerTeamId, passOrPlay } = payload;
      const playingTeamId = passOrPlay === "play" ? winnerTeamId : winnerTeamId === "team1" ? "team2" : "team1";
      room.controlTeamId = playingTeamId;
      room.faceoffWinnerTeamId = winnerTeamId;
      room.stage = "playing";
      room.strikes = 0;
      room.activePoll = null;
      const playingName = playingTeamId === "team1" ? room.team1.name : room.team2.name;
      room.hostBanter = `BUTTERFLY: ${playingName} gets control of the survey board! Let's see those answers!`;
    } else if (action === "open_vote") {
      const { title, options, allowedTeamId } = payload;
      room.activePoll = {
        id: `poll_${Date.now()}`,
        title: title || "Cast Your Vote!",
        options: options || ["PLAY 🎮", "PASS 🛑"],
        allowedTeamId: allowedTeamId || "all",
        votes: {},
        voterIds: [],
        isOpen: true,
      };
      room.huddleMessages.push({
        id: `msg_poll_${Date.now()}`,
        senderName: "BUTTERFLY",
        senderAvatar: "🦋",
        senderTeamId: "host",
        senderRole: "host",
        text: `📊 VOTE OPENED: ${title || "Cast your vote below!"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } else if (action === "vote_poll" || action === "cast_vote") {
      const { optionIndex, playerId, playerTeamId } = payload;
      if (room.activePoll && room.activePoll.isOpen) {
        if (!room.activePoll.votes) room.activePoll.votes = {};
        if (!room.activePoll.voterIds) room.activePoll.voterIds = [];
        const pid = playerId || `p_${Date.now()}`;
        if (!room.activePoll.voterIds.includes(pid)) {
          room.activePoll.voterIds.push(pid);
          if (typeof optionIndex === 'number') {
            room.activePoll.votes[optionIndex] = (room.activePoll.votes[optionIndex] || 0) + 1;
          }
        }
      }
    } else if (action === "close_vote") {
      if (room.activePoll) {
        room.activePoll.isOpen = false;
      }
    } else if (action === "skip_round") {
      if (room.currentQuestion) {
        room.currentQuestion.answers.forEach((a: any) => (a.revealed = true));
      }
      const nextIdx = room.currentRoundIndex + 1;
      if (nextIdx >= room.settings.totalRounds) {
        const t1Score = room.team1.score;
        const t2Score = room.team2.score;
        room.winningTeamId = t1Score >= t2Score ? "team1" : "team2";
        if (room.settings.enableFastMoney) {
          room.stage = "fast_money_intro";
        } else {
          room.stage = "game_over";
        }
        room.hostBanter = `BUTTERFLY: Round skipped by BUTTERFLY! Moving to final results!`;
      } else {
        room.currentRoundIndex = nextIdx;
        room.stage = "category_select";
        room.controlTeamId = null;
        room.roundBankedPoints = 0;
        room.strikes = 0;
        room.faceoffBuzzedTeamId = null;
        room.faceoffPhase = "waiting_buzz";
        room.activePoll = null;
        room.hostBanter = `BUTTERFLY: Round skipped by BUTTERFLY! Moving to Round ${nextIdx + 1}!`;
      }
    } else if (action === "kick_member") {
      const { teamId, memberId } = payload;
      if (teamId === "team1") {
        const kicked = (room.team1.members || []).find((m: any) => m.id === memberId);
        room.team1.members = (room.team1.members || []).filter((m: any) => m.id !== memberId);
        if (room.team1.members.length > 0) {
          room.team1TurnIdx = room.team1TurnIdx % room.team1.members.length;
        } else {
          room.team1TurnIdx = 0;
        }
        if (kicked) {
          room.hostBanter = `BUTTERFLY (Host Action): Kicked ${kicked.name} from ${room.team1.name}!`;
        }
      } else if (teamId === "team2") {
        const kicked = (room.team2.members || []).find((m: any) => m.id === memberId);
        room.team2.members = (room.team2.members || []).filter((m: any) => m.id !== memberId);
        if (room.team2.members.length > 0) {
          room.team2TurnIdx = room.team2TurnIdx % room.team2.members.length;
        } else {
          room.team2TurnIdx = 0;
        }
        if (kicked) {
          room.hostBanter = `BUTTERFLY (Host Action): Kicked ${kicked.name} from ${room.team2.name}!`;
        }
      }
    } else if (action === "update_settings") {
      const { countdownSeconds, totalRounds } = payload;
      if (countdownSeconds !== undefined) {
        room.settings.countdownSeconds = countdownSeconds;
      }
      if (totalRounds !== undefined) {
        room.settings.totalRounds = totalRounds;
      }
    } else if (action === "submit_guess") {
      const { guessText, playerName, teamId } = payload;
      if (room.currentQuestion) {
        const answers = room.currentQuestion.answers;
        const matched = matchSurveyAnswer(answers, guessText);

        const currentMultiplier = room.currentRoundIndex === 2 ? 2 : room.currentRoundIndex >= 3 ? 3 : 1;

        // Resolve real active player name if default/missing
        let resolvedPlayerName = (playerName || "").trim();
        const activeTeamId = teamId || room.controlTeamId || "team1";
        if (!resolvedPlayerName || resolvedPlayerName === "Sarah" || resolvedPlayerName === "Player") {
          const activeMembers = activeTeamId === "team1" ? room.team1.members : room.team2.members;
          const turnIdx = activeTeamId === "team1" ? room.team1TurnIdx : room.team2TurnIdx;
          if (activeMembers && activeMembers.length > 0) {
            resolvedPlayerName = activeMembers[turnIdx % activeMembers.length]?.name || activeMembers[0]?.name || "Player 1";
          } else {
            resolvedPlayerName = activeTeamId === "team1" ? (room.team1.name + " Member") : (room.team2.name + " Member");
          }
        }

        // Record in guessLogs
        room.guessLogs = room.guessLogs || [];
        room.guessLogs.push({
          id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          playerName: resolvedPlayerName,
          teamId: activeTeamId,
          guessText: (guessText || "").trim(),
          matched: Boolean(matched),
          points: matched ? matched.points * currentMultiplier : 0,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          stage: room.stage,
          roundNumber: (room.currentRoundIndex || 0) + 1,
        });

        if (matched) {
          matched.revealed = true;
          const points = matched.points * currentMultiplier;
          room.roundBankedPoints += points;

          const activePlayingTeamId = room.controlTeamId || activeTeamId;
          if (activePlayingTeamId === "team1") {
            room.team1RoundPoints = (room.team1RoundPoints || 0) + points;
          } else if (activePlayingTeamId === "team2") {
            room.team2RoundPoints = (room.team2RoundPoints || 0) + points;
          }

          // Rotate turn
          if (room.controlTeamId === "team1") {
            room.team1TurnIdx = (room.team1TurnIdx + 1) % (room.team1.members.length || 1);
          } else if (room.controlTeamId === "team2") {
            room.team2TurnIdx = (room.team2TurnIdx + 1) % (room.team2.members.length || 1);
          }

          // Handle Steal Success or Continued Board Clearing in Steal Mode
          if (room.stage === "steal") {
            const allRevealed = answers.every((a: any) => a.revealed);
            if (allRevealed) {
              const t1Pts = room.team1RoundPoints || 0;
              const t2Pts = room.team2RoundPoints || 0;
              let winnerTeamId: "team1" | "team2" = "team1";
              if (t1Pts > t2Pts) {
                winnerTeamId = "team1";
              } else if (t2Pts > t1Pts) {
                winnerTeamId = "team2";
              } else {
                winnerTeamId = (room.controlTeamId || "team1") as "team1" | "team2";
              }

              const winnerName = winnerTeamId === "team1" ? room.team1.name : room.team2.name;
              const loserName = winnerTeamId === "team1" ? room.team2.name : room.team1.name;
              const winPts = winnerTeamId === "team1" ? t1Pts : t2Pts;
              const losePts = winnerTeamId === "team1" ? t2Pts : t1Pts;
              const awarded = room.roundBankedPoints;

              if (winnerTeamId === "team1") {
                room.team1.score += awarded;
              } else {
                room.team2.score += awarded;
              }
              room.lastRoundWinnerTeamId = winnerTeamId;
              room.lastAwardedPoints = awarded;
              room.roundBankedPoints = 0;
              room.stage = "round_end";
              room.hostBanter = `BUTTERFLY: BOARD CLEARED! ${winnerName} accumulated higher points this round (${winPts} vs ${losePts} PTS) and wins +${awarded} PTS!`;
            } else {
              const stealWinId = room.controlTeamId;
              const stealWinName = stealWinId === "team1" ? room.team1.name : room.team2.name;
              room.stage = "steal";
              room.hostBanter = `BUTTERFLY: PERFECT GUESS BY ${stealWinName}! "${matched.text}" IS ON THE BOARD! +${points} PTS banked! Keep guessing to clear the board!`;
            }
          } else {
            const activeName = activePlayingTeamId === "team1" ? room.team1.name : room.team2.name;
            room.hostBanter = `BUTTERFLY: "${matched.text}" IS ON THE BOARD! +${points} points added to the Round Bank for ${activeName}!`;

            // Check if all answers revealed
            const allRevealed = answers.every((a: any) => a.revealed);
            if (allRevealed && room.controlTeamId) {
              const t1Pts = room.team1RoundPoints || 0;
              const t2Pts = room.team2RoundPoints || 0;
              let winnerTeamId: "team1" | "team2" = "team1";
              if (t1Pts > t2Pts) {
                winnerTeamId = "team1";
              } else if (t2Pts > t1Pts) {
                winnerTeamId = "team2";
              } else {
                winnerTeamId = (room.controlTeamId || "team1") as "team1" | "team2";
              }

              const winnerName = winnerTeamId === "team1" ? room.team1.name : room.team2.name;
              const loserName = winnerTeamId === "team1" ? room.team2.name : room.team1.name;
              const winPts = winnerTeamId === "team1" ? t1Pts : t2Pts;
              const losePts = winnerTeamId === "team1" ? t2Pts : t1Pts;
              const awarded = room.roundBankedPoints;

              if (winnerTeamId === "team1") {
                room.team1.score += awarded;
              } else {
                room.team2.score += awarded;
              }
              room.lastRoundWinnerTeamId = winnerTeamId;
              room.lastAwardedPoints = awarded;
              room.roundBankedPoints = 0;
              room.stage = "round_end";
              room.hostBanter = `BUTTERFLY: BOARD CLEARED! ${winnerName} accumulated higher points this round (${winPts} vs ${losePts} PTS) and wins +${awarded} PTS!`;
            }
          }
        } else {
          // Strike X - 0 Points for wrong answers!
          room.strikes += 1;

          // Rotate turn
          if (room.controlTeamId === "team1") {
            room.team1TurnIdx = (room.team1TurnIdx + 1) % (room.team1.members.length || 1);
          } else if (room.controlTeamId === "team2") {
            room.team2TurnIdx = (room.team2TurnIdx + 1) % (room.team2.members.length || 1);
          }

          if (room.strikes >= 3 && room.stage === "playing") {
            const originalTeamId = room.controlTeamId;
            room.originalPlayingTeamId = originalTeamId;
            const origName = originalTeamId === "team1" ? room.team1.name : room.team2.name;
            
            const stealTeamId = originalTeamId === "team1" ? "team2" : "team1";
            room.controlTeamId = stealTeamId;
            room.stage = "steal";
            room.isStealAcknowledged = false;
            room.strikes = 0; // RESET STRIKES TO ZERO FOR SECOND FAMILY!
            const stealName = stealTeamId === "team1" ? room.team1.name : room.team2.name;

            room.hostBanter = `BUTTERFLY: 3 STRIKES for ${origName}! ${stealName} gets CONTROL to guess remaining answers!`;
          } else if (room.stage === "steal") {
            const stealName = room.controlTeamId === "team1" ? room.team1.name : room.team2.name;
            const origTeamId = room.originalPlayingTeamId || (room.controlTeamId === "team1" ? "team2" : "team1");
            const origName = origTeamId === "team1" ? room.team1.name : room.team2.name;

            if (room.strikes < 3) {
              room.hostBanter = `BUTTERFLY: STRIKE ${room.strikes} FOR ${stealName}! "${guessText}" was NOT on the board! Try again (${3 - room.strikes} tries left)!`;
            } else {
              // Both families couldn't figure out all answers!
              // Requirement 3: MAKE THE FAMILY WITH MOST POINTS WIN THE ROUND
              room.currentQuestion.answers.forEach((a: any) => (a.revealed = true));
              room.stage = "round_end";

              const t1Pts = room.team1RoundPoints || 0;
              const t2Pts = room.team2RoundPoints || 0;

              let roundWinnerId: "team1" | "team2" = "team1";
              if (t2Pts > t1Pts) {
                roundWinnerId = "team2";
              } else if (t1Pts > t2Pts) {
                roundWinnerId = "team1";
              } else {
                roundWinnerId = (origTeamId || "team1") as "team1" | "team2";
              }

              const winnerName = roundWinnerId === "team1" ? room.team1.name : room.team2.name;
              const awarded = room.roundBankedPoints;

              if (roundWinnerId === "team1") {
                room.team1.score += awarded;
              } else {
                room.team2.score += awarded;
              }
              room.lastRoundWinnerTeamId = roundWinnerId;
              room.lastAwardedPoints = awarded;
              room.roundBankedPoints = 0;

              room.hostBanter = `BUTTERFLY: BOTH FAMILIES GOT 3 STRIKES! ${winnerName} accumulated the most points this round (${roundWinnerId === "team1" ? t1Pts : t2Pts} vs ${roundWinnerId === "team1" ? t2Pts : t1Pts} PTS) and wins the round (+${awarded} PTS)!`;
            }
          } else {
            room.hostBanter = `BUTTERFLY: STRIKE ${room.strikes}! "${guessText}" was NOT on the board!`;
          }
        }
      }
    } else if (action === "acknowledge_steal") {
      room.isStealAcknowledged = true;
      const stealName = room.controlTeamId === "team1" ? room.team1.name : room.team2.name;
      room.hostBanter = `BUTTERFLY: NOW IS THE ${stealName.toUpperCase()} FAMILY CHANCE! Let's clear the board!`;
    } else if (action === "award_points") {
      const { teamId } = payload;
      if (teamId === "team1") {
        room.team1.score += room.roundBankedPoints;
      } else {
        room.team2.score += room.roundBankedPoints;
      }
      room.roundBankedPoints = 0;
      room.currentQuestion.answers.forEach((a: any) => (a.revealed = true));
      room.stage = "round_end";
    } else if (action === "next_round") {
      const nextIdx = room.currentRoundIndex + 1;
      if (nextIdx >= room.settings.totalRounds) {
        const t1Score = room.team1.score;
        const t2Score = room.team2.score;
        room.winningTeamId = t1Score >= t2Score ? "team1" : "team2";
        if (room.settings.enableFastMoney) {
          room.stage = "fast_money_intro";
        } else {
          room.stage = "game_over";
        }
      } else {
        room.currentRoundIndex = nextIdx;
        room.stage = "category_select";
        room.controlTeamId = null;
        room.roundBankedPoints = 0;
        room.strikes = 0;
        room.faceoffBuzzedTeamId = null;
        room.faceoffPhase = "waiting_buzz";
        room.activePoll = null;
        room.hostBanter = `BUTTERFLY: Round ${nextIdx + 1}! Discuss in chat while BUTTERFLY selects the category!`;
      }
    } else if (action === "go_home") {
      const fresh = createDefaultRoomState(roomCode);
      rooms.set(roomCode, fresh);
      return res.json({ success: true, roomState: fresh });
    } else if (action === "reset_game") {
      const fresh = createDefaultRoomState(roomCode);
      rooms.set(roomCode, fresh);
      return res.json({ success: true, roomState: fresh });
    } else if (action === "send_chat") {
      const { senderName, senderAvatar, text, isCheer, senderTeamId, senderRole } = payload;
      const newMsg = {
        id: `msg_${Date.now()}`,
        senderName: senderRole === "host" || senderTeamId === "host" ? "BUTTERFLY" : senderName,
        senderAvatar: senderRole === "host" || senderTeamId === "host" ? "🦋" : senderAvatar,
        senderTeamId: senderTeamId || "audience",
        senderRole: senderRole || "audience",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isCheer,
      };
      room.huddleMessages.push(newMsg);
      if (room.huddleMessages.length > 50) {
        room.huddleMessages.shift();
      }

      // Check if Host typed "[CATEGORY VOTE]", "[GAME VOTE]", or "[OPEN THE VOTE]"
      if (text && (senderRole === "host" || senderTeamId === "host" || (senderName && senderName.toUpperCase().includes("BUTTERFLY")))) {
        if (text.includes("[CATEGORY VOTE]") || (text.includes("[OPEN THE VOTE]") && room.stage === "category_select")) {
          room.activePoll = {
            id: `poll_${Date.now()}`,
            title: "[CATEGORY VOTE] Which Category Should We Play?",
            options: ["Household 🏠", "Workplace 💼", "Outdoors ⛺", "Pop Culture ⚡"],
            allowedTeamId: "all",
            votes: {},
            voterIds: [],
            isOpen: true,
          };
        } else if (text.includes("[GAME VOTE]") || text.includes("[OPEN THE VOTE]")) {
          const winTeamId = room.faceoffBuzzedTeamId || "team1";
          const winTeamName = winTeamId === "team1" ? room.team1.name : room.team2.name;
          room.activePoll = {
            id: `poll_${Date.now()}`,
            title: `[GAME VOTE] ${winTeamName}: Should We PLAY or PASS?`,
            options: ["PLAY 🎮", "PASS 🛑"],
            allowedTeamId: winTeamId,
            votes: {},
            voterIds: [],
            isOpen: true,
          };
        }
      }
    } else if (action === "toggle_pause") {
      room.isPaused = !room.isPaused;
      room.hostBanter = room.isPaused
        ? "BUTTERFLY: GAME PAUSED. Take a quick break!"
        : "BUTTERFLY: GAME RESUMED! Let's get back to the feud!";
      // Add pause notification message to studio chat
      room.huddleMessages.push({
        id: `msg_pause_${Date.now()}`,
        senderName: "BUTTERFLY",
        senderAvatar: "🦋",
        senderTeamId: "host",
        senderRole: "host",
        text: room.isPaused ? "⏸️ GAME PAUSED BY BUTTERFLY. Studio Chat remains open!" : "▶️ GAME RESUMED BY BUTTERFLY!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isCheer: true,
      });
    } else if (action === "generate_room_code") {
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      room.settings.roomCode = newCode;
      room.hostBanter = `BUTTERFLY: Generated new Room Code: ${newCode}`;
      room.huddleMessages.push({
        id: `msg_code_${Date.now()}`,
        senderName: "BUTTERFLY",
        senderAvatar: "🦋",
        senderTeamId: "host",
        senderRole: "host",
        text: `🔑 NEW ROOM CODE: ${newCode}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isCheer: true,
      });
    } else if (action === "host_reveal_answer") {
      const { answerId } = payload;
      if (room.currentQuestion && room.currentQuestion.answers) {
        const mult = room.currentQuestion.multiplier || 1;
        const ans = room.currentQuestion.answers.find((a: any) => a.id === answerId);
        if (ans && !ans.revealed) {
          ans.revealed = true;
          const pts = (ans.points || 0) * mult;
          room.roundBankedPoints += pts;
          if (room.controlTeamId === "team1") {
            room.team1.score += pts;
          } else if (room.controlTeamId === "team2") {
            room.team2.score += pts;
          }
          room.hostBanter = `BUTTERFLY (Host Action): Manually revealed "${ans.text}" (+${pts} PTS)!`;
        }
      }
    } else if (action === "host_add_points") {
      const { teamId, points, target } = payload;
      const pts = Number(points) || 0;
      if (target === "round" || teamId === "bank") {
        room.roundBankedPoints = Math.max(0, (room.roundBankedPoints || 0) + pts);
        if (teamId === "team1") {
          room.team1RoundPoints = Math.max(0, (room.team1RoundPoints || 0) + pts);
        } else if (teamId === "team2") {
          room.team2RoundPoints = Math.max(0, (room.team2RoundPoints || 0) + pts);
        }
        const name = teamId === "team1" ? room.team1.name : teamId === "team2" ? room.team2.name : "Round Bank";
        room.hostBanter = `BUTTERFLY (Host Action): Added +${pts} PTS to ${name}'s Round Bank Score!`;
      } else if (teamId === "team1" && room.team1) {
        room.team1.score = Math.max(0, room.team1.score + pts);
        room.hostBanter = `BUTTERFLY (Host Action): Added +${pts} PTS to ${room.team1.name}'s Total Game Score!`;
      } else if (teamId === "team2" && room.team2) {
        room.team2.score = Math.max(0, room.team2.score + pts);
        room.hostBanter = `BUTTERFLY (Host Action): Added +${pts} PTS to ${room.team2.name}'s Total Game Score!`;
      }
    } else if (action === "host_set_control") {
      const { teamId } = payload;
      if (teamId === "team1" || teamId === "team2") {
        room.controlTeamId = teamId;
        const teamName = teamId === "team1" ? room.team1.name : room.team2.name;
        room.hostBanter = `BUTTERFLY (Host Action): Granted control to ${teamName}!`;
      }
    } else if (action === "host_set_member_turn") {
      const { teamId, memberIdx } = payload;
      if (teamId === "team1" && room.team1) {
        room.team1TurnIdx = Math.max(0, Number(memberIdx) || 0);
        const memberName = room.team1.members[room.team1TurnIdx % (room.team1.members.length || 1)]?.name || "Player";
        room.hostBanter = `BUTTERFLY (Host Action): Set ${room.team1.name} active player turn to ${memberName}!`;
      } else if (teamId === "team2" && room.team2) {
        room.team2TurnIdx = Math.max(0, Number(memberIdx) || 0);
        const memberName = room.team2.members[room.team2TurnIdx % (room.team2.members.length || 1)]?.name || "Player";
        room.hostBanter = `BUTTERFLY (Host Action): Set ${room.team2.name} active player turn to ${memberName}!`;
      }
    } else if (action === "host_add_strike") {
      room.strikes = Math.min(3, room.strikes + 1);
      room.hostBanter = `BUTTERFLY (Host Action): Strike added! (${room.strikes}/3)`;
      if (room.strikes >= 3 && room.stage === "playing") {
        const stealTeamId = room.controlTeamId === "team1" ? "team2" : "team1";
        room.controlTeamId = stealTeamId;
        room.stage = "steal";
        room.strikes = 0; // Reset strikes to 0 for second family!
        const stealName = stealTeamId === "team1" ? room.team1.name : room.team2.name;
        room.hostBanter = `BUTTERFLY: 3 STRIKES! ${stealName} gets CONTROL to guess and STEAL! (3 Tries Allowed!)`;
      }
    } else if (action === "host_subtract_strike") {
      room.strikes = Math.max(0, room.strikes - 1);
      room.hostBanter = `BUTTERFLY (Host Action): Removed 1 strike! (${room.strikes}/3 remaining)`;
    } else if (action === "host_clear_strikes") {
      room.strikes = 0;
      room.hostBanter = "BUTTERFLY (Host Action): All strikes cleared!";
    }

    res.json({ success: true, roomState: room });
  });

  // AI Survey Question Generator Endpoint
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { topic, count = 4 } = req.body;
      const topicPrompt = topic && typeof topic === "string" ? topic.trim() : "General Party & Pop Culture";

      const ai = getGenAI();
      const prompt = `Generate ${count} funny and engaging Family Feud style survey questions for the theme/topic: "${topicPrompt}". 
Each question must have between 4 and 8 top survey answers with realistic points (summing up to roughly 100 points per question, sorted descending by points).
The answers should be short, concise phrases (1-4 words).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a professional comedy game show writer for Family Feud. Create clear, hilarious, family-friendly or pop-culture survey questions with top realistic survey answers and point values.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of survey questions for Family Feud",
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: "The survey question prompt, e.g. 'Name something people lose in their couch cushions'",
                },
                answers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: {
                        type: Type.STRING,
                        description: "Short answer name, capitalized nicely",
                      },
                      points: {
                        type: Type.INTEGER,
                        description: "Survey points awarded (e.g. 42)",
                      },
                    },
                    required: ["text", "points"],
                  },
                },
              },
              required: ["question", "answers"],
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response generated from AI.");
      }

      const questionsData = JSON.parse(responseText);
      const processedQuestions = questionsData.map((q: any, idx: number) => ({
        id: `gen_${Date.now()}_${idx}`,
        question: q.question,
        answers: (q.answers || []).map((ans: any, aIdx: number) => ({
          id: `ans_${Date.now()}_${idx}_${aIdx}`,
          text: ans.text,
          points: Number(ans.points) || 10,
          revealed: false,
        })),
      }));

      res.json({ success: true, questions: processedQuestions });
    } catch (err: any) {
      console.error("Error generating survey questions:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to generate AI survey questions.",
      });
    }
  });

  // AI Host Banter Endpoint
  app.post("/api/host-banter", async (req, res) => {
    try {
      const { eventType, playerGuess, questionText, points } = req.body;
      const ai = getGenAI();

      let contextPrompt = "";
      if (eventType === "strike") {
        contextPrompt = `A player guessed "${playerGuess}" for the question "${questionText}", but it was NOT on the board (Strike X!). Give a funny, shocked 1-2 sentence Steve Harvey style host reaction!`;
      } else if (eventType === "good_answer") {
        contextPrompt = `A player guessed "${playerGuess}" for "${questionText}" and got ${points} points! Give an enthusiastic, comedic 1-2 sentence host reaction!`;
      } else {
        contextPrompt = `Give a hilarious 1-2 sentence game show host greeting to hype up the studio audience and families!`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contextPrompt,
        config: {
          systemInstruction:
            "You are Steve Harvey, the iconic, hilarious, expressive host of Family Feud. Keep commentary short (1-2 sentences max), punchy, comedic, and full of personality!",
        },
      });

      res.json({ success: true, commentary: response.text || "Survey says!" });
    } catch (err: any) {
      res.json({ success: true, commentary: "Survey says! What an answer, folks!" });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
