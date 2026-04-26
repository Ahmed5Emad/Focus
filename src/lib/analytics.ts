export function calculateFlowScore(
  durationSeconds: number,
  minorDistractions: number,
  majorDistractions: number
): number {
  const BASE_SCORE = 100;
  const MINOR_PENALTY_PER_INCIDENT = 5;
  const MAJOR_PENALTY_PER_INCIDENT = 15;
  const BONUS_POINTS_PER_FIVE_MINUTES = 1;
  const MAX_BONUS_POINTS = 20;
  const SECONDS_PER_FIVE_MINUTES = 300;

  const totalMinorPenalty = minorDistractions * MINOR_PENALTY_PER_INCIDENT;
  const totalMajorPenalty = majorDistractions * MAJOR_PENALTY_PER_INCIDENT;
  
  const rawDurationBonus = Math.floor(durationSeconds / SECONDS_PER_FIVE_MINUTES) * BONUS_POINTS_PER_FIVE_MINUTES;
  const cappedDurationBonus = Math.min(rawDurationBonus, MAX_BONUS_POINTS);
  
  const calculatedScore = BASE_SCORE - totalMinorPenalty - totalMajorPenalty + cappedDurationBonus;
  
  const finalScore = Math.max(0, Math.min(100, calculatedScore));
  
  return Math.floor(finalScore);
}
