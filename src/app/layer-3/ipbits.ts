import { id } from "../../core/helpers"
import { Byte4, Byte4Zero } from "../../core/networking/layers/layer-3/address";

const IP: HTMLElement[][] = [];
const MASK: HTMLElement[][] = [];

for (let i=0; i<4; i++) {
	IP[i] = [];
	MASK[i] = [];
	for (let j=0; j<8; j++) {
		IP[i][j] = id("byte_ip_"+i+"_"+j);
		MASK[i][j] = id("byte_ip_" + i + "_" + j);
	}
}

function extractDOMByte4(from: HTMLElement[][]): Byte4 {

	let bytes = Byte4Zero()

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 8; j++) {
			bytes[i].bit(j, (<HTMLInputElement>from[i][j]).checked ? true : false);
		}
	}

	return bytes;

}

console.log("HELLO!!!!");
console.log(extractDOMByte4(IP));