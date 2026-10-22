import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Player, PlayerId, Candy, CandyType, GamePhase, GameMode, DrawnCircle } from './types';
import { Dice3D } from './components/Dice3D';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { CircleConceptModal } from './components/CircleConceptModal';
import { GameOverModal } from './components/GameOverModal';
import { sound } from './utils/audio';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  RotateCcw,
  Users,
  Bot,
  Sparkles,
  Award,
  ChevronRight,
  Compass,
  CheckCircle2,
} from 'lucide-react';

const CANDY_POOL: Array<{ type: CandyType; points: number; name: string; color: string }> = [
  { type: 'swirl', points: 1, name: '회오리 사탕', color: '#f43f5e' },
  { type: 'jelly', points: 1, name: '젤리빈', color: '#10b981' },
  { type: 'star', points: 2, name: '별사탕', color: '#fbbf24' },
  { type: 'heart', points: 2, name: '하트 사탕', color: '#ec4899' },
  { type: 'crown', points: 3, name: '황금 왕관 사탕', color: '#eab308' },
  { type: 'rainbow', points: 4, name: '무지개 롤리팝', color: '#8b5cf6' },
];

const INITIAL_PLAYERS: Record<PlayerId, Player> = {
  p1: {
    id: 'p1',
    name: '블루 레오',
    avatar: '🦁',
    themeColor: 'sky',
    badgeBg: 'bg-sky-50',
    borderColor: 'border-sky-400',
    compassColor: '#0284c7',
    pencilColor: '#0284c7',
    score: 0,
    candyCount: 0,
    isBot: false,
  },
  p2: {
    id: 'p2',
    name: '핑크 로라',
    avatar: '🐰',
    themeColor: 'rose',
    badgeBg: 'bg-rose-50',
    borderColor: 'border-rose-400',
    compassColor: '#e11d48',
    pencilColor: '#e11d48',
    score: 0,
    candyCount: 0,
    isBot: false,
  },
};

const COLS = 20;
const ROWS = 14;

function generateInitialCandies(count = 68): Candy[] {
  const positions = new Set<string>();
  const candies: Candy[] = [];

  while (candies.length < count) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    const key = `${x},${y}`;

    if (!positions.has(key)) {
      positions.add(key);
      const template = CANDY_POOL[Math.floor(Math.random() * CANDY_POOL.length)];
      candies.push({
        id: `candy-${Math.random().toString(36).substring(2, 9)}`,
        x,
        y,
        type: template.type,
        points: template.points,
        name: template.name,
        color: template.color,
      });
    }
  }

  return candies;
}

