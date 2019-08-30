// DNSFlow
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-04-14)

import React, { Component, RefObject } from "react";

import "src/sass/pages/dnsflow.scss"
import { id } from "../../../wireworks/utils/dom";
import FlowCanvas, { FlowCanvasProps, Node, Label, NodeConnection, Line } from "../../../components/FlowCanvas";
import ErrorBox from "../../../components/ErrorBox";
import { Domain, ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE, ERROR_SMALL_DOMAIN } from "../../../wireworks/networking/layers/layer-5/domain";
import { clamp } from "../../../wireworks/utils/math";

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

// Constants representing the mode of a DNS server.

const ITERATIVE = "iterative";
const RECURSIVE = "recursive";

type Speed = "veryslow" | "slow" | "normal" | "fast" | "veryfast";
type ServerMode = "iterative" | "recursive";

/**
 * A data structure that represents servers and hosts.
 */
type Machine = {
	name: string,
	node: Node,
	label: Label,
	mode: ServerMode
};

// +==============================================+

// move somewhere better

// serverImage.onload = draw;
// clientImage.onload = draw;

class DnsFlow extends Component {

	private txtDomain: RefObject<HTMLInputElement>;
	private dnsCanvas: RefObject<DnsFlowCanvas>;
	private selectSpeed: RefObject<HTMLSelectElement>;
	private selectLocalMode: RefObject<HTMLSelectElement>;
	private selectRootMode: RefObject<HTMLSelectElement>;
	private selectTldMode: RefObject<HTMLSelectElement>;
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
				
				console.log(tmpDomain);				

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

	componentDidMount() {

		document.body.className = "theme-layer5";

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
							<select name="speed" id="speed" ref={this.selectSpeed}>
								<option value="veryslow">Muito Lento</option>
								<option value="slow">Lento</option>
								<option value="normal" selected>Normal</option>
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
						<h1>
							<select id="local_mode" ref={this.selectLocalMode}>
								<option value="iterative">Iterativo</option>
								<option value="recursive" selected>Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>Root</label>
						<h1>
							<select id="root_mode" ref={this.selectRootMode}>
								<option value="iterative" selected>Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>TLD</label>
						<h1>
							<select id="tld_mode" ref={this.selectTldMode}>
								<option value="iterative" selected>Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>Intermediários</label>
						<h1>
							<select id="inter_mode" ref={this.selectInterMode}>
								<option value="iterative" selected>Iterativos</option>
								<option value="recursive">Recursivos</option>
							</select>
						</h1>
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

class DnsFlowCanvas extends Component<DnsFlowCanvasProps> {

	private flowCanvas: RefObject<FlowCanvas>;
	private client: Machine;
	private local: Machine;
	private root: Machine;
	private tld: Machine;
	private inter: Machine;
	private admin: Machine;
	private dest: Machine;

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

		this.makerWidth = 10;

		switch (this.props.speed) {
			case "veryslow": this.makerSpeed = verySlowSpeed; break;
			case "slow": this.makerSpeed = slowSpeed; break;
			case "normal": this.makerSpeed = normalSpeed; break;
			case "fast": this.makerSpeed = fastSpeed; break;
			case "veryfast": this.makerSpeed = veryFastSpeed; break;
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
	 * The speed of the lines the line maker makes.
	 */
	private makerWidth = 0;

	/**
	 * The width of the lines the line maker makes.
	 */
	private makerSpeed = 0;

	/**
	 * Creates NodeConnections.
	 * @param from What machine to start from.
	 * @param to What machine to go to.
	 * @param kind What kind of connection to create. Must be either "request", "partial" (responses) or "full" (responses).
	 * @param msg What message to carry in the end of the line.
	 */
	public makeConnection = (from: Machine, to: Machine, kind: "request" | "partial" | "full", msg: string): NodeConnection => {
		let style: string;
		switch (kind) {
			case ("request"): style = yellowWire; break;
			case ("partial"): style = redWire; break;
			case ("full"): style = greenWire; break;
		}
		return { from: from.node, to: to.node, strokeStyle: style, lineWidth: this.makerWidth, speed: this.makerSpeed, labelText: msg };
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

		this.client.label = new Label({x: 0, y: 0}, this.client.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		this.local.label  = new Label({x: 0, y: 0}, this.local.name,  "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		this.root.label   = new Label({x: 0, y: 0}, this.root.name,   "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		this.tld.label    = new Label({x: 0, y: 0}, this.tld.name,    "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		this.inter.label  = new Label({x: 0, y: 0}, this.inter.name,  "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		this.admin.label  = new Label({x: 0, y: 0}, this.admin.name,  "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		this.dest.label   = new Label({x: 0, y: 0}, this.dest.name,   "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		
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

		setInterval(this.flowCanvas.current.draw, 2000);
	}

	constructor(props: DnsFlowCanvasProps) {
		super(props);
		this.flowCanvas = React.createRef();
	}

	render() {
		return <FlowCanvas ref={this.flowCanvas} width={750} height={560} fixedDeltaTime={1000 / 60}/>;
	}

}