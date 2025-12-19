import React, { useRef, useEffect } from 'react';
import { COLORS, CELL_SIZE, CANVAS_SIZE, GRID_SIZE } from '../constants';
import { SymbolType } from '../types';

interface SlotCanvasProps {
  grid: SymbolType[][];
  spinningCols: boolean[]; // Which columns are currently moving
  offsets: number[]; // Vertical pixel offset for animation per column
}

const SlotCanvas: React.FC<SlotCanvasProps> = ({ grid, spinningCols, offsets }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to draw improved pixel-art-style vector shapes
  const drawSymbol = (ctx: CanvasRenderingContext2D, type: SymbolType, x: number, y: number) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;
    
    ctx.save();
    ctx.translate(cx, cy);

    // Hard shadow for retro depth
    ctx.shadowColor = "rgba(62, 39, 35, 0.2)"; 
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    switch (type) {
      case SymbolType.CHERRY:
        // Stems
        ctx.strokeStyle = '#2E7D32'; // Dark Green
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-5, 2);
        ctx.quadraticCurveTo(0, -10, 8, -14); // Right
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(6, 2);
        ctx.quadraticCurveTo(2, -8, 8, -14); // Left
        ctx.stroke();

        // Leaf
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(8, -14, 6, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Fruit Body
        const drawCherry = (ox: number, oy: number) => {
             ctx.fillStyle = '#D50000';
             ctx.beginPath();
             ctx.arc(ox, oy, 7, 0, Math.PI * 2);
             ctx.fill();
             // Shine
             ctx.fillStyle = '#FFCDD2';
             ctx.beginPath();
             ctx.arc(ox - 2, oy - 2, 2, 0, Math.PI * 2);
             ctx.fill();
        }
        drawCherry(-6, 4);
        drawCherry(6, 4);
        break;

      case SymbolType.LEMON:
        // Main Shape
        ctx.fillStyle = '#FFEB3B'; // Bright Yellow
        ctx.beginPath();
        // A more lemon-like oval
        ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pointy Ends
        ctx.beginPath();
        ctx.arc(-16, 0, 3, 0, Math.PI * 2); // Left nub
        ctx.arc(16, 0, 3, 0, Math.PI * 2); // Right nub
        ctx.fill();

        // Texture / Pores (Dots)
        ctx.fillStyle = '#FBC02D'; // Darker Yellow for texture
        ctx.beginPath();
        ctx.arc(-8, 2, 1, 0, Math.PI*2);
        ctx.arc(4, -4, 1, 0, Math.PI*2);
        ctx.arc(8, 3, 1, 0, Math.PI*2);
        ctx.fill();
        
        // Shine
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(-5, -4, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        break;

      case SymbolType.SEVEN:
        ctx.fillStyle = '#2979FF'; // Deep Blue
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        // A bold "7" path
        ctx.moveTo(-12, -14);
        ctx.lineTo(14, -14);
        ctx.lineTo(14, -6);
        ctx.lineTo(0, 16);
        ctx.lineTo(-10, 16);
        ctx.lineTo(4, -6);
        ctx.lineTo(-12, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case SymbolType.CLOVER:
        ctx.fillStyle = '#00E676'; // Bright Green
        
        const drawLeaf = (rot: number) => {
             ctx.save();
             ctx.rotate(rot);
             ctx.translate(0, -3);
             ctx.beginPath();
             // Heart-ish shape for leaf
             ctx.arc(-5, 0, 5, Math.PI, 0); // Left bump
             ctx.arc(5, 0, 5, Math.PI, 0); // Right bump
             ctx.moveTo(10, 0);
             ctx.lineTo(0, 10); // Point
             ctx.lineTo(-10, 0);
             ctx.fill();
             ctx.restore();
        }

        drawLeaf(0);
        drawLeaf(Math.PI/2);
        drawLeaf(Math.PI);
        drawLeaf(-Math.PI/2);
        
        // Center
        ctx.fillStyle = '#1B5E20';
        ctx.beginPath();
        ctx.arc(0,0, 2, 0, Math.PI*2);
        ctx.fill();
        break;

      case SymbolType.GOLD_CLOVER:
        // Background Glow to pop against cream background
        ctx.shadowColor = "rgba(255, 111, 0, 0.8)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FF6F00'; // Amber backing
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI*2);
        ctx.fill();
        
        ctx.shadowBlur = 0; // Reset shadow for crisp internal lines
        ctx.shadowOffsetX = 0; 
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = '#FFD700'; // Gold
        
        const drawGoldLeaf = (rot: number) => {
             ctx.save();
             ctx.rotate(rot);
             ctx.translate(0, -3);
             ctx.beginPath();
             ctx.arc(-5, 0, 5, Math.PI, 0);
             ctx.arc(5, 0, 5, Math.PI, 0);
             ctx.moveTo(10, 0);
             ctx.lineTo(0, 10);
             ctx.lineTo(-10, 0);
             ctx.fill();
             
             // Inner Highlight
             ctx.fillStyle = '#FFF59D';
             ctx.beginPath();
             ctx.arc(0, 2, 2, 0, Math.PI*2);
             ctx.fill();
             ctx.fillStyle = '#FFD700';
             
             ctx.restore();
        }

        drawGoldLeaf(0);
        drawGoldLeaf(Math.PI/2);
        drawGoldLeaf(Math.PI);
        drawGoldLeaf(-Math.PI/2);

        // Diamond Center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(-6, 0);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = COLORS.screenBg;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Subtle Grid
    ctx.strokeStyle = '#E6E6C5';
    ctx.lineWidth = 1;
    for(let i=1; i<GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
    }
    
    // Draw Symbols
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE; row++) {
        const symbol = grid[col][row];
        let drawY = row * CELL_SIZE;
        
        if (spinningCols[col]) {
            drawY += offsets[col];
            // Wrap logic for drawing position
            drawY = drawY % CANVAS_SIZE;
        }

        drawSymbol(ctx, symbol, col * CELL_SIZE, drawY);

        // Draw "Ghost" symbol for seamless loop
        if (spinningCols[col]) {
             drawSymbol(ctx, symbol, col * CELL_SIZE, drawY - CANVAS_SIZE);
        }
      }
    }
    
    // Optional: Subtle scanline texture directly on canvas for extra grit
    ctx.fillStyle = "rgba(0,0,0,0.03)";
    for(let i=0; i<CANVAS_SIZE; i+=2) {
        ctx.fillRect(0, i, CANVAS_SIZE, 1);
    }

  }, [grid, spinningCols, offsets]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="w-full h-full object-contain"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default SlotCanvas;