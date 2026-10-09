export interface BottleTelemetry {
  lightLux: number;            // Ambient light lux (0 - 100,000)
  uvIndex: number;             // UV Index (0 - 12+)
  ax: number;                  // IMU Accel X
  ay: number;                  // IMU Accel Y
  az: number;                  // IMU Accel Z
  tiltPitch: number;           // Bottle tilt angle (-180 to +180 deg)
  accelMagnitude: number;      // Vector magnitude |A| (g)
  totalSips: number;           // Sip count detected
  estimatedVolumeMl: number;   // Calculated hydration intake in ml
  batteryPercent: number;      // Battery remaining %
  lastSipTime: string;         // ISO timestamp of last sip
  weatherStrainIndex: number;  // Combined UV + Heat + Motion strain score (0-10)
  isOutdoorMode: boolean;      // Outdoor classification state
  outdoorSeconds: number;      // Cumulative outdoor touch grass time
}

export type ActivityClass = 'INDOOR_REST' | 'OUTDOOR_WALK' | 'OUTDOOR_RUN' | 'EXPOSURE_WARNING';

export interface EdgeAIInference {
  activity: ActivityClass;
  activityLabel: string;
  confidence: number;          // 0.0 to 1.0
  dehydrationRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  suggestedHourlyIntakeMl: number;
  shadeAlertRecommended: boolean;
  nextHydrationDueSec: number;
}

export interface UserHydrationGoal {
  dailyTargetMl: number;       // e.g. 2500 ml
  bottleCapacityMl: number;    // e.g. 750 ml
  uvWarningThreshold: number;  // e.g. 6.0 UV Index
  weightKg: number;
  outdoorTargetMinutes: number;// e.g. 60 min outdoor time
}

export interface HardwareConfig {
  pinNeoPixel: number;
  pinBuzzer: number;
  pinUvSensor: number;
  pinBattery: number;
  sipTiltThresholdDeg: number;
  sipMinDurationMs: number;
  bleServiceName: string;
}

export interface AlertMessage {
  id: string;
  timestamp: string;
  type: 'SIP' | 'REMINDER' | 'SHADE' | 'GOAL_ACHIEVED' | 'SYSTEM';
  title: string;
  message: string;
}
