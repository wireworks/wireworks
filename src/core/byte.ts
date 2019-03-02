namespace Core {

	type Bits = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];

	export class Byte {
		
		private bits: Bits;
		private decimal: number;

		constructor(decimal: number) {

			this.setDecimal(decimal);

		}

		setDecimal(decimal: number): void {
			
			if (decimal < 0 || decimal > 255 || decimal.toString().indexOf('.') !== -1) {
				throw new RangeError("The decimal value of a byte must be an integer between 0-255 (inclusive)");
			}

			let tmpDecimal = decimal;
			let tmpBits: Bits = [false, false, false, false, false, false, false, false]

			for (let i = 0; i < 8; i++) {
				tmpBits[i] = tmpDecimal % 2 ? true : false;
				tmpDecimal = Math.floor(tmpDecimal / 2);
			}
			
			this.bits = tmpBits
			this.decimal = decimal;

		}

		setBits(bits: Bits): void {

			this.decimal = 0;
			this.bits = bits;		

			for (let i = 0; i < bits.length; i++)
				this.decimal += this.bits[i] ? Math.pow(2, i) : 0;
				
		}

		getDecimal(): number {
			return this.decimal;
		}

		getBits(): Bits {
			return this.bits;
		}

	}

}