export default function App() {
  // Game Setup
  const [gameMode, setGameMode] = useState<GameMode>('2p');
  const [maxRounds, setMaxRounds] = useState<number>(5);
  const [round, setRound] = useState<number>(1);
  const [activeTurn, setActiveTurn] = useState<PlayerId>('p1');
  const [phase, setPhase] = useState<GamePhase>('ROLL_DICE');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Players
  const [players, setPlayers] = useState<Record<PlayerId, Player>>(INITIAL_PLAYERS);

  // Candies & Radius
  const [candies, setCandies] = useState<Candy[]>(() => generateInitialCandies());
  const [currentRadius, setCurrentRadius] = useState<number | null>(null);
  const [lastDrawnCircle, setLastDrawnCircle] = useState<DrawnCircle | null>(null);

  // Feedback Notification Banner
  const [turnFeedback, setTurnFeedback] = useState<{
    text: string;
    subText: string;
    points: number;
    count: number;
    visible: boolean;
  } | null>(null);

  // Modals
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  // Handle Game Mode switch
  const handleModeChange = (mode: GameMode) => {
    sound.playClick();
    setGameMode(mode);
    setPlayers((prev) => ({
      ...prev,
      p2: {
        ...prev.p2,
        name: mode === 'vs_bot' ? '다람이 봇' : '핑크 로라',
        avatar: mode === 'vs_bot' ? '🐿️' : '🐰',
        isBot: mode === 'vs_bot',
      },
    }));
    restartGame();
  };

  // Full Restart
  const restartGame = useCallback(() => {
    sound.playClick();
    setPlayers((prev) => ({
      p1: { ...prev.p1, score: 0, candyCount: 0 },
      p2: { ...prev.p2, score: 0, candyCount: 0 },
    }));
    setCandies(generateInitialCandies());
    setRound(1);
    setActiveTurn('p1');
    setCurrentRadius(null);
    setLastDrawnCircle(null);
    setTurnFeedback(null);
    setPhase('ROLL_DICE');
    setIsGameOverModalOpen(false);
  }, []);

  // Sound toggle
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playClick();
  };

  // Step 1: Dice Roll Completed
  const handleRollComplete = (radius: number) => {
    setCurrentRadius(radius);
    setPhase('SELECT_CENTER');
  };

  // Step 2: Compass 360° circle drawing completed on board
  const handleCircleCompleted = (
    capturedCandies: Candy[],
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    const earnedPoints = capturedCandies.reduce((sum, c) => sum + c.points, 0);

    // Update Player Score
    setPlayers((prev) => ({
      ...prev,
      [activeTurn]: {
        ...prev[activeTurn],
        score: prev[activeTurn].score + earnedPoints,
        candyCount: prev[activeTurn].candyCount + capturedCandies.length,
      },
    }));

    // Record drawn circle
    const circleInfo: DrawnCircle = {
      id: `circle-${Date.now()}`,
      playerId: activeTurn,
      centerX,
      centerY,
      radius,
      candyCount: capturedCandies.length,
      pointsEarned: earnedPoints,
    };
    setLastDrawnCircle(circleInfo);

    // Educational & scoring feedback
    const activePlayer = players[activeTurn];
    const isZero = radius === 0;

    setTurnFeedback({
      text: isZero
        ? `${activePlayer.name}님, 꽝! (다음 기회에)`
        : `${activePlayer.name}님이 사탕 ${capturedCandies.length}개 획득! (+${earnedPoints}점)`,
      subText: isZero
        ? `컴퍼스를 벌리지 못해 사탕을 획득하지 못했어요! 다음 기회에 힘내봐요!`
        : `원의 중심 (${centerX}, ${centerY})에 침을 꽂고 반지름 ${radius}cm로 그렸어요! (지름 = ${radius * 2}cm)`,
      points: earnedPoints,
      count: capturedCandies.length,
      visible: true,
    });

    setPhase('COLLECTING');

    // Remove captured candies and respawn new ones
    setTimeout(() => {
      setCandies((prev) => {
        const remaining = prev.filter((c) => !capturedCandies.some((cap) => cap.id === c.id));
        // Add 2~4 new random candies to keep board populated
        const replenished = [...remaining];
        const existingKeys = new Set(replenished.map((c) => `${c.x},${c.y}`));
        const addCount = Math.min(capturedCandies.length, 5);

        for (let i = 0; i < addCount; i++) {
          let rx = Math.floor(Math.random() * COLS);
          let ry = Math.floor(Math.random() * ROWS);
          if (!existingKeys.has(`${rx},${ry}`)) {
            existingKeys.add(`${rx},${ry}`);
            const tmpl = CANDY_POOL[Math.floor(Math.random() * CANDY_POOL.length)];
            replenished.push({
              id: `candy-${Math.random().toString(36).substring(2, 9)}`,
              x: rx,
              y: ry,
              type: tmpl.type,
              points: tmpl.points,
              name: tmpl.name,
              color: tmpl.color,
            });
          }
        }
        return replenished;
      });

      // Advance Turn or Round
      if (activeTurn === 'p1') {
        setActiveTurn('p2');
        setCurrentRadius(null);
        setPhase('ROLL_DICE');
      } else {
        // Player 2 finished
        if (round >= maxRounds) {
          // Game Over!
          sound.playCheer();
          setPhase('GAME_OVER');
          setIsGameOverModalOpen(true);
        } else {
          setRound((r) => r + 1);
          setActiveTurn('p1');
          setCurrentRadius(null);
          setPhase('ROLL_DICE');
        }
      }
    }, 2400);
  };

  const currentActivePlayer = players[activeTurn];
  const isBotActive = currentActivePlayer.isBot === true;

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract (3 zones: Brand - Nav/Links - Primary CTA) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-40">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900">
            사탕 팡팡 컴퍼스 원 게임
          </span>
        </div>

        {/* Zone 2: Informational Links / Badges */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
          <span className="text-slate-800">초등 3학년 2학기 수학</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>원의 중심 & 반지름</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>지름 = 반지름 × 2</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>컴퍼스 360° 실시간 그리기</span>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            onClick={() => setIsConceptModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>원의 개념 교실</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-4">
        {/* Game Mode & Options Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => handleModeChange('2p')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                gameMode === '2p'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>2인 친구 대결</span>
            </button>
            <button
              onClick={() => handleModeChange('vs_bot')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                gameMode === 'vs_bot'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-rose-500" />
              <span>AI 다람이와 대결</span>
            </button>
          </div>

          {/* Rounds & Restart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>대결 판수:</span>
              {[3, 5, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setMaxRounds(num);
                    restartGame();
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    maxRounds === num
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={restartGame}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>새로 시작</span>
            </button>
          </div>
        </div>

        {/* Current Turn Guidance Strip */}
        <div className={`p-3.5 rounded-2xl border-2 transition-all flex flex-wrap items-center justify-between gap-3 ${
          activeTurn === 'p1' ? 'bg-sky-50/80 border-sky-400' : 'bg-rose-50/80 border-rose-400'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{currentActivePlayer.avatar}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md text-white ${
                  activeTurn === 'p1' ? 'bg-sky-600' : 'bg-rose-600'
                }`}>
                  {currentActivePlayer.name}의 차례
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {phase === 'ROLL_DICE' && '① 아래 3D 주사위를 던져 컴퍼스의 반지름을 정하세요! (꽝 / 1~5)'}
                  {phase === 'SELECT_CENTER' && currentRadius === 0 && '② 앗! 꽝 (다음 기회에!)이 나왔어요. 모눈종이를 클릭하여 턴을 넘기세요!'}
                  {phase === 'SELECT_CENTER' && currentRadius !== 0 && '② 모눈종이 위 가장 탐나는 곳을 찾아 클릭하여 컴퍼스 침을 꽂으세요!'}
                  {phase === 'DRAWING_CIRCLE' && currentRadius === 0 && '③ 앗, 꽝이에요! 다음 기회에 다시 도전해요!'}
                  {phase === 'DRAWING_CIRCLE' && currentRadius !== 0 && '③ 컴퍼스가 중심점을 축으로 360° 회전하며 원을 그리고 있어요!'}
                  {phase === 'COLLECTING' && currentRadius === 0 && '④ 꽝 (다음 기회에!) 아쉽지만 다음 턴에 멋진 원을 그려봐요!'}
                  {phase === 'COLLECTING' && currentRadius !== 0 && '④ 원 안에 쏙 들어온 사탕을 수집했어요!'}
                </span>
              </div>
            </div>
          </div>

          {currentRadius !== null && (
            <div className={`border px-3 py-1 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-2 ${
              currentRadius === 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white/90 border-slate-200 text-slate-700'
            }`}>
              {currentRadius === 0 ? (
                <span className="text-rose-600 font-extrabold">꽝 (다음 기회에!) · 반지름 = 0cm</span>
              ) : (
                <>
                  <span className="text-blue-600">반지름 = {currentRadius}칸 ({currentRadius}cm)</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-indigo-600">지름 = {currentRadius * 2}칸 ({currentRadius * 2}cm)</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Turn Result Feedback Notification */}
        {turnFeedback && turnFeedback.visible && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
              <div>
                <div className="font-extrabold text-sm">{turnFeedback.text}</div>
                <div className="text-xs text-amber-100">{turnFeedback.subText}</div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-xl text-xs font-black">
              +{turnFeedback.points}점
            </div>
          </div>
        )}

        {/* Split Layout: Board (65%) & Controls / Score Deck (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Main Game Board (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <GameBoard
              candies={candies}
              activePlayer={currentActivePlayer}
              currentRadius={currentRadius}
              phase={phase}
              onCircleCompleted={handleCircleCompleted}
              lastDrawnCircle={lastDrawnCircle}
              isBotTurn={isBotActive}
            />
          </div>

          {/* Right: Controls & Scoreboard (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Scoreboard */}
            <ScoreBoard
              player1={players.p1}
              player2={players.p2}
              activeTurn={activeTurn}
              round={round}
              maxRounds={maxRounds}
            />

            {/* 3D Dice Component */}
            <Dice3D
              onRollComplete={handleRollComplete}
              disabled={phase !== 'ROLL_DICE'}
              activePlayerName={currentActivePlayer.name}
              themeColor={currentActivePlayer.themeColor}
              isBot={isBotActive}
              currentRadius={currentRadius}
            />

            {/* Candy Types Legend Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">사탕 종류 및 점수표</span>
                <span className="text-[11px] text-slate-400 font-mono">1~4점</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg text-xs">
                  <span className="text-base">🍬</span>
                  <div>
                    <div className="font-bold text-[11px] text-slate-700">회오리</div>
                    <div className="text-[10px] text-slate-500 font-bold">1점</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg text-xs">
                  <span className="text-base">🟢</span>
                  <div>
                    <div className="font-bold text-[11px] text-slate-700">젤리빈</div>
                    <div className="text-[10px] text-slate-500 font-bold">1점</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg text-xs">
                  <span className="text-base">⭐</span>
                  <div>
                    <div className="font-bold text-[11px] text-slate-700">별사탕</div>
                    <div className="text-[10px] text-amber-600 font-bold">2점</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg text-xs">
                  <span className="text-base">💖</span>
                  <div>
                    <div className="font-bold text-[11px] text-slate-700">하트젤리</div>
                    <div className="text-[10px] text-rose-600 font-bold">2점</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg text-xs">
                  <span className="text-base">👑</span>
                  <div>
                    <div className="font-bold text-[11px] text-slate-700">황금왕관</div>
                    <div className="text-[10px] text-amber-600 font-bold">3점</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg text-xs">
                  <span className="text-base">🌈</span>
                  <div>
                    <div className="font-bold text-[11px] text-slate-700">무지개</div>
                    <div className="text-[10px] text-purple-600 font-bold">4점</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CircleConceptModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
      />

      <GameOverModal
        isOpen={isGameOverModalOpen}
        player1={players.p1}
        player2={players.p2}
        onRestart={restartGame}
      />
    </div>
  );
}
