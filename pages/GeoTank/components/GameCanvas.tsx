import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Entity, EntityType, PlayerStats, UpgradeState, CONSTANTS, FloatingText } from '../types';
import { audioService } from '../services/audioService';
import { v4 as uuidv4 } from 'uuid';

// Helper for collision
const checkCollision = (e1: Entity, e2: Entity) => {
  const dx = e1.x - e2.x;
  const dy = e1.y - e2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < e1.radius + e2.radius;
};

// Diep.io Classic Palette
const COLORS = {
  PLAYER: '#00b2e1',    // Blue
  BULLET: '#00b2e1',    // Blue
  SQUARE: '#ffe869',    // Yellow
  TRIANGLE: '#fc7677',  // Red
  PENTAGON: '#768dfc',  // Purple
  BOSS: '#8C4354',      // Darker Red/Pink (Summoner style)
  BARREL: '#999999',    // Grey
  STROKE: '#555555',    // Dark Grey Border
  BACKGROUND: '#cdcdcd',
  GRID: '#b4b4b4',
};

const STROKE_WIDTH = 4;

// Enemy Config
const ENEMY_TYPES = {
  SQUARE: { hp: 10, score: 100, radius: 24, color: COLORS.SQUARE, damage: 8, speed: 1.0 },
  TRIANGLE: { hp: 30, score: 300, radius: 30, color: COLORS.TRIANGLE, damage: 15, speed: 2.2 },
  PENTAGON: { hp: 100, score: 1000, radius: 48, color: COLORS.PENTAGON, damage: 25, speed: 0.6 },
  BOSS: { hp: 3000, score: 10000, radius: 90, color: COLORS.BOSS, damage: 40, speed: 0.8 },
};

interface GameCanvasProps {
  setScore: (score: number) => void;
  setLevel: (level: number) => void;
  setXp: (xp: number, maxXp: number) => void;
  setHp: (hp: number, maxHp: number) => void;
  setUpgradePoints: (fn: (prev: number) => number) => void;
  upgrades: UpgradeState;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  setScore, setLevel, setXp, setHp, setUpgradePoints, upgrades 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State Refs
  const playerRef = useRef<Entity>({
    id: 'player',
    type: EntityType.PLAYER,
    x: CONSTANTS.WORLD_WIDTH / 2,
    y: CONSTANTS.WORLD_HEIGHT / 2,
    radius: CONSTANTS.PLAYER_RADIUS,
    vx: 0,
    vy: 0,
    angle: 0,
    hp: CONSTANTS.PLAYER_BASE_HP,
    maxHp: CONSTANTS.PLAYER_BASE_HP,
    color: COLORS.PLAYER,
    damage: 0,
    scoreValue: 0
  });

  const entitiesRef = useRef<Entity[]>([]);
  const textsRef = useRef<FloatingText[]>([]);
  const cameraRef = useRef({ x: CONSTANTS.WORLD_WIDTH / 2, y: CONSTANTS.WORLD_HEIGHT / 2 });
  const shakeRef = useRef(0);
  
  const frameRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const gameStateRef = useRef({
    score: 0,
    level: 1,
    xp: 0,
    maxXp: 100,
    lastShotFrame: 0,
    gameTime: 0
  });

  const getPlayerStats = (): PlayerStats => {
    return {
      bulletSpeed: 8 + upgrades.bulletSpeed * 1.5,
      reloadTime: Math.max(5, 30 - upgrades.reload * 3),
      moveSpeed: 5 + upgrades.moveSpeed * 0.6,
      bulletDamage: 12 + upgrades.damage * 5,
      maxHp: CONSTANTS.PLAYER_BASE_HP + upgrades.damage * 10
    };
  };

  const addFloatingText = (text: string, x: number, y: number, color: string, size = 20) => {
    textsRef.current.push({
      id: uuidv4(),
      text, x, y, color, size,
      life: 50, maxLife: 50,
      vx: (Math.random() - 0.5) * 1,
      vy: -1.5 
    });
  };

