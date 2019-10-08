// IPBits
// +=========================+
// Author: Henrique Colini
// Version: 4.0 (2019-08-25)

import React, { Component, RefObject, ChangeEvent } from "react";
import { copyToClipboard } from "../../../wireworks/utils/dom";
import { isCharNumeric, isStringNumeric } from "../../../wireworks/utils/string";
import { clamp } from "../../../wireworks/utils/math";
import { Byte } from "../../../wireworks/networking/byte";
import { joinBitIndex, Address, Byte4Zero, splitBitIndex } from "../../../wireworks/networking/layers/layer-3/address";
import "src/sass/pages/ipbits.scss";

/**
 * Keys that will not trigger keyUp/keyDown events.
 */
const additionalKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Insert"];

// +==============================================+

class Ipbits extends Component {

	/**
	 * The checkboxes corresponding to the IP bits.
	 */
	private IP: RefObject<HTMLInputElement>[][] = [];
	/**
	 * The checkboxes corresponding to the mask bits.
	 */
	private MASK: RefObject<HTMLInputElement>[][] = [];

	/**
	 * The mask displays.
	 */
	private maskDisplays: RefObject<HTMLDivElement>[] = [];

	/**
	 * The IP displays.
	 */
	private ipDisplays: RefObject<HTMLInputElement>[] = [];

	/**
	 * The short IP display.
	 */
	private ipDisplayShort: RefObject<HTMLHeadingElement>;

	/**
	 * The short mask display.
	 */
	private maskDisplayShort: RefObject<HTMLHeadingElement>;

	/**
	 * The button that copies the mask.
	 */
	private copyMaskButton: RefObject<HTMLElement>;

	/**
	 * The button that copies the IP.
	 */
	private copyIPButton: RefObject<HTMLElement>;

	/**
	 * The button that copies the mask.
	 */
	private copyMaskText: RefObject<HTMLSpanElement>;

	/**
	 * The button that copies the IP.
	 */
	private copyIPText: RefObject<HTMLSpanElement>;
	
