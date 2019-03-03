/**
 * Returns a value, clamped between max and min.
 * @param  {number} value The number to be clamped.
 * @param  {number} min The minimum possible number.
 * @param  {number} max The maximum possible number.
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
};