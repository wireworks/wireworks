export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Shorthand for document.getElementById(id).
 * @param  {string} elementId String that specifies the ID value. Case-insensitive.
 */
export function id(elementId: string): HTMLElement {
	return document.getElementById(elementId);
}

/**
 * Copies a string to the user's clipboard.
 * @param  {string} str String to be copied.
 * @param  {(success:boolean)=>void} done What happens on success/failure. Optional.
 */
export function copyToClipboard(str: string, done?: (success: boolean) => void): void {

	let tmp = document.createElement("textarea");

	tmp.style.position = 'fixed';
	tmp.style.top = "0";
	tmp.style.left = "0";
	tmp.style.opacity = "0";
	tmp.value = str;

	document.body.appendChild(tmp);
	tmp.focus();
	tmp.select();

	let success = document.execCommand('copy');
	document.body.removeChild(tmp);

	if(done) {
		done(success);
	}

}

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

/**
 * Returns a value, clamped between max and min.
 * @param  {number} value The number to be clamped.
 * @param  {number} min The minimum possible number.
 * @param  {number} max The maximum possible number.
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
};