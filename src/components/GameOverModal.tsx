import React from 'react';
import { Player } from '../types';
import { Trophy, RotateCcw, Sparkles, Award } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  player1: Player;
  player2: Player;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  player1,
  player2,
  onRestart,
}) => {
  if (!isOpen) return null;

  const isTie = player1.score === player2.score;
  const winner = player1.score > player2.score ? player1 : player2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4">
        {/* Celebration Header */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-md animate-bounce">
            {isTie ? '🤝' : winner.avatar}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest">
            <Trophy className="w-4 h-4" />
            <span>대결 종료</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mt-1">
            {isTie ? '멋진 무승부예요!' : `${winner.name} 승리!`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            둘 다 컴퍼스를 멋지게 돌려 사탕을 잔뜩 모았어요!
          </p>
        </div>

        {/* Score comparison podium */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className={`p-3 rounded-xl border ${player1.score >= player2.score ? 'bg-sky-50 border-sky-300' : 'bg-white border-slate-200'}`}>
            <div className="text-2xl mb-1">{player1.avatar}</div>
            <div className="font-bold text-xs text-slate-700">{player1.name}</div>
            <div className="text-xl font-black text-sky-700 mt-0.5 tabular-nums">
              {player1.score}<span className="text-xs font-medium ml-0.5">점</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              사탕 {player1.candyCount}개
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${player2.score >= player1.score ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'}`}>
            <div className="text-2xl mb-1">{player2.avatar}</div>
            <div className="font-bold text-xs text-slate-700">{player2.name}</div>
            <div className="text-xl font-black text-rose-700 mt-0.5 tabular-nums">
              {player2.score}<span className="text-xs font-medium ml-0.5">점</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              사탕 {player2.candyCount}개
            </div>
          </div>
        </div>

        {/* Circle Learning Achievement Summary */}
        <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-left text-xs text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-blue-950">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>오늘 마스터한 원의 지식</span>
          </div>
          <div className="text-[11px] text-blue-800 leading-relaxed">
            • 원의 중심: 컴퍼스의 침을 콕 꽂았던 자리<br />
            • 반지름: 주사위 눈만큼 컴퍼스를 벌린 길이<br />
            • 지름: 반지름의 딱 2배!
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>한 판 더 대결하기!</span>
        </button>
      </div>
    </div>
  );
};
