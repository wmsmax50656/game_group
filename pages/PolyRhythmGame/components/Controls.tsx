
import React from 'react';
import { RhythmState, RhythmLayer, COLORS } from '../types';

interface Props {
  settings: RhythmState;
  setSettings: React.Dispatch<React.SetStateAction<RhythmState>>;
  disabled?: boolean;
}

const Controls: React.FC<Props> = ({ settings, setSettings, disabled = false }) => {
  
  const handleTogglePlay = () => {
    if (disabled) return;
    setSettings(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const updateBpm = (val: number) => {
    if (disabled) return;
    setSettings(prev => ({ ...prev, bpm: val }));
  };

  const updateOffset = (val: number) => {
    if (disabled) return;
    setSettings(prev => ({ ...prev, offset: val }));
  };

  const addLayer = () => {
    if (disabled || settings.layers.length >= 8) return;
    const newId = Date.now().toString();
    const newLayer: RhythmLayer = {
      id: newId,
      beats: settings.layers.length + 3,
      color: COLORS[settings.layers.length % COLORS.length],
      mute: false
    };
    setSettings(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
  };

  const removeLayer = (id: string) => {
    if (disabled) return;
    setSettings(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id)
    }));
  };

  const updateLayerBeats = (id: string, beats: number) => {
    if (disabled) return;
    setSettings(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, beats } : l)
    }));
  };

  return (
    <div className={`w-full border-t-2 border-white/20 pt-8 space-y-12 transition-opacity ${disabled ? 'pointer-events-none select-none' : ''}`}>
      
      {/* Master Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Play/Stop Button */}
        <button
          onClick={handleTogglePlay}
          disabled={disabled}
          className={`
            w-full h-24 text-2xl font-bold uppercase tracking-widest border-2 transition-all
            flex items-center justify-center gap-4
            ${settings.isPlaying 
              ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black' 
              : 'border-white text-white hover:bg-white hover:text-black'} 
            ${disabled ? 'opacity-50 cursor-not-allowed border-gray-600 text-gray-600' : ''}
          `}
        >
          {settings.isPlaying ? '■ Terminate' : '▶ Execute'}
        </button>

        {/* Global Settings (BPM & Offset) */}
        <div className="space-y-6">
          {/* BPM Control */}
          <div className={`border-2 border-gray-800 p-4 relative bg-gray-900/20 ${disabled ? 'opacity-50' : ''}`}>
            <span className="absolute -top-3 left-4 bg-black px-2 text-gray-500 text-xs uppercase tracking-wider">
              Tempo Control
            </span>
            <div className="flex items-end justify-between mb-2">
               <span className="text-2xl font-bold text-white font-mono">{settings.bpm}</span>
               <span className="text-xs text-gray-500 mb-1">BEATS PER MINUTE</span>
            </div>
            <input 
              type="range" min="40" max="240" step="5"
              value={settings.bpm}
              onChange={(e) => updateBpm(parseInt(e.target.value))}
              className="w-full disabled:cursor-not-allowed"
              disabled={disabled}
            />
          </div>

          {/* Audio/Video Sync Calibration */}
          <div className={`border-2 border-gray-800 p-4 relative bg-gray-900/20 ${disabled ? 'opacity-50' : ''}`}>
            <span className="absolute -top-3 left-4 bg-black px-2 text-gray-500 text-xs uppercase tracking-wider">
              A/V Sync Calibration
            </span>
            <div className="flex items-end justify-between mb-2">
               <span className="text-2xl font-bold text-white font-mono">
                 {settings.offset > 0 ? '+' : ''}{settings.offset}ms
               </span>
               <span className="text-xs text-gray-500 mb-1">GLOBAL OFFSET</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => updateOffset(settings.offset - 10)}
                className="w-8 h-8 border border-gray-600 text-gray-400 hover:border-white hover:text-white flex items-center justify-center"
              >-</button>
              <input 
                type="range" min="-300" max="300" step="10"
                value={settings.offset}
                onChange={(e) => updateOffset(parseInt(e.target.value))}
                className="w-full disabled:cursor-not-allowed"
                disabled={disabled}
              />
              <button 
                onClick={() => updateOffset(settings.offset + 10)}
                className="w-8 h-8 border border-gray-600 text-gray-400 hover:border-white hover:text-white flex items-center justify-center"
              >+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Layers Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Signal Generators</h3>
          <button 
             onClick={addLayer}
             disabled={disabled || settings.layers.length >= 8}
             className="text-xs border border-gray-600 hover:border-white text-gray-400 hover:text-white px-4 py-2 uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            [ + Add Module ]
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settings.layers.map((layer) => (
            <div key={layer.id} className={`border border-gray-800 p-4 bg-gray-900/10 transition-colors relative group ${disabled ? 'opacity-70' : 'hover:border-gray-600'}`}>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 border border-current" style={{ color: layer.color }}></div>
                  <span className="text-sm font-bold text-white">MOD-{layer.id.slice(-4)}</span>
                </div>
                <button 
                  onClick={() => removeLayer(layer.id)}
                  disabled={disabled}
                  className="text-gray-600 hover:text-red-500 transition-colors px-2 disabled:opacity-0"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 font-mono">
                  <span>VERTICES</span>
                  <span className="text-white">{layer.beats}</span>
                </div>
                <input 
                  type="range" min="2" max="16" 
                  value={layer.beats}
                  onChange={(e) => updateLayerBeats(layer.id, parseInt(e.target.value))}
                  className="w-full disabled:cursor-not-allowed"
                  disabled={disabled}
                />
              </div>

              {/* Decorative corners */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-700 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-700 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Controls;
