import React from 'react';
import { CandyType } from '../types';

interface CandyIconProps {
  type: CandyType;
  size?: number;
  highlighted?: boolean;
}

export const CandyIcon: React.FC<CandyIconProps> = ({
  type,
  size = 32,
  highlighted = false,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center transition-transform ${
        highlighted ? 'scale-125 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-bounce' : 'hover:scale-110'
      }`}
    >
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        className="w-full h-full select-none"
      >
        {type === 'swirl' && (
          // Swirl Round Candy
          <g>
            <circle cx="20" cy="20" r="15" fill="#f43f5e" />
            <path
              d="M 20 8 A 12 12 0 0 1 32 20 A 8 8 0 0 1 20 28 A 4 4 0 0 1 16 20 A 4 4 0 0 1 20 16"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Candy wrappers on sides */}
            <path d="M 5 17 L 0 12 L 0 28 L 5 23 Z" fill="#fb7185" />
            <path d="M 35 17 L 40 12 L 40 28 L 35 23 Z" fill="#fb7185" />
            <circle cx="16" cy="14" r="2.5" fill="#ffffff" opacity="0.6" />
          </g>
        )}

        {type === 'jelly' && (
          // Jelly Bean Candy
          <g>
            <path
              d="M 12 15 C 8 22 14 32 24 30 C 33 28 36 18 28 12 C 21 8 15 10 12 15 Z"
              fill="#10b981"
            />
            <path
              d="M 16 16 C 14 20 17 26 23 25"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="27" cy="16" r="2.5" fill="#ffffff" opacity="0.6" />
          </g>
        )}

        {type === 'star' && (
          // Sparkling Star Candy
          <g>
            <polygon
              points="20,4 24,14 35,15 27,23 29,34 20,29 11,34 13,23 5,15 16,14"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            <circle cx="20" cy="20" r="4" fill="#fef08a" />
            <circle cx="17" cy="16" r="1.5" fill="#ffffff" />
          </g>
        )}

        {type === 'heart' && (
          // Heart Candy
          <g>
            <path
              d="M 20 32 C 14 26 8 20 8 14 C 8 8 14 6 18 10 L 20 12 L 22 10 C 26 6 32 8 32 14 C 32 20 26 26 20 32 Z"
              fill="#ec4899"
              stroke="#db2777"
              strokeWidth="1.5"
            />
            <circle cx="15" cy="13" r="2" fill="#ffffff" opacity="0.6" />
          </g>
        )}

        {type === 'crown' && (
          // Golden King Crown Candy (+3 pts)
          <g>
            <circle cx="20" cy="20" r="16" fill="#facc15" stroke="#eab308" strokeWidth="2" />
            <path
              d="M 11 26 L 11 17 L 15 21 L 20 13 L 25 21 L 29 17 L 29 26 Z"
              fill="#e11d48"
              stroke="#be123c"
              strokeWidth="1"
            />
            <circle cx="11" cy="16" r="1.5" fill="#38bdf8" />
            <circle cx="20" cy="12" r="2" fill="#38bdf8" />
            <circle cx="29" cy="16" r="1.5" fill="#38bdf8" />
            <rect x="13" y="24" width="14" height="2" rx="1" fill="#fde047" />
          </g>
        )}

        {type === 'rainbow' && (
          // Rainbow Lollipop
          <g>
            {/* Stick */}
            <line x1="20" y1="26" x2="20" y2="38" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            {/* Rainbow Rings */}
            <circle cx="20" cy="18" r="14" fill="#ef4444" />
            <circle cx="20" cy="18" r="11" fill="#f97316" />
            <circle cx="20" cy="18" r="8" fill="#eab308" />
            <circle cx="20" cy="18" r="5" fill="#3b82f6" />
            <circle cx="20" cy="18" r="2.5" fill="#a855f7" />
            <circle cx="16" cy="14" r="2" fill="#ffffff" opacity="0.7" />
          </g>
        )}
      </svg>
    </div>
  );
};
