import React from 'react';
import type { BottleTelemetry, EdgeAIInference, UserHydrationGoal } from '../types';
import { Droplet, Sun, Activity, ShieldAlert, Compass } from 'lucide-react';

interface DashboardProps {
  telemetry: BottleTelemetry;
  inference: EdgeAIInference;
  userGoal: UserHydrationGoal;
}

export const Dashboard: React.FC<DashboardProps> = ({
  telemetry,
  inference,
  userGoal
}) => {
  const percentHydration = Math.min(100, Math.round((telemetry.estimatedVolumeMl / userGoal.dailyTargetMl) * 100));

  const getRiskColor = (risk: EdgeAIInference['dehydrationRisk']) => {
    switch (risk) {
      case 'CRITICAL': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'HIGH': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'MODERATE': return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      case 'LOW': default: return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    }
  };

  const riskBadge = getRiskColor(inference.dehydrationRisk);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert (If High UV Strain or Shade Recommended) */}
      {inference.shadeAlertRecommended && (
        <div className="bg-gradient-to-r from-red-950/80 via-amber-950/60 to-slate-900 border border-red-500/40 rounded-2xl p-4 flex items-start gap-4 shadow-xl shadow-red-950/30 animate-pulse">
          <div className="p-3 bg-red-500/20 rounded-xl text-red-400 border border-red-500/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-red-300 uppercase tracking-wide">
                PHYSICAL SHADE & HYDRATION ALERT TRIGGERED
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-red-500/20 text-red-300 rounded border border-red-500/30">
                PIEZO ALARM ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Current UV Index is <strong className="text-amber-300">{telemetry.uvIndex.toFixed(1)}</strong> with high exertion. Seek immediate shade and take a drink from your Smart Bottle!
            </p>
          </div>
        </div>
      )}

      {/* Main 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Hydration Goal Intake */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Daily Hydration Intake</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {telemetry.estimatedVolumeMl} <span className="text-sm font-normal text-slate-400">/ {userGoal.dailyTargetMl} ml</span>
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Droplet className="w-5 h-5" />
            </div>
          </div>

          {/* Intake Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
              <span>Goal Progress</span>
              <span className="font-bold text-cyan-400">{percentHydration}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700 shadow-sm shadow-cyan-400/50"
                style={{ width: `${percentHydration}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-2 flex items-center justify-between">
              <span>Total sips: {telemetry.totalSips}</span>
              <span>Last sip: {telemetry.lastSipTime}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Dehydration Risk & Edge AI Inference */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Edge AI Dehydration Risk</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xl font-black tracking-tight ${riskBadge.text}`}>
                  {inference.dehydrationRisk} RISK
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${riskBadge.bg} ${riskBadge.border} ${riskBadge.text}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Confidence:</span>
              <span className="text-emerald-400 font-bold">{Math.round(inference.confidence * 100)}%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {inference.activityLabel}
            </p>
          </div>
        </div>

        {/* Card 3: Solar UV Index & Lux */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Outdoor Solar UV Exposure</p>
              <h3 className="text-2xl font-black text-amber-300 mt-1">
                UV {telemetry.uvIndex.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 12</span>
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Ambient Light:</span>
              <span className="text-amber-300 font-bold">{Math.round(telemetry.lightLux).toLocaleString()} Lux</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                style={{ width: `${Math.min(100, (telemetry.uvIndex / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Weather Strain Index */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Weather Strain Score</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">
                {telemetry.weatherStrainIndex.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 10.0</span>
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Target Hourly Intake:</span>
              <span className="text-emerald-300 font-bold">{inference.suggestedHourlyIntakeMl} ml/h</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Combines IMU motion + UV strain
            </p>
          </div>
        </div>

      </div>

      {/* Screenless Physical Hardware Interaction Guide */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            100% Screenless Hardware Feedback Guide (Zero Phone Screen Required)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-cyan-400 shrink-0 shadow-lg shadow-cyan-400/50 mt-0.5 animate-pulse" />
            <div>
              <h4 className="font-bold text-cyan-300">Pulsing Cyan Halo</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Normal indoor state. Hydration target is on track. Device is sampling IMU & Light @ 20Hz.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-emerald-400 shrink-0 shadow-lg shadow-emerald-400/50 mt-0.5 animate-pulse" />
            <div>
              <h4 className="font-bold text-emerald-300">Emerald Green Chime</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Double piezo chirp on sip detection (&gt;65° pitch angle). Outdoor "Touch Grass" activity mode active.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-amber-400 shrink-0 shadow-lg shadow-amber-400/50 mt-0.5 animate-pulse" />
            <div>
              <h4 className="font-bold text-amber-300">Flashing Amber / Red Alert</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                High UV exposure (&gt;6.0) or hydration overdue (&gt;30 min). Urgent buzzer chirp sounds.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
