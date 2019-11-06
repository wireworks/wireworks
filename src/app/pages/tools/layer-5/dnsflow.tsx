// DNSFlow
// +=========================+
// Author: Henrique Colini
// Version: 2.0 (2019-08-30)

import React, { Component, RefObject } from "react";

import FlowCanvas, { Node, Label, NodeConnection, Line } from "../../../components/FlowCanvas";
import ErrorBox from "../../../components/ErrorBox";
import { Domain, ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE, ERROR_SMALL_DOMAIN } from "../../../wireworks/networking/layers/layer-5/domain";

// Images used in the canvas.

const serverImage = new Image();
const clientImage = new Image();

import("src/images/layers/5/client.png").then(res => clientImage.src = res.default);
import("src/images/layers/5/server.png").then(res => serverImage.src = res.default);

// Wire colors.

const greenWire = "#a9cc78";
const redWire = "#db938a";
const blueWire = "#9ac9ed";
const yellowWire = "#e5c16e";

// Simulation speed constants.

const verySlowSpeed = 10;
const slowSpeed = 25;
const normalSpeed = 100;
const fastSpeed = 400;
const veryFastSpeed = 600;

type Speed = "veryslow" | "slow" | "normal" | "fast" | "veryfast";

// Constants representing the mode of a DNS server.

const ITERATIVE = "iterative";
const RECURSIVE = "recursive";

type ServerMode = "iterative" | "recursive";

/**
 * A data structure that represents servers and hosts.
 */
type DNSMachine = {
	name: string,
	node: Node,
	label: Label,
	mode: ServerMode
};

// +==============================================+

class DnsFlow extends Component {

	/** The reference to the domain input. */
	private txtDomain: RefObject<HTMLInputElement>;
	/** The reference to the DnsFlowCanvas. */
	private dnsCanvas: RefObject<DnsFlowCanvas>;
	/** The reference to the speed select. */
	private selectSpeed: RefObject<HTMLSelectElement>;
	/** The reference to the Local server mode select. */
	private selectLocalMode: RefObject<HTMLSelectElement>;
	/** The reference to the Root server mode select. */
	private selectRootMode: RefObject<HTMLSelectElement>;
	/** The reference to the TLD server mode select. */
	private selectTldMode: RefObject<HTMLSelectElement>;
	/** The reference to the Intermediary server mode select. */
	private selectInterMode: RefObject<HTMLSelectElement>;

	state = {
		errorMessage: null as string,
		domain: undefined as Domain,
		speed: "normal" as Speed,
		localMode: "recursive" as ServerMode,
		rootMode: "iterative" as ServerMode,
		tldMode: "iterative" as ServerMode,
		interMode: "iterative" as ServerMode
	}

	/**
	 * Runs the simulation.
	 */
	public run = () => {

		this.setState({errorMessage: null});
		let errStr: string = undefined;
		
		try {
			
			let fullName = this.txtDomain.current.value;
			
			if (fullName === "localhost") {
				errStr = "Você não pode usar esse nome.";
				throw Error();
			} else {

				let tmpDomain = Domain.extractDomain(new Domain(".", undefined), fullName);	
				
				this.setState(
					{
						domain: tmpDomain,
						speed: this.selectSpeed.current.value,
						localMode: this.selectLocalMode.current.value,
						rootMode: this.selectRootMode.current.value,
						tldMode: this.selectTldMode.current.value,
						interMode: this.selectInterMode.current.value,
					},
					this.dnsCanvas.current.run
				);
				
			}

		} catch (error) {

			if (!errStr) {

				switch (error.name) {
					case ERROR_INVALID_LABEL:
						errStr = "Esse domínio possui um nome inválido.";
						break;
					case ERROR_FULL_NAME_RANGE:
						errStr = "Esse domínio possui um nome grande demais.";
						break;
					case ERROR_SMALL_DOMAIN:
						errStr = "Você deve inserir um domínio com mais partes.";
						break;
					default:
						errStr = "Erro desconhecido (" + error.name + ")."
						console.error(error);
						break;
				}

			}

			this.setState({errorMessage: "Entrada inválida. " + errStr});

		}
	}	

	constructor(props: any) {
		super(props);
		this.txtDomain = React.createRef();
		this.dnsCanvas = React.createRef();
		this.selectSpeed = React.createRef();
		this.selectLocalMode = React.createRef();
		this.selectRootMode = React.createRef();
		this.selectTldMode = React.createRef();
		this.selectInterMode = React.createRef();
	}	

