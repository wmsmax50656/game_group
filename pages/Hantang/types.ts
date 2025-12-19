export interface Vector2 {
  x: number;
  y: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED', // For level up selection
  GAME_OVER = 'GAME_OVER',
}

export interface Entity {
  id: string;
  position: Vector2;
  radius: number;
  color: string;
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  xp: number;
  level: number;
  nextLevelXp: number;
  // Stats
  damageMulti: number;
  attackSpeedMulti: number;
  projectileCount: number;
  weapons: WeaponType[];
  skills: Record<string, number>; // Track level of each skill (id -> level)
}

export interface Enemy extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  type: 'ZOMBIE' | 'FAST' | 'TANK';
}

export interface Projectile extends Entity {
  velocity: Vector2;
  damage: number;
  duration: number; // frames or time to live
  penetration: number;
  isEvo?: boolean; // Visual flag for evo projectiles
}

export interface Gem extends Entity {
  value: number;
}

export interface DamageNumber {
  id: string;
  position: Vector2;
  value: number;
  opacity: number;
  life: number;
}

export enum WeaponType {
  KUNAI = 'KUNAI',
  SHOTGUN = 'SHOTGUN',
  GUARDIAN = 'GUARDIAN',
  BAT = 'BAT'
}

export interface UpgradeOption {
  id: string;
  title: string; // Dynamic title based on level
  name: string; // Base name
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  type: 'WEAPON' | 'STAT';
  currentLevel: number;
  isEvo: boolean;
}

// --- Equipment & Inventory Types ---

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
export type EquipmentType = 'WEAPON' | 'NECKLACE' | 'GLOVES' | 'SUIT' | 'BELT' | 'BOOTS';

export interface InventoryItem {
  id: string;
  type: EquipmentType;
  rarity: Rarity;
  level: number;
  name: string; // e.g. "Kunai", "Metal Suit"
}

export interface EquippedState {
  WEAPON: InventoryItem | null;
  NECKLACE: InventoryItem | null;
  GLOVES: InventoryItem | null;
  SUIT: InventoryItem | null;
  BELT: InventoryItem | null;
  BOOTS: InventoryItem | null;
}

// --- Skin Types ---

export type SkinEffectType = 'NONE' | 'BLOOD' | 'GOLD' | 'PIXEL' | 'VOID';

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: Rarity;
  effectType: SkinEffectType;
  primaryColor: string;
}

// --- User Profile & Auth ---

export interface UserProfile {
  username: string;
  password?: string; // In a real app, never store plain text passwords
  highScore: number;
  gold: number;
  gems: number;
  keys: number;
  inventory: InventoryItem[];
  equipped: EquippedState;
  ownedSkins: string[];
  equippedSkinId: string;
  purchasedDaily: string[];
}