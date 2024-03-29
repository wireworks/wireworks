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
 * Error name for a when an IP Address should be a network address, but isn't.
 */
export const ERROR_NOT_NETWORK = "NotNetworkError";

/**
 * Converts a bit in Byte index to a bit in Byte4 index.
 * @param  {number} byteIndex The index of the Byte in a Byte4.
 * @param  {number} bitIndex The index of the bit in the Byte.
 */
export function joinBitIndex(byteIndex: number, bitIndex: number): number {
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
export function splitBitIndex(byte4Index: number): { byteIndex: number, bitIndex: number } {
	if (byte4Index > 31 || byte4Index < 0) {
		throw new RangeError("The byte4Index must be between 0-31 (inclusive)");
	}
	return {
		byteIndex: Math.floor(byte4Index / 8),
		bitIndex: 7 - (byte4Index % 8)
	};
}

/**
 * A full IP/Mask address.
 * @author Henrique Colini
 */
export class IP {
	
	/**
	 * This IP address's IP octets.
	 */
	private ip: Byte4;

	/**
	 * This IP address' mask.
	 */
	private mask: Byte4;

	/**
	 * The numerical representation of this IP address' mask.
	 */
	private maskShort: number;

	
	/**
	 * Constructs an IP address, given an IP and a mask.
	 * @constructor
	 * @param  {Byte4|string} ip The IP of this address. May be a Byte4 or a formatted string.
	 * @param  {Byte4|number} mask Optional. The mask of this address. May be a Byte4 or its numerical representation. If not given, defaults to /0.
	 * @param  {boolean} requireMask Optional. If set to true, the mask becomes a required parameter in the formatted string.
	 * @param  {boolean} requireNetwork Optional. If true, throws an error if this is not a network address. Defaults to false.
	 */
	constructor(ip: Byte4 | string, mask?: Byte4 | number, requireMask: boolean = false, requireNetwork: boolean = false) {

		if (typeof ip === "string") {
			this.parseIP(ip, requireMask);
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
				this.setMask(Byte4Zero());
			}
		}

		if (requireNetwork && !this.isNetworkAddress(true)) {
			let err = new Error("Not a Network Address");
			err.name = ERROR_NOT_NETWORK;
			throw err;
		}

	}

	/**
	 * Returns the network address of this IP Address.
	 * @param {boolean} allowAbove30 Optional. If false, returns undefined if the mask is greater than 30. Defaults to false.
	 */
	public getNetworkAddress(allowAbove30: boolean = false): IP {

		if (!allowAbove30 && this.maskShort > 30) return undefined;

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

		return new IP(bytes, cloneByte4(this.mask));

	}

	/**
	 * Returns the broadcast address of this IP Address' network.
	 * @param {boolean} allowAbove30 Optional. If false, returns undefined if the mask is greater than 30. Defaults to false.
	 */
	public getBroadcastAddress(allowAbove30: boolean = false): IP {

		if (!allowAbove30 && this.maskShort > 30) return undefined;

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

		return new IP(bytes, cloneByte4(this.mask));

	}
	
	/**
	 * Returns whether this IP Address is a network address.
	 * @param {boolean} allowAbove30 Optional. If false, returns false if the mask is greater than 30. Defaults to false.
	 */
	public isNetworkAddress(allowAbove30: boolean = false): boolean {
		return this.compare(this.getNetworkAddress(allowAbove30));
	};

	/**
	 * Returns whether this IP Address is a broadcast address.
	 * @param {boolean} allowAbove30 Optional. If false, returns false if the mask is greater than 30. Defaults to false.
	 */
	public isBroadcastAddress(allowAbove30: boolean = false): boolean {
		return this.compare(this.getBroadcastAddress(allowAbove30));
	};
	
	/**
	 * Returns true if this IP Address is the same as another.
	 * @param {IP} other the IP Address to be compared with.
	 */
	public compare(other: IP): boolean {

		if (!other) {
			return false;
		}

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
	 * Returns the amount of hosts that this IP Address' network has.
	 * @param {boolean} requireNetwork Optional. If true, throws an error if this is not a network address. Defaults to false.
	 */
	public numberOfHosts(requireNetwork: boolean = false): number {

		if(requireNetwork && !this.isNetworkAddress(true)) {
			let err = new Error("Not a network address");
			err.name = ERROR_NOT_NETWORK;
			throw err;
		}

		if (this.maskShort === 31)
			return 2;
		if (this.maskShort === 32)
			return 1;
		return (Math.pow(2, 32 - this.maskShort) - 2);

	}

	/**
	 * Returns the first valid host IP Address of this network.
	 * @param  {boolean} requireNetwork Optional. If true, throws an error if this is not a network address. Defaults to false.
	 */
	public firstHost(requireNetwork: boolean = false): IP {

		if (requireNetwork && !this.isNetworkAddress(true)) {
			let err = new Error("Not a network address");
			err.name = ERROR_NOT_NETWORK;
			throw err;
		}

		let ipBytes: Byte4;
		let maskBytes: Byte4;

		if (requireNetwork) {
			ipBytes = cloneByte4(this.ip);
			maskBytes = cloneByte4(this.mask);
		}
		else {
			let net = this.getNetworkAddress(true);
			ipBytes = net.ip;
			maskBytes = net.mask;
		}

		if (this.maskShort < 31) {
			ipBytes[3].setDecimal(ipBytes[3].getDecimal() + 1);
		}

		return new IP(ipBytes, maskBytes);

	}

	/**
	 * Returns the last valid host IP Address of this network.
	 * @param  {boolean} requireNetwork Optional. If true, throws an error if this is not a network address. Defaults to false.
	 */
	public lastHost(requireNetwork: boolean = false): IP {

		if (requireNetwork && !this.isNetworkAddress(true)) {
			let err = new Error("Not a Network Address");
			err.name = ERROR_NOT_NETWORK;
			throw err;
		}

		let ipBytes: Byte4;
		let maskBytes: Byte4;

		let net = this.getBroadcastAddress(true);
		ipBytes = net.ip;
		maskBytes = net.mask;

		if (this.maskShort < 31) {
			ipBytes[3].setDecimal(ipBytes[3].getDecimal() - 1);
		}

		return new IP(ipBytes, maskBytes);

	}

	/**
	 * Divides this IP Address into two subnets.
	 * @param  {boolean} requireNetwork Optional. If true, throws an error if this is not a network address. Defaults to false.
	 */
	public subdivide(requireNetwork: boolean = false): [IP, IP] {

		if (requireNetwork && !this.isNetworkAddress(true)) {
			let err = new Error("Not a Network Address");
			err.name = ERROR_NOT_NETWORK;
			throw err;
		}

		let subnets: [IP, IP] = [undefined, undefined];

		if (this.maskShort === 32) {
			return subnets;
		}

		let ipBytes: Byte4;

		if (requireNetwork) {
			ipBytes = cloneByte4(this.ip);
		}
		else {
			let net = this.getNetworkAddress(true);
			ipBytes = net.ip;
		}

		subnets[0] = new IP(cloneByte4(ipBytes), this.maskShort+1);
		
		let secondIpBytes: Byte4 = cloneByte4(ipBytes);
		let {byteIndex, bitIndex} = splitBitIndex(this.maskShort);
		secondIpBytes[byteIndex].bit(bitIndex, true);

		subnets[1] = new IP(secondIpBytes, this.maskShort+1);

		return subnets;

	}
	
	/**
	 * Sets this IP Address' mask.
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
	 * Sets this IP Address' mask, given its numerical representation (0-32).
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
	 * Sets this IP Address' IP value.
	 * @param  {Byte4} ip
	 */
	public setIp(ip: Byte4): void {
		this.ip = ip;
	}

	/**
	 * Returns this IP Address' mask.
	 */
	public getMask(): Byte4 {
		return this.mask;
	}

	/**
	 * Returns the numerical representation of this IP Address' mask.
	 */
	public getMaskShort(): number {
		return this.maskShort;
	}
	
	/**
	 * Returns this IP Address' IP value.
	 */
	public getIp(): Byte4 {
		return this.ip;
	}

	/**
	 * Sets this IP Address IP/Mask values from a parsed string.
	 * @param  {string} address The full address, in the X.X.X.X/X format. If requireMask is false, the mask can be ommited and defaults to /0.
	 * @param  {boolean=true} requireMask Whether the address requires the mask to be given.
	 */
	public parseIP(address: string, requireMask: boolean = true): void {

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
	 * Returns the string representation of this IP Address in the X.X.X.X/X format.
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