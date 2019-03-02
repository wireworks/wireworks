namespace Core.Layers {

	export type Bit8 = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
	export const BIT8_ZERO: Bit8 = [false, false, false, false, false, false, false, false];
	export const BIT8_FULL: Bit8 = [true, true, true, true, true, true, true, true];

	export class Byte {
		
		private bits: Bit8;
		private decimal: number;

		constructor(value: number|Bit8) {

			if (typeof value === "number") {
				this.setDecimal(value);
			}
			else {
				this.setBits(value);
			}

		}

		setDecimal(decimal: number): void {
			
			if (decimal < 0 || decimal > 255 || decimal.toString().indexOf('.') !== -1) {
				throw new RangeError("The decimal value of a byte must be an integer between 0-255 (inclusive)");
			}

			let tmpDecimal = decimal;
			let tmpBits: Bit8 = BIT8_ZERO.slice() as Bit8

			for (let i = 0; i < 8; i++) {
				tmpBits[i] = tmpDecimal % 2 ? true : false;
				tmpDecimal = Math.floor(tmpDecimal / 2);
			}
			
			this.bits = tmpBits
			this.decimal = decimal;

		}

		setBits(bits: Bit8): void {

			this.decimal = 0;
			this.bits = bits;		

			for (let i = 0; i < bits.length; i++)
				this.decimal += this.bits[i] ? Math.pow(2, i) : 0;
				
		}

		getDecimal(): number {
			return this.decimal;
		}

		getBits(): Bit8 {
			return this.bits;	
		}

		bit(index: number, value: boolean|undefined = undefined): boolean {

			if (value !== undefined) {
				let bits = this.bits;
				bits[index] = value;
				this.setBits(bits);
			}

			return this.bits[index];

		}

		clone(): Byte {

			return new Byte(this.bits.slice() as Bit8)

		}

	}
	
	export const BYTE_ZERO: Byte = new Byte(BIT8_ZERO)
	export const BYTE_FULL: Byte = new Byte(BIT8_FULL)

}