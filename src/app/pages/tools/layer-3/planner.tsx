// Planner
// +=========================+
// Author: Henrique Colini
// Version: 2.0 (2019-03-03)

import React, { Component, RefObject } from "react";
import { Address, ERROR_NOT_NETWORK, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE } from "../../../wireworks/networking/layers/layer-3/address";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";
import ErrorBox from "../../../components/ErrorBox";
import "src/sass/pages/planner.scss";

// +==============================================+

class Planner extends Component {

	private addressDOM: RefObject<HTMLInputElement>;
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

	constructor(props: any) {
		super(props);
		this.addressDOM = React.createRef();
		this.btnGenerate = React.createRef();
	}

	private createPlan = () => {

		let errStr: string = undefined;
		this.state.errorMessage = undefined;
	
		try {
			
			let address = new Address(this.addressDOM.current.value);
	
			try {
	
				address = new Address(this.addressDOM.current.value, undefined, true, true);
	
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

	private inputEnter = (ev: React.KeyboardEvent<HTMLInputElement>): void => {
		if (ev.key === "Enter")
			this.createPlan();
	}

	componentDidMount() {

		let c = this;

		document.body.className = "theme-layer3";
			
	}

    render() {
        return (
            <main>
				<label htmlFor="address">Rede/Máscara</label>
				<h1>
					<input type="text" name="address" ref={this.addressDOM} placeholder="0.0.0.0/0" onKeyDown={this.inputEnter}/>
					<button type="button" ref={this.btnGenerate} onClick={this.createPlan}>Gerar plano</button>
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
							<td>{this.state.networkStr}</td>
							<td>{this.state.maskStr}</td>
							<td>{this.state.firstValidStr}</td>
							<td>{this.state.lastValidStr}</td>
							<td>{this.state.broadcastStr}</td>
							<td>{this.state.hostsStr}</td>
						</tr>
					</table>
				}
			</main>
        );
    }
}

export default Planner;