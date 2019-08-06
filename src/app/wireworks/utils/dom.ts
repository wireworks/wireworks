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

/**
 * Creates an HTML element.
 * @param  {string} tagName The tag of the element, such as "div", "span", "p" etc.
 * @param  {string} classes The classes of the element. Optional.
 * @param  {string} text The text content of this element.
 * @param  {string} id The ID of this element.
 */
export function make(tagName: string, classes: string = undefined, text: string = undefined, id: string = undefined): HTMLElement {

	let dom = document.createElement(tagName);
	if (classes !== undefined) {
		if (classes.length > 0) {
			dom.className = classes;
		}
	}
	if (text !== undefined) {
		dom.appendChild(textNode(text));
	}
	if (id !== undefined) {
		dom.id = id;
	}
	return dom;
}

/**
 * This removes all children from the element.
 * @param  {HTMLElement} element The parent element.
 */
export function clearChildren(element: HTMLElement): void {
	while (element.lastChild) element.removeChild(element.lastChild);
}

/**
 * Returns a text node, given a string.
 * @param  {string} text The text of the node.
 */
export function textNode(text: string): Text {
	return document.createTextNode(text);
}