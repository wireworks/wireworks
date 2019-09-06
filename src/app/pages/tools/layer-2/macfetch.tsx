// MACFetch
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-09-02)

import React, { Component, RefObject } from "react";
import FlowCanvas, { Node, Label, NodeConnection, Line } from "../../../components/FlowCanvas";
import { Address, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE } from "../../../wireworks/networking/layers/layer-3/address";
import ErrorBox from "../../../components/ErrorBox";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";
import MAC, { ERROR_MAC_ADDRESS_PARSE } from "../../../wireworks/networking/layers/layer-2/mac";

// Images used in the canvas.

const computerImage = new Image();
const routerImage = new Image();
const internetImage = new Image();
const switchImage = new Image();

import("src/images/layers/2/computer.png").then(res => computerImage.src = res.default);
import("src/images/layers/2/router.png").then(res => routerImage.src = res.default);
import("src/images/layers/2/internet.png").then(res => internetImage.src = res.default);
import("src/images/layers/2/switch.png").then(res => switchImage.src = res.default);

// Simulation speed constants.

type Speed = "veryslow" | "slow" | "normal" | "fast" | "veryfast";

const speedValues = {
	veryslow: 10,
	slow: 25,
	normal: 50,
	fast: 200,
	veryfast: 600
};

// Wire colors.

const grayWire = "#aaaaaa";
const greenWire = "#a9cc78";
const yellowWire = "#e5c16e";

/**
 * Helper data structure used to refer to MACFetch's computers and other network devices.
 */
type MACMachine = {
	ip: Address,
	mac: MAC,
	node: Node,
	connections: MACMachine[],
	isSwitch: boolean
};

// +==============================================+

interface MacFetchProps {
	ipFetch: boolean
}

class MacFetch extends Component<MacFetchProps> {

	/** The reference to the target IP input. */
	private txtTarget: RefObject<HTMLInputElement>;
	/** The reference to the origin select. */
	private selectOrigin: RefObject<HTMLSelectElement>;
	/** The reference to the speed select. */
	private selectSpeed: RefObject<HTMLSelectElement>;
	/** The reference to the MacFetchCanvas. */
	private macCanvas: RefObject<MacFetchCanvas>;
	
	state = {
		errorMessage: null as string,
		origin: undefined as "A"|"B"|"C",
		target: undefined as Address|MAC,
		speed: undefined as Speed
	}

