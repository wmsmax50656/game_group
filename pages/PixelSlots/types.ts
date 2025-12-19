export enum SymbolType {
  CHERRY = 'CHERRY',
  LEMON = 'LEMON',
  SEVEN = 'SEVEN',
  CLOVER = 'CLOVER',
  GOLD_CLOVER = 'GOLD_CLOVER', // The rare jackpot symbol
}

export interface SymbolDef {
  type: SymbolType;
  color: string;
  value: number;
}

export enum GamePhase {
  SPINNING = 'SPINNING',
  IDLE = 'IDLE',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY' // Not used yet, but good for future
}

export interface GameState {
  money: number;
  debt: number;
  spins: number;
  maxSpins: number;
  round: number;
  phase: GamePhase;
  grid: SymbolType[][];
}