export type PlayerId = 'p1' | 'p2';

export interface Player {
  id: PlayerId;
  name: string;
  avatar: string; // Emoji e.g. 🦁, 🐰, 🐿️
  themeColor: string; // Tailwind color key e.g. 'sky', 'rose'
  badgeBg: string;
  borderColor: string;
  compassColor: string;
  pencilColor: string;
  score: number;
  candyCount: number;
  isBot?: boolean;
}

export type CandyType = 'swirl' | 'jelly' | 'star' | 'heart' | 'crown' | 'rainbow';

export interface Candy {
  id: string;
  x: number; // Grid coordinate X (0 to cols-1)
  y: number; // Grid coordinate Y (0 to rows-1)
  type: CandyType;
  points: number;
  name: string;
  color: string;
}

export type GamePhase =
  | 'ROLL_DICE' // Turn started, waiting for roll
  | 'ROLLING_DICE' // 3D dice rolling animation
  | 'SELECT_CENTER' // Dice decided radius, player hovers/selects center point
  | 'DRAWING_CIRCLE' // Compass rotating 360° in real-time
  | 'COLLECTING' // Showing captured candies and educational feedback
  | 'GAME_OVER'; // End of game

export type GameMode = '2p' | 'vs_bot' | 'practice';

export interface BoardConfig {
  cols: number;
  rows: number;
  initialCandies: number;
  label: string;
}

export interface DrawnCircle {
  id: string;
  playerId: PlayerId;
  centerX: number;
  centerY: number;
  radius: number; // in grid units
  candyCount: number;
  pointsEarned: number;
}

