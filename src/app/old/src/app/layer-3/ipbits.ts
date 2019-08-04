// IPBits
// +=========================+
// Author: Henrique Colini
// Version: 3.1 (2019-03-03)

import { Byte } from "../../core/networking/byte";
import { Address, Byte4Zero, joinBitIndex, splitBitIndex } from "../../core/networking/layers/layer-3/address";
import { isCharNumeric, isStringNumeric } from "../../core/utils/string";
import { id, copyToClipboard } from "../../core/utils/dom";
import { clamp } from "../../core/utils/math";

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
export function loadDOMComponents(): void {
	
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

		const additionalKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Insert"];
		let display = id("display_ip_" + i);
		let resultByte: Byte;

		display.addEventListener("focus", function (evt: FocusEvent): void {

			let range, selection;
			if (document.createRange) {
				range = document.createRange();
				range.selectNodeContents(display);
				selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}

			let originalAddress = extractAddress();
			resultByte = originalAddress.getIp()[i];

		});

		display.addEventListener("blur", function (evt: FocusEvent): void {
			setIPByteDOM(resultByte, i, true);
		});

		display.addEventListener("keydown", function (evt: KeyboardEvent): void { 

			if (evt.key === "Enter") {
				display.blur();
			}
			
			if (additionalKeys.indexOf(evt.key) === -1 && !isCharNumeric(evt.key)){				
				evt.preventDefault();
				return;
			}

			let selectedText = window.getSelection().anchorNode.parentNode == display && window.getSelection().toString();

			if (additionalKeys.indexOf(evt.key) === -1 && display.textContent.replace(HIDDENCHAR, "").length == 3 && selectedText.length === 0) {

				evt.preventDefault();

			}

		});

		display.addEventListener("keyup", function (evt: KeyboardEvent): void {
			
			let next = i < 3 ? id("display_ip_" + (i + 1)) : undefined;

			let selectedText = window.getSelection().anchorNode.parentNode == display && window.getSelection().toString();

			if (additionalKeys.indexOf(evt.key) === -1 && display.textContent.replace(HIDDENCHAR, "").length == 3 && selectedText.length === 0) {

				if (next) {
					next.focus();
				}

			}

		});

		display.addEventListener("input", function (evt: Event): void {

			if (display.textContent === "") {
				display.textContent = HIDDENCHAR;
				
				let address = extractAddress();

				let minByte = address.getIp()[i];
				let mask = address.getMask()[i];

				for (let i = 0; i < 8; i++) {
					if (!mask.bit(i)) {
						minByte.bit(i, false);
					}
				}

				resultByte = minByte;

			}
			else {

				if (display.textContent.indexOf(HIDDENCHAR) !== -1 && display.textContent.length > 1) {

					display.textContent = display.textContent.replace(HIDDENCHAR, "");

					let range, selection;
					if (document.createRange) {
						range = document.createRange();
						range.selectNodeContents(display);
						range.collapse(false);
						selection = window.getSelection();
						selection.removeAllRanges();
						selection.addRange(range);
					}

				}

				if (isStringNumeric(display.textContent)){

					let address = extractAddress();

					let minByte = address.getIp()[i];
					let maxByte = minByte.clone();
					let mask = address.getMask()[i];

					for (let i = 0; i < 8; i++) {
						if (!mask.bit(i)) {
							minByte.bit(i, false);
							maxByte.bit(i, true);
						}
					}

					let value = new Byte(
						clamp(
							parseInt(display.textContent, 10),
							minByte.getDecimal(),
							maxByte.getDecimal()
						)
					);

					resultByte = value;
					setIPByteDOM(value, i, false);

				}

			}

		});		

	}
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
export function updateDisplays(address?: Address): void {

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
export function copyIPToClipboard(): void {

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
export function copyMaskToClipboard(): void {

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
