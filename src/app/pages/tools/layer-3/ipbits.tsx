// IPBits
// +=========================+
// Author: Henrique Colini
// Version: 3.1 (2019-03-03)

import React, { FC, Component } from "react";
import { id, copyToClipboard } from "../../../wireworks/utils/dom";
import { isCharNumeric, isStringNumeric } from "../../../wireworks/utils/string";
import { clamp } from "../../../wireworks/utils/math";
import { Byte } from "../../../wireworks/networking/byte";
import { joinBitIndex, Address, Byte4Zero, splitBitIndex } from "../../../wireworks/networking/layers/layer-3/address";
import "sass/pages/ipbits.scss";

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

	index += ((id("byte_mask_" + byteIndex + "_" + bitIndex) as HTMLInputElement).checked ? 1 : 0);

	for (let byte4Index = 0; byte4Index < 32; byte4Index++) {
		
		let { bitIndex: bitIndex, byteIndex: byteIndex } = splitBitIndex(byte4Index);
		let on = byte4Index < index;

		(id("byte_mask_" + byteIndex + "_" + bitIndex) as HTMLInputElement).checked = on;
		(id("byte_ip_" + byteIndex + "_" + bitIndex) as HTMLInputElement).disabled = on;		

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

class Ipbits extends Component {

    componentDidMount() {
		document.body.className = "theme-layer3";
        loadDOMComponents();
        updateDisplays();
        id("copy_ip").addEventListener("click", ev => copyIPToClipboard())
        id("copy_mask").addEventListener("click", ev => copyMaskToClipboard())
    }

    render() {
        return(
            <main>
                <div className="spacer">
                    <h2>Máscara <i className="far fa-clipboard copy-icon" id="copy_mask"></i> <span className="copy-text"
                            id="copy_mask_text">Máscara copiada</span></h2>
                    <h2 className="text-light font-light" id="mask_value"></h2>
                </div>
                
                <div className="box">
                
                    <div className="block">
                        <div id="display_mask_0" className="mask-display">0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_7" type="checkbox"/><label htmlFor="byte_mask_0_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_6" type="checkbox"/><label htmlFor="byte_mask_0_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_5" type="checkbox"/><label htmlFor="byte_mask_0_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_4" type="checkbox"/><label htmlFor="byte_mask_0_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_3" type="checkbox"/><label htmlFor="byte_mask_0_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_2" type="checkbox"/><label htmlFor="byte_mask_0_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_1" type="checkbox"/><label htmlFor="byte_mask_0_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_0" type="checkbox"/><label htmlFor="byte_mask_0_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_mask_1" className="mask-display">0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_7" type="checkbox"/><label htmlFor="byte_mask_1_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_6" type="checkbox"/><label htmlFor="byte_mask_1_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_5" type="checkbox"/><label htmlFor="byte_mask_1_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_4" type="checkbox"/><label htmlFor="byte_mask_1_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_3" type="checkbox"/><label htmlFor="byte_mask_1_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_2" type="checkbox"/><label htmlFor="byte_mask_1_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_1" type="checkbox"/><label htmlFor="byte_mask_1_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_0" type="checkbox"/><label htmlFor="byte_mask_1_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_mask_2" className="mask-display">0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_7" type="checkbox"/><label htmlFor="byte_mask_2_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_6" type="checkbox"/><label htmlFor="byte_mask_2_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_5" type="checkbox"/><label htmlFor="byte_mask_2_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_4" type="checkbox"/><label htmlFor="byte_mask_2_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_3" type="checkbox"/><label htmlFor="byte_mask_2_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_2" type="checkbox"/><label htmlFor="byte_mask_2_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_1" type="checkbox"/><label htmlFor="byte_mask_2_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_0" type="checkbox"/><label htmlFor="byte_mask_2_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_mask_3" className="mask-display">0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_7" type="checkbox"/><label htmlFor="byte_mask_3_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_6" type="checkbox"/><label htmlFor="byte_mask_3_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_5" type="checkbox"/><label htmlFor="byte_mask_3_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_4" type="checkbox"/><label htmlFor="byte_mask_3_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_3" type="checkbox"/><label htmlFor="byte_mask_3_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_2" type="checkbox"/><label htmlFor="byte_mask_3_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_1" type="checkbox"/><label htmlFor="byte_mask_3_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_0" type="checkbox"/><label htmlFor="byte_mask_3_0"></label>
                            </div>
                        </div>
                    </div>
                
                </div>
                
                <div className="spacer">
                    <h2>IP <i className="far fa-clipboard copy-icon" id="copy_ip"></i> <span className="copy-text" id="copy_ip_text">IP
                            Copiado</span></h2>
                    <h2 className="text-light font-light" id="ip_value"></h2>
                </div>
                
                <div className="box">
                
                    <div className="block">
                        <div id="display_ip_0" className="display" contentEditable>0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_7" type="checkbox"/><label htmlFor="byte_ip_0_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_6" type="checkbox"/><label htmlFor="byte_ip_0_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_5" type="checkbox"/><label htmlFor="byte_ip_0_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_4" type="checkbox"/><label htmlFor="byte_ip_0_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_3" type="checkbox"/><label htmlFor="byte_ip_0_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_2" type="checkbox"/><label htmlFor="byte_ip_0_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_1" type="checkbox"/><label htmlFor="byte_ip_0_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_0" type="checkbox"/><label htmlFor="byte_ip_0_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_ip_1" className="display" contentEditable>0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_7" type="checkbox"/><label htmlFor="byte_ip_1_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_6" type="checkbox"/><label htmlFor="byte_ip_1_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_5" type="checkbox"/><label htmlFor="byte_ip_1_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_4" type="checkbox"/><label htmlFor="byte_ip_1_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_3" type="checkbox"/><label htmlFor="byte_ip_1_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_2" type="checkbox"/><label htmlFor="byte_ip_1_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_1" type="checkbox"/><label htmlFor="byte_ip_1_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_0" type="checkbox"/><label htmlFor="byte_ip_1_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_ip_2" className="display" contentEditable>0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_7" type="checkbox"/><label htmlFor="byte_ip_2_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_6" type="checkbox"/><label htmlFor="byte_ip_2_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_5" type="checkbox"/><label htmlFor="byte_ip_2_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_4" type="checkbox"/><label htmlFor="byte_ip_2_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_3" type="checkbox"/><label htmlFor="byte_ip_2_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_2" type="checkbox"/><label htmlFor="byte_ip_2_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_1" type="checkbox"/><label htmlFor="byte_ip_2_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_0" type="checkbox"/><label htmlFor="byte_ip_2_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_ip_3" className="display" contentEditable>0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_7" type="checkbox"/><label htmlFor="byte_ip_3_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_6" type="checkbox"/><label htmlFor="byte_ip_3_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_5" type="checkbox"/><label htmlFor="byte_ip_3_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_4" type="checkbox"/><label htmlFor="byte_ip_3_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_3" type="checkbox"/><label htmlFor="byte_ip_3_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_2" type="checkbox"/><label htmlFor="byte_ip_3_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_1" type="checkbox"/><label htmlFor="byte_ip_3_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_0" type="checkbox"/><label htmlFor="byte_ip_3_0"></label>
                            </div>
                        </div>
                    </div>
                
                </div>
            </main>

        );
    }

}


export default Ipbits;