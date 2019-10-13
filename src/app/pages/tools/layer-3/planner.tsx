// Planner
// +=========================+
// Author: Henrique Colini
// Version: 3.1 (2019-08-29)

import React, { Component, RefObject } from "react";
import { IP, ERROR_NOT_NETWORK, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE } from "../../../wireworks/networking/layers/layer-3/ip";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";
import ErrorBox from "../../../components/ErrorBox";
import "src/sass/pages/planner.scss";

// +==============================================+

class Planner extends Component {

	/**
	 * The reference to the address input.
	 */
	private txtAddress: RefObject<HTMLInputElement>;
	/**
	 * The reference to the generate button.
	 */
	private btnGenerate: RefObject<HTMLButtonElement>;

	state = {
		errorMessage: undefined,
		networkStr: "",
		maskStr: "",
		firstValidStr: "",
		lastValidStr: "",
		broadcastStr: "",
		hostsStr: "",
		showTable: false
	};

	/**
	 * Creates a networking plan.
	 */
	private createPlan = () => {

		let errStr: string = undefined;
		this.setState({errorMessage: undefined});
	
		try {
			
			let address = new IP(this.txtAddress.current.value);
	
			try {
	
				address = new IP(this.txtAddress.current.value, undefined, true, true);
	
			} catch (error) {
	
				if (error.name === ERROR_NOT_NETWORK) {
					errStr = "Este não é um endereço de rede. Você quis dizer " + address.getNetworkAddress(true).toString() + "?";
				}
	
				throw error;
	
			}
	
			this.setState({firstValidStr: address.firstHost(true).toString(true)});
			this.setState({lastValidStr: address.lastHost(true).toString(true)});
			this.setState({maskStr: address.maskString()})	
			this.setState({hostsStr: '' + address.numberOfHosts().toLocaleString()});
			
			let network = address.getNetworkAddress();
			let broadcast = address.getBroadcastAddress();
			
			this.setState({networkStr: network ? network.toString() : "N/A"});
			this.setState({broadcastStr: broadcast ? broadcast.toString(true) : "N/A"});
			
			this.setState({showTable: true});
		
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
	
			this.setState({showTable: false})
			this.setState({errorMessage: "Entrada inválida. " + errStr})
	
		}	
			
	}
	
	constructor(props: any) {
		super(props);
		this.txtAddress = React.createRef();
		this.btnGenerate = React.createRef();
	}

    render() {
        return (
            <main>
				<label htmlFor="address">Rede/Máscara</label>
				<h1>
					<input type="text" name="address" ref={this.txtAddress} placeholder="0.0.0.0/0" onKeyDown={(ev) => {if (ev.key === "Enter") this.createPlan()}}/>
					<button type="button" ref={this.btnGenerate} onClick={this.createPlan}>Gerar plano</button>
				</h1>
				<ErrorBox errorMessage={this.state.errorMessage}/>
				{ this.state.showTable &&
					<table>
						<tbody>
						<tr>
							<th>Rede</th>
							<th>Máscara</th>
							<th>Primeiro Válido</th>
							<th>Último Válido</th>
							<th>Broadcast</th>
							<th>Hosts</th>
						</tr>
						<tr>
							<td>{this.state.networkStr}</td>
							<td>{this.state.maskStr}</td>
							<td>{this.state.firstValidStr}</td>
							<td>{this.state.lastValidStr}</td>
							<td>{this.state.broadcastStr}</td>
							<td>{this.state.hostsStr}</td>
						</tr>
						</tbody>
					</table>
				}
			</main>
        );
    }
}

export default Planner;