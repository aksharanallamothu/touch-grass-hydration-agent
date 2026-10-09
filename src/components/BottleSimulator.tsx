import React from 'react';
import type { BottleTelemetry } from '../types';
import { Sun, RotateCw, Activity, Droplet, Battery, Sparkles, Wifi } from 'lucide-react';
import { buzzer } from '../services/audioBuzzer';

interface BottleSimulatorProps {
  telemetry: BottleTelemetry;
  onUpdateTelemetry: (updates: Partial<BottleTelemetry>) => void;
  onTriggerSip: () => void;
  isBleConnected: boolean;
}

export const BottleSimulator: React.FC<BottleSimulatorProps> = ({
  telemetry,
  onUpdateTelemetry,
  onTriggerSip,
  isBleConnected
}) => {

  // Dynamic LED Ring Color based on UV & Hydration state
  const getNeoPixelColor = () => {
    if (telemetry.uvIndex >= 6.0 || telemetry.weatherStrainIndex >= 7.0) {
      return { hex: '#ef4444', label: 'RED (UV / HEAT DANGER)', ringStyle: 'shadow-red-500/80 border-red-500' };
    }
    if (telemetry.isOutdoorMode) {
      return { hex: '#10b981', label: 'EMERALD (OUTDOOR GRASS ACTIVE)', ringStyle: 'shadow-emerald-500/80 border-emerald-400' };
    }
    return { hex: '#06b6d4', label: 'CYAN (NORMAL / INDOOR)', ringStyle: 'shadow-cyan-500/80 border-cyan-400' };
  };

  const ringColor = getNeoPixelColor();

  const handleTiltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pitch = parseFloat(e.target.value);
    onUpdateTelemetry({ tiltPitch: pitch });

    // Sip Gesture detection trigger at pitch >= 65 deg
    if (pitch >= 65 && telemetry.tiltPitch < 65) {
      onTriggerSip();
    }
  };

  const handleUvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uv = parseFloat(e.target.value);
    const lux = uv * 3800; // Lux scaling multiplier
    onUpdateTelemetry({
      uvIndex: uv,
      lightLux: lux,
      isOutdoorMode: uv >= 1.2 || lux > 2000
    });
  };

  const handleShake = () => {
    const randomShake = 1.8 + Math.random() * 1.5;
    onUpdateTelemetry({ accelMagnitude: randomShake });
    buzzer.playBuzzerTone(440, 50, 'sine', 0.1);
    setTimeout(() => {
      onUpdateTelemetry({ accelMagnitude: 1.0 });
    }, 1200);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Ambient Glow */}
      <div 
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: ringColor.hex }}
      />

      {/* Header & Status Indicator */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Hardware Bottle Visualizer
              </h2>
              <p className="text-xs text-slate-400">
                {isBleConnected ? 'Live BLE Sensor Stream' : 'Interactive Edge AI Hardware Node'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border flex items-center gap-1.5 ${
              isBleConnected
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Wifi className="w-3 h-3" />
              {isBleConnected ? 'BLE ACTIVE' : 'VIRTUAL NODE'}
            </span>
          </div>
        </div>

        {/* Bottle Graphic & NeoPixel LED Ring */}
        <div className="my-6 flex flex-col items-center justify-center">
          
          {/* Bottle Container with tilt rotation transform */}
          <div 
            className="relative transition-transform duration-300 ease-out flex flex-col items-center"
            style={{ transform: `rotate(${telemetry.tiltPitch * 0.5}deg)` }}
          >
            {/* Cap / Drinking Spout */}
            <div className="w-12 h-6 bg-slate-700 rounded-t-lg border-t border-slate-500 shadow-md relative z-10 flex items-center justify-center">
              <div className="w-4 h-2 bg-slate-900 rounded-sm" />
            </div>

            {/* WS2812B NeoPixel RGB LED Halo Ring */}
            <div className={`w-32 h-6 rounded-full border-4 bg-slate-950 transition-all duration-500 flex items-center justify-around px-2 shadow-xl ${ringColor.ringStyle}`}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300 animate-pulse"
                  style={{
                    backgroundColor: ringColor.hex,
                    boxShadow: `0 0 10px ${ringColor.hex}`
                  }}
                />
              ))}
            </div>

            {/* Stainless Steel Bottle Main Body */}
            <div className="w-28 h-64 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-b-3xl border-x border-b border-slate-600/80 shadow-2xl relative overflow-hidden flex flex-col justify-between p-3">
              
              {/* Brushed Metal Texture Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

              {/* Water Fill Level Gauge */}
              <div 
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-cyan-600/60 to-emerald-500/40 transition-all duration-700 rounded-b-2xl border-t border-cyan-400/40"
                style={{ height: `${Math.max(10, Math.min(100, (telemetry.estimatedVolumeMl / 1000) * 100))}%` }}
              />

              {/* Laser Etched Logo */}
              <div className="relative z-10 text-center mt-4">
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase opacity-80">
                  TOUCH GRASS
                </p>
                <p className="text-[9px] text-emerald-400/90 font-mono mt-0.5">
                  EDGE AI AGENT
                </p>
              </div>

              {/* Embedded Sensor Telemetry Overlay on Bottle Body */}
              <div className="relative z-10 bg-slate-950/70 backdrop-blur-sm p-2 rounded-xl border border-slate-800 text-[10px] space-y-1 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">TILT:</span>
                  <span className="font-bold text-teal-300">{Math.round(telemetry.tiltPitch)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">UV INDEX:</span>
                  <span className={`font-bold ${telemetry.uvIndex > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {telemetry.uvIndex.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ACCEL |A|:</span>
                  <span className="font-bold text-cyan-300">{telemetry.accelMagnitude.toFixed(2)}g</span>
                </div>
              </div>

              {/* Bottom Power Battery Badge */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
                <div className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{telemetry.batteryPercent}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{telemetry.totalSips} sips</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* LED Ring Status Badge */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: ringColor.hex }}
            />
            <span className="font-mono text-slate-300 font-semibold text-[11px]">
              WS2812B RING: {ringColor.label}
            </span>
          </div>
          <span className="text-slate-500 text-[10px] font-mono">20Hz SAMPLING</span>
        </div>

      </div>

      {/* Interactive Controls & Sensor Sliders */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        
        {/* Tilt Pitch Control Slider */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-teal-400" /> Bottle Pitch Angle:
            </span>
            <span className="font-mono text-teal-300 font-bold">{Math.round(telemetry.tiltPitch)}°</span>
          </div>
          <input
            type="range"
            min="-30"
            max="90"
            step="1"
            value={telemetry.tiltPitch}
            onChange={handleTiltChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
            <span>Vertical (0°)</span>
            <span>Sip Threshold (&gt;65°)</span>
          </div>
        </div>

        {/* UV Index & Outdoor Sunlight Slider */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Outdoor UV Exposure:
            </span>
            <span className="font-mono text-amber-300 font-bold">UV {telemetry.uvIndex.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={telemetry.uvIndex}
            onChange={handleUvChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
            <span>Indoor (0.0)</span>
            <span>Moderate (3.0)</span>
            <span>Extreme UV (8.5+)</span>
          </div>
        </div>

        {/* Quick Simulator Action Triggers */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onTriggerSip}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-500/10"
          >
            <Droplet className="w-4 h-4 text-cyan-200" />
            <span>DRINK SIP (+45ml)</span>
          </button>

          <button
            onClick={handleShake}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>SHAKE IMU (MOTION)</span>
          </button>
        </div>

      </div>

    </div>
  );
};
