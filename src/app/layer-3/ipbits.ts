import { id, copyToClipboard, isStringNumeric, isCharNumeric, NUMBERS } from "../../core/helpers"
import { Byte4, Byte4Zero, Address } from "../../core/networking/layers/layer-3/address";
import { Byte } from "../../core/networking/byte";

/**
 * The checkboxes corresponding to the IP bits.
 */
const IP: HTMLInputElement[][] = [];
/**
 * The checkboxes corresponding to the mask bits.
 */
const MASK: HTMLInputElement[][] = [];
/**
 * A zero-width character used to work around empty contenteditable fields issues.
 */
const HIDDENCHAR = String.fromCharCode(8205);

/**
 * Loads the DOM checkboxes into IP and MASK and sets the events for the input displays.
 */
function loadDOMComponents(): void {
	
	for (let i = 0; i < 4; i++) {

		IP[i] = [];
		MASK[i] = [];

		for (let j = 0; j < 8; j++) {

			let ipBit = id("byte_ip_" + i + "_" + j);
			let maskBit = id("byte_mask_" + i + "_" + j);

			ipBit.addEventListener("change", function () {
				updateDisplays();
			});

			maskBit.addEventListener("change", function () {
				selectMaskBit(joinBitIndex(i, j));
			});

			IP[i][j] = ipBit as HTMLInputElement;
			MASK[i][j] = maskBit as HTMLInputElement;
		}

		let display = id("display_ip_" + i);
		
		let originalText: string;

		display.addEventListener("focus", function (evt: FocusEvent): void {

			originalText = display.textContent;
			display.textContent = HIDDENCHAR;

		});

		display.addEventListener("blur", function (evt: FocusEvent): void {
			if (display.textContent == HIDDENCHAR) {
				display.textContent = originalText;
			}
		});

		display.addEventListener("keyup", function (evt: KeyboardEvent): void { 

			let next = i < 3 ? id("display_ip_" + (i + 1)) : undefined;

			if (evt.key !== "Backspace" && evt.key !== "Delete" && !isCharNumeric(evt.key)){
				evt.preventDefault();
				return;
			}

			let selection = window.getSelection().anchorNode.parentNode == display && window.getSelection().toString();

			if (!next && display.textContent.length >= 3 && !(selection.length > 0)) {
				evt.preventDefault();
				return;
			}

			if (display.textContent.indexOf(HIDDENCHAR) !== -1) {

				if (display.textContent.length > 1) {
					display.textContent = display.textContent.replace(HIDDENCHAR, "");
				}

				display.focus()
				document.getSelection().collapse(display, 1);

			}

			if (display.textContent.length >= 3 && next) {

				let address = extractAddress();
				let minByte = address.getIp()[i];
				let mask = address.getMask()[i];

				for (let i = 0; i < 8; i++) {
					if (!mask.bit(i)) {
						minByte.bit(i, false);
					}
				}

				if (minByte.getDecimal() < 100) {
					next.focus();					
				}

			}

			if ((evt.key == "Backspace" || evt.key == "Delete") && display.textContent.length <= 1) {
				display.textContent = HIDDENCHAR;
			}

		});

		display.addEventListener("input", function (evt: Event): void {

			if (display.textContent !== HIDDENCHAR) {

				let str = display.textContent;
				let mutatedStr = str;
				let address = extractAddress();

				if (!isStringNumeric(str)) {
					str = "";
					mutatedStr = "";
					for (let c = 0; c < display.textContent.length; c++) {
						let char = display.textContent.charAt(c);
						str += isCharNumeric(char) ? char : "";
						mutatedStr += char === HIDDENCHAR || isCharNumeric(char) ? char : "";
					}
				}

				let minByte = address.getIp()[i];
				let maxByte = minByte.clone();
				let mask = address.getMask()[i];

				for (let i = 0; i < 8; i++) {
					if (!mask.bit(i)) {
						minByte.bit(i, false);
						maxByte.bit(i, true);
					}
				}

				let value = parseInt(str, 10);

				if (value < minByte.getDecimal()) {
					value = minByte.getDecimal();
				}

				if (value > maxByte.getDecimal()) {
					value = maxByte.getDecimal();
				}

				if (isNaN(value) || value == undefined) {
					value = minByte.getDecimal();
				}

				if (`${value}` != display.textContent.replace(HIDDENCHAR, "")) {

					if (mutatedStr === HIDDENCHAR) {
						display.textContent = HIDDENCHAR;
					}
					else {
						display.textContent = `${value}`;
					}
					document.getSelection().collapse(display, 1);

				}

				setIPByteDOM(new Byte(value), i, false);

			}
		});		

	}
}

/**
 * Converts a bit in Byte index to a bit in Byte4 index.
 * @param  {number} byteIndex The index of the Byte in a Byte4.
 * @param  {number} bitIndex The index of the bit in the Byte.
 */
