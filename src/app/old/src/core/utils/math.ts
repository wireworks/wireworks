/**
 * Returns a value, clamped between max and min.
 * @param  {number} value The number to be clamped.
 * @param  {number} min The minimum possible number.
 * @param  {number} max The maximum possible number.
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
};

/**
 * Converts a binary number (as a string, boolean array, or number array) to a decimal number.
 * @param  {boolean[]} binary The number to be converted. An array of booleans, read from left to right (e.g. 001 equals 4).
 * @param  {boolean} reversed Optional. Whether the input should be reversed (read from right to left). Defaults to false.
 */
export function binaryToDecimal(binary: boolean[], reversed: boolean = false): number {

	if (binary.length === 0) {
		return 0;
	}

	let decimal = 0;

	for (let realIndex = 0; realIndex < binary.length; realIndex++) {

		let i = reversed ? binary.length - realIndex - 1 : realIndex;

		decimal += binary[i] ? Math.pow(2, i) : 0;
		
	}

	return decimal;
	
}

/**
 * Converts a decimal number (must be a positive integer) to an array of booleans (read from left to right, such that 001 equals 4).
 * @param  {number} decimal The number to be converted. Must be a positive integer.
 * @param  {boolean} reversed Optional. Whether the output should be reversed (read from right to left). Defaults to false.
 */
export function decimalToBinary(decimal: number, reversed: boolean = false): boolean[] {

	if (decimal < 0) {
		throw new RangeError("Attempting to convert negative number to binary");
	}

	if (decimal !== Math.floor(decimal)) {
		throw new RangeError("Attempting to convert non-integer number to binary");
	}

	let binary: boolean[] = [];

	let tmpDecimal = decimal, i = 0;

	while (tmpDecimal > 0) {

		binary[i] = tmpDecimal % 2 ? true : false;
		tmpDecimal = Math.floor(tmpDecimal / 2);

		i++;

	}

	if (reversed) {
		binary.reverse();
	}

	return binary;

}