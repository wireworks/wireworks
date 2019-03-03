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

	if (done) {
		done(success);
	}

}