import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { Dices, Sparkles } from 'lucide-react';

interface Dice3DProps {
  onRollComplete: (radius: number) => void;
  disabled?: boolean;
  activePlayerName: string;
  themeColor: string;
  isBot?: boolean;
  currentRadius: number | null;
}

// 3D Rotation angles for faces (0, 1, 2, 3, 4, 5)
const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  0: { x: 0, y: 0 },       // Front Face: 0
  5: { x: 180, y: 0 },     // Back Face: 5
  1: { x: -90, y: 0 },     // Top Face: 1
  4: { x: 90, y: 0 },      // Bottom Face: 4
  2: { x: 0, y: -90 },     // Left Face: 2
  3: { x: 0, y: 90 },      // Right Face: 3
};

export const Dice3D: React.FC<Dice3DProps> = ({
  onRollComplete,
  disabled = false,
  activePlayerName,
  themeColor,
  isBot = false,
  currentRadius,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [rotation, setRotation] = useState({ x: 15, y: -25, z: 0 });
  const [displayValue, setDisplayValue] = useState<number | null>(currentRadius);
  const [shakePreview, setShakePreview] = useState(false);

  // Sync display if provided externally
  useEffect(() => {
    if (currentRadius !== null && !isRolling) {
      setDisplayValue(currentRadius);
      const faceRot = FACE_ROTATIONS[currentRadius] ?? FACE_ROTATIONS[0];
      setRotation({ x: faceRot.x, y: faceRot.y, z: 0 });
    }
  }, [currentRadius, isRolling]);

  const rollDice = () => {
    if (isRolling || disabled) return;

    sound.playClick();
    sound.playDiceRoll();
    setIsRolling(true);

    // Roll pool: includes 0! 5 and 6 are toned down as requested.
    // 0, 1, 2, 3, 4 are primary, 5 is occasional.
    const possible = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5];
    const target = possible[Math.floor(Math.random() * possible.length)];

    // Multi-turn 3D spin
    const spins = 3 + Math.floor(Math.random() * 2);
    const targetRot = FACE_ROTATIONS[target] ?? FACE_ROTATIONS[0];

    // Compute large angle so it tumbles
    const finalX = targetRot.x + 360 * spins;
    const finalY = targetRot.y + 360 * (spins + 1);

    setRotation({
      x: finalX,
      y: finalY,
      z: (Math.random() - 0.5) * 40,
    });

    // Landing timing
    setTimeout(() => {
      sound.playDiceLand();
      setIsRolling(false);
      setDisplayValue(target);
      onRollComplete(target);
    }, 1200);
  };

  // Bot auto-roll
  useEffect(() => {
    if (isBot && !disabled && !isRolling && currentRadius === null) {
      const timer = setTimeout(() => {
        rollDice();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isBot, disabled, isRolling, currentRadius]);

  const size = 84; // px
  const half = size / 2;

  // Render Face patterns for 0, 1, 2, 3, 4, 5
  const renderFaceContent = (num: number) => {
    const dotClasses = "w-3 h-3 rounded-full bg-slate-800 shadow-inner";
    switch (num) {
      case 0:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-1.5 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 rounded-2xl border border-rose-200/60">
            <span className="text-2xl font-black text-rose-600 drop-shadow-xs tracking-tight">
              꽝
            </span>
            <span className="text-[9px] font-bold text-rose-500 mt-0.5 tracking-tight leading-none text-center">
              다음기회에
            </span>
          </div>
        );
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-red-500 shadow-md ring-2 ring-red-300" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between">
            <div className={`self-start ${dotClasses}`} />
            <div className={`self-end ${dotClasses}`} />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between">
            <div className={`self-start ${dotClasses}`} />
            <div className={`self-center ${dotClasses}`} />
            <div className={`self-end ${dotClasses}`} />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className={dotClasses} />
              <div className={dotClasses} />
            </div>
            <div className="flex justify-between">
              <div className={dotClasses} />
              <div className={dotClasses} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className={dotClasses} />
              <div className={dotClasses} />
            </div>
            <div className="flex justify-center">
              <div className={dotClasses} />
            </div>
            <div className="flex justify-between">
              <div className={dotClasses} />
              <div className={dotClasses} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const faceStyle = (transform: string) => ({
    position: 'absolute' as const,
    width: `${size}px`,
    height: `${size}px`,
    transform,
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    border: '2px solid #e2e8f0',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.05)',
  });

  return (
    <div className="flex flex-col items-center bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Dices className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
          ① 주사위로 반지름 정하기 (0~5)
        </span>
      </div>

      {/* 3D Dice Stage */}
      <div
        className="w-32 h-28 flex items-center justify-center cursor-pointer perspective-1000 select-none"
        onClick={() => !disabled && !isRolling && rollDice()}
        onMouseEnter={() => setShakePreview(true)}
        onMouseLeave={() => setShakePreview(false)}
        title="클릭하여 주사위를 굴려보세요! (0~5)"
      >
        <div
          className={`relative preserve-3d transition-transform ${
            isRolling ? 'duration-[1200ms] ease-out' : 'duration-300 ease-spring'
          } ${shakePreview && !isRolling && !disabled ? 'scale-105' : ''}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          }}
        >
          {/* 6 Faces: 0, 5, 1, 4, 2, 3 */}
          {/* Front (0) */}
          <div style={faceStyle(`translateZ(${half}px)`)}>
            {renderFaceContent(0)}
          </div>
          {/* Back (5) */}
          <div style={faceStyle(`rotateY(180deg) translateZ(${half}px)`)}>
            {renderFaceContent(5)}
          </div>
          {/* Left (2) */}
          <div style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`)}>
            {renderFaceContent(2)}
          </div>
          {/* Right (3) */}
          <div style={faceStyle(`rotateY(90deg) translateZ(${half}px)`)}>
            {renderFaceContent(3)}
          </div>
          {/* Top (1) */}
          <div style={faceStyle(`rotateX(90deg) translateZ(${half}px)`)}>
            {renderFaceContent(1)}
          </div>
          {/* Bottom (4) */}
          <div style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`)}>
            {renderFaceContent(4)}
          </div>
        </div>
      </div>

      {/* Roll Action Button */}
      <button
        onClick={rollDice}
        disabled={disabled || isRolling}
        className={`mt-2 w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          disabled || isRolling
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-md hover:shadow-lg active:scale-95'
        }`}
      >
        <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
        <span>{isRolling ? '데굴데굴 굴리는 중...' : '주사위 굴리기!'}</span>
      </button>

      {/* Result Callout & Circle Math Explanation */}
      {displayValue !== null && (
        <div className={`mt-3 w-full rounded-xl p-2.5 text-center border ${
          displayValue === 0
            ? 'bg-rose-50/90 border-rose-200 text-rose-900'
            : 'bg-amber-50/80 border-amber-200/80 text-amber-900'
        }`}>
          <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
            <Sparkles className={`w-3.5 h-3.5 ${displayValue === 0 ? 'text-rose-500' : 'text-amber-600'}`} />
            {displayValue === 0 ? (
              <span><strong className="text-rose-600 text-base">꽝! (다음 기회에)</strong> | 반지름: 0칸</span>
            ) : (
              <>
                <span>반지름: <strong className="text-amber-600 text-base">{displayValue}칸</strong></span>
                <span className="text-amber-400">|</span>
                <span>지름: <strong className="text-blue-600 text-base">{displayValue * 2}칸</strong></span>
              </>
            )}
          </div>
          <div className={`text-[11px] mt-0.5 font-medium ${displayValue === 0 ? 'text-rose-700' : 'text-amber-700'}`}>
            {displayValue === 0
              ? '컴퍼스를 벌리지 못했어요! 다음 기회에 힘내봐요!'
              : `(원의 중심에서 원 위의 점까지 거리 = ${displayValue}cm)`}
          </div>
        </div>
      )}
    </div>
  );
};
