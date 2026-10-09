# 🌿 "Touch Grass" Smart Water Bottle Hydration Agent (Edge AI / Arduino)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Edge AI](https://img.shields.io/badge/Edge_AI-TinyML-cyan.svg)](#-edge-ai-architecture)
[![Hardware](https://img.shields.io/badge/Hardware-ESP32%2FArduino_UNO_R4-orange.svg)](#-hardware--firmware)
[![BLE](https://img.shields.io/badge/BLE-Web_Bluetooth_GATT-blue.svg)](#-web-companion-dashboard)

A physical, hardware-based agent built into a water bottle or backpack strap that tracks outdoor activity time, exposure to ambient light/UV, and alerts you when to drink water or seek shade.

---

## 🌟 The "Touch Grass" Concept
Unlike traditional fitness trackers that rely on phone screens or intrusive push notifications, the **Touch Grass Smart Water Bottle** is **100% physical and screenless outdoor hardware**:
- **Zero-Screen Interaction**: Relies on ambient **WS2812B NeoPixel RGB halo light rings** and **piezoceramic haptic sound chirps**.
- **On-Device TinyML**: Executes local IMU tilt gesture detection (sip recognition) and weather strain calculation directly on the ESP32 chip.
- **Off-Grid & Offline**: Operates seamlessly in remote wilderness without Wi-Fi or cellular service using peer-to-peer Bluetooth Low Energy (BLE).

---

## 🏗️ Hardware Architecture & Wiring

```
  +-------------------------------------------------------------------------+
  |                      ESP32 / ARDUINO UNO R4 WIFi                        |
  |                                                                         |
  |   [3.3V/5V] -------> VCC (MPU6050, LTR390, NeoPixel)                    |
  |   [GND]    -------> GND (All Sensors & Common Ground)                   |
  |                                                                         |
  |   [GPIO 21 / A4] -> SDA (MPU6050 IMU & LTR390 UV Sensor I2C)            |
  |   [GPIO 22 / A5] -> SCL (MPU6050 IMU & LTR390 UV Sensor I2C)            |
  |                                                                         |
  |   [GPIO 5]  -------> DIN (WS2812B NeoPixel 8-LED Halo Ring)             |
  |   [GPIO 6]  -------> POS (+) (Piezoelectric Ceramic Buzzer)            |
  |   [Pin A0]  -------> SIG (Analog Photodiode / UV Sensor Input)        |
  |   [Pin A1]  -------> BAT (3.7V LiPo Battery Voltage Divider)             |
  +-------------------------------------------------------------------------+
```

### Bill of Materials (BOM)
- **Microcontroller**: ESP32-WROOM-32 or Arduino UNO R4 WiFi
- **6-Axis Motion IMU**: MPU6050 / LSM6DS3 (I2C address `0x68`)
- **Light / UV Sensor**: LTR390 / Analog Photodiode (A0)
- **Visual Feedback**: WS2812B NeoPixel RGB LED Ring (Pin 5)
- **Audio Feedback**: 3.3V Piezoelectric Ceramic Buzzer (Pin 6)
- **Power**: 3.7V 1000mAh LiPo Battery with TP4056 USB-C Charger module

---

## 🧠 Edge AI & Web Companion Features

- **Activity Classifier**: Detects `INDOOR_REST`, `OUTDOOR_WALK`, `OUTDOOR_RUN`, and `EXPOSURE_WARNING` states.
- **Weather Strain Score**: Combines solar UV Index + ambient lux + IMU movement vector magnitude \(|A| = \sqrt{a_x^2 + a_y^2 + a_z^2}\).
- **Interactive Hardware Simulator**: Complete 2D/3D bottle graphic with tilt pitch controls (-30° to +90°), UV exposure sliders, and piezoceramic Web Audio sound synthesis.
- **Web Bluetooth (BLE) Manager**: Connects browser directly to ESP32 GATT server characteristics over local BLE.
- **Firmware Exporter**: Custom C++ code generator for makers to tune GPIO pins, bottle volumes, and sip angles.

---

## 📁 Repository Structure

```
├── firmware/
│   └── touch_grass_firmware.ino    # Arduino / ESP32 C++ firmware sketch
├── docs/
│   └── hardware_wiring.md          # Wiring schematics & hardware assembly guide
├── src/
│   ├── components/
│   │   ├── BottleSimulator.tsx     # Interactive 3D/2D bottle simulator
│   │   ├── Dashboard.tsx           # Hydration gauges & weather strain score
│   │   ├── TelemetryGraphs.tsx     # Real-time SVG telemetry streams
│   │   ├── CodeGenerator.tsx       # Custom C++ firmware generator
│   │   ├── AlertLog.tsx            # Chronological event feed
│   │   └── Navbar.tsx              # Top status bar & BLE controls
│   ├── services/
│   │   ├── edgeAI.ts               # Edge AI classifier engine
│   │   ├── webBluetooth.ts         # Web BLE GATT server manager
│   │   └── audioBuzzer.ts          # Web Audio API piezo sound synthesizer
│   ├── types.ts                    # TypeScript interfaces
│   ├── App.tsx                     # Main React application
│   └── main.tsx                    # Entry point
├── vite.config.ts                  # Vite + Tailwind setup
└── package.json
```

---

## ⚡ Quick Start

### 1. Run Companion Web Dashboard Locally
```bash
# Clone repository
git clone https://github.com/aksharanallamothu/touch-grass-hydration-agent.git
cd touch-grass-hydration-agent

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 2. Flash Microcontroller Firmware
1. Open `firmware/touch_grass_firmware.ino` in Arduino IDE.
2. Select target board (**ESP32 Dev Module** or **Arduino UNO R4 WiFi**).
3. Click **Upload** and pair with the Web App over Bluetooth LE!

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
