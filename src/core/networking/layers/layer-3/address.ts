import { Byte, ByteZero, ByteMax } from "../../byte";

/**
 * An array of 4 Bytes.
 */
export type Byte4 = [Byte,Byte,Byte,Byte];

/**
 * Returns a Byte4 corresponding to 0, 0, 0, 0.
 */
export function Byte4Zero(): Byte4 {
	return [ByteZero(), ByteZero(), ByteZero(), ByteZero()];
}

/**
 * Returns a Byte4 corresponding to 255, 255, 255, 255.
 */
export function Byte4Max(): Byte4 {
	return [ByteMax(), ByteMax(), ByteMax(), ByteMax()];
}

/**
 * A full IP/Mask address.
 * @author Henrique Colini
 */
export class Address {
	
	/**
	 * This Address' IP.
	 */
	private ip: Byte4;

	/**
	 * This Address' mask.
	 */
	private mask: Byte4;

	/**
	 * The numerical representation of this Address' mask.
	 */
	private maskShort: number;

	
	/**
	 * Constructs an Address, given an IP and a mask.
	 * @constructor
	 * @param  {Byte4|string} ip The IP of this Address. May be a Byte4 or a formatted string.
	 * @param  {Byte4|number} mask Optional. The mask of this Address. May be a Byte4 or its numerical representation.
	 */
	constructor(ip: Byte4 | string, mask?: Byte4 | number) {

		if (typeof ip === "string") {
			this.parseAddress(ip, false);
		}
		else {
			this.ip = ip;
		}

		if (!this.mask) {
			if (mask) {
				if (typeof mask === "number") {
					this.setMaskShort(mask);
				}
				else {
					this.setMask(mask);
				}
			}
			else {
				this.mask = Byte4Zero();
			}
		}

	}
	
	/**
	 * Sets this Address' mask.
	 * @param  {Byte4} mask
	 */
	public setMask(mask: Byte4): void {

		let maskShortTmp = 0;
		let end = false;

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 8; j++) {

				if (mask[i].bit(8 - 1 - j)) {
					if(!end) {
						maskShortTmp++;
					}
					else {
						throw new Error("Mask contains holes");
					}
				}
				else {
					end = true;
				}
			}
		}

		this.maskShort = maskShortTmp;
		this.mask = mask;

	}

	/**
	 * Sets this Address' mask, given its numerical representation (0-32).
	 * @param  {number} maskShort
	 */
	public setMaskShort(maskShort: number): void {

		if (maskShort < 0 || maskShort > 32) {
			throw new RangeError("The short mask should be between 0 and 32");
		}

		let tmpMask: Byte4 = Byte4Zero();

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 8; j++) {
				if (((8 * i) + j) < maskShort) {
					tmpMask[i].bit(8 - 1 - j, true);
				}
				else {
					tmpMask[i].bit(8 - 1 - j, false);
				}
			}
		}

		this.maskShort = maskShort;
		this.mask = tmpMask;

	}

	/**
	 * Sets this Address' IP value.
	 * @param  {Byte4} ip
	 */
	public setIp(ip: Byte4): void {
		this.ip = ip;
	}

	/**
	 * Returns this Address' mask.
	 */
	public getMask(): Byte4 {
		return this.mask;
	}

	/**
	 * Returns the numerical representation of this Address' mask.
	 */
	public getMaskShort(): number {
		return this.maskShort;
	}
	
	/**
	 * Returns this Address' IP value.
	 */
	public getIp(): Byte4 {
		return this.ip;
	}

	/**
	 * Sets this Address IP/Mask values from a parsed string.
	 * @param  {string} address The full address, in the X.X.X.X/X format. If requireMask is false, the mask can be ommited and defaults to /0.
	 * @param  {boolean=true} requireMask Whether the address requires the mask to be given.
	 */
	public parseAddress(address: string, requireMask: boolean = true): void {

		address = address.trim();
		const fullRegex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/;
		const ipRegex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;

		let match = fullRegex.exec(address);

		if (match !== null) {
			let ipByte0 = new Byte(parseInt(match[1], 10));
			let ipByte1 = new Byte(parseInt(match[2], 10));
			let ipByte2 = new Byte(parseInt(match[3], 10));
			let ipByte3 = new Byte(parseInt(match[4], 10));
			let maskShort = parseInt(match[5], 10);

			if (maskShort < 0 || maskShort > 32) {
				throw new RangeError("The short mask should be between 0 and 32");
			}

			this.setIp([ipByte0, ipByte1, ipByte2, ipByte3]);
			this.setMaskShort(maskShort);
		}
		else if (!requireMask) {

			let matchIp = ipRegex.exec(address);

			if (matchIp !== null) {
				let ipByte0 = new Byte(parseInt(matchIp[1], 10));
				let ipByte1 = new Byte(parseInt(matchIp[2], 10));
				let ipByte2 = new Byte(parseInt(matchIp[3], 10));
				let ipByte3 = new Byte(parseInt(matchIp[4], 10));

				this.setIp([ipByte0, ipByte1, ipByte2, ipByte3]);
			}
			else {
				throw new Error("Invalid IP/mask address string");
			}

		}
		else {
			throw new Error("Invalid IP/mask address string");
		}

	}

	
	/**
	 * Returns the string representation of this Address in the X.X.X.X/X format.
	 * @param  {boolean=false} omitMask Whether the mask should be ommited.
	 */
	toString(omitMask: boolean = false): string {

		return "" +
			this.ip[0].getDecimal() + "." +
			this.ip[1].getDecimal() + "." +
			this.ip[2].getDecimal() + "." +
			this.ip[3].getDecimal() + (omitMask? "" : this.shortMaskString());

	}

	/**
	 * Returns the string representation of the mask.
	 */
	maskString(): string {
		return "" +
			this.mask[0].getDecimal() + "." +
			this.mask[1].getDecimal() + "." +
			this.mask[2].getDecimal() + "." +
			this.mask[3].getDecimal();
	}

	shortMaskString(): string {
		return "/" + this.getMaskShort();
	}

}