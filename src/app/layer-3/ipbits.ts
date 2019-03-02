import { id } from "../../core/helpers"
import { Byte4, Byte4Zero, Address } from "../../core/networking/layers/layer-3/address";

const IP: HTMLElement[][] = [];
const MASK: HTMLElement[][] = [];

for (let i=0; i<4; i++) {
	IP[i] = [];
	MASK[i] = [];
	for (let j=0; j<8; j++) {

		let ipBit = id("byte_ip_" + i + "_" + j);
		let maskBit = id("byte_mask_" + i + "_" + j);

		ipBit.addEventListener("change", function() {
			updateIPDisplay();
		});

		IP[i][j] = ipBit;
		MASK[i][j] = maskBit;
	}
}

function extractAddress(): Address {

	let ipBytes = Byte4Zero()
	let maskBytes = Byte4Zero()

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 8; j++) {
			ipBytes[i].bit(j, (<HTMLInputElement>IP[i][j]).checked ? true : false);
			maskBytes[i].bit(j, (<HTMLInputElement>MASK[i][j]).checked ? true : false);
		}
	}

	return new Address(ipBytes,maskBytes);

}

function updateIPShort(str?: string): void {

	id("ip_value").textContent = str ? str : extractAddress().toString();

}

function updateIPDisplay(): void {

	let address = extractAddress();

	for (let i = 0; i < 4; i++)
		id("display_ip_" + i).textContent = "" + address.getIp()[i].getDecimal();

	updateIPShort(address.toString(true));

}