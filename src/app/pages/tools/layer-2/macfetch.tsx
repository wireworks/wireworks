// MACFetch
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-09-01)

import React, { Component, RefObject } from "react";
import FlowCanvas, { FlowCanvasProps, Node, Label, NodeConnection, Line } from "../../../components/FlowCanvas";
import { Address, ERROR_NOT_NETWORK, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE } from "../../../wireworks/networking/layers/layer-3/address";
import ErrorBox from "../../../components/ErrorBox";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";

// Images used in the canvas.

const computerImage = new Image();
const routerImage = new Image();
const internetImage = new Image();
const switchImage = new Image();

import("src/images/layers/2/computer.png").then(res => computerImage.src = res.default);
import("src/images/layers/2/router.png").then(res => routerImage.src = res.default);
import("src/images/layers/2/internet.png").then(res => internetImage.src = res.default);
import("src/images/layers/2/switch.png").then(res => switchImage.src = res.default);

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
							<select id="origin" defaultValue="A">
								<option value="A">Computador A</option>
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
				<MacFetchCanvas/>
			</main>
		);
	}

}

export default MacFetch;

class MacFetchCanvas extends Component {

	private flowCanvas: RefObject<FlowCanvas>;

	resetCanvas = () => {

		let pl = 80; // padding
		let pr = 80;
		let pt = 40;
		let pb = 70;

		let w = this.flowCanvas.current.props.width;
		let h = this.flowCanvas.current.props.height;
		
		let pcA  =     new Node({ x: pl, y: h - pb },                        60, 60, {l: 10, t: 10, r: 10, b: 10}, computerImage, 0.5);
		let pcB  =     new Node({ x: w/2, y: h - pb },                       60, 60, {l: 10, t: 10, r: 10, b: 10}, computerImage, 0.5);
		let pcC  =     new Node({ x: w-pr, y: h - pb },                      60, 60, {l: 10, t: 10, r: 10, b: 10}, computerImage, 0.5);
		let internet = new Node({ x: w/2, y: pt },                           60, 60, {l: 10, t: 10, r: 10, b: 10}, internetImage, 0.5);
		let router =   new Node({ x: w/2, y: internet.pos.y + 120 },         60, 60, {l: 10, t: 10, r: 10, b: 10}, routerImage,   0.5);
		let nSwitch =  new Node({ x: w/2, y: (pcB.pos.y + router.pos.y)/2 }, 60, 30, {l: 10, t: 10, r: 10, b: 10}, switchImage,   0.5);

		let pcALabel =    new Label({x: 0, y: 0},   "Computador A", "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		let pcBLabel =    new Label({x: 0, y: 0},   "Computador B", "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		let pcCLabel =    new Label({x: 0, y: 0},   "Computador C", "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		let routerLabel = new Label({x: 0, y: 0},   "Roteador",     "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		let internetLabel = new Label({x: 0, y: 0}, "Internet",     "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);

		pcALabel.pos =      this.flowCanvas.current.getAlignedPoint(pcA, pcALabel, "bottom", "center");
		pcBLabel.pos =      this.flowCanvas.current.getAlignedPoint(pcB, pcBLabel, "bottom", "center");
		pcCLabel.pos =      this.flowCanvas.current.getAlignedPoint(pcC, pcCLabel, "bottom", "center");
		routerLabel.pos =   this.flowCanvas.current.getAlignedPoint(router, routerLabel, "center", "right");
		internetLabel.pos = this.flowCanvas.current.getAlignedPoint(internet, internetLabel, "center", "right");

		let pcASwitchLine = new Line(pcA, nSwitch, 1, "#aaaaaa", 10);
		let pcBSwitchLine = new Line(pcB, nSwitch, 1, "#aaaaaa", 10);
		let pcCSwitchLine = new Line(pcC, nSwitch, 1, "#aaaaaa", 10);
		let routerSwitchLine = new Line(router, nSwitch, 1, "#aaaaaa", 10);
		let routerInternetLine = new Line(router, internet, 1, "#aaaaaa", 10);

		this.flowCanvas.current.clearDrawables();

		this.flowCanvas.current.addDrawable(pcA);
		this.flowCanvas.current.addDrawable(pcB);
		this.flowCanvas.current.addDrawable(pcC);
		this.flowCanvas.current.addDrawable(pcALabel);
		this.flowCanvas.current.addDrawable(pcBLabel);
		this.flowCanvas.current.addDrawable(pcCLabel);
		this.flowCanvas.current.addDrawable(nSwitch);
		this.flowCanvas.current.addDrawable(router);
		this.flowCanvas.current.addDrawable(internet);
		this.flowCanvas.current.addDrawable(routerLabel);
		this.flowCanvas.current.addDrawable(internetLabel);
		this.flowCanvas.current.addDrawable(pcASwitchLine);
		this.flowCanvas.current.addDrawable(pcBSwitchLine);
		this.flowCanvas.current.addDrawable(pcCSwitchLine);
		this.flowCanvas.current.addDrawable(routerSwitchLine);
		this.flowCanvas.current.addDrawable(routerInternetLine);
		
		this.flowCanvas.current.draw();

	}

	constructor(props: any) {
		super(props);
		this.flowCanvas = React.createRef();
	}

	componentDidMount() {
		this.resetCanvas();
		computerImage.onload = this.flowCanvas.current.draw;
		routerImage.onload = this.flowCanvas.current.draw;
		switchImage.onload = this.flowCanvas.current.draw;
	}
	
	render() {
		return <FlowCanvas ref={this.flowCanvas} width={750} height={600} fixedDeltaTime={1000 / 60}/>;
	}
}