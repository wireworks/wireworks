/**
 * An array of 8 bits (boolean values).
 */
export type Bit8 = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];

/**
 * Returns a Bit8 filled with false.
 */
export function Bit8Zero(): Bit8 {
	return [false, false, false, false, false, false, false, false];
}

/**
 * Returns a Bit8 filled with true.
 */
export function Bit8Max(): Bit8 {
	return [true, true, true, true, true, true, true, true];
}

/**
 * Returns a Byte corresponding to the number 0.
 */
export function ByteZero(): Byte {
	return new Byte(Bit8Zero());
}

/**
 * Returns a Byte corresponding to the number 255.
 */
export function ByteMax(): Byte {
	return new Byte(Bit8Max());
}

/**
 * Error name for a byte outside the correct range.
 */
export const ERROR_BYTE_RANGE = "ByteRangeError";

/**
 * A Byte, composed of 8 bits (boolean values).
 * @author Henrique Colini
 */
export class Byte {

	/**
	 * This Byte's Bit8 representation.
	 */	
	private bits: Bit8;

	/**
	 * This Byte's numerical representation.
	 */
	private decimal: number;
	
	/**
	 * Constructs a Byte from a number (0-255) or a Bit8.
	 * @constructor
	 * @param  {number|Bit8} value The value of this Byte.
	 */

	constructor(value: number | Bit8) {

		if (typeof value === "number") {
			this.setDecimal(value);
		}
		else {
			this.setBits(value);
		}

	}

	/**
	 * Sets the value of this Byte, using a number (0-255).
	 * @param  {number} decimal
	 */

	setDecimal(decimal: number): void {

		if (decimal < 0 || decimal > 255 || decimal.toString().indexOf('.') !== -1) {
			let err = new RangeError("The decimal value of a byte must be an integer between 0-255 (inclusive)");
			err.name = ERROR_BYTE_RANGE;
			throw err;
		}

		let tmpDecimal = decimal;
		let tmpBits: Bit8 = Bit8Zero();

		for (let i = 0; i < 8; i++) {
			tmpBits[i] = tmpDecimal % 2 ? true : false;
			tmpDecimal = Math.floor(tmpDecimal / 2);
		}

		this.bits = tmpBits
		this.decimal = decimal;

	}

	/**
	 * Sets the value of this Byte, using a Bit8.
	 * @param  {Bit8} bits
	 */

	setBits(bits: Bit8): void {

		this.decimal = 0;
		this.bits = bits;

		for (let i = 0; i < bits.length; i++)
			this.decimal += this.bits[i] ? Math.pow(2, i) : 0;

	}

	/**
	 * Returns this Byte's numeric value.
	 */

	getDecimal(): number {
		return this.decimal;
	}

	/**
	 * Returns this Byte's Bit8 representation.
	 */

	getBits(): Bit8 {
		return this.bits;
	}

	/**
	 * Getter/Setter of a single bit from this Byte.
	 * @param  {number} index The index of the bit.
	 * @param  {boolean|undefined=undefined} value Optional. Sets the value for this bit.
	 */

	bit(index: number, value: boolean | undefined = undefined): boolean {

		if (value !== undefined) {
			let bits = this.bits;
			bits[index] = value;
			this.setBits(bits);
		}

		return this.bits[index];

	}

	/**
	 * Clones this Byte.
	 */
	clone(): Byte {

		return new Byte(this.bits.slice() as Bit8)

	}

}