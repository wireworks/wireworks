// Planner
// +=========================+
// Author: Henrique Colini
// Version: 2.0 (2019-03-03)

import { id } from "../../core/helpers/dom";
import { Address, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE, ERROR_NOT_NETWORK } from "../../core/networking/layers/layer-3/address";
import { ERROR_BYTE_RANGE } from "../../core/networking/byte";

/**
 * Creates the network plan table.
 */
function createPlan() {

	let oldPlan = id('plan');

	if (oldPlan !== null) {
		oldPlan.remove();
	}

	let table = document.createElement('table');
	table.id = "plan";

	let errStr: string = undefined;

	try {
			
		let address = new Address((<HTMLInputElement>id("address")).value, undefined, true);

		let firstValidStr: string;
		let lastValidStr: string;

		try {
			firstValidStr = address.firstHost(true).toString(true);
			lastValidStr = address.lastHost(true).toString(true);
		} catch (error) {
			
			if (error.name === ERROR_NOT_NETWORK) {
				errStr = "Este não é um endereço de rede. Você quis dizer " + address.getNetworkAddress(true).toString() + "?";
			}

			throw error;

		}

		let maskStr = address.maskString();		
		let hostsStr = '' + address.numberOfHosts().toLocaleString();
		
		let network = address.getNetworkAddress();
		let broadcast = address.getBroadcastAddress();
		let networkStr = network ? network.toString() : "N/A";
		let broadcastStr = broadcast ? broadcast.toString(true) : "N/A";

		table.innerHTML = `
				<tr>
					<th>Rede</th>
					<th>Máscara</th>
					<th>Primeiro Válido</th>
					<th>Último Válido</th>
					<th>Broadcast</th>
					<th>Hosts</th>
				</tr>
				<tr>
					<td>${networkStr}</td>
					<td>${maskStr}</td>
					<td>${firstValidStr}</td>
					<td>${lastValidStr}</td>
					<td>${broadcastStr}</td>
					<td>${hostsStr}</td>
				</tr>
			`;		

	} catch (error) {
		
		if(!errStr){
			
			switch (error.name) {
				case ERROR_ADDRESS_PARSE:
					errStr = "A entrada deve possuir o formato 0.0.0.0/0.";
					break;
				case ERROR_MASK_RANGE:
					errStr = "O valor da máscara é alto demais (deve estar entre 0-32).";
					break;
				case ERROR_BYTE_RANGE:
					errStr = "Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).";
					break;
				default:
					errStr = "Erro desconhecido (" + error.name + ")."
					break;
			}

		}

		table.innerHTML = `
				<td>
					<h2 class="error">Entrada inválida. ${errStr}</h2>
				</td>
			`;

	}	

	id('container').appendChild(table);
	
}

// +==============================================+

id("address").addEventListener("keydown", function(ev: KeyboardEvent): void {
	if (ev.key === "Enter")
		createPlan();
});

id("button_generate").addEventListener("click", function(ev: MouseEvent):void {
	createPlan();
});