	/**
	 * Returns the Address, extracted from the DOM elements.
	 */
	private extractAddress(): Address {

		let ipBytes = Byte4Zero()
		let maskBytes = Byte4Zero()

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 8; j++) {
				ipBytes[i].bit(j, (this.IP[i][j]).current.checked ? true : false);
				maskBytes[i].bit(j, (this.MASK[i][j]).current.checked ? true : false);
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
	private setIPByteDOM(byte: Byte, index: number, updateBig: boolean = true, updateShort: boolean = true): void {
		
		let dom = this.IP[index];

		for (let i = 0; i < 8; i++) {
			
			dom[i].current.checked = byte.bit(i);
			
		}
		
		if (updateBig) {		
			this.updateDisplays();
		}
		else if (updateShort) {
			this.updateIPShort();
		}

	}

	/**
	 * Updates the small IP display string.
	 * @param  {string} str? The string to be shown. If not given, it will be calculated.
	 */
	private updateIPShort(str?: string): void {

		this.ipDisplayShort.current.textContent = str ? str : this.extractAddress().toString(true);

	}

	/**
	 * Updates the small mask display string.
	 * @param  {string} str? The string to be shown. If not given, it will be calculated.
	 */
	private updateMaskShort(str?: string): void {

		this.maskDisplayShort.current.textContent = str ? str : this.extractAddress().shortMaskString();

	}

	/**
	 * Updates the big displays for the IP and mask.
	 * @param  {Address} address? The address that will be displayed. If not given, it will be calculated.
	 */
	private updateDisplays = (address?: Address): void => {

		address = address? address : this.extractAddress();

		for (let i = 0; i < 4; i++) {
			this.ipDisplays[i].current.value = "" + address.getIp()[i].getDecimal();
			this.maskDisplays[i].current.textContent = "" + address.getMask()[i].getDecimal();
		}

		this.updateIPShort(address.toString(true));
		this.updateMaskShort(address.shortMaskString());

	}

	/**
	 * Selects all the mask bit checkboxes until a given index.
	 * @param  {number} index The last checked bit.
	 */
	private selectMaskBit = (index: number): void => {

		let { bitIndex, byteIndex } = splitBitIndex(index);

		index += this.MASK[byteIndex][bitIndex].current.checked ? 1 : 0;

		for (let byte4Index = 0; byte4Index < 32; byte4Index++) {
			
			let { bitIndex, byteIndex } = splitBitIndex(byte4Index);
			let on = byte4Index < index;

			this.MASK[byteIndex][bitIndex].current.checked = on;
			this.IP[byteIndex][bitIndex].current.disabled = on;		

		}

		this.updateDisplays();

	}

	/**
	 * Copies the IP (in X.X.X.X format) to the clipboard.
	 */
	private copyIPToClipboard = (): void => {

		let scope: Ipbits = this;

		copyToClipboard(this.extractAddress().toString(true), function (success: boolean): void {

			let text = scope.copyIPText.current;
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
	private copyMaskToClipboard = (): void => {

		let scope: Ipbits = this;

		copyToClipboard(this.extractAddress().maskString(), function (success: boolean): void {

			let text = scope.copyMaskText.current;
			text.style.transition = "";
			text.style.opacity = "1";
			setTimeout(function () {
				text.style.transition = "opacity 1s";
				text.style.opacity = "0";
			}, 2000);

		});

	}

	/**
	 * Handles IP bit clicking.
	 */
	handleIPBitChange = () => {
		this.updateDisplays();
	}

	/**
	 * Handles mask bit clicking.
	 */
	handleMaskBitChange = (byteIndex: number, bitIndex: number) => {		
		this.selectMaskBit(joinBitIndex(byteIndex, bitIndex));
	}

	/**
	 * The byte that will be set after the last display gets blurred.
	 */
	private blurByte: Byte;

	/**
	 * Handles IP display focus.
	 */
	private handleDisplayFocus = (display: HTMLInputElement, byteIndex: number): void => {
		
		display.select();

		let originalAddress = this.extractAddress();
		this.blurByte = originalAddress.getIp()[byteIndex];

	}

	/**
	 * Handles IP display blur.
	 */
	private handleDisplayBlur = (byteIndex: number): void => {
		this.setIPByteDOM(this.blurByte, byteIndex, true);
	}

	/**
	 * Handles IP display key down.
	 */
	private handleDisplayKeydown = (evt: React.KeyboardEvent<HTMLInputElement>, display: HTMLInputElement): void => { 
		
		if (evt.key === "Enter") {
			display.blur(); // only for UX, otherwise useless
		}
		
		if (additionalKeys.indexOf(evt.key) === -1 && !isCharNumeric(evt.key)){				
			evt.preventDefault();
			return;
		}

		let selectedText = window.getSelection().anchorNode === display.parentNode ? window.getSelection().toString() : "";

		if (additionalKeys.indexOf(evt.key) === -1 && display.value.length >= 3 && selectedText === "")  evt.preventDefault();

	}

	/**
	 * Handles IP display key up.
	 */
	private handleDisplayKeyup = (evt: React.KeyboardEvent<HTMLInputElement>, display: HTMLInputElement, byteIndex: number): void => {
				
		let next = byteIndex < 3 ? this.ipDisplays[byteIndex + 1].current : undefined;

		let selectedText = window.getSelection().anchorNode === display.parentNode ? window.getSelection().toString() : "";

		if (additionalKeys.indexOf(evt.key) === -1 && display.value.length >= 3 && selectedText === "") {

			if (next) {
				next.focus();
			}

		}

	}

	/**
	 * Handles IP display input.
	 */
	private handleDisplayChange = (evt: ChangeEvent<HTMLInputElement>, display: HTMLInputElement, byteIndex: number): void => {
		
		if (display.value === "") {
						
			let address = this.extractAddress();

			let minByte = address.getIp()[byteIndex];
			let mask = address.getMask()[byteIndex];

			for (let i = 0; i < 8; i++) {
				if (!mask.bit(i)) {
					minByte.bit(i, false);
				}
			}

			this.blurByte = minByte;

		}
		else {

			if (isStringNumeric(display.value)){

				let address = this.extractAddress();

				let minByte = address.getIp()[byteIndex];
				let maxByte = minByte.clone();
				let mask = address.getMask()[byteIndex];

				for (let i = 0; i < 8; i++) {
					if (!mask.bit(i)) {
						minByte.bit(i, false);
						maxByte.bit(i, true);
					}
				}

				let value = new Byte(
					clamp(
						parseInt(display.value, 10),
						minByte.getDecimal(),
						maxByte.getDecimal()
					)
				);

				this.blurByte = value;
				this.setIPByteDOM(value, byteIndex, false);

			}

		}

	}
	
	constructor(props: any) {
		
		super(props);

		for (let i = 0; i < 4; i++) {
			
			this.maskDisplays[i] = React.createRef();
			this.ipDisplays[i] = React.createRef();
			this.MASK[i] = [];
			this.IP[i] = [];

			for (let j = 0; j < 8; j++) {
				this.MASK[i][j] = React.createRef();
				this.IP[i][j] = React.createRef();
			}
			
		}

		this.maskDisplayShort = React.createRef();
		this.ipDisplayShort = React.createRef();

		this.copyMaskButton = React.createRef();
		this.copyIPButton = React.createRef();
		this.copyMaskText = React.createRef();
		this.copyIPText = React.createRef();

	}

	componentDidMount() {		
		this.updateDisplays();
		this.updateIPShort();
	}

	render() {

		let maskBox = [];
		let ipBox = [];

		for (let i = 0; i < 4; i++) {
			
			let bitBox = [];
			
			for (let j = 7; j >= 0; j--) {
				let id = "byte_mask_"+i+"_"+j;
				bitBox.push(
					<div className="bit" key={id+"_bit"}>
						<input tabIndex={-1} id={id} ref={this.MASK[i][j]} type="checkbox" onChange={()=>{this.handleMaskBitChange(i,j)}}/>
						<label htmlFor={id}></label>
					</div>
				)
			}

			maskBox.push(
				<div className="block" key={"mask_block_"+i}>
					<div className="mask-display" ref={this.maskDisplays[i]}>0</div>
					<div className="bit-box"> { bitBox } </div>
				</div>				
			);
			if (i < 3) maskBox.push(<div className="dot" key={"mask_dot_"+i}></div>);
			
		}

		for (let i = 0; i < 4; i++) {
			
			let bitBox = [];
			
			for (let j = 7; j >= 0; j--) {
				let id = "byte_ip_"+i+"_"+j;
				bitBox.push(
					<div className="bit" key={id+"_bit"}>
						<input tabIndex={-1} id={id} ref={this.IP[i][j]} type="checkbox" onChange={this.handleIPBitChange}/>
						<label htmlFor={id}></label>
					</div>
				)
			}

			let ipDisplay = <input
								type="text"
								className="display"
								ref={this.ipDisplays[i]}
								onChange={(evt) => {this.handleDisplayChange(evt, this.ipDisplays[i].current, i)}}
								onFocus={() => {this.handleDisplayFocus(this.ipDisplays[i].current, i)}}
								onBlur={() => {this.handleDisplayBlur(i)}}
								onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>) => {this.handleDisplayKeydown(evt, this.ipDisplays[i].current)}}
								onKeyUp={(evt: React.KeyboardEvent<HTMLInputElement>) => {this.handleDisplayKeyup(evt, this.ipDisplays[i].current, i)}}
								/>;

			ipBox.push(
				<div className="block" key={"ip_block_"+i}>
					{ ipDisplay }
					<div className="bit-box"> { bitBox } </div>
				</div>				
			);
			if (i < 3) ipBox.push(<div className="dot" key={"ip_dot_"+i}></div>);
			
		}

		return(
			<main>
				<div className="spacer">
					<h2>Máscara <i className="far fa-clipboard copy-icon" ref={this.copyMaskButton} onClick={this.copyMaskToClipboard}></i> <span className="copy-text" ref={this.copyMaskText}>Máscara copiada</span></h2>
					<h2 className="text-light font-light" ref={this.maskDisplayShort}>/0</h2>
				</div>
				
				<div className="box"> {maskBox} </div>
				
				<div className="spacer">
					<h2>IP <i className="far fa-clipboard copy-icon" ref={this.copyIPButton} onClick={this.copyIPToClipboard}></i> <span className="copy-text" ref={this.copyIPText}>IP Copiado</span></h2>
					<h2 className="text-light font-light" ref={this.ipDisplayShort}>0.0.0.0</h2>
				</div>
				
				<div className="box"> {ipBox} </div>
			</main>

		);
	}

}

export default Ipbits;