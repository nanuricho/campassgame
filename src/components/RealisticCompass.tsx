import React, { useMemo } from 'react';

interface RealisticCompassProps {
  centerX: number; // center point in pixels
  centerY: number;
  radiusPx: number; // radius in pixels
  rotationDeg: number; // 0 to 360 degrees
  pencilColor: string; // hex or rgb color for pencil line & body
  pencilName?: string;
  isDrawing?: boolean;
}

export const RealisticCompass: React.FC<RealisticCompassProps> = ({
  centerX,
  centerY,
  radiusPx,
  rotationDeg,
  pencilColor,
  pencilName = '연필',
  isDrawing = true,
}) => {
  // Compass geometry:
  // When radius is 0, legs are folded together (needle at 0, pencil at 4px)
  const effectivePencilX = radiusPx === 0 ? 4 : radiusPx;

  const legLength = useMemo(() => {
    return Math.max(130, effectivePencilX * 0.9 + 50);
  }, [effectivePencilX]);

  const halfR = effectivePencilX / 2;
  // Hinge height above the baseline (y is negative going up)
  const hingeY = useMemo(() => {
    const squared = legLength * legLength - halfR * halfR;
    return -Math.sqrt(Math.max(1600, squared));
  }, [legLength, halfR]);

  const hingeX = halfR;

  // Slight realistic forward tilt when drawing
  const compassTilt = isDrawing ? 4 : 0;

  return (
    <g
      transform={`translate(${centerX}, ${centerY}) rotate(${rotationDeg})`}
      className="pointer-events-none select-none transition-transform duration-75"
      style={{ filter: 'drop-shadow(3px 8px 6px rgba(0,0,0,0.22))' }}
    >
      {/* 1. Center needle pin dot / paper indent */}
      <circle cx={0} cy={0} r={4.5} fill="#475569" stroke="#94a3b8" strokeWidth={1.5} />
      <circle cx={0} cy={0} r={1.5} fill="#f8fafc" />

      {/* 2. Radius measurement guide bar between needle and pencil */}
      {isDrawing && (
        <g opacity={0.6}>
          <line
            x1={0}
            y1={0}
            x2={radiusPx}
            y2={0}
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        </g>
      )}

      {/* Compass Body Group */}
      <g transform={`rotate(${compassTilt}, ${hingeX}, ${hingeY})`}>
        {/* === TOP HANDLE & HINGE === */}
        {/* Top Handle Stem */}
        <rect
          x={hingeX - 3.5}
          y={hingeY - 38}
          width={7}
          height={26}
          rx={2}
          fill="url(#handle-metal-gradient)"
          stroke="#475569"
          strokeWidth={0.8}
        />
        {/* Handle knurled ridges */}
        <line x1={hingeX - 3} y1={hingeY - 33} x2={hingeX + 3} y2={hingeY - 33} stroke="#64748b" strokeWidth={1} />
        <line x1={hingeX - 3} y1={hingeY - 28} x2={hingeX + 3} y2={hingeY - 28} stroke="#64748b" strokeWidth={1} />
        <line x1={hingeX - 3} y1={hingeY - 23} x2={hingeX + 3} y2={hingeY - 23} stroke="#64748b" strokeWidth={1} />
        <line x1={hingeX - 3} y1={hingeY - 18} x2={hingeX + 3} y2={hingeY - 18} stroke="#64748b" strokeWidth={1} />

        {/* Top Handle Knob */}
        <circle cx={hingeX} cy={hingeY - 38} r={5} fill="#64748b" stroke="#334155" strokeWidth={1} />
        <circle cx={hingeX - 1} cy={hingeY - 39} r={1.5} fill="#cbd5e1" />

        {/* Hinge Joint Disk */}
        <circle
          cx={hingeX}
          cy={hingeY}
          r={12}
          fill="url(#hinge-metal-gradient)"
          stroke="#334155"
          strokeWidth={1.5}
        />
        {/* Inner Hinge Bolt & Nut */}
        <circle cx={hingeX} cy={hingeY} r={6} fill="#475569" stroke="#1e293b" strokeWidth={1} />
        <circle cx={hingeX} cy={hingeY} r={3} fill="#94a3b8" />
        <rect x={hingeX - 4} y={hingeY - 1} width={8} height={2} fill="#334155" />

        {/* === LEFT LEG: NEEDLE ARM (침 다리) === */}
        {/* Metallic Arm from hinge to needle socket */}
        <path
          d={`M ${hingeX - 5} ${hingeY + 5} 
              L ${hingeX - 9} ${hingeY + 12}
              L -2 -18
              L 2 -18
              L ${hingeX - 1} ${hingeY + 6} Z`}
          fill="url(#left-leg-gradient)"
          stroke="#475569"
          strokeWidth={1}
        />
        {/* Needle Clamp / Socket */}
        <rect
          x={-5}
          y={-18}
          width={10}
          height={10}
          rx={2}
          fill="#334155"
          stroke="#1e293b"
          strokeWidth={1}
        />
        {/* Clamp Thumb Screw */}
        <circle cx={-6} cy={-13} r={3} fill="#cbd5e1" stroke="#475569" strokeWidth={0.8} />

        {/* Sharp Needle Pin (침) touching (0, 0) */}
        <polygon
          points={`-1.2,-8 1.2,-8 0,0`}
          fill="#e2e8f0"
          stroke="#475569"
          strokeWidth={0.5}
        />
        <line x1={0} y1={-8} x2={0} y2={0} stroke="#94a3b8" strokeWidth={0.8} />

        {/* === RIGHT LEG: PENCIL HOLDER ARM (연필 다리) === */}
        {/* Metallic Arm from hinge to pencil clamp */}
        <path
          d={`M ${hingeX + 1} ${hingeY + 6}
              L ${hingeX + 5} ${hingeY + 5}
              L ${radiusPx + 8} -28
              L ${radiusPx + 2} -28
              L ${hingeX} ${hingeY + 8} Z`}
          fill="url(#right-leg-gradient)"
          stroke="#475569"
          strokeWidth={1}
        />

        {/* Pencil Clamp Bracket */}
        <rect
          x={radiusPx - 7}
          y={-32}
          width={14}
          height={16}
          rx={2.5}
          fill="#475569"
          stroke="#1e293b"
          strokeWidth={1}
        />
        {/* Clamp tightening screw on the side */}
        <rect x={radiusPx + 7} y={-26} width={5} height={5} rx={1} fill="#94a3b8" stroke="#334155" strokeWidth={0.8} />

        {/* === REALISTIC PENCIL (연필) === */}
        <g>
          {/* Pencil Wooden Body (angles slightly from clamp down to (radiusPx, 0)) */}
          {/* Hexagonal pencil barrel */}
          <polygon
            points={`
              ${radiusPx - 4.5},-55
              ${radiusPx + 4.5},-55
              ${radiusPx + 4.5},-16
              ${radiusPx - 4.5},-16
            `}
            fill={pencilColor}
            stroke="#1e293b"
            strokeWidth={0.8}
          />
          {/* Pencil facet highlight stripe */}
          <rect
            x={radiusPx - 1.5}
            y={-55}
            width={3}
            height={39}
            fill="#ffffff"
            opacity={0.3}
          />
          {/* Pencil Top Eraser Ferrule */}
          <rect
            x={radiusPx - 4.5}
            y={-62}
            width={9}
            height={7}
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth={0.8}
          />
          {/* Eraser */}
          <rect
            x={radiusPx - 4}
            y={-68}
            width={8}
            height={6}
            rx={2}
            fill="#f472b6"
            stroke="#db2777"
            strokeWidth={0.8}
          />

          {/* Sharpened Wood Cone (깎은 나무 부분) */}
          <polygon
            points={`
              ${radiusPx - 4.5},-16
              ${radiusPx + 4.5},-16
              ${radiusPx},0
            `}
            fill="#fde68a"
            stroke="#d97706"
            strokeWidth={0.8}
          />

          {/* Graphite Lead Tip (연필심) touching precisely at (radiusPx, 0) */}
          <polygon
            points={`
              ${radiusPx - 1.5},-6
              ${radiusPx + 1.5},-6
              ${radiusPx},0
            `}
            fill="#1e293b"
          />
        </g>
      </g>

      {/* Pencil tip drawing sparkle effect */}
      {isDrawing && (
        <g transform={`translate(${radiusPx}, 0)`}>
          <circle cx={0} cy={0} r={3} fill={pencilColor} opacity={0.8} />
          <circle cx={0} cy={0} r={1.5} fill="#ffffff" />
          <path
            d="M -3 -3 L 3 3 M -3 3 L 3 -3"
            stroke="#ffffff"
            strokeWidth={1}
            opacity={0.6}
          />
        </g>
      )}

      {/* Gradients */}
      <defs>
        <linearGradient id="handle-metal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="45%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        <radialGradient id="hinge-metal-gradient" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>

        <linearGradient id="left-leg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="right-leg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="60%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
    </g>
  );
};
