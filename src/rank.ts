/** Rank the streets of an area from large to small (#44): rank = length × class weight × lanes factor. No map code. */

/** The values of a stored street that give its rank (`scripts/fetch_area.py`, #43). */
export interface RankValues {
  length?: number; // meters
  highway?: string; // the class with the largest length in the street
  lanes?: number; // the largest number of lanes, 1 when missing
}

/** The weight of a road class. A main road carries more traffic, so more people know its name. */
export const CLASS_WEIGHT: Record<string, number> = {
  motorway: 8, // main roads: the names that most people know
  trunk: 8,
  primary: 8,
  secondary: 5, // roads that join the parts of a town
  tertiary: 3, // roads that join the streets of a part of a town
  unclassified: 1, // the usual street
  residential: 1,
  living_street: 0.3, // small ways that few people use to go through
  pedestrian: 0.3,
  service: 0.3,
  footway: 0.3,
  cycleway: 0.3,
};
/** The weight of a class that is not in `CLASS_WEIGHT`: as a usual street. */
const OTHER_WEIGHT = 1;
/** Each lane more than 1 adds this part to the rank: a wide road is a large road. */
const LANE_STEP = 0.25;

/** Return the rank of a street: a larger number for a larger street. */
export function rank(street: RankValues): number {
  const weight = CLASS_WEIGHT[street.highway ?? ""] ?? OTHER_WEIGHT;
  const lanes = Math.max(1, street.lanes ?? 1);
  return (street.length ?? 0) * weight * (1 + LANE_STEP * (lanes - 1));
}

/** Return a copy of the streets, sorted from the largest rank to the smallest. */
export function byRank<T extends RankValues>(streets: T[]): T[] {
  return [...streets].sort((a, b) => rank(b) - rank(a));
}
