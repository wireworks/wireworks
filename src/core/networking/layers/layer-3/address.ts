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
 * Clones a Byte4.
 * @param  {Byte4} byte4 The Byte4 to be cloned.
 */
export function cloneByte4(byte4: Byte4): Byte4 {

	byte4 = byte4.slice() as Byte4;

	for (let i = 0; i < 4; i++) {
		byte4[i] = byte4[i].clone();		
	}

	return byte4;

}

/**
 * Error name for a mask with holes.
 */
export const ERROR_MASK_HOLES = "MaskHolesError";
/**
 * Error name for a mask outside the correct range.
 */
export const ERROR_MASK_RANGE = "MaskRangeError";
/**
 * Error name for a malformated address string.
 */
export const ERROR_ADDRESS_PARSE = "AddressParseError";

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
	 * Returns the Network Address of this Address.
	 */
	public getNetworkAddress(): Address {

		let bytes: Byte4 = Array<Byte>(4) as Byte4;

		for (let i = 0; i < 4; i++) {

			let minByte = this.ip[i].clone();
			let maskByte = this.mask[i];

			for (let i = 0; i < 8; i++) {
				if (!maskByte.bit(i)) {
					minByte.bit(i, false);
				}
			}

			bytes[i] = minByte;

		}

		return new Address(bytes, cloneByte4(this.mask));

	}

	/**
	 * Returns the Broadcast Address of this Address' network.
	 */
	public getBroadcastAddress(): Address {

		let bytes: Byte4 = Array<Byte>(4) as Byte4;

		for (let i = 0; i < 4; i++) {

			let maxByte = this.ip[i].clone();
			let maskByte = this.mask[i];

			for (let i = 0; i < 8; i++) {
				if (!maskByte.bit(i)) {
					maxByte.bit(i, true);
				}
			}

			bytes[i] = maxByte;

		}

		return new Address(bytes, cloneByte4(this.mask));

	}
	
	/**
	 * Returns whether this Address is a Network Address.
	 */
	public isNetworkAddress(): boolean {
		return this.compare(this.getNetworkAddress());
	};

	/**
	 * Returns whether this Address is a Broadcast Address.
	 */
	public isBroadcastAddress(): boolean {
		return this.compare(this.getBroadcastAddress());
	};
	
	/**
	 * Returns true if this Address is the same as another.
	 * @param  {Address} other the Address to be compared with.
	 */
	public compare(other: Address): boolean {

		if (this === other)
			return true;

		if (this.ip === other.ip && (this.mask === other.mask || this.maskShort === other.maskShort))
			return true;

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 8; j++) {
				if ((this.ip[i].bit(j) !== other.ip[i].bit(j)) || (this.mask[i].bit(j) !== other.mask[i].bit(j))) {
					return false;
				}
			}			
		}

		return true;

	}
	
	/**
	 * Returns the amount of hosts that this Address' network has.
	 */
	public numberOfHosts(): number {

		if (this.maskShort == 31)
			return 2;
		if (this.maskShort == 32)
			return 1;
		return (Math.pow(2, 32 - this.maskShort) - 2);

	}
	
	/**
	 * Sets this Address' mask.
	 * @param  {Byte4} mask The Byte4 mask to be set.
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
						let err = new Error("Mask contains holes");
						err.name = ERROR_MASK_HOLES;
						throw err;
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
	 * @param  {number} maskShort The numerical mask to be set.
	 */
	public setMaskShort(maskShort: number): void {

		if (maskShort < 0 || maskShort > 32) {
			let err = new RangeError("The short mask should be between 0 and 32");
			err.name = ERROR_MASK_RANGE;
			throw err;
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
				let err = new RangeError("The short mask should be between 0 and 32");
				err.name = ERROR_MASK_RANGE;
				throw err;
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
				let err = new Error("Invalid IP/mask address string");
				err.name = ERROR_ADDRESS_PARSE;
				throw err;
			}

		}
		else {
			let err = new Error("Invalid IP/mask address string");
			err.name = ERROR_ADDRESS_PARSE;
			throw err;
		}

	}

	
	/**
	 * Returns the string representation of this Address in the X.X.X.X/X format.
	 * @param  {boolean} omitMask Whether the mask should be ommited. Defaults to false.
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