import React, { useState } from 'react';
import { X, CheckCircle, Lightbulb, Compass, Award, ArrowRight } from 'lucide-react';
import { RealisticCompass } from './RealisticCompass';

interface CircleConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CircleConceptModal: React.FC<CircleConceptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [interactiveRadius, setInteractiveRadius] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'concepts' | 'compass' | 'quiz'>('concepts');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleQuizSubmit = (choice: number) => {
    setQuizAnswer(choice);
    // Question: 반지름이 4cm인 원의 지름은 몇 cm일까요? Correct is 8.
    setIsAnswerCorrect(choice === 8);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                초3 수학 원 개념 쏙쏙 교실
              </h2>
              <p className="text-xs text-slate-500">
                원의 중심, 반지름, 지름과 컴퍼스 사용법을 마스터해봐요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 gap-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`pb-2.5 px-3 font-bold text-xs transition-colors border-b-2 ${
              activeTab === 'concepts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. 원의 핵심 개념
          </button>
          <button
            onClick={() => setActiveTab('compass')}
            className={`pb-2.5 px-3 font-bold text-xs transition-colors border-b-2 ${
              activeTab === 'compass'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. 컴퍼스 실습 체험관
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`pb-2.5 px-3 font-bold text-xs transition-colors border-b-2 ${
              activeTab === 'quiz'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. 척척 퀴즈 풀기
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'concepts' && (
            <div className="space-y-4">
              {/* Concept 1: Center */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm text-blue-950">
                    원의 중심 (Center)
                  </h3>
                  <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                    원을 그릴 때 <strong>컴퍼스의 침을 꽂았던 점</strong>을 ‘원의 중심’이라고 해요.
                    한 원에서 원의 중심은 <strong>오직 1개</strong>만 있어요!
                  </p>
                </div>
              </div>

              {/* Concept 2: Radius */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">
                    반지름 (Radius)
                  </h3>
                  <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                    원의 중심과 원 위의 한 점을 이은 선분이에요.
                    <strong> 컴퍼스를 벌린 길이</strong>가 바로 반지름이 된답니다.
                    한 원에서 반지름의 길이는 모두 똑같아요!
                  </p>
                </div>
              </div>

              {/* Concept 3: Diameter */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm text-purple-950">
                    지름 (Diameter) — 가장 중요한 공식!
                  </h3>
                  <p className="text-xs text-purple-900 mt-1 leading-relaxed">
                    원의 중심을 지나도록 원 위의 두 점을 곧게 이은 선분이에요.
                    원 안에서 그을 수 있는 <strong>가장 긴 선분</strong>이며,
                    <span className="font-bold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-300 ml-1">
                      지름 = 반지름 × 2
                    </span>
                    입니다.
                  </p>
                </div>
              </div>

              {/* How to use a compass */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  컴퍼스로 바르게 원 그리는 4단계
                </h3>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>컴퍼스의 침과 연필 끝을 바닥에 대고 가지런히 맞춥니다.</li>
                  <li>자에 대고 컴퍼스를 벌려 원하는 <strong>반지름만큼 길이</strong>를 잽니다.</li>
                  <li>원의 중심이 될 자리에 <strong>컴퍼스의 침을 콕!</strong> 꽂아 고정합니다.</li>
                  <li>컴퍼스를 살짝 기울여 손잡이를 잡고 한 방향으로 <strong>360° 부드럽게</strong> 돌립니다.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'compass' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600">
                아래 슬라이더를 움직여 컴퍼스를 벌려보세요! 컴퍼스의 다리가 벌어지면서 <strong>반지름</strong>과 <strong>지름</strong>이 어떻게 변하는지 확인해봐요.
              </div>

              {/* Slider Control */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">컴퍼스 벌린 길이 (반지름 r):</span>
                  <span className="text-sm font-black text-blue-600 font-mono">
                    {interactiveRadius} cm {interactiveRadius === 0 && '(다리가 완전히 닫힌 상태!)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={interactiveRadius}
                  onChange={(e) => setInteractiveRadius(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>0cm(꽝)</span>
                  <span>1cm</span>
                  <span>2cm</span>
                  <span>3cm</span>
                  <span>4cm</span>
                  <span>5cm</span>
                </div>
              </div>

              {/* Live Interactive Compass Preview */}
              <div className="h-64 bg-slate-50/50 rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="-180 -180 360 360">
                  {/* Grid background */}
                  <circle cx={0} cy={0} r={interactiveRadius * 32} fill="#38bdf8" fillOpacity={0.08} stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" />
                  
                  {/* Diameter Line */}
                  <line
                    x1={-interactiveRadius * 32}
                    y1={0}
                    x2={interactiveRadius * 32}
                    y2={0}
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />

                  {/* Compass Graphic anchored at (0, 0) */}
                  <RealisticCompass
                    centerX={0}
                    centerY={0}
                    radiusPx={interactiveRadius * 32}
                    rotationDeg={-25}
                    pencilColor="#0284c7"
                    pencilName="파랑 연필"
                    isDrawing={false}
                  />

                  {/* Labels */}
                  <text x={0} y={16} textAnchor="middle" fill="#475569" fontSize={11} fontWeight="bold">
                    원의 중심
                  </text>
                </svg>
              </div>

              {/* Math Equation Formula Callout */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <div className="text-[11px] text-blue-600 font-medium">컴퍼스 벌린 길이</div>
                  <div className="text-base font-black text-blue-900 mt-0.5">
                    반지름 = {interactiveRadius}cm
                  </div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
                  <div className="text-[11px] text-purple-600 font-medium">반지름의 2배</div>
                  <div className="text-base font-black text-purple-900 mt-0.5">
                    지름 = {interactiveRadius * 2}cm
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>오늘의 원 깜짝 퀴즈!</span>
                </div>
                <p className="text-sm text-slate-800 font-medium">
                  "컴퍼스를 <strong>4cm</strong>만큼 벌려서 원을 그렸습니다. 완성된 이 원의 <strong>지름</strong>은 몇 cm일까요?"
                </p>
              </div>

              {/* Choices */}
              <div className="grid grid-cols-2 gap-3">
                {[2, 4, 8, 16].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleQuizSubmit(val)}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      quizAnswer === val
                        ? val === 8
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                          : 'border-red-400 bg-red-50 text-red-800 shadow-sm'
                        : 'border-slate-200 hover:border-blue-300 bg-white text-slate-700'
                    }`}
                  >
                    {val} cm
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {isAnswerCorrect !== null && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    isAnswerCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 shrink-0 ${isAnswerCorrect ? 'text-emerald-600' : 'text-red-500'}`} />
                  <div>
                    <div className="font-bold text-sm">
                      {isAnswerCorrect ? '정답입니다! 참 잘했어요 👏' : '아쉬워요! 다시 한번 생각해볼까요?'}
                    </div>
                    <div className="text-xs mt-1">
                      지름은 반지름의 2배이므로: <strong>4cm × 2 = 8cm</strong>가 됩니다!
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            이해했어요! 게임 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
