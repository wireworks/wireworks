export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Returns whether a character is a number.
 * @param  {string} str The character to be anyalized.
*/
export function isCharNumeric(str: string): boolean {
	return NUMBERS.indexOf(str) !== -1;
}

/**
 * Returns whether a string is composed of numbers only.
 * @param  {string} str The string to be anyalized.
 */
export function isStringNumeric(str: string): boolean {
	for (let i = 0; i < str.length; i++) {
		if (!isCharNumeric(str.charAt(i)))
			return false;
	}
	return true;
}

