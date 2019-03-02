import { id } from "../../core/helpers"
import { Byte4, Byte4Zero, Address } from "../../core/networking/layers/layer-3/address";

/**
 * The checkboxes corresponding to the IP bits.
 */
const IP: HTMLInputElement[][] = [];
/**
 * The checkboxes corresponding to the mask bits.
 */
const MASK: HTMLInputElement[][] = [];

for (let i=0; i<4; i++) {
	IP[i] = [];
	MASK[i] = [];
	for (let j=0; j<8; j++) {

		let ipBit = id("byte_ip_" + i + "_" + j);
		let maskBit = id("byte_mask_" + i + "_" + j);

		ipBit.addEventListener("change", function() {
			updateDisplays();
		});

		maskBit.addEventListener("change", function () {
			selectMaskBit(joinBitIndex(i,j));
		});

		IP[i][j] = ipBit as HTMLInputElement;
		MASK[i][j] = maskBit as HTMLInputElement;
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
 * Updates the small IP display string.
 * @param  {string} str? The string to be shown. If not given, it will be calculated.
 */
function updateIPShort(str?: string): void {

	id("ip_value").textContent = str ? str : extractAddress().toString();

}

/**
 * Updates the small mask display string.
 * @param  {string} str? The string to be shown. If not given, it will be calculated.
 */
function updateMaskShort(str?: string): void {

	id("mask_value").textContent = str ? str : extractAddress().maskString();

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
	updateMaskShort(address.maskString());

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

// +==============================================+

updateDisplays();