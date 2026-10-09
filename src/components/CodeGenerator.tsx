import React, { useState } from 'react';
import { Copy, Check, Sliders, Cpu, Terminal } from 'lucide-react';
import type { HardwareConfig } from '../types';

interface CodeGeneratorProps {
  initialConfig: HardwareConfig;
}

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({ initialConfig }) => {
  const [config, setConfig] = useState<HardwareConfig>(initialConfig);
  const [copied, setCopied] = useState(false);

  const generatedCode = `/*
 * Custom Hardware Firmware for Touch Grass Smart Hydration Agent
 * Board Target: ESP32-WROOM / Arduino UNO R4 WiFi
 * Generated for BLE Device Name: "${config.bleServiceName}"
 */

#include <Wire.h>
#include <ArduinoBLE.h>

#define PIN_NEOPIXEL     ${config.pinNeoPixel}
#define PIN_BUZZER       ${config.pinBuzzer}
#define PIN_UV_ANALOG    ${config.pinUvSensor}
#define PIN_BATTERY      ${config.pinBattery}

#define SIP_TILT_THRESHOLD  ${config.sipTiltThresholdDeg}.0f
#define SIP_MIN_MS          ${config.sipMinDurationMs}

BLEService hydrationService("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
BLEStringCharacteristic telemetryChar("beb5483e-36e1-4688-b7f5-ea07361b26a8", BLERead | BLENotify, 80);

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_UV_ANALOG, INPUT);
  
  if (!BLE.begin()) {
    Serial.println("BLE Init Failed!");
    while(1);
  }
  
  BLE.setLocalName("${config.bleServiceName}");
  BLE.setAdvertisedService(hydrationService);
  hydrationService.addCharacteristic(telemetryChar);
  BLE.addService(hydrationService);
  BLE.advertise();
  
  // Power-on Chime
  tone(PIN_BUZZER, 880, 100);
}

void loop() {
  BLEDevice central = BLE.central();
  if (central) {
    while (central.connected()) {
      int uvVal = analogRead(PIN_UV_ANALOG);
      float uvIndex = (uvVal / 1024.0f) * 12.0f;
      
      char packet[80];
      snprintf(packet, sizeof(packet), "UV:%.1f|LUX:%.0f|TILT:0|SIPS:0|VOL:0", uvIndex, uvIndex * 3000.0f);
      telemetryChar.writeValue(packet);
      delay(200);
    }
  }
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Firmware & TinyML Code Exporter
            </h2>
            <p className="text-xs text-slate-400">
              Generate custom C++ Arduino/ESP32 sketch with tuned pinouts & thresholds
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4 text-white" />}
          <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY C++ CODE'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hardware Configuration Sliders / Inputs */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" /> Hardware Pin Configuration
          </h3>

          <div>
            <label className="text-xs text-slate-400 flex justify-between">
              <span>WS2812B NeoPixel GPIO:</span>
              <span className="font-mono text-emerald-400 font-bold">GPIO {config.pinNeoPixel}</span>
            </label>
            <input
              type="number"
              value={config.pinNeoPixel}
              onChange={e => setConfig({ ...config, pinNeoPixel: parseInt(e.target.value) || 5 })}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 flex justify-between">
              <span>Piezo Buzzer PWM GPIO:</span>
              <span className="font-mono text-emerald-400 font-bold">GPIO {config.pinBuzzer}</span>
            </label>
            <input
              type="number"
              value={config.pinBuzzer}
              onChange={e => setConfig({ ...config, pinBuzzer: parseInt(e.target.value) || 6 })}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 flex justify-between">
              <span>Sip Gesture Tilt Pitch (°):</span>
              <span className="font-mono text-teal-300 font-bold">{config.sipTiltThresholdDeg}°</span>
            </label>
            <input
              type="range"
              min="45"
              max="85"
              value={config.sipTiltThresholdDeg}
              onChange={e => setConfig({ ...config, sipTiltThresholdDeg: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 flex justify-between">
              <span>BLE GATT Local Name:</span>
            </label>
            <input
              type="text"
              value={config.bleServiceName}
              onChange={e => setConfig({ ...config, bleServiceName: e.target.value })}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Code Preview Pane */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Terminal className="w-4 h-4" /> touch_grass_custom.ino
            </span>
            <span>Arduino C++ / ESP32</span>
          </div>

          <pre className="overflow-x-auto max-h-96 text-emerald-300/90 leading-relaxed scrollbar-thin">
            <code>{generatedCode}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};