function joinBitIndex(byteIndex: number, bitIndex: number): number {
	if (byteIndex > 3 || byteIndex < 0) {
		throw new RangeError("The byteIndex must be between 0-3 (inclusive)");
	}
	if (bitIndex > 7 || bitIndex < 0) {
		throw new RangeError("The bitIndex must be between 0-7 (inclusive)");
	}
	return (8 * byteIndex) + (7 - bitIndex);
}

/**
 * Converts a bit in Byte4 index to a bit in Byte index.
 * @param  {number} byte4Index The index of the bit in a Byte4.
 */
function splitBitIndex(byte4Index: number): { byteIndex: number, bitIndex: number} {
	if (byte4Index > 31 || byte4Index < 0) {
		throw new RangeError("The byte4Index must be between 0-31 (inclusive)");
	}
	return {
		byteIndex: Math.floor(byte4Index / 8),
		bitIndex: 7 - (byte4Index % 8)
	};
}

/**
 * Returns the Address, extracted from the DOM elements.
 */
function extractAddress(): Address {

	let ipBytes = Byte4Zero()
	let maskBytes = Byte4Zero()

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 8; j++) {
			ipBytes[i].bit(j, (IP[i][j]).checked ? true : false);
			maskBytes[i].bit(j, (MASK[i][j]).checked ? true : false);
		}
	}

	return new Address(ipBytes,maskBytes);

}

/**
 * Sets the checkboxes and display of a DOM representation of a Byte, given a real one.
 * @param  {Byte} byte The byte to be displayed.
 * @param  {number} index The index of the 4 possible IP DOM bytes.
 * @param  {boolean} updateBig Whether the big displays should be updated as well. Defaults to true.
 * @param  {boolean} updateShort Whether the short display should be updated as well. Defaults to true.
 */
function setIPByteDOM(byte: Byte, index: number, updateBig: boolean = true, updateShort: boolean = true): void {
	
	let dom = IP[index];

	for (let i = 0; i < 8; i++) {
		
		dom[i].checked = byte.bit(i);
		
	}
	
	if (updateBig) {		
		updateDisplays();
	}
	else if (updateShort) {
		updateIPShort();
	}

}

/**
 * Updates the small IP display string.
 * @param  {string} str? The string to be shown. If not given, it will be calculated.
 */
function updateIPShort(str?: string): void {

	id("ip_value").textContent = str ? str : extractAddress().toString(true);

}

/**
 * Updates the small mask display string.
 * @param  {string} str? The string to be shown. If not given, it will be calculated.
 */
function updateMaskShort(str?: string): void {

	id("mask_value").textContent = str ? str : extractAddress().shortMaskString();

}

/**
 * Updates the big displays for the IP and mask.
 * @param  {Address} address? The address that will be displayed. If not given, it will be calculated.
 */
function updateDisplays(address?: Address): void {

	address = address? address : extractAddress();

	for (let i = 0; i < 4; i++) {
		id("display_ip_" + i).textContent = "" + address.getIp()[i].getDecimal();
		id("display_mask_" + i).textContent = "" + address.getMask()[i].getDecimal();
	}

	updateIPShort(address.toString(true));
	updateMaskShort(address.shortMaskString());

}

/**
 * Selects all the mask bit checkboxes until a given index.
 * @param  {number} index The last checked bit.
 */
function selectMaskBit(index: number): void {

	let { bitIndex: bitIndex, byteIndex: byteIndex } = splitBitIndex(index);
	index += ((<HTMLInputElement>id("byte_mask_" + byteIndex + "_" + bitIndex)).checked ? 1 : 0);

	for (let byte4Index = 0; byte4Index < 32; byte4Index++) {
		
		let { bitIndex: bitIndex, byteIndex: byteIndex } = splitBitIndex(byte4Index);
		let on = byte4Index < index;

		(<HTMLInputElement>id("byte_mask_" + byteIndex + "_" + bitIndex)).checked = on;
		(<HTMLInputElement>id("byte_ip_" + byteIndex + "_" + bitIndex)).disabled = on;		

	}

	updateDisplays();

}

/**
 * Copies the IP (in X.X.X.X format) to the clipboard.
 */
function copyIPToClipboard(): void {

	copyToClipboard(extractAddress().toString(true), function (success: boolean): void {

		let text = id("copy_ip_text");
		text.style.transition = "";
		text.style.opacity = "1";
		setTimeout(function () {
			text.style.transition = "opacity 1s";
			text.style.opacity = "0";
		}, 2000);

	});

}

/**
 * Copies the mask (in X.X.X.X format) to the clipboard.
 */
function copyMaskToClipboard(): void {

	copyToClipboard(extractAddress().maskString(), function (success: boolean): void {

		let text = id("copy_mask_text");
		text.style.transition = "";
		text.style.opacity = "1";
		setTimeout(function () {
			text.style.transition = "opacity 1s";
			text.style.opacity = "0";
		}, 2000);

	});

}

// +==============================================+

loadDOMComponents();
updateDisplays();
id("copy_ip").addEventListener("click", ev => copyIPToClipboard())
id("copy_mask").addEventListener("click", ev => copyMaskToClipboard())