	render () {
		return (
			<main>
				<div className="hbox">
					<div>
						<label htmlFor="domain">Domínio</label>
						<h1>
							<input type="text" name="domain" ref={this.txtDomain} onKeyDown={(ev) => {if(ev.key==="Enter")this.run()}} placeholder="www.exemplo.com.br"/>
						</h1>
					</div>
					<div>
						<label htmlFor="speed">Velocidade</label>
						<h1>
							<select name="speed" id="speed" ref={this.selectSpeed} defaultValue="normal">
								<option value="veryslow">Muito Lento</option>
								<option value="slow">Lento</option>
								<option value="normal">Normal</option>
								<option value="fast">Rápido</option>
								<option value="veryfast">Muito Rápido</option>
							</select>
							<button onClick={this.run}>Visualizar</button>
						</h1>
					</div>
				</div>
				
				<ErrorBox errorMessage={this.state.errorMessage}/>

				<DnsFlowCanvas ref={this.dnsCanvas} domain={this.state.domain} speed={this.state.speed} localMode={this.state.localMode} rootMode={this.state.rootMode} tldMode={this.state.tldMode} interMode={this.state.interMode} />

				<div className="hbox">

					<div>
						<label>Local</label>
						<div>
							<select id="local_mode" ref={this.selectLocalMode} defaultValue="recursive">
								<option value="iterative">Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</div>
					</div>
					<div>
						<label>Root</label>
						<div>
							<select id="root_mode" ref={this.selectRootMode} defaultValue="iterative">
								<option value="iterative">Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</div>
					</div>
					<div>
						<label>TLD</label>
						<div>
							<select id="tld_mode" ref={this.selectTldMode} defaultValue="iterative">
								<option value="iterative">Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</div>
					</div>
					<div>
						<label>Intermediários</label>
						<div>
							<select id="inter_mode" ref={this.selectInterMode} defaultValue="iterative">
								<option value="iterative">Iterativos</option>
								<option value="recursive">Recursivos</option>
							</select>
						</div>
					</div>

				</div>

			</main>
		);
	}
}

export default DnsFlow;

interface DnsFlowCanvasProps {
	domain: Domain,
	speed: Speed,
	localMode: ServerMode,
	rootMode: ServerMode,
	tldMode: ServerMode,
	interMode: ServerMode
}

/**
 * A component representing the DNSFlow FlowCanvas.
 */
class DnsFlowCanvas extends Component<DnsFlowCanvasProps> {

	/** The reference to the FlowCanvas. */
	private flowCanvas: RefObject<FlowCanvas>;
	/** The origin client. */
	private client: DNSMachine;
	/** The local server. */
	private local: DNSMachine;
	/** The root server. */
	private root: DNSMachine;
	/** The TLD server. */
	private tld: DNSMachine;
	/** The intermediary server. */
	private inter: DNSMachine;
	/** The administrative server. */
	private admin: DNSMachine;
	/** The destination client. */
	private dest: DNSMachine;
	/** The configurations for the line maker. */
	private makerConfigs = {
		width: 0,
		speed: 0
	}

	/**
	 * Runs the simulation.
	 */
	public run = () => {

		const drawables = this.flowCanvas.current.getDrawables();
		let drawIndex = drawables.length;

		while(drawIndex--) {
			if(drawables[drawIndex] instanceof Line) {
				this.flowCanvas.current.removeDrawable(drawables[drawIndex]);
			}
		}

		this.flowCanvas.current.stopLineAnimations();

		this.makerConfigs.width = 10;

		switch (this.props.speed) {
			case "veryslow": this.makerConfigs.speed = verySlowSpeed; break;
			case "slow": this.makerConfigs.speed = slowSpeed; break;
			case "normal": this.makerConfigs.speed = normalSpeed; break;
			case "fast": this.makerConfigs.speed = fastSpeed; break;
			case "veryfast": this.makerConfigs.speed = veryFastSpeed; break;
		}

		let cons = this.calculateConnections(this.props.domain);
		
		this.flowCanvas.current.connectMultipleNodes(cons.connections, cons.success ? this.onSuccess : this.onFailure);

	}

	/**
	 * What to do when a DNS query ends in success. 
	 */
	public onSuccess = () => {
		this.flowCanvas.current.connectNodes(this.client.node, this.dest.node, blueWire, 10, fastSpeed, undefined);
		this.flowCanvas.current.connectNodes(this.dest.node, this.client.node, blueWire, 10, fastSpeed, undefined);
	}

