import React from 'react';
import type { BottleTelemetry } from '../types';
import { Sun, Activity, TrendingUp } from 'lucide-react';

interface TelemetryGraphsProps {
  history: BottleTelemetry[];
}

export const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  // Generate SVG path for a history array
  const createSvgPath = (
    data: number[],
    width: number,
    height: number,
    minVal: number,
    maxVal: number
  ) => {
    if (data.length < 2) return '';
    const range = maxVal - minVal || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((val, i) => {
      const x = i * stepX;
      const normalizedY = (val - minVal) / range;
      const y = height - normalizedY * (height - 20) - 10;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const chartWidth = 500;
  const chartHeight = 120;

  const uvValues = history.map(h => h.uvIndex);
  const accelValues = history.map(h => h.accelMagnitude);
  const volumeValues = history.map(h => h.estimatedVolumeMl);

  const uvPath = createSvgPath(uvValues, chartWidth, chartHeight, 0, 12);
  const accelPath = createSvgPath(accelValues, chartWidth, chartHeight, 0.5, 3.5);
  const volumePath = createSvgPath(volumeValues, chartWidth, chartHeight, 0, 2000);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            Real-Time Edge Telemetry Streams
          </h2>
          <p className="text-xs text-slate-400">
            20Hz Sensor Telemetry Buffer ({history.length} samples logged)
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
          LIVE TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: UV Index Stream */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sun className="w-4 h-4 text-amber-400" /> Solar UV Index (LTR390)
            </span>
            <span className="font-mono text-xs text-amber-400 font-bold">
              {uvValues[uvValues.length - 1]?.toFixed(1) || '0.0'}
            </span>
          </div>

          <div className="relative w-full h-28 my-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={uvPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Buffer Start</span>
            <span>Current Stream</span>
          </div>
        </div>

        {/* Chart 2: Acceleration Vector Magnitude */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Activity className="w-4 h-4 text-cyan-400" /> IMU Accel |A| Vector (g)
            </span>
            <span className="font-mono text-xs text-cyan-400 font-bold">
              {accelValues[accelValues.length - 1]?.toFixed(2) || '1.00'}g
            </span>
          </div>

          <div className="relative w-full h-28 my-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <path d={accelPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Buffer Start</span>
            <span>Current Stream</span>
          </div>
        </div>

        {/* Chart 3: Hydration Volume Accumulation */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Cumulative Hydration (ml)
            </span>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              {volumeValues[volumeValues.length - 1] || 0} ml
            </span>
          </div>

          <div className="relative w-full h-28 my-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <path d={volumePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Buffer Start</span>
            <span>Current Stream</span>
          </div>
        </div>

      </div>

    </div>
  );
};