	/**
	 * Runs the simulation.
	 */
	public run = () => {

		let errStr: string = null;
		this.setState({errorMessage: null});
	
		try {
			
			let target: Address|MAC;

			if (this.props.ipFetch) {
				target = new MAC(this.txtTarget.current.value);
			}
			else {
				target = new Address(this.txtTarget.current.value, undefined, true);
				
				if (target.isNetworkAddress()) {
					errStr = "Este é um endereço de rede. Escolha outro endereço.";
					throw Error;
				}
			}

			this.setState(
				{
					origin: this.selectOrigin.current.value,
					target: target,
					speed: this.selectSpeed.current.value
				},
				this.macCanvas.current.run
			);
		
		} catch (error) {
			
			if(!errStr){
				
				switch (error.name) {
					case ERROR_MAC_ADDRESS_PARSE:
						errStr = "O MAC do destino deve possuir o formato 00-00-00-00-00-00.";
						break;
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

	constructor(props: any) {
		super(props);
		this.txtTarget = React.createRef();
		this.selectSpeed = React.createRef();
		this.selectOrigin = React.createRef();
		this.macCanvas = React.createRef();
	}
	
	render() {
		return (
			<main>
				<div className="hbox align-end mb-3">
					<div>
						<label htmlFor="origin">Host de Origem</label>
						<div>
							<select id="origin" ref={this.selectOrigin} defaultValue="A">
								<option value="A">Computador A</option>
								<option value="B">Computador B</option>
								<option value="C">Computador C</option>
							</select>
						</div>
					</div>
					<div>
						<label htmlFor="target_address">{this.props.ipFetch? "MAC" : "IP"} de Destino</label>
						<div>
							<input type="text" id="target_address" ref={this.txtTarget} onKeyDown={(ev) => { if (ev.key === "Enter") this.run() }} placeholder={this.props.ipFetch ? "00-00-00-00-00-00" : "0.0.0.1/0"}/>
						</div>
					</div>
					<div>
						<label htmlFor="speed">Velocidade</label>
						<div>
							<select name="speed" id="speed" ref={this.selectSpeed} defaultValue="normal">
								<option value="veryslow">Muito Lento</option>
								<option value="slow">Lento</option>
								<option value="normal">Normal</option>
								<option value="fast">Rápido</option>
								<option value="veryfast">Muito Rápido</option>
							</select>
							<button onClick={this.run}>Visualizar</button>
						</div>
					</div>
				</div>
				<ErrorBox errorMessage={this.state.errorMessage}/>
				<MacFetchCanvas ref={this.macCanvas} origin={this.state.origin} target={this.state.target} speed={this.state.speed} ipFetch={this.props.ipFetch}/>
			</main>
		);
	}

}

export default MacFetch;

interface MacFetchCanvasProps {
	origin: "A"|"B"|"C",
	target: Address|MAC,
	speed: Speed,
	ipFetch: boolean
}

/**
 * The component representing MACFetch's FlowCanvas.
 */
class MacFetchCanvas extends Component<MacFetchCanvasProps> {

	/** The reference to the FlowCanvas. */
	private flowCanvas: RefObject<FlowCanvas>;
	
	// MACFetch's network devices and computers.

	private mSwitch: MACMachine = {ip: undefined, mac: undefined, connections: [], isSwitch: true, node: undefined};
	private pcA: MACMachine =     {ip: new Address("10.10.0.2/24"), mac: new MAC("00-00-00-AA-AA-AA"), connections: [this.mSwitch], isSwitch: false, node: undefined};
	private pcB: MACMachine =     {ip: new Address("10.10.0.3/24"), mac: new MAC("00-00-00-BB-BB-BB"), connections: [this.mSwitch], isSwitch: false, node: undefined};
	private pcC: MACMachine =     {ip: new Address("10.10.0.4/24"), mac: new MAC("00-00-00-CC-CC-CC"), connections: [this.mSwitch], isSwitch: false, node: undefined};
	private router: MACMachine =  {ip: new Address("10.10.0.1/24"), mac: new MAC("00-00-00-F0-F0-F0"), connections: [this.mSwitch], isSwitch: false, node: undefined};
	
	/** A list of fixed lines that shouldn't be removed upon simulation resetting. */
	private fixedLines: Line[] = [];

	/** An object mapping machines to simplified names. */
	private origins = {
		A: this.pcA,
		B: this.pcB,
		C: this.pcC
	}

	/**
	 * Runs the simulation.
	 */
	public run = () => {

		const speed = speedValues[this.props.speed];
		const fCanvas = this.flowCanvas.current;
		const router = this.router;
		const ipFetch = this.props.ipFetch;

		fCanvas.stopLineAnimations();

		const drawables = fCanvas.getDrawables();
		let drawIndex = drawables.length;

		while(drawIndex--) {
			if(drawables[drawIndex] instanceof Line && this.fixedLines.indexOf(drawables[drawIndex] as Line) < 0) {
				fCanvas.removeDrawable(drawables[drawIndex]);
			}
		}

		let lookingFor = this.props.target;

		const response = function(path: MACMachine[]) {
			
			let targetStr = (ipFetch? path[path.length-1].ip : path[path.length-1].mac).toString();
			let connections: NodeConnection[] = [];

			for (let i = path.length-1; i >= 1; i--) {
				const machine = path[i];

				connections.push({
					from: machine.node,
					to: path[i-1].node,
					strokeStyle: greenWire,
					lineWidth: 5,
					speed: speed,
					labelText: targetStr
				});
				
			}

			fCanvas.connectMultipleNodes(connections);

		}

		const nextHop = function (previous: MACMachine, from: MACMachine, path: MACMachine[]) {
		
			path.push(from);

			for (let i = 0; i < from.connections.length; i++) {

				const to = from.connections[i];
	
				if (to != previous) {
					let line = fCanvas.connectNodes(
						from.node,
						to.node,
						yellowWire,
						5,
						speed,
						(ipFetch ? "IP de " : "MAC de ")+lookingFor.toString()+"?",
						() => { 
							fCanvas.removeDrawable(line);
							
							if (to.connections.length > 1)
								nextHop(from, to, path);
							else {
								if (!to.isSwitch) {

									let comparison: boolean;

									if (ipFetch) comparison = to.mac.compare(lookingFor as MAC);
									else comparison = to.ip.compare(lookingFor as Address) || ((to === router) && !to.ip.getNetworkAddress().compare((lookingFor as Address).getNetworkAddress()));

									if (comparison) {
										path.push(to);
										response(path);
									}
								}
							}

						}
					);
				}
				
			}

		}

		nextHop(undefined, this.origins[this.props.origin], []);

	}

	/**
	 * Resets the canvas.
	 */
	resetCanvas = () => {

		let pl = 100; // padding
		let pr = 100;
		let pt = 50;
		let pb = 90;

		const fCanvas = this.flowCanvas.current;

		let w = fCanvas.props.width;
		let h = fCanvas.props.height;
		
		let internetNode =  new Node({ x: pr,  y: pt },      60, 60, {l: 10, t: 10, r: 10, b: 10}, internetImage, 0.5);
		this.router.node =  new Node({ x: w/2, y: pt },		 60, 60, {l: 10, t: 10, r: 10, b: 10}, routerImage,   0.5);
		this.pcB.node  =    new Node({ x: w/2, y: h - pb },  60, 60, {l: 10, t: 10, r: 10, b: 10}, computerImage, 0.5);
		this.mSwitch.node = new Node({ x: w/2,  y: (this.pcB.node.pos.y + this.router.node.pos.y)/2 },  60, 30, {l: 10, t: 10, r: 10, b: 10}, switchImage,   0.5);
		this.pcA.node  =    new Node({ x: pl,   y: (this.mSwitch.node.pos.y + this.pcB.node.pos.y)/2 }, 60, 60, {l: 10, t: 10, r: 10, b: 10}, computerImage, 0.5);
		this.pcC.node  =    new Node({ x: w-pr, y: (this.mSwitch.node.pos.y + this.pcB.node.pos.y)/2 }, 60, 60, {l: 10, t: 10, r: 10, b: 10}, computerImage, 0.5);

		let internetLabel = new Label({x: 0, y: 0}, "Internet",     "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 12);
		internetLabel.pos = fCanvas.getAlignedPoint(internetNode, internetLabel, "bottom", "center");

		let pcALabel =    new Label({x: 0, y: 0}, "Computador A\n" + this.pcA.ip.toString() + "\n" + this.pcA.mac.toString(), "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 12, "center");
		let pcBLabel =    new Label({x: 0, y: 0}, "Computador B\n" + this.pcB.ip.toString() + "\n" + this.pcB.mac.toString(), "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 12, "center");
		let pcCLabel =    new Label({x: 0, y: 0}, "Computador C\n" + this.pcC.ip.toString() + "\n" + this.pcC.mac.toString(), "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 12, "center");
		let routerLabel = new Label({x: 0, y: 0}, "Roteador\n" + this.router.ip.toString() + "\n" + this.router.mac.toString(),     "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 12);

		pcALabel.pos =    fCanvas.getAlignedPoint(this.pcA.node,    pcALabel,    "bottom", "center");
		pcBLabel.pos =    fCanvas.getAlignedPoint(this.pcB.node,    pcBLabel,    "bottom", "center");
		pcCLabel.pos =    fCanvas.getAlignedPoint(this.pcC.node,    pcCLabel,    "bottom", "center");
		routerLabel.pos = fCanvas.getAlignedPoint(this.router.node, routerLabel, "center", "right");

		this.fixedLines = [
			new Line(this.pcA.node, this.mSwitch.node, 1, grayWire, 10),
			new Line(this.pcB.node, this.mSwitch.node, 1, grayWire, 10),
			new Line(this.pcC.node, this.mSwitch.node, 1, grayWire, 10),
			new Line(this.router.node, this.mSwitch.node, 1, grayWire, 10),
			new Line(this.router.node, internetNode, 1, grayWire, 10)
		];

		fCanvas.clearDrawables();

		fCanvas.addDrawable(this.pcA.node);
		fCanvas.addDrawable(this.pcB.node);
		fCanvas.addDrawable(this.pcC.node);
		fCanvas.addDrawable(this.mSwitch.node);
		fCanvas.addDrawable(this.router.node);
		fCanvas.addDrawable(internetNode);
		fCanvas.addDrawable(pcALabel);
		fCanvas.addDrawable(pcBLabel);
		fCanvas.addDrawable(pcCLabel);
		fCanvas.addDrawable(routerLabel);
		fCanvas.addDrawable(internetLabel);

		for (let i = 0; i < this.fixedLines.length; i++) {
			fCanvas.addDrawable(this.fixedLines[i]);
		}

		fCanvas.draw();

	}

	constructor(props: any) {
		super(props);
		this.flowCanvas = React.createRef();
		this.mSwitch.connections = [this.pcA, this.pcB, this.pcC, this.router];
	}

	componentDidMount() {
		this.resetCanvas();
		computerImage.onload = this.flowCanvas.current.draw;
		routerImage.onload = this.flowCanvas.current.draw;
		switchImage.onload = this.flowCanvas.current.draw;
	}
	
	render() {
		return <FlowCanvas ref={this.flowCanvas} width={750} height={560} fixedDeltaTime={1000 / 60}/>;
	}
}