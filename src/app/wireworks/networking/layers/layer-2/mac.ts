import { Byte, ByteZero, ByteMax } from "../../byte";

/**
 * An array of 6 Bytes.
 */
export type Byte6 = [Byte,Byte,Byte,Byte,Byte,Byte];

/**
 * Returns a Byte6 corresponding to 0, 0, 0, 0, 0, 0.
 */
export function Byte6Zero(): Byte6 {
	return [ByteZero(), ByteZero(), ByteZero(), ByteZero(), ByteZero(), ByteZero()];
}

/**
 * Returns a Byte6 corresponding to 255, 255, 255, 255, 255, 255.
 */
export function Byte6Max(): Byte6 {
	return [ByteMax(), ByteMax(), ByteMax(), ByteMax(), ByteMax(), ByteMax()];
}

/**
 * Clones a Byte6.
 * @param  {Byte6} byte6 The Byte6 to be cloned.
 */
export function cloneByte6(byte6: Byte6): Byte6 {

	byte6 = byte6.slice() as Byte6;

	for (let i = 0; i < 6; i++) {
		byte6[i] = byte6[i].clone();		
	}

	return byte6;

}

/**
 * Error name for a malformated MAC address string.
 */
export const ERROR_MAC_ADDRESS_PARSE = "AddressParseError";

const allowedChars = ['A','B','C','D','E','F','0','1','2','3','4','5','6','7','8','9'];

/**
 * A MAC address.
 * @author Henrique Colini
 */
export default class MAC {

	private bytes: Byte6 = Byte6Zero();
	private asString: string;
	
	/**
	 * Constructs a MAC address.
	 * @param  {Byte6|string} mac The MAC address itself. May be a Byte6 or a formatted string.
	 */
	constructor(mac: Byte6|string) {
		if (typeof mac === "string") this.parseAddress(mac);
		else this.setBytes(mac);
	}

	public parseAddress(str: string) {
		
		str = str.toUpperCase().replace(/[:.-]/g, "");

		if (str.length != 12) {
			let err = new Error("Invalid MAC address string");
			err.name = ERROR_MAC_ADDRESS_PARSE;
			throw err;
		}
		
		for (let i = 0; i < str.length; i++) {
			const c = str[i];
			if (allowedChars.indexOf(c) == -1) {
				let err = new Error("Invalid MAC address string");
				err.name = ERROR_MAC_ADDRESS_PARSE;
				throw err;
			}			
		}

		this.asString = "";
		
		for (let i = 0; i < 6; i++) {
			const piece = str[i*2]+str[(i*2)+1];
			this.bytes[i] = new Byte(parseInt(piece, 16));
			this.asString += piece;
			if (i < 6-1) this.asString += "-";
		}

	}

	public setBytes(bytes: Byte6) {
		this.bytes = bytes;
		this.asString = "";
		for (let i = 0; i < 6; i++) {
			let piece = bytes[i].getDecimal().toString(16).toUpperCase();
			this.asString += (piece.length<2? '0' : '') + piece;
			if (i < 6-1) this.asString += "-";
		}
	}

	public getBytes(): Byte6 {
		return this.bytes;
	}

	public toString(): string {
		return this.asString;
	}

}