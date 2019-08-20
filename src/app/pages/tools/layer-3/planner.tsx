// Planner
// +=========================+
// Author: Henrique Colini
// Version: 2.0 (2019-03-03)

import React, { Component } from "react";
import { id, make } from "../../../wireworks/utils/dom";
import { Address, ERROR_NOT_NETWORK, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE } from "../../../wireworks/networking/layers/layer-3/address";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";
import "src/sass/pages/planner.scss"
import ErrorBox from "../../../components/ErrorBox";

let planWrapper = id('plan-wrapper');
let addressDOM = id('address') as HTMLInputElement;

export function init() {
	planWrapper = id('plan-wrapper');
	addressDOM = id('address') as HTMLInputElement;
}

/**
 * Creates the network plan table.
 */
export function createPlan() {

	let oldPlan = id('plan');

	if (oldPlan !== null) {
		oldPlan.remove();
	}

	let table = make("table", "", "", "plan");

	let errStr: string = undefined;

	try {
		
		let address = new Address(addressDOM.value);

		try {

			address = new Address(addressDOM.value, undefined, true, true);

		} catch (error) {

			if (error.name === ERROR_NOT_NETWORK) {
				errStr = "Este não é um endereço de rede. Você quis dizer " + address.getNetworkAddress(true).toString() + "?";
			}

			throw error;

		}

		let firstValidStr = address.firstHost(true).toString(true);
		let lastValidStr = address.lastHost(true).toString(true);
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
					errStr = "Erro desconhecido (" + error.name + ").";
					console.error(error);
					break;
			}

		}

		table.innerHTML = `
				<td>
					<h2 class="font-mono text-danger">Entrada inválida. ${errStr}</h2>
				</td>
			`;

	}	

	planWrapper.appendChild(table);
	
}

// +==============================================+

class Planner extends Component {

	state = {
		errorMessage: null,
		network: "",
		mask: "",
		firstValid: "",
		lastValid: "",
		broadcast: "",
		hosts: "",
		showTable: false
	};

	componentDidMount() {

		let c = this;

		document.body.className = "theme-layer3";
		
		init();

		id("address").addEventListener("keydown", function(ev: KeyboardEvent): void {
			if (ev.key === "Enter")
				createPlan();
		});
		
		id("button_generate").addEventListener("click", function(ev: MouseEvent):void {
			c.setState({errorMessage: "wow not gay :)"});
			createPlan();
		});
	}

    render() {
        return (
            <main>
				<label htmlFor="address">Rede/Máscara</label>
				<h1>
					<input type="text" name="address" id="address" placeholder="0.0.0.0/0"/>
					<button type="button" id="button_generate">Gerar plano</button>
				</h1>
				<ErrorBox errorMessage={this.state.errorMessage}/>
				{ this.state.showTable &&
					<table>
						<tr>
							<th>Rede</th>
							<th>Máscara</th>
							<th>Primeiro Válido</th>
							<th>Último Válido</th>
							<th>Broadcast</th>
							<th>Hosts</th>
						</tr>
						<tr>
							<td>{this.state.network}</td>
							<td>{this.state.mask}</td>
							<td>{this.state.firstValid}</td>
							<td>{this.state.lastValid}</td>
							<td>{this.state.broadcast}</td>
							<td>{this.state.hosts}</td>
						</tr>
					</table>
				}
			</main>
        );
    }
}

export default Planner;