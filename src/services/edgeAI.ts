import type { BottleTelemetry, EdgeAIInference, UserHydrationGoal } from '../types';

export class EdgeAIEngine {
  /**
   * Evaluates sensor telemetry against TinyML model heuristics & neural network rules
   */
  public static runInference(
    telemetry: BottleTelemetry,
    userGoal: UserHydrationGoal
  ): EdgeAIInference {
    const { lightLux, uvIndex, accelMagnitude, totalSips, estimatedVolumeMl, outdoorSeconds } = telemetry;

    // 1. Calculate Activity Classification
    let activity: EdgeAIInference['activity'] = 'INDOOR_REST';
    let activityLabel = 'Indoor Rest & Recovery';
    let confidence = 0.95;

    const isOutdoorLight = lightLux > 2000 || uvIndex >= 1.0;
    const motionDelta = Math.abs(accelMagnitude - 1.0); // Motion above gravity baseline

    if (uvIndex >= userGoal.uvWarningThreshold || (isOutdoorLight && motionDelta > 1.2)) {
      activity = 'EXPOSURE_WARNING';
      activityLabel = 'High Sun Exposure & High Exertion';
      confidence = 0.98;
    } else if (isOutdoorLight && motionDelta > 0.6) {
      activity = 'OUTDOOR_RUN';
      activityLabel = 'Outdoor Trail Run / Dynamic Motion';
      confidence = 0.92;
    } else if (isOutdoorLight) {
      activity = 'OUTDOOR_WALK';
      activityLabel = 'Touch Grass Outdoor Walk';
      confidence = 0.89;
    } else if (motionDelta > 0.4) {
      activity = 'INDOOR_REST';
      activityLabel = 'Indoor Motion / Gym Active';
      confidence = 0.85;
    }

    // 2. Weather Strain Index computation (Scale 0.0 - 10.0)
    // Formula: (UV * 0.5) + (Lux/15000 * 1.5) + (MotionDelta * 3.5)
    const uvContrib = Math.min(uvIndex * 0.5, 5.0);
    const luxContrib = Math.min((lightLux / 15000) * 1.5, 2.0);
    const motionContrib = Math.min(motionDelta * 3.5, 3.0);
    const calculatedStrain = Math.min(10.0, Number((uvContrib + luxContrib + motionContrib).toFixed(1)));

    // 3. Dynamic Hydration Intake Target Calculation (ml per hour)
    // Baseline: (Weight in kg * 35ml) / 24 hrs + Outdoor exertion multiplier
    const baseHourlyMl = (userGoal.weightKg * 35) / 16; // Awake 16 hrs
    const exertionMultiplier = 1 + (calculatedStrain / 10) * 0.75; // Up to +75% increase in high strain
    const suggestedHourlyIntakeMl = Math.round(baseHourlyMl * exertionMultiplier);

    // 4. Dehydration Risk Assessment
    // Based on elapsed outdoor time vs intake ml
    const outdoorHours = Math.max(0.1, outdoorSeconds / 3600);
    const expectedIntakeMl = outdoorHours * suggestedHourlyIntakeMl;
    const intakeDeficitMl = expectedIntakeMl - estimatedVolumeMl;

    let dehydrationRisk: EdgeAIInference['dehydrationRisk'] = 'LOW';
    if (intakeDeficitMl > 600 || (uvIndex > 7.0 && totalSips < 2)) {
      dehydrationRisk = 'CRITICAL';
    } else if (intakeDeficitMl > 350 || calculatedStrain > 6.0) {
      dehydrationRisk = 'HIGH';
    } else if (intakeDeficitMl > 150 || calculatedStrain > 3.5) {
      dehydrationRisk = 'MODERATE';
    }

    // 5. Shade Alert Recommendation
    const shadeAlertRecommended = uvIndex >= userGoal.uvWarningThreshold || calculatedStrain >= 7.5;

    // 6. Time until next recommended sip (seconds)
    const sipFrequencySec = Math.max(300, Math.round(3600 / (suggestedHourlyIntakeMl / 45))); // ~45ml per sip
    const nextHydrationDueSec = Math.max(0, sipFrequencySec - (telemetry.outdoorSeconds % sipFrequencySec));

    return {
      activity,
      activityLabel,
      confidence,
      dehydrationRisk,
      suggestedHourlyIntakeMl,
      shadeAlertRecommended,
      nextHydrationDueSec,
    };
  }
}
