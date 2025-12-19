import { SymbolDef, SymbolType } from './types';

// Palette
export const COLORS = {
  bg: '#2d1b2e', // Dark purple/brown
  screenBg: '#F6F7D4', // Cream
  uiText: '#3E2723', // Dark Brown
  accent: '#D4AC0D', // Gold
  border: '#3E2723',
};

// Symbol Definitions
export const SYMBOLS: Record<SymbolType, SymbolDef> = {
  [SymbolType.CHERRY]: { type: SymbolType.CHERRY, color: '#FF004D', value: 5 },
  [SymbolType.LEMON]: { type: SymbolType.LEMON, color: '#FFA300', value: 15 },
  [SymbolType.SEVEN]: { type: SymbolType.SEVEN, color: '#29ADFF', value: 50 },
  [SymbolType.CLOVER]: { type: SymbolType.CLOVER, color: '#00E436', value: 100 },
  [SymbolType.GOLD_CLOVER]: { type: SymbolType.GOLD_CLOVER, color: '#FFD700', value: 1000 },
};

export const GRID_SIZE = 3;
export const CANVAS_SIZE = 128;
export const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// Probabilities for RNG (Simple weight system)
// Total weight = 100 for easier calculation
export const SYMBOL_WEIGHTS = [
  { type: SymbolType.CHERRY, weight: 35 },
  { type: SymbolType.LEMON, weight: 30 },
  { type: SymbolType.SEVEN, weight: 17 },
  { type: SymbolType.CLOVER, weight: 10 },
  { type: SymbolType.GOLD_CLOVER, weight: 8 }, // Slightly increased for fun (8%)
];