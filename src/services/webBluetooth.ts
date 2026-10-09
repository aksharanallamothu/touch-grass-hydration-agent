import type { BottleTelemetry } from '../types';

export class WebBluetoothManager {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private isConnected: boolean = false;
  private onTelemetryCallback: ((telemetry: Partial<BottleTelemetry>) => void) | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'bluetooth' in navigator;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public setTelemetryCallback(cb: (telemetry: Partial<BottleTelemetry>) => void) {
    this.onTelemetryCallback = cb;
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth API is not supported in this browser.');
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'TouchGrass' }],
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b', '180d']
      });

      if (!this.device || !this.device.gatt) {
        throw new Error('Device GATT connection unavailable.');
      }

      this.device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));

      const server = await this.device.gatt.connect();
      const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      this.characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicChanged.bind(this));

      this.isConnected = true;
      return true;
    } catch (err) {
      console.warn('Web BLE connection failed or cancelled by user:', err);
      this.isConnected = false;
      return false;
    }
  }

  public disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
  }

  private handleDisconnect() {
    this.isConnected = false;
    console.log('[WebBLE] Disconnected from Touch Grass Smart Bottle');
  }

  private handleCharacteristicChanged(event: Event) {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const decoder = new TextDecoder('utf-8');
    const payloadStr = decoder.decode(target.value);
    // Packet Format: "UV:3.2|LUX:2700|TILT:72|SIPS:12|VOL:540|STRAIN:7.8"
    const parsed = this.parseBLEPayload(payloadStr);
    if (this.onTelemetryCallback) {
      this.onTelemetryCallback(parsed);
    }
  }

  private parseBLEPayload(payload: string): Partial<BottleTelemetry> {
    const result: Partial<BottleTelemetry> = {};
    const parts = payload.split('|');

    for (const part of parts) {
      const [key, val] = part.split(':');
      if (!key || !val) continue;

      const num = parseFloat(val);
      switch (key) {
        case 'UV': result.uvIndex = num; break;
        case 'LUX': result.lightLux = num; break;
        case 'TILT': result.tiltPitch = num; break;
        case 'SIPS': result.totalSips = Math.round(num); break;
        case 'VOL': result.estimatedVolumeMl = num; break;
        case 'STRAIN': result.weatherStrainIndex = num; break;
      }
    }
    return result;
  }
}

export const bleManager = new WebBluetoothManager();
