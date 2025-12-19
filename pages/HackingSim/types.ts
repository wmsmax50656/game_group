export enum AppPhase {
  DESKTOP = 'DESKTOP',
  UAC_PROMPT = 'UAC_PROMPT',
  INSTALLING = 'INSTALLING',
  CHAOS = 'CHAOS',
  WALLET_THEFT = 'WALLET_THEFT',
  FINAL_ERROR = 'FINAL_ERROR',
  BSOD = 'BSOD',
  GAMEOVER = 'GAMEOVER'
}

export interface LogEntry {
  id: number;
  text: string;
}