	/**
	 * What to do when a DNS query ends in failure.
	 */
	public onFailure = () => {}

	/**
	 * Calculates the connections between servers needed in a DNS query. Returns a list of said connections and whether the query was successful.
	 * @param domain The host domain.
	 */
	public calculateConnections = (domain: Domain): { connections: NodeConnection[], success: boolean} => {
		
		
		let parts = domain.getDomainParts();
		let connections: NodeConnection[] = [
			this.makeConnection(this.client, this.local, "request", parts.full + "?")
		];
		let success = false;

		// LOCAL returns "."
		if (this.local.mode === ITERATIVE) {
			connections.push(this.makeConnection(this.local, this.client, "partial", "."));
		}
		// LOCAL returns "www.example.com.br"
		else if (this.local.mode === RECURSIVE) {

			connections.push(this.makeConnection(this.local, this.root, "request", parts.full + "?"));

			// ROOT returns "br"
			if (this.root.mode === ITERATIVE) {

				connections.push(this.makeConnection(this.root, this.local, "partial", parts.tld));
				connections.push(this.makeConnection(this.local, this.tld, "request", parts.full + "?"));

				// TLD returns "com.br"
				if (this.tld.mode === ITERATIVE) {			

					if (parts.inter) {

						// INTER returns "example.com.br"
						if (this.inter.mode === ITERATIVE) {
							connections.push(...[
								this.makeConnection(this.tld, this.local, "partial", parts.inter + "." + parts.tld),
								this.makeConnection(this.local, this.inter, "request", parts.full + "?"),
								this.makeConnection(this.inter, this.local, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
								this.makeConnection(this.local, this.admin, "request", parts.full + "?"),
								this.makeConnection(this.admin, this.local, "full", parts.full)
							]);
						}
						// INTER returns "www.example.com.br"
						else if (this.inter.mode === RECURSIVE) {
							connections.push(...[
								this.makeConnection(this.tld, this.local, "partial", parts.inter + "." + parts.tld),
								this.makeConnection(this.local, this.inter, "request", parts.full + "?"),
								this.makeConnection(this.inter, this.admin, "request", parts.full + "?"),
								this.makeConnection(this.admin, this.inter, "full", parts.full),
								this.makeConnection(this.inter, this.local, "full", parts.full)
							]);
						}
					}
					else {
						connections.push(...[
							this.makeConnection(this.tld, this.local, "partial", parts.admin + "." + parts.tld),
							this.makeConnection(this.local, this.admin, "request", parts.full + "?"),
							this.makeConnection(this.admin, this.local, "full", parts.full)
						]);
					}

				}
				// TLD returns "www.example.com.br"
				else if (this.tld.mode === RECURSIVE) {

					if (parts.inter) {					
						// INTER returns "example.com.br"
						// ADMIN returns "www.example.com.br"
						if (this.inter.mode === ITERATIVE) {
							connections.push(...[
								this.makeConnection(this.tld, this.inter, "request", parts.full + "?"),
								this.makeConnection(this.inter, this.tld, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
								this.makeConnection(this.tld, this.admin, "request", parts.full + "?"),
								this.makeConnection(this.admin, this.tld, "full", parts.full)
							]);
						}
						// INTER returns "www.example.com.br"
						// ADMIN returns "www.example.com.br"
						else if (this.inter.mode === RECURSIVE) {
							connections.push(...[
								this.makeConnection(this.tld, this.inter, "request", parts.full + "?"),
								this.makeConnection(this.inter, this.admin, "request", parts.full + "?"),
								this.makeConnection(this.admin, this.inter, "full", parts.full),
								this.makeConnection(this.inter, this.tld, "full", parts.full)
							]);
						}
					}
					// ADMIN returns "www.example.com.br"
					else {
						connections.push(...[
							this.makeConnection(this.tld, this.admin, "request", parts.full + "?"),
							this.makeConnection(this.admin, this.tld, "full", parts.full)
						]);
					}

					connections.push(this.makeConnection(this.tld, this.local, "full", parts.full));

				}

			}
			// ROOT returns "www.example.com.br"
			else if (this.root.mode === RECURSIVE) {

				connections.push(this.makeConnection(this.root, this.tld, "request", parts.full + "?"));

				// TLD returns "com.br"
				if (this.tld.mode === ITERATIVE) {
					
					if (parts.inter) {

						connections.push(this.makeConnection(this.tld, this.root, "partial", parts.inter + "." + parts.tld));

						// INTER returns "example.com.br"
						// ADMIN returns "www.example.com.br"
						if (this.inter.mode === ITERATIVE) {
							connections.push(...[
								this.makeConnection(this.root, this.inter, "request", parts.full + "?"),
								this.makeConnection(this.inter, this.root, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
								this.makeConnection(this.root, this.admin, "request", parts.full + "?"),
								this.makeConnection(this.admin, this.root, "full", parts.full)
							]);
						}
						// INTER returns "www.example.com.br"
						// ADMIN returns "www.example.com.br"
						else if (this.inter.mode === RECURSIVE) {
							connections.push(...[
								this.makeConnection(this.root, this.inter, "request", parts.full + "?"),
								this.makeConnection(this.inter, this.admin, "request", parts.full + "?"),
								this.makeConnection(this.admin, this.inter, "full", parts.full),
								this.makeConnection(this.inter, this.root, "full", parts.full)
							]);
						}
					}
					else {
						// ADMIN returns "www.example.com.br"
						connections.push(...[
							this.makeConnection(this.tld, this.root, "partial", parts.admin + "." + parts.tld),
							this.makeConnection(this.root, this.admin, "request", parts.full + "?"),
							this.makeConnection(this.admin, this.root, "full", parts.full)
						]);
					}

				}
				// TLD returns "www.example.com.br"
				else if (this.tld.mode === RECURSIVE) {

					if (parts.inter) {
						// INTER returns "example.com.br"
						// ADMIN returns "www.example.com.br"
						if (this.inter.mode === ITERATIVE) {
							connections.push(...[
								this.makeConnection(this.tld, this.inter, "request", parts.full + "?"),
								this.makeConnection(this.inter, this.tld, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
								this.makeConnection(this.tld, this.admin, "request", parts.full + "?"),
								this.makeConnection(this.admin, this.tld, "full", parts.full)
							]);
						}
						// INTER returns "www.example.com.br"
						// ADMIN returns "www.example.com.br"
						else if (this.inter.mode === RECURSIVE) {
							connections.push(...[
								this.makeConnection(this.tld, this.inter, "request", parts.full + "?"),
								this.makeConnection(this.inter, this.admin, "request", parts.full + "?"),
								this.makeConnection(this.admin, this.inter, "full", parts.full),
								this.makeConnection(this.inter, this.tld, "full", parts.full)
							]);
						}
					}
					else {
						// ADMIN returns "www.example.com.br"
						connections.push(...[
							this.makeConnection(this.tld, this.admin, "request", parts.full + "?"),
							this.makeConnection(this.admin, this.tld, "full", parts.full)
						]);
					}

					connections.push(this.makeConnection(this.tld, this.root, "full", parts.full));

				}

				connections.push(this.makeConnection(this.root, this.local, "full", parts.full));

			}

			connections.push(this.makeConnection(this.local, this.client, "full", parts.full));
			success = true;
		}

		return { connections: connections, success: success };

	}

	/**
	 * Creates NodeConnections.
	 * @param from What machine to start from.
	 * @param to What machine to go to.
	 * @param kind What kind of connection to create. Must be either "request", "partial" (responses) or "full" (responses).
	 * @param msg What message to carry in the end of the line.
	 */
	public makeConnection = (from: DNSMachine, to: DNSMachine, kind: "request" | "partial" | "full", msg: string): NodeConnection => {
		let style: string;
		switch (kind) {
			case ("request"): style = yellowWire; break;
			case ("partial"): style = redWire; break;
			case ("full"): style = greenWire; break;
		}
		return { from: from.node, to: to.node, strokeStyle: style, lineWidth: this.makerConfigs.width, speed: this.makerConfigs.speed, labelText: msg };
	}

	/**
	 * Deletes all drawables, sets up all Nodes and their Labels.
	 */
	public resetCanvas = () => {

		let pl = 80; // padding
		let pr = 80;
		let pt = 70;
		let pb = 70;

		let w = this.flowCanvas.current.props.width;
		let h = this.flowCanvas.current.props.height;
		
		this.client.node = new Node({ x: pl, y: h - pb },           60, 60, {l: 10, t: 10, r: 10, b: 10}, clientImage);
		this.local.node  = new Node({ x: pl, y: h - pb - 180 },     60, 60, {l: 10, t: 10, r: 10, b: 40}, serverImage);
		this.root.node   = new Node({ x: pl, y: pt + 80 },          60, 60, {l: 10, t: 10, r: 10, b: 10}, serverImage);
		this.inter.node  = new Node({ x: w - pr, y: pt + 80 },      60, 60, {l: 10, t: 10, r: 10, b: 10}, serverImage);
		this.tld.node    = new Node({ x: (w+pl-pr)/2, y: pt },      60, 60, {l: 10, t: 10, r: 10, b: 10}, serverImage);
		this.admin.node  = new Node({ x: w - pr, y: h - pb - 180 }, 60, 60, {l: 10, t: 10, r: 10, b: 10}, serverImage);
		this.dest.node   = new Node({ x: w - pr, y: h - pb },       60, 60, {l: 10, t: 10, r: 10, b: 10}, clientImage);

		this.client.label = new Label({x: 0, y: 0}, this.client.name, "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		this.local.label  = new Label({x: 0, y: 0}, this.local.name,  "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		this.root.label   = new Label({x: 0, y: 0}, this.root.name,   "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		this.tld.label    = new Label({x: 0, y: 0}, this.tld.name,    "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		this.inter.label  = new Label({x: 0, y: 0}, this.inter.name,  "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		this.admin.label  = new Label({x: 0, y: 0}, this.admin.name,  "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		this.dest.label   = new Label({x: 0, y: 0}, this.dest.name,   "#505050", "transparent", 6, 0, "14px Work Sans, Montserrat, sans-serif", 14);
		
		this.client.label.pos = this.flowCanvas.current.getAlignedPoint(this.client.node, this.client.label, "bottom", "center");
		this.local.label.pos  = this.flowCanvas.current.getAlignedPoint(this.local.node, this.local.label, "bottom", "center");
		this.root.label.pos   = this.flowCanvas.current.getAlignedPoint(this.root.node, this.root.label, "top", "center");
		this.tld.label.pos    = this.flowCanvas.current.getAlignedPoint(this.tld.node, this.tld.label, "top", "center");
		this.inter.label.pos  = this.flowCanvas.current.getAlignedPoint(this.inter.node, this.inter.label, "top", "center");
		this.admin.label.pos  = this.flowCanvas.current.getAlignedPoint(this.admin.node, this.admin.label, "bottom", "center");
		this.dest.label.pos   = this.flowCanvas.current.getAlignedPoint(this.dest.node, this.dest.label, "bottom", "center");

		this.flowCanvas.current.clearDrawables();

		this.flowCanvas.current.addDrawable(this.client.node);
		this.flowCanvas.current.addDrawable(this.local.node);
		this.flowCanvas.current.addDrawable(this.root.node);
		this.flowCanvas.current.addDrawable(this.inter.node);
		this.flowCanvas.current.addDrawable(this.admin.node);
		this.flowCanvas.current.addDrawable(this.dest.node);
		this.flowCanvas.current.addDrawable(this.tld.node);

		this.flowCanvas.current.addDrawable(this.client.label);
		this.flowCanvas.current.addDrawable(this.local.label);
		this.flowCanvas.current.addDrawable(this.root.label);
		this.flowCanvas.current.addDrawable(this.inter.label);
		this.flowCanvas.current.addDrawable(this.admin.label);
		this.flowCanvas.current.addDrawable(this.dest.label);
		this.flowCanvas.current.addDrawable(this.tld.label);

		this.flowCanvas.current.draw();

	}

	componentWillReceiveProps(props: DnsFlowCanvasProps) {		
		this.local.mode = props.localMode;
		this.root.mode = props.rootMode;
		this.tld.mode = props.tldMode;
		this.inter.mode = props.interMode;
	}



	componentDidMount() {		
		
		this.client = { name: "Host Cliente", node: undefined, label: undefined, mode: undefined };
		this.local = { name: "Local", node: undefined, label: undefined, mode: undefined };
		this.root = { name: "Root", node: undefined, label: undefined, mode: undefined };
		this.tld = { name: "TLD", node: undefined, label: undefined, mode: undefined };
		this.inter = { name: "Intermediários", node: undefined, label: undefined, mode: undefined };
		this.admin = { name: "Autoritativo", node: undefined, label: undefined, mode: undefined };
		this.dest = { name: "Host Destino", node: undefined, label: undefined, mode: undefined };

		this.resetCanvas();

		serverImage.onload = this.flowCanvas.current.draw;
		clientImage.onload = this.flowCanvas.current.draw;
	}

	constructor(props: DnsFlowCanvasProps) {
		super(props);
		this.flowCanvas = React.createRef();
	}

	render() {
		return <FlowCanvas ref={this.flowCanvas} width={750} height={560} fixedDeltaTime={1000 / 60}/>;
	}

}