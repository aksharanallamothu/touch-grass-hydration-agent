"""
Offline Python Text-to-Speech (TTS) Hiker Audio Daemon
Uses pyttsx3 for offline voice synthesis over BLE GATT notifications.

Requirements:
  pip install pyttsx3 bleak asyncio
"""

import sys
import asyncio
import pyttsx3
from bleak import BleakClient, BleakScanner

# BLE GATT Service & Characteristic UUIDs
SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"

class VoiceAgent:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 150)    # Hiker friendly speech rate
        self.engine.setProperty('volume', 1.0)
        self.last_uv_alert = 0

    def speak(self, text):
        print(f"[VOICE AGENT]: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def handle_ble_data(self, sender, data):
        payload = data.decode('utf-8')
        print(f"[BLE RX]: {payload}")
        
        # Parse payload format: "UV:6.5|LUX:45000|TILT:70|SIPS:8|VOL:360|STRAIN:8.2"
        try:
            parts = dict(item.split(":") for item in payload.split("|") if ":" in item)
            uv = float(parts.get("UV", 0))
            sips = int(parts.get("SIPS", 0))
            vol = float(parts.get("VOL", 0))
            strain = float(parts.get("STRAIN", 0))

            # Trigger spoken voice alerts
            if uv >= 6.0 and strain >= 7.0:
                self.speak(f"Warning! UV index is {uv:.1f}. High heat strain. Drink water and find shade.")
            elif sips > 0 and vol % 225 == 0: # Milestone every ~225ml
                self.speak(f"Hydration progress update: Total intake is {int(vol)} milliliters.")
        except Exception as e:
            print(f"Parsing error: {e}")

async def main():
    agent = VoiceAgent()
    agent.speak("Touch Grass Voice Agent starting up. Searching for physical water bottle...")

    device = await BleakScanner.find_device_by_filter(
        lambda d, ad: d.name and "TouchGrass" in d.name
    )

    if not device:
        print("TouchGrass physical bottle not found over Bluetooth LE. Running voice test...")
        agent.speak("Demonstration voice mode active. Touch Grass outdoor agent ready!")
        return

    print(f"Connecting to TouchGrass bottle at {device.address}...")
    async with BleakClient(device) as client:
        print("Connected to Smart Bottle BLE GATT Server!")
        agent.speak("Smart Water Bottle connected over Bluetooth. Enjoy your hike!")
        
        await client.start_notify(CHARACTERISTIC_UUID, agent.handle_ble_data)
        while True:
            await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())
