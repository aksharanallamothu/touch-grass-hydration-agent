# "Touch Grass" Smart Water Bottle Hardware Assembly & Wiring Guide

This guide details the physical hardware construction, sensor wiring, power management, and mechanical installation for embedding the Edge AI Hydration Agent onto a standard stainless steel water bottle or backpack strap enclosure.

---

## 1. Bill of Materials (BOM)

| Component | Recommended Model | Function | Connection |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | ESP32-WROOM-32 / Arduino UNO R4 WiFi | Edge AI compute & BLE GATT Server | Core Controller |
| **6-Axis Motion IMU** | MPU6050 / LSM6DS3 | Tilt detection, step counting, sip gesture recognition | I2C (SDA/SCL - 0x68) |
| **Light & UV Sensor** | LTR390 / BH1750 / Analog Photodiode | Ambient light lux & Solar UV Index measurement | I2C / Analog Pin A0 |
| **Physical Feedback** | WS2812B NeoPixel RGB Ring (8 or 12 LEDs) | 100% Screenless visual status ring | Digital Pin 5 |
| **Physical Sound** | Piezoelectric Ceramic Buzzer (3.3V/5V) | Haptic audio chirps & hydration alarms | PWM Pin 6 |
| **Power Source** | 3.7V 1000mAh LiPo Battery | Portable outdoor power supply | BAT terminal |
| **Battery Charger** | TP4056 Module with Protection | USB-C charging for internal LiPo | Micro-USB / USB-C |

---

## 2. Wiring Schematic & Pinout Table

```
      +-----------------------------------------------------------+
      |                 ESP32 / ARDUINO UNO R4                    |
      |                                                           |
      |   [3.3V/5V] -------> VCC (MPU6050, LTR390, NeoPixel)      |
      |   [GND]    -------> GND (All Sensors & Power Ground)     |
      |                                                           |
      |   [GPIO 21 / A4] -> SDA (MPU6050 & LTR390 I2C Data)      |
      |   [GPIO 22 / A5] -> SCL (MPU6050 & LTR390 I2C Clock)     |
      |                                                           |
      |   [GPIO 5]  -------> DIN (WS2812B NeoPixel Data In)       |
      |   [GPIO 6]  -------> POS (+) (Piezo Ceramic Buzzer)      |
      |   [Pin A0]  -------> SIG (Analog Photodiode / UV Sensor)  |
      |   [Pin A1]  -------> BAT Divider (Battery Voltage Sense) |
      +-----------------------------------------------------------+
```

---

## 3. Physical Enclosure & Water Bottle Mounting

1. **Top Cap Ring Collar**:
   - 3D Print or strap a weather-proof silicone sleeve around the neck collar of the water bottle.
   - Mount the WS2812B NeoPixel ring facing upwards around the cap rim so it casts a glowing halo around the drinking spout.

2. **Sensory Orientation**:
   - Orient the MPU6050 IMU accelerometer so the **Y-axis** aligns vertically along the height of the bottle. Tilting the bottle for drinking rotates the Y and Z axes, triggering the **Sip Recognition Algorithm**.
   - Orient the Ambient UV sensor facing outward on the bottle sleeve, avoiding hand shadows during carrying.

3. **Battery Management**:
   - The TP4056 module provides USB-C charging. Under active 20Hz sensor sampling and BLE advertising, power draw averages ~28mA, granting **~35+ hours of outdoor Touch Grass activity** on a 1000mAh battery.
