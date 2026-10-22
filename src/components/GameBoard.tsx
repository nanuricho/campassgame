import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Candy, Player, GamePhase, DrawnCircle } from '../types';
import { CandyIcon } from './CandyIcon';
import { RealisticCompass } from './RealisticCompass';
import { sound } from '../utils/audio';
import { Target, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface GameBoardProps {
  candies: Candy[];
  activePlayer: Player;
  currentRadius: number | null;
  phase: GamePhase;
  onCircleCompleted: (capturedCandies: Candy[], centerX: number, centerY: number, radius: number) => void;
  lastDrawnCircle: DrawnCircle | null;
  isBotTurn: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  candies,
  activePlayer,
  currentRadius,
  phase,
  onCircleCompleted,
  lastDrawnCircle,
  isBotTurn,
}) => {
  // Expanded Board configuration: 20 cols x 14 rows for a much larger play area!
  const COLS = 20;
  const ROWS = 14;

  const containerRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 840, height: 588 });
  const [hoverGrid, setHoverGrid] = useState<{ x: number; y: number } | null>(null);

  // Compass 360 drawing animation state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingCenter, setDrawingCenter] = useState<{ x: number; y: number } | null>(null);
  const [drawingRadius, setDrawingRadius] = useState<number>(3);
  const [rotationDeg, setRotationDeg] = useState(0);

  // Resize observer to keep cell size crisp, responsive, and spacious
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableW = rect.width;
        // Expanded aspect ratio: 20:14, up to 640px height
        const calcH = Math.min(Math.max(availableW * (ROWS / COLS), 460), 640);
        setBoardDimensions({ width: availableW, height: calcH });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const cellW = boardDimensions.width / COLS;
  const cellH = boardDimensions.height / ROWS;
  const unitPx = (cellW + cellH) / 2;

  // Convert grid coordinates to pixel center
  const gridToPixel = useCallback((gx: number, gy: number) => {
    return {
      x: (gx + 0.5) * cellW,
      y: (gy + 0.5) * cellH,
    };
  }, [cellW, cellH]);

  // Convert mouse/touch event to closest grid point
  const getGridFromPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const gx = Math.floor(px / cellW);
    const gy = Math.floor(py / cellH);

    const clampedX = Math.max(0, Math.min(COLS - 1, gx));
    const clampedY = Math.max(0, Math.min(ROWS - 1, gy));

    return { x: clampedX, y: clampedY };
  }, [cellW, cellH]);

  // Candies enclosed by a circle at (cx, cy) with radius r
  // If r === 0, no candies are enclosed (it is just a single point!)
  const getEnclosedCandies = useCallback((cx: number, cy: number, r: number) => {
    if (r === 0) return [];
    return candies.filter((candy) => {
      const dx = candy.x - cx;
      const dy = candy.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Allow slight threshold for boundary candies to be generous to kids!
      return dist <= r + 0.28;
    });
  }, [candies]);

  // Enclosed candies preview for current hover
  const previewCandies = useMemo(() => {
    if (phase !== 'SELECT_CENTER' || !hoverGrid || currentRadius === null) return [];
    return getEnclosedCandies(hoverGrid.x, hoverGrid.y, currentRadius);
  }, [phase, hoverGrid, currentRadius, getEnclosedCandies]);

  // Start compass drawing animation
  const startCompassDraw = useCallback((cx: number, cy: number, radius: number) => {
    if (isDrawing) return;
    setIsDrawing(true);
    setDrawingCenter({ x: cx, y: cy });
    setDrawingRadius(radius);
    setRotationDeg(0);
    sound.playNeedlePin();

    // Special case: Radius is 0 (Degenerate circle = single center point!)
    if (radius === 0) {
      setTimeout(() => {
        setIsDrawing(false);
        onCircleCompleted([], cx, cy, 0);
      }, 800);
      return;
    }

    const startTime = performance.now();
    const duration = 2200; // 2.2 seconds for full 360 degree circle drawing
    let lastSoundTime = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth circular drawing progression
      const currentAngle = progress * 360;
      setRotationDeg(currentAngle);

      // Sound scratch during drawing
      if (currentTime - lastSoundTime > 240 && progress < 0.95) {
        sound.playDrawingStroke();
        lastSoundTime = currentTime;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Completed 360°!
        sound.playCircleComplete();
        setTimeout(() => {
          setIsDrawing(false);
          const captured = getEnclosedCandies(cx, cy, radius);
          sound.playCandyPop(captured.length);
          onCircleCompleted(captured, cx, cy, radius);
        }, 300);
      }
    };

    requestAnimationFrame(animate);
  }, [isDrawing, getEnclosedCandies, onCircleCompleted]);

  // Bot Turn Auto Execution
  useEffect(() => {
    if (isBotTurn && phase === 'SELECT_CENTER' && currentRadius !== null && !isDrawing) {
      const timer = setTimeout(() => {
        if (currentRadius === 0) {
          // Radius is 0: Bot picks center or random point to pin
          const centerPt = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
          setHoverGrid(centerPt);
          setTimeout(() => {
            startCompassDraw(centerPt.x, centerPt.y, 0);
          }, 600);
          return;
        }

        // Radius > 0: Find best grid point to capture maximum points
        let bestScore = -1;
        let bestPoint = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };

        for (let gx = 0; gx < COLS; gx++) {
          for (let gy = 0; gy < ROWS; gy++) {
            const enclosed = getEnclosedCandies(gx, gy, currentRadius);
            const score = enclosed.reduce((sum, c) => sum + c.points, 0);
            if (score > bestScore) {
              bestScore = score;
              bestPoint = { x: gx, y: gy };
            }
          }
        }

        // Show hover on best point briefly, then draw
        setHoverGrid(bestPoint);
        setTimeout(() => {
          startCompassDraw(bestPoint.x, bestPoint.y, currentRadius);
        }, 800);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isBotTurn, phase, currentRadius, isDrawing, getEnclosedCandies, startCompassDraw]);

  // Handle pointer down / click on board
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isBotTurn || isDrawing || phase !== 'SELECT_CENTER' || currentRadius === null) return;
    const grid = getGridFromPointer(e);
    if (!grid) return;

    startCompassDraw(grid.x, grid.y, currentRadius);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isBotTurn || isDrawing || phase !== 'SELECT_CENTER') return;
    const grid = getGridFromPointer(e);
    if (grid) {
      setHoverGrid(grid);
    }
  };

  const handlePointerLeave = () => {
    if (!isDrawing && !isBotTurn) {
      setHoverGrid(null);
    }
  };

  // Convert drawingCenter to pixels for SVG drawing
  const drawingCenterPx = drawingCenter ? gridToPixel(drawingCenter.x, drawingCenter.y) : null;
  const drawingRadiusPx = drawingRadius * unitPx;

  // Arc path for the real-time drawing pencil stroke
  const drawnArcPath = useMemo(() => {
    if (!drawingCenterPx || rotationDeg <= 0 || drawingRadius <= 0) return '';
    const r = drawingRadiusPx;
    const cx = drawingCenterPx.x;
    const cy = drawingCenterPx.y;

    if (rotationDeg >= 359.5) {
      // Full circle
      return `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
    }

    const rad = (rotationDeg * Math.PI) / 180;
    const endX = cx + r * Math.cos(rad);
    const endY = cy + r * Math.sin(rad);
    const largeArcFlag = rotationDeg > 180 ? 1 : 0;

    return `M ${cx + r} ${cy} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  }, [drawingCenterPx, drawingRadiusPx, drawingRadius, rotationDeg]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Top & Left Grid Rulers (Math concept: cm grid) */}
      <div className="w-full flex items-center justify-between px-2 mb-1 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-blue-500" />
          <span>모눈 종이 판 (가로 20칸 × 세로 14칸 · 1칸 = 1cm)</span>
        </div>
        {phase === 'SELECT_CENTER' && currentRadius !== null && (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 animate-pulse font-bold text-xs">
            {currentRadius === 0 ? (
              <span className="text-rose-600">앗, 꽝 (다음 기회에)! 모눈종이를 클릭해 턴을 넘기세요!</span>
            ) : (
              <span>침을 꽂을 중심점을 클릭하세요! (반지름 {currentRadius}cm)</span>
            )}
          </div>
        )}
      </div>

      {/* Main Board Container (Enlarged Play Area) */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`relative w-full overflow-hidden rounded-2xl border-2 transition-all shadow-md select-none touch-none ${
          phase === 'SELECT_CENTER'
            ? 'cursor-crosshair border-blue-400 ring-4 ring-blue-100'
            : 'border-slate-300/80 bg-white'
        }`}
        style={{
          height: `${boardDimensions.height}px`,
          backgroundImage: `
            linear-gradient(to right, rgba(226, 232, 240, 0.75) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.75) 1px, transparent 1px)
          `,
          backgroundSize: `${cellW}px ${cellH}px`,
          backgroundColor: '#fafcff',
        }}
      >
        {/* Horizontal and Vertical coordinate labels */}
        <div className="absolute top-0 left-0 right-0 flex pointer-events-none opacity-40">
          {Array.from({ length: COLS }).map((_, i) => (
            <div
              key={`col-${i}`}
              className="text-[9px] text-slate-400 font-mono text-center"
              style={{ width: `${cellW}px` }}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Previous Turn Circle or Dot */}
        {lastDrawnCircle && !isDrawing && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {(() => {
              const cp = gridToPixel(lastDrawnCircle.centerX, lastDrawnCircle.centerY);
              const rPx = lastDrawnCircle.radius * unitPx;
              const color = lastDrawnCircle.playerId === 'p1' ? '#38bdf8' : '#fb7185';
              if (lastDrawnCircle.radius === 0) {
                return (
                  <g opacity={0.6}>
                    <circle cx={cp.x} cy={cp.y} r={5} fill={color} />
                    <circle cx={cp.x} cy={cp.y} r={9} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="2 2" />
                  </g>
                );
              }
              return (
                <g opacity={0.35}>
                  <circle
                    cx={cp.x}
                    cy={cp.y}
                    r={rPx}
                    fill={color}
                    fillOpacity={0.08}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <circle cx={cp.x} cy={cp.y} r={3} fill={color} />
                </g>
              );
            })()}
          </svg>
        )}

        {/* Scattered Candies */}
        {candies.map((candy) => {
          const pos = gridToPixel(candy.x, candy.y);
          const isHighlighted = previewCandies.some((c) => c.id === candy.id);

          return (
            <div
              key={candy.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                zIndex: isHighlighted ? 20 : 10,
              }}
            >
              <CandyIcon
                type={candy.type}
                size={Math.min(32, Math.max(22, cellW * 0.72))}
                highlighted={isHighlighted}
              />
              {/* Point badge for special candies */}
              {candy.points > 1 && (
                <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-amber-400 text-amber-950 px-1 rounded-full shadow-xs">
                  +{candy.points}
                </span>
              )}
            </div>
          );
        })}

        {/* Interactive Hover Preview during SELECT_CENTER */}
        {phase === 'SELECT_CENTER' && hoverGrid && currentRadius !== null && !isDrawing && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            {(() => {
              const cp = gridToPixel(hoverGrid.x, hoverGrid.y);
              const rPx = currentRadius * unitPx;
              const themeColor = activePlayer.id === 'p1' ? '#0284c7' : '#e11d48';

              if (currentRadius === 0) {
                // Special Hover Preview for radius = 0 (point dot)
                return (
                  <g>
                    <circle cx={cp.x} cy={cp.y} r={8} fill="#e11d48" stroke="#ffffff" strokeWidth={2} className="animate-ping" opacity={0.6} />
                    <circle cx={cp.x} cy={cp.y} r={6} fill="#e11d48" stroke="#ffffff" strokeWidth={2} />
                    <circle cx={cp.x} cy={cp.y} r={2} fill="#ffffff" />
                    <line x1={cp.x - 14} y1={cp.y} x2={cp.x + 14} y2={cp.y} stroke="#e11d48" strokeWidth={1.5} />
                    <line x1={cp.x} y1={cp.y - 14} x2={cp.x} y2={cp.y + 14} stroke="#e11d48" strokeWidth={1.5} />
                  </g>
                );
              }

              return (
                <g>
                  {/* Outer circle preview */}
                  <circle
                    cx={cp.x}
                    cy={cp.y}
                    r={rPx}
                    fill={themeColor}
                    fillOpacity={0.12}
                    stroke={themeColor}
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    className="animate-pulse-subtle"
                  />

                  {/* Center needle pin point */}
                  <circle cx={cp.x} cy={cp.y} r={6} fill={themeColor} stroke="#ffffff" strokeWidth={2} />
                  <circle cx={cp.x} cy={cp.y} r={2} fill="#ffffff" />

                  {/* Radius Guide Line (반지름 표시) */}
                  <line
                    x1={cp.x}
                    y1={cp.y}
                    x2={cp.x + rPx}
                    y2={cp.y}
                    stroke={themeColor}
                    strokeWidth={2}
                  />

                  {/* Radius Text Pill */}
                  <rect
                    x={cp.x + rPx / 2 - 28}
                    y={cp.y - 18}
                    width={56}
                    height={18}
                    rx={9}
                    fill="#ffffff"
                    stroke={themeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={cp.x + rPx / 2}
                    y={cp.y - 5}
                    textAnchor="middle"
                    fill={themeColor}
                    fontSize={10}
                    fontWeight="bold"
                  >
                    반지름 {currentRadius}cm
                  </text>

                  {/* Crosshair guide for precise center pinning */}
                  <line x1={cp.x - 12} y1={cp.y} x2={cp.x + 12} y2={cp.y} stroke={themeColor} strokeWidth={1} opacity={0.6} />
                  <line x1={cp.x} y1={cp.y - 12} x2={cp.x} y2={cp.y + 12} stroke={themeColor} strokeWidth={1} opacity={0.6} />
                </g>
              );
            })()}
          </svg>
        )}

        {/* REAL-TIME 360° COMPASS DRAWING LAYER */}
        {isDrawing && drawingCenterPx && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-40 overflow-visible">
            {drawingRadius > 0 && (
              <>
                {/* 1. Translucent fill preview forming */}
                <circle
                  cx={drawingCenterPx.x}
                  cy={drawingCenterPx.y}
                  r={drawingRadiusPx}
                  fill={activePlayer.pencilColor}
                  fillOpacity={0.15 * (rotationDeg / 360)}
                />

                {/* 2. Real-time Drawn Arc Stroke */}
                <path
                  d={drawnArcPath}
                  fill="none"
                  stroke={activePlayer.pencilColor}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
                />
              </>
            )}

            {/* 3. Center Needle point marker */}
            <circle
              cx={drawingCenterPx.x}
              cy={drawingCenterPx.y}
              r={drawingRadius === 0 ? 7 : 5}
              fill={drawingRadius === 0 ? '#e11d48' : '#334155'}
              stroke="#ffffff"
              strokeWidth={2}
            />

            {/* 4. REALISTIC COMPASS GRAPHIC ROTATING AROUND CENTER */}
            <RealisticCompass
              centerX={drawingCenterPx.x}
              centerY={drawingCenterPx.y}
              radiusPx={drawingRadiusPx}
              rotationDeg={drawingRadius === 0 ? 0 : rotationDeg}
              pencilColor={activePlayer.pencilColor}
              pencilName={activePlayer.name}
              isDrawing={true}
            />
          </svg>
        )}

        {/* Hover Information Floating Tooltip */}
        {phase === 'SELECT_CENTER' && hoverGrid && currentRadius !== null && !isDrawing && (
          <div
            className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${gridToPixel(hoverGrid.x, hoverGrid.y).x}px`,
              top: `${gridToPixel(hoverGrid.x, hoverGrid.y).y - (currentRadius === 0 ? 10 : currentRadius * unitPx + 10)}px`,
            }}
          >
            <div className="bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2 whitespace-nowrap">
              {currentRadius === 0 ? (
                <>
                  <span className="font-bold text-rose-300">
                    꽝 (다음 기회에!)
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-300">클릭하여 턴 넘기기</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-amber-300">
                    🍬 사탕 {previewCandies.length}개 ({previewCandies.reduce((s, c) => s + c.points, 0)}점)
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-300">클릭하여 침 꽂기</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Educational Footer Banner */}
      <div className="w-full mt-2.5 flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 font-medium">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>
            <strong>컴퍼스 사용법:</strong> 침을 원의 중심에 꽂고, 원하는 반지름만큼 벌려 360° 한 바퀴 돌려요!
          </span>
        </div>
        {currentRadius !== null && (
          <div className="font-mono text-xs text-slate-700 font-semibold">
            {currentRadius === 0 ? '꽝 (다음 기회에!) · 반지름 = 0cm' : `반지름(r) = ${currentRadius}cm · 지름(d) = ${currentRadius * 2}cm`}
          </div>
        )}
      </div>
    </div>
  );
};
