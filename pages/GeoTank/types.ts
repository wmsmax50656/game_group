export interface Vector {
  x: number;
  y: number;
}

export enum EntityType {
  PLAYER = 'PLAYER',
  BULLET = 'BULLET',
  ENEMY_SQUARE = 'ENEMY_SQUARE',
  ENEMY_TRIANGLE = 'ENEMY_TRIANGLE',
  ENEMY_PENTAGON = 'ENEMY_PENTAGON',
  BOSS = 'BOSS',
  PARTICLE = 'PARTICLE'
}

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  color: string;
  damage: number;
  scoreValue: number;
  remove?: boolean;
  ttl?: number; // Time to live (for particles/bullets)
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;
  vx: number;
  vy: number;
}

export interface PlayerStats {
  bulletSpeed: number;
  reloadTime: number; // in frames
  moveSpeed: number;
  bulletDamage: number;
  maxHp: number;
}

export interface UpgradeState {
  bulletSpeed: number;
  reload: number;
  moveSpeed: number;
  damage: number;
  points: number;
}

export const CONSTANTS = {
  WORLD_WIDTH: 2000,
  WORLD_HEIGHT: 2000,
  PLAYER_BASE_HP: 100,
  PLAYER_RADIUS: 20,
  GRID_SIZE: 50,
  XP_TO_LEVEL_FACTOR: 1.5,
};