  const spawnEntity = (type: EntityType, x: number, y: number, angle = 0) => {
    let config = ENEMY_TYPES.SQUARE;
    let newEntity: Entity = {
      id: uuidv4(),
      type,
      x,
      y,
      radius: 0,
      vx: 0,
      vy: 0,
      angle,
      hp: 0,
      maxHp: 0,
      color: '',
      damage: 0,
      scoreValue: 0
    };

    if (type === EntityType.BULLET) {
      const stats = getPlayerStats();
      newEntity = {
        ...newEntity,
        radius: 10,
        color: COLORS.BULLET,
        vx: Math.cos(angle) * stats.bulletSpeed,
        vy: Math.sin(angle) * stats.bulletSpeed,
        damage: stats.bulletDamage,
        ttl: 120
      };
    } else if (type === EntityType.PARTICLE) {
       newEntity = {
        ...newEntity,
        radius: Math.random() * 5 + 3,
        color: '#FFFFFF', // Will be overridden
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        ttl: 20,
        damage: 0
      };
    } else {
      if (type === EntityType.BOSS) config = ENEMY_TYPES.BOSS;
      else if (type === EntityType.ENEMY_PENTAGON) config = ENEMY_TYPES.PENTAGON;
      else if (type === EntityType.ENEMY_TRIANGLE) config = ENEMY_TYPES.TRIANGLE;
      
      newEntity = {
        ...newEntity,
        radius: config.radius,
        hp: config.hp,
        maxHp: config.hp,
        scoreValue: config.score,
        color: config.color,
        damage: config.damage,
      };
    }
    entitiesRef.current.push(newEntity);
  };

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for(let i=0; i<count; i++) {
        const p: Entity = {
            id: uuidv4(),
            type: EntityType.PARTICLE,
            x, y,
            radius: Math.random() * 6 + 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            angle: 0,
            hp: 0, maxHp: 0,
            damage: 0, scoreValue: 0,
            color: color,
            ttl: 15 + Math.random() * 15
        };
        entitiesRef.current.push(p);
    }
  };

  const handleLevelUp = () => {
    const state = gameStateRef.current;
    if (state.xp >= state.maxXp) {
      state.xp -= state.maxXp;
      state.level += 1;
      state.maxXp = Math.floor(state.maxXp * CONSTANTS.XP_TO_LEVEL_FACTOR);
      setUpgradePoints(p => p + 1);
      audioService.playLevelUp();
      setLevel(state.level);
      playerRef.current.hp = playerRef.current.maxHp;
      addFloatingText("Level Up!", playerRef.current.x, playerRef.current.y - 50, '#000000', 36);
    }
    setXp(state.xp, state.maxXp);
  };

  // Helper to draw a polygon
  const drawPolygon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, sides: number, angle: number = 0) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const rot = angle + (i * 2 * Math.PI) / sides;
        ctx.lineTo(x + Math.cos(rot) * radius, y + Math.sin(rot) * radius);
      }
      ctx.closePath();
  };

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameRef.current++;
    gameStateRef.current.gameTime++;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const player = playerRef.current;
    const stats = getPlayerStats();
    
    // --- 1. Player Physics (Drift) ---
    const ACCEL = stats.moveSpeed * 0.08; 
    const FRICTION = 0.93; // Higher friction for tanky feel

    let inputDx = 0;
    let inputDy = 0;
    if (keysRef.current['w'] || keysRef.current['arrowup']) inputDy = -1;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) inputDy = 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) inputDx = -1;
    if (keysRef.current['d'] || keysRef.current['arrowright']) inputDx = 1;

    if (inputDx !== 0 || inputDy !== 0) {
      const length = Math.sqrt(inputDx * inputDx + inputDy * inputDy);
      inputDx /= length;
      inputDy /= length;
    }

    player.vx += inputDx * ACCEL;
    player.vy += inputDy * ACCEL;
    player.vx *= FRICTION;
    player.vy *= FRICTION;
    player.x += player.vx;
    player.y += player.vy;

    // Boundaries
    if (player.x < player.radius) { player.x = player.radius; player.vx *= -0.5; }
    if (player.x > CONSTANTS.WORLD_WIDTH - player.radius) { player.x = CONSTANTS.WORLD_WIDTH - player.radius; player.vx *= -0.5; }
    if (player.y < player.radius) { player.y = player.radius; player.vy *= -0.5; }
    if (player.y > CONSTANTS.WORLD_HEIGHT - player.radius) { player.y = CONSTANTS.WORLD_HEIGHT - player.radius; player.vy *= -0.5; }

    // Camera (Soft Follow)
    const cam = cameraRef.current;
    cam.x += (player.x - cam.x) * 0.08;
    cam.y += (player.y - cam.y) * 0.08;

    // Mouse Aiming
    const mouseWorldX = mouseRef.current.x - canvasWidth/2 + cam.x;
    const mouseWorldY = mouseRef.current.y - canvasHeight/2 + cam.y;
    player.angle = Math.atan2(mouseWorldY - player.y, mouseWorldX - player.x);

    // Shooting
    if (mouseRef.current.down && frameRef.current - gameStateRef.current.lastShotFrame >= stats.reloadTime) {
      const barrelLen = player.radius * 1.6;
      spawnEntity(EntityType.BULLET, 
        player.x + Math.cos(player.angle) * barrelLen, 
        player.y + Math.sin(player.angle) * barrelLen, 
        player.angle + (Math.random() - 0.5) * 0.05
      );
      gameStateRef.current.lastShotFrame = frameRef.current;
      audioService.playShoot();
      
      const recoilPower = 0.5 + stats.bulletDamage * 0.05;
      player.vx -= Math.cos(player.angle) * recoilPower;
      player.vy -= Math.sin(player.angle) * recoilPower;
      
      shakeRef.current += 1.5;
    }

    // --- 2. Spawning ---
    const spawnRate = Math.max(20, 100 - gameStateRef.current.level * 2);
    if (frameRef.current % spawnRate === 0 && entitiesRef.current.length < 50) {
        const dist = Math.max(canvasWidth, canvasHeight) / 1.2 + Math.random() * 300;
        const angle = Math.random() * Math.PI * 2;
        let ex = player.x + Math.cos(angle) * dist;
        let ey = player.y + Math.sin(angle) * dist;
        
        ex = Math.max(50, Math.min(CONSTANTS.WORLD_WIDTH - 50, ex));
        ey = Math.max(50, Math.min(CONSTANTS.WORLD_HEIGHT - 50, ey));

        const rand = Math.random();
        let type = EntityType.ENEMY_SQUARE;
        if (rand > 0.92) type = EntityType.ENEMY_PENTAGON;
        else if (rand > 0.75) type = EntityType.ENEMY_TRIANGLE;
        
        spawnEntity(type, ex, ey);
    }

    if (gameStateRef.current.gameTime % 3600 === 0 && gameStateRef.current.gameTime > 0) {
        spawnEntity(EntityType.BOSS, player.x, 200);
        addFloatingText("THE GUARDIAN", player.x, player.y - 150, '#F14E54', 40);
        shakeRef.current += 10;
    }

    // --- 3. Update Entities ---
    entitiesRef.current.forEach(e => {
      if (e.type === EntityType.BULLET || e.type === EntityType.PARTICLE) {
        e.x += e.vx;
        e.y += e.vy;
        
        if (e.type === EntityType.PARTICLE) {
            e.vx *= 0.9;
            e.vy *= 0.9;
        }

        if(e.ttl !== undefined) e.ttl--;
        if(e.ttl !== undefined && e.ttl <= 0) e.remove = true;
        if (e.type === EntityType.BULLET && (e.x < 0 || e.x > CONSTANTS.WORLD_WIDTH || e.y < 0 || e.y > CONSTANTS.WORLD_HEIGHT)) {
            e.remove = true;
        }
      } else {
        const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x);
        let maxSpeed = 0;
        if (e.type === EntityType.ENEMY_SQUARE) maxSpeed = ENEMY_TYPES.SQUARE.speed;
        if (e.type === EntityType.ENEMY_TRIANGLE) maxSpeed = ENEMY_TYPES.TRIANGLE.speed;
        if (e.type === EntityType.ENEMY_PENTAGON) maxSpeed = ENEMY_TYPES.PENTAGON.speed;
        if (e.type === EntityType.BOSS) maxSpeed = ENEMY_TYPES.BOSS.speed;

        const enemyAccel = 0.03; 
        e.vx += Math.cos(angleToPlayer) * enemyAccel;
        e.vy += Math.sin(angleToPlayer) * enemyAccel;
        
        const currentSpeed = Math.sqrt(e.vx*e.vx + e.vy*e.vy);
        if (currentSpeed > maxSpeed) {
            e.vx = (e.vx / currentSpeed) * maxSpeed;
            e.vy = (e.vy / currentSpeed) * maxSpeed;
        }
        
        e.angle += 0.02; // Slow rotation
        e.x += e.vx;
        e.y += e.vy;

        // Bounce off walls
         if (e.x < e.radius || e.x > CONSTANTS.WORLD_WIDTH - e.radius) e.vx *= -1;
         if (e.y < e.radius || e.y > CONSTANTS.WORLD_HEIGHT - e.radius) e.vy *= -1;
      }
    });

    // --- 4. Collisions ---
    // Bullet vs Enemies
    entitiesRef.current.filter(e => e.type === EntityType.BULLET).forEach(bullet => {
        if(bullet.remove) return;
        entitiesRef.current.filter(e => e.type.startsWith('ENEMY') || e.type === EntityType.BOSS).forEach(enemy => {
            if(enemy.remove) return;
            if(checkCollision(bullet, enemy)) {
                bullet.remove = true;
                enemy.hp -= bullet.damage;
                audioService.playHit();
                
                // Knockback
                const knockback = 2.0;
                enemy.vx += Math.cos(bullet.angle) * knockback;
                enemy.vy += Math.sin(bullet.angle) * knockback;
                
                if(enemy.hp <= 0) {
                    enemy.remove = true;
                    spawnParticles(enemy.x, enemy.y, enemy.color, 8);
                    audioService.playExplosion();
                    gameStateRef.current.score += enemy.scoreValue;
                    gameStateRef.current.xp += enemy.scoreValue / 2;
                    setScore(gameStateRef.current.score);
                    handleLevelUp();
                }
            }
        });
    });

    // Player vs Enemies
    entitiesRef.current.filter(e => e.type.startsWith('ENEMY') || e.type === EntityType.BOSS).forEach(enemy => {
        if (enemy.remove) return;
        if (checkCollision(player, enemy)) {
            const damage = enemy.damage * 0.1;
            player.hp -= damage;
            setHp(player.hp, player.maxHp);
            shakeRef.current += 1;
            
            // Elastic collision response
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            const force = 4;
            player.vx += Math.cos(angle) * force;
            player.vy += Math.sin(angle) * force;
            enemy.vx -= Math.cos(angle) * force;
            enemy.vy -= Math.sin(angle) * force;
            
            if (player.hp <= 0) {
               player.x = CONSTANTS.WORLD_WIDTH / 2;
               player.y = CONSTANTS.WORLD_HEIGHT / 2;
               player.hp = player.maxHp;
               player.vx = 0; player.vy = 0;
               gameStateRef.current.score = 0;
               gameStateRef.current.level = 1;
               gameStateRef.current.xp = 0;
               entitiesRef.current = [];
               setScore(0);
               setLevel(1);
               shakeRef.current += 10;
            }
        }
    });

    entitiesRef.current = entitiesRef.current.filter(e => !e.remove);

    // Update Floating Text
    textsRef.current.forEach(t => {
        t.x += t.vx;
        t.y += t.vy;
        t.life--;
    });
    textsRef.current = textsRef.current.filter(t => t.life > 0);

    // --- 5. Drawing ---
    if (shakeRef.current > 0) {
        shakeRef.current *= 0.9; 
        if (shakeRef.current < 0.1) shakeRef.current = 0;
    }
    const shakeX = (Math.random() - 0.5) * shakeRef.current;
    const shakeY = (Math.random() - 0.5) * shakeRef.current;

    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0,0, canvasWidth, canvasHeight);

    // Center Camera
    ctx.translate(canvasWidth/2 - cam.x + shakeX, canvasHeight/2 - cam.y + shakeY);

    // Draw Grid
    const gridSize = 40; // Diep grid is tighter
    const startX = Math.floor((cam.x - canvasWidth/2) / gridSize) * gridSize;
    const startY = Math.floor((cam.y - canvasHeight/2) / gridSize) * gridSize;
    
    ctx.beginPath();
    ctx.strokeStyle = COLORS.GRID;
    ctx.lineWidth = 1;

    const visibleCols = Math.ceil(canvasWidth / gridSize) + 2;
    const visibleRows = Math.ceil(canvasHeight / gridSize) + 2;

    for (let x = 0; x < visibleCols; x++) {
        const gx = startX + x * gridSize;
        if (gx < 0 || gx > CONSTANTS.WORLD_WIDTH) continue;
        ctx.moveTo(gx, startY - gridSize);
        ctx.lineTo(gx, startY + canvasHeight + gridSize * 2);
    }
    for (let y = 0; y < visibleRows; y++) {
        const gy = startY + y * gridSize;
        if (gy < 0 || gy > CONSTANTS.WORLD_HEIGHT) continue;
        ctx.moveTo(startX - gridSize, gy);
        ctx.lineTo(startX + canvasWidth + gridSize * 2, gy);
    }
    ctx.stroke();

    // Render Entities
    // We sort entities to ensure proper layering if needed, though simple loop is fine.
    
    // Draw Functions
    const setEntityStyle = (color: string) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = COLORS.STROKE;
        ctx.lineWidth = STROKE_WIDTH;
        ctx.lineJoin = 'round';
    };

    [...entitiesRef.current, playerRef.current].forEach(e => {
        // Optimization: view culling
        if (e.x + e.radius < cam.x - canvasWidth/2 - 100 || 
            e.x - e.radius > cam.x + canvasWidth/2 + 100 ||
            e.y + e.radius < cam.y - canvasHeight/2 - 100 ||
            e.y - e.radius > cam.y + canvasHeight/2 + 100) return;

        if (e.type === EntityType.PLAYER) {
            // Barrel (Rect)
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.rotate(e.angle);
            
            ctx.fillStyle = COLORS.BARREL;
            ctx.strokeStyle = COLORS.STROKE;
            ctx.lineWidth = STROKE_WIDTH;
            // Draw barrel sticking out
            ctx.fillRect(0, -e.radius * 0.4, e.radius * 2.2, e.radius * 0.8);
            ctx.strokeRect(0, -e.radius * 0.4, e.radius * 2.2, e.radius * 0.8);
            
            ctx.restore();

            // Body (Circle)
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            setEntityStyle(COLORS.PLAYER);
            ctx.fill();
            ctx.stroke();

        } else if (e.type === EntityType.BULLET) {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            setEntityStyle(COLORS.BULLET);
            ctx.fill();
            ctx.stroke();
        } else if (e.type === EntityType.PARTICLE) {
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Enemies
            setEntityStyle(e.color);
            if (e.type === EntityType.ENEMY_SQUARE) {
                // Square
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.rotate(e.angle);
                ctx.beginPath();
                ctx.rect(-e.radius, -e.radius, e.radius*2, e.radius*2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            } else if (e.type === EntityType.ENEMY_TRIANGLE) {
                // Triangle
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.rotate(e.angle);
                drawPolygon(ctx, 0, 0, e.radius, 3, 0);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            } else if (e.type === EntityType.ENEMY_PENTAGON || e.type === EntityType.BOSS) {
                // Pentagon
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.rotate(e.angle);
                drawPolygon(ctx, 0, 0, e.radius, 5, 0);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            // Health Bar for damaged enemies
            if (e.hp < e.maxHp) {
                const barW = e.radius * 1.5;
                const barH = 5;
                const barY = e.y + e.radius + 10;
                ctx.fillStyle = '#555'; // bg
                ctx.fillRect(e.x - barW/2, barY, barW, barH);
                ctx.fillStyle = '#85e37d'; // hp green
                ctx.fillRect(e.x - barW/2 + 1, barY + 1, (barW - 2) * (e.hp/e.maxHp), barH - 2);
            }
        }
    });

    // Draw Floating Text
    textsRef.current.forEach(t => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.font = `bold ${t.size}px Ubuntu, sans-serif`;
        ctx.textAlign = 'center';
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });

    requestAnimationFrame(update);
  }, [setScore, setLevel, setXp, setHp, upgrades, setUpgradePoints]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    const handleMouseMove = (e: MouseEvent) => { 
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
    };
    const handleMouseDown = () => { mouseRef.current.down = true; };
    const handleMouseUp = () => { mouseRef.current.down = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
    }

    const raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(raf);
    };
  }, [update]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full cursor-crosshair" />;
};