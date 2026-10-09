import React from 'react';
import type { AlertMessage } from '../types';
import { Bell, Droplet, Sun, ShieldAlert, CheckCircle2, Radio } from 'lucide-react';

interface AlertLogProps {
  logs: AlertMessage[];
}

export const AlertLog: React.FC<AlertLogProps> = ({ logs }) => {
  const getIcon = (type: AlertMessage['type']) => {
    switch (type) {
      case 'SIP': return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'SHADE': return <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />;
      case 'REMINDER': return <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />;
      case 'GOAL_ACHIEVED': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'SYSTEM': default: return <Radio className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            Hardware & Agent Activity Stream
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-500">
          {logs.length} Events Recorded
        </span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No hardware events logged yet. Take a sip or adjust sliders!
          </div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-start justify-between text-xs transition hover:border-slate-700"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(log.type)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{log.title}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">{log.message}</p>
                </div>
              </div>

              <span className="font-mono text-[10px] text-slate-500 shrink-0 ml-2">
                {log.timestamp}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
