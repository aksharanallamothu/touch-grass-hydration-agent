import React from 'react';
import { Sun, Volume2, VolumeX, Bluetooth, Cpu, Zap, Mic, MicOff } from 'lucide-react';

interface NavbarProps {
  isBleConnected: boolean;
  onConnectBle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  isOutdoorMode: boolean;
  outdoorSeconds: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isBleConnected,
  onConnectBle,
  isMuted,
  onToggleMute,
  isVoiceEnabled,
  onToggleVoice,
  isOutdoorMode,
  outdoorSeconds
}) => {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-emerald-500/20 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Edge AI Tag */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
            <Sun className="w-6 h-6 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                TOUCH GRASS
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> EDGE AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Hardware Screenless Hydration & UV Exposure Agent
            </p>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Outdoor Mode Timer Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isOutdoorMode 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20' 
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}>
            <Zap className={`w-3.5 h-3.5 ${isOutdoorMode ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
            <span>{isOutdoorMode ? 'OUTDOOR GRASS ACTIVE' : 'INDOOR REST'}</span>
            <span className="font-mono text-xs text-emerald-300 font-bold ml-1">
              {formatTime(outdoorSeconds)}
            </span>
          </div>

          {/* Voice Text-to-Speech Toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
              isVoiceEnabled
                ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={isVoiceEnabled ? "Text-to-Speech Spoken Alerts Active" : "Text-to-Speech Voice Muted"}
          >
            {isVoiceEnabled ? <Mic className="w-4 h-4 text-teal-400" /> : <MicOff className="w-4 h-4 text-slate-500" />}
            <span className="hidden md:inline font-mono text-[10px]">VOICE TTS</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={isMuted ? "Unmute Buzzer Sound" : "Mute Buzzer Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Bluetooth Connect Button */}
          <button
            onClick={onConnectBle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition shadow-lg ${
              isBleConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-500 hover:to-emerald-500 shadow-teal-500/20'
            }`}
          >
            <Bluetooth className={`w-4 h-4 ${isBleConnected ? 'text-emerald-400 animate-pulse' : 'text-white'}`} />
            <span>{isBleConnected ? 'ESP32 BLE CONNECTED' : 'PAIR PHYSICAL BLE'}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
