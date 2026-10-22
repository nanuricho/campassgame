import React from 'react';
import { Player, PlayerId } from '../types';
import { Trophy, Award, Bot, Sparkles } from 'lucide-react';

interface ScoreBoardProps {
  player1: Player;
  player2: Player;
  activeTurn: PlayerId;
  round: number;
  maxRounds: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  player1,
  player2,
  activeTurn,
  round,
  maxRounds,
}) => {
  const totalScore = player1.score + player2.score;
  const p1Percent = totalScore > 0 ? (player1.score / totalScore) * 100 : 50;

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-sm flex flex-col gap-2.5">
      {/* Top row: Round Indicator & Leader */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            라운드 {round} / {maxRounds}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-600 font-medium">
            {player1.score > player2.score
              ? `🦁 ${player1.name} 리드 중!`
              : player2.score > player1.score
              ? `${player2.avatar} ${player2.name} 리드 중!`
              : '동점! 막상막하 승부!'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
          <Trophy className="w-3.5 h-3.5" />
          <span>사탕 대결</span>
        </div>
      </div>

      {/* Players Card Split */}
      <div className="grid grid-cols-2 gap-3">
        {/* Player 1 Card */}
        <div
          className={`relative p-3 rounded-xl border-2 transition-all ${
            activeTurn === 'p1'
              ? 'border-sky-500 bg-sky-50/70 shadow-md ring-2 ring-sky-200 scale-[1.01]'
              : 'border-slate-200 bg-slate-50/60 opacity-80'
          }`}
        >
          {activeTurn === 'p1' && (
            <div className="absolute -top-2.5 left-3 bg-sky-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>현재 차례</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-xl shadow-xs">
                {player1.avatar}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-800 flex items-center gap-1">
                  <span>{player1.name}</span>
                </div>
                <div className="text-[11px] text-sky-700 font-medium">
                  사탕 {player1.candyCount}개 획득
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-sky-700 tabular-nums">
                {player1.score}
                <span className="text-xs font-semibold ml-0.5 text-sky-600">점</span>
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 Card */}
        <div
          className={`relative p-3 rounded-xl border-2 transition-all ${
            activeTurn === 'p2'
              ? 'border-rose-500 bg-rose-50/70 shadow-md ring-2 ring-rose-200 scale-[1.01]'
              : 'border-slate-200 bg-slate-50/60 opacity-80'
          }`}
        >
          {activeTurn === 'p2' && (
            <div className="absolute -top-2.5 left-3 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>현재 차례</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-xl shadow-xs">
                {player2.avatar}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-800 flex items-center gap-1">
                  <span>{player2.name}</span>
                  {player2.isBot && (
                    <Bot className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </div>
                <div className="text-[11px] text-rose-700 font-medium">
                  사탕 {player2.candyCount}개 획득
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-rose-700 tabular-nums">
                {player2.score}
                <span className="text-xs font-semibold ml-0.5 text-rose-600">점</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Balance Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
        <div
          className="bg-sky-500 h-full transition-all duration-500"
          style={{ width: `${p1Percent}%` }}
        />
        <div
          className="bg-rose-500 h-full transition-all duration-500"
          style={{ width: `${100 - p1Percent}%` }}
        />
      </div>
    </div>
  );
};
