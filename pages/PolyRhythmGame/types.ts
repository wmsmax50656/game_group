export interface RhythmLayer {
  id: string;
  beats: number; // 3 = Triangle, 4 = Square, etc.
  color: string;
  mute: boolean;
}

export interface RhythmState {
  bpm: number;
  layers: RhythmLayer[];
  isPlaying: boolean;
  offset: number; // Latency offset in milliseconds
}

export type JudgmentType = 'PURE' | 'EARLY' | 'LATE' | 'MISS';

export interface JudgmentResult {
  type: JudgmentType;
  text: string;
  color: string;
  diff: number; // difference in ms
}

export const COLORS = [
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#d97706', // Amber
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#eab308', // Yellow
];