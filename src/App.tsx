import React, { useState, useEffect } from 'react';
import type { BottleTelemetry, UserHydrationGoal, HardwareConfig, AlertMessage } from './types';
import { EdgeAIEngine } from './services/edgeAI';
import { buzzer } from './services/audioBuzzer';
import { voiceAlerts } from './services/voiceAlerts';
import { bleManager } from './services/webBluetooth';
import { Navbar } from './components/Navbar';
import { BottleSimulator } from './components/BottleSimulator';
import { Dashboard } from './components/Dashboard';
import { TelemetryGraphs } from './components/TelemetryGraphs';
import { CodeGenerator } from './components/CodeGenerator';
import { AlertLog } from './components/AlertLog';
import confetti from 'canvas-confetti';
import { Cpu, LayoutDashboard, Terminal, Bell, Sun, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Initial Telemetry State
  const [telemetry, setTelemetry] = useState<BottleTelemetry>({
    lightLux: 1500,
    uvIndex: 0.8,
    ax: 0.0,
    ay: 0.0,
    az: 1.0,
    tiltPitch: 0,
    accelMagnitude: 1.0,
    totalSips: 4,
    estimatedVolumeMl: 180,
    batteryPercent: 94,
    lastSipTime: '12 mins ago',
    weatherStrainIndex: 1.2,
    isOutdoorMode: false,
    outdoorSeconds: 1240,
  });

  // User Goals
  const [userGoal] = useState<UserHydrationGoal>({
    dailyTargetMl: 2500,
    bottleCapacityMl: 750,
    uvWarningThreshold: 6.0,
    weightKg: 70,
    outdoorTargetMinutes: 60,
  });

  // Hardware Pins & Setup Config
  const [hardwareConfig] = useState<HardwareConfig>({
    pinNeoPixel: 5,
    pinBuzzer: 6,
    pinUvSensor: 0,
    pinBattery: 1,
    sipTiltThresholdDeg: 65,
    sipMinDurationMs: 1200,
    bleServiceName: 'TouchGrass-Bottle',
  });

  // Telemetry History Buffer (for SVG live charts)
  const [history, setHistory] = useState<BottleTelemetry[]>([]);

  // Logs Feed
  const [logs, setLogs] = useState<AlertMessage[]>([
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      title: 'Touch Grass Node Initialized',
      message: 'Physical Hardware Agent connected @ 20Hz sensor sampling.',
    },
    {
      id: '2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SIP',
      title: 'Sip Detected (+45ml)',
      message: 'Bottle tilted at 72° angle for 1.4s. Volume updated.',
    },
  ]);

  // Audio & Voice State
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CODE_GEN' | 'LOGS'>('DASHBOARD');

  // Compute Edge AI Inference
  const inference = EdgeAIEngine.runInference(telemetry, userGoal);

  // Periodic Telemetry Stream Buffer & Outdoor Timer Tick (1Hz)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => {
        const isOutdoor = prev.uvIndex >= 1.2 || prev.lightLux > 2000;
        const newOutdoorSec = isOutdoor ? prev.outdoorSeconds + 1 : prev.outdoorSeconds;
        const strain = Number(((prev.uvIndex * 0.5) + (Math.max(0, prev.accelMagnitude - 1) * 3)).toFixed(1));

        const updated = {
          ...prev,
          isOutdoorMode: isOutdoor,
          outdoorSeconds: newOutdoorSec,
          weatherStrainIndex: strain,
        };

        // Push into rolling 30-sample chart buffer
        setHistory(h => [...h.slice(-29), updated]);

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Hydration Sip Trigger Function
  const handleTriggerSip = () => {
    const newSipCount = telemetry.totalSips + 1;
    const newVolume = telemetry.estimatedVolumeMl + 45;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTelemetry(prev => ({
      ...prev,
      totalSips: newSipCount,
      estimatedVolumeMl: newVolume,
      lastSipTime: nowTime,
    }));

    // Sound Piezo Chirp & Spoken Voice Alert
    buzzer.playSipChirp();
    voiceAlerts.announceSip(newVolume, newSipCount);

    // Log Event
    const newLog: AlertMessage = {
      id: Date.now().toString(),
      timestamp: nowTime,
      type: 'SIP',
      title: `Sip #${newSipCount} Recorded (+45ml)`,
      message: `Total Hydration Intake: ${newVolume} ml / ${userGoal.dailyTargetMl} ml`,
    };
    setLogs(prev => [newLog, ...prev]);

    // Check if Goal Reached
    if (newVolume >= userGoal.dailyTargetMl && telemetry.estimatedVolumeMl < userGoal.dailyTargetMl) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      buzzer.playGoalFanfare();
      setLogs(prev => [
        {
          id: (Date.now() + 1).toString(),
          timestamp: nowTime,
          type: 'GOAL_ACHIEVED',
          title: 'Daily Hydration Goal Achieved! 🎉',
          message: 'Touch Grass Agent target completed successfully.',
        },
        ...prev,
      ]);
    }
  };

  // Telemetry manual updates from sliders
  const handleUpdateTelemetry = (updates: Partial<BottleTelemetry>) => {
    setTelemetry(prev => ({ ...prev, ...updates }));
  };

  // Mute toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    buzzer.setMuted(nextMute);
  };

  // Bluetooth Connection Handler
  const handleConnectBle = async () => {
    if (isBleConnected) {
      bleManager.disconnect();
      setIsBleConnected(false);
      return;
    }

    try {
      const success = await bleManager.connect();
      if (success) {
        setIsBleConnected(true);
        bleManager.setTelemetryCallback(bleData => {
          setTelemetry(prev => ({ ...prev, ...bleData }));
        });
      }
    } catch (e) {
      console.warn('BLE connect error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        isBleConnected={isBleConnected}
        onConnectBle={handleConnectBle}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={() => {
          const next = !isVoiceEnabled;
          setIsVoiceEnabled(next);
          voiceAlerts.setEnabled(next);
        }}
        isOutdoorMode={telemetry.isOutdoorMode}
        outdoorSeconds={telemetry.outdoorSeconds}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'DASHBOARD'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>HARDWARE AGENT & DASHBOARD</span>
            </button>

            <button
              onClick={() => setActiveTab('CODE_GEN')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'CODE_GEN'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>C++ FIRMWARE EXPORTER</span>
            </button>

            <button
              onClick={() => setActiveTab('LOGS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'LOGS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>EVENT STREAM LOG ({logs.length})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500">
            <Cpu className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>TINYML INFERENCE ACTIVE</span>
          </div>
        </div>

        {/* Tab 1: Dashboard & Bottle Visualizer */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Interactive Hardware Bottle Simulator */}
              <div className="lg:col-span-1">
                <BottleSimulator
                  telemetry={telemetry}
                  onUpdateTelemetry={handleUpdateTelemetry}
                  onTriggerSip={handleTriggerSip}
                  isBleConnected={isBleConnected}
                />
              </div>

              {/* Right Column: Dashboard Gauges & Weather Strain */}
              <div className="lg:col-span-2 space-y-6">
                <Dashboard
                  telemetry={telemetry}
                  inference={inference}
                  userGoal={userGoal}
                />
              </div>

            </div>

            {/* Real-time Telemetry Streams (Full width) */}
            <TelemetryGraphs history={history} />
          </div>
        )}

        {/* Tab 2: C++ Firmware Exporter */}
        {activeTab === 'CODE_GEN' && (
          <CodeGenerator initialConfig={hardwareConfig} />
        )}

        {/* Tab 3: Event Stream Log */}
        {activeTab === 'LOGS' && (
          <AlertLog logs={logs} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Touch Grass Smart Water Bottle Hydration Agent • Edge AI / Arduino / ESP32</p>
          <div className="flex items-center gap-4 text-emerald-400">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" /> Outdoor First
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Screenless Physical Haptics
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
