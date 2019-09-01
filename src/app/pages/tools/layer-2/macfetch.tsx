// MACFetch
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-09-01)

import React, { Component, RefObject } from "react";
import FlowCanvas, { FlowCanvasProps, Node, Label, NodeConnection, Line } from "../../../components/FlowCanvas";
import { Address, ERROR_NOT_NETWORK, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE } from "../../../wireworks/networking/layers/layer-3/address";
import ErrorBox from "../../../components/ErrorBox";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";

class MacFetch extends Component {

	private txtTargetAddress: RefObject<HTMLInputElement>;

	state = {
		errorMessage: null as string
	}

	public run = () => {

		let errStr: string = null;
		this.setState({errorMessage: null});
	
		try {
			
			let address = new Address(this.txtTargetAddress.current.value, undefined, true);
			
			if (address.isNetworkAddress()) {
				errStr = "Este é um endereço de rede. Escolha outro endereço.";
				throw Error;
			}
				
		
		} catch (error) {
			
			if(!errStr){
				
				switch (error.name) {
					case ERROR_ADDRESS_PARSE:
						errStr = "O IP do destino deve possuir o formato 0.0.0.0/0.";
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
	
			this.setState({errorMessage: "Entrada inválida. " + errStr})
	
		}
	}

	componentDidMount() {
		document.body.className = "theme-layer2";
	}

	constructor(props: any) {
		super(props);
		this.txtTargetAddress = React.createRef();
	}
	

	render() {
		return (
			<main>
				<div className="hbox align-end mb-3">
					<div>
						<label htmlFor="origin">Host de Origem</label>
						<div>
							<select id="origin">
								<option value="A" selected>Computador A</option>
								<option value="B">Computador B</option>
								<option value="C">Computador C</option>
							</select>
						</div>
					</div>
					<div>
						<label htmlFor="target_address">Endereço IP de Destino</label>
						<div>
							<input type="text" id="target_address" ref={this.txtTargetAddress} onKeyDown={ (ev) => { if(ev.key === "Enter") this.run() }} placeholder="0.0.0.1/0"/>
						</div>
					</div>
					<button type="button" onClick={this.run}>Visualizar</button>
				</div>
				<ErrorBox errorMessage={this.state.errorMessage}/>
			</main>
		);
	}

}

export default MacFetch;

