namespace Core.Layers.Layer3 {

	export type Byte4 = [Byte,Byte,Byte,Byte]
	export const BYTE4_ZERO: Byte4 = [BYTE_ZERO.clone(), BYTE_ZERO.clone(), BYTE_ZERO.clone(), BYTE_ZERO.clone()]
	export const BYTE4_FULL: Byte4 = [BYTE_FULL.clone(), BYTE_FULL.clone(), BYTE_FULL.clone(), BYTE_FULL.clone()]

	export class Address {

		private ip: Byte4;
		private mask: Byte4;
		private maskShort: number;

		constructor(ip: Byte4|string, mask?: Byte4|number) {

			if (typeof ip === "string") {
				this.parseAddress(ip,false);
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
					this.mask = BYTE4_ZERO.slice() as Byte4;
				}
			}

		}

		public setMask(mask: Byte4): void {

			let maskShortTmp = 0;
			let end = false;

			for (let i = 0; !end && i < 4; i++) {
				for (let j = 0; !end && j < 8; j++) {
					if (mask[i].bit(8 - 1 - j)) {
						maskShortTmp++;
					}
					else {
						end = true;
					}
				}
				end = true;
			}

			this.maskShort = maskShortTmp;
			this.mask = mask;

		}

		public setMaskShort(maskShort: number): void {
			
			if (maskShort < 0 || maskShort > 32) {
				throw new RangeError("The short mask should be between 0 and 32");
			}
			
			let tmpMask: Byte4 = BYTE4_ZERO.slice() as Byte4;

			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 8; j++) {
					if (((8 * i) + j) < maskShort) {
						tmpMask[i].bit(8-1-j, true);
					}
					else {
						tmpMask[i].bit(8 - 1 - j, false);
					}
				}
			}

			this.maskShort = maskShort;
			this.mask = tmpMask;

		}

		public setIp(ip: Byte4): void {
			this.ip = ip;
		}

		public getMask(): Byte4 {
			return this.mask;
		}

		public getMaskShort(): number {
			return this.maskShort;
		}

		public getIp(): Byte4 {
			return this.ip;
		}

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

	}

}