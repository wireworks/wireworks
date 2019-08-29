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

// Data structures representing servers and hosts in the canvas.

let client: Machine;
let local: Machine;
let root: Machine;
let tld: Machine;
let inter: Machine;
let admin: Machine;
let dest: Machine;

/**
 * A data structure that represents servers and hosts.
 */
type Machine = {
	name: string,
	node: Node,
	label: Label,
	modeDOM: HTMLSelectElement|undefined
};

type Speed = "veryslow" | "slow" | "normal" | "fast" | "veryfast";
type ServerMode = "iterative" | "recursive";

// +==============================================+

serverImage.onload = draw;
clientImage.onload = draw;

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

    componentDidMount() {

		document.body.className = "theme-layer5";
		
		// vai tudo pro DnsFlowCanvas

        client = { name: "Host Cliente", node: undefined, label: undefined, modeDOM: undefined };
		local = { name: "Local", node: undefined, label: undefined, modeDOM: id("local_mode") as HTMLSelectElement };
		root = { name: "Root", node: undefined, label: undefined, modeDOM: id("root_mode") as HTMLSelectElement };
		tld = { name: "TLD", node: undefined, label: undefined, modeDOM: id("tld_mode") as HTMLSelectElement };
		inter = { name: "Intermediários", node: undefined, label: undefined, modeDOM: id("inter_mode") as HTMLSelectElement };
		admin = { name: "Autoritativo", node: undefined, label: undefined, modeDOM: undefined };
		dest = { name: "Host Destino", node: undefined, label: undefined, modeDOM: undefined };

		// resetCanvas();

        // setInterval(draw, 2000);

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
				
				this.setState({
					domain: tmpDomain,
					speed: this.selectSpeed.current.value,
					localMode: this.selectLocalMode.current.value,
					rootMode: this.selectRootMode.current.value,
					tldMode: this.selectTldMode.current.value,
					interMode: this.selectInterMode.current.value,
				});

				this.dnsCanvas.current.run();
				
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
							<input type="text" name="domain" ref={this.txtDomain} placeholder="www.exemplo.com.br"/>
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
							<button id="run">Visualizar</button>
						</h1>
					</div>
				</div>
				
				<ErrorBox errorMessage={this.state.errorMessage}/>

				<DnsFlowCanvas ref={this.dnsCanvas}/>

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

interface DnsFlowCanvasProps extends FlowCanvasProps {
	domain: Domain,
	speed: Speed,
	localMode: ServerMode,
	rootMode: ServerMode,
	tldMode: ServerMode,
	interMode: ServerMode
}

class DnsFlowCanvas extends Component<DnsFlowCanvasProps> {

	private flowCanvas: RefObject<FlowCanvas>;

	/**
	 * Runs the simulation.
	 */
	public run = () => {

		let drawables = this.flowCanvas.current.getDrawables();
		let drawIndex = drawables.length;

		while(drawIndex--) {
			if(drawables[drawIndex] instanceof Line) {
				this.flowCanvas.current.removeDrawable(drawIndex[drawIndex]);
			}
		}

		this.flowCanvas.current.stopLineAnimations();

		// makerWidth = 10;

		// 		switch (speedDOM.value) {
		// 			case "veryslow": makerSpeed = verySlowSpeed; break;
		// 			case "slow": makerSpeed = slowSpeed; break;
		// 			case "normal": makerSpeed = normalSpeed; break;
		// 			case "fast": makerSpeed = fastSpeed; break;
		// 			case "veryfast": makerSpeed = veryFastSpeed; break;
		// 		}

		// 		let cons = calculateConnections(Domain.extractDomain(tmpRoot, fullName));
				
		// 		connectMultipleNodes(cons.connections, cons.success ? onSuccess : onFailure);

		

	}

	/**
	 * What to do when a DNS query ends in success. 
	 */
	public onSuccess = () => {
		connectNodes(client.node, dest.node, blueWire, 10, fastSpeed, undefined);
		connectNodes(dest.node, client.node, blueWire, 10, fastSpeed, undefined);
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
			makeConnection(client, local, "request", parts.full + "?")
		];
		let success = false;

		// LOCAL returns "."
		if (local.modeDOM.value === ITERATIVE) {
			connections.push(makeConnection(local, client, "partial", "."));
		}
		// LOCAL returns "www.example.com.br"
		else if (local.modeDOM.value === RECURSIVE) {

			connections.push(makeConnection(local, root, "request", parts.full + "?"));

			// ROOT returns "br"
			if (root.modeDOM.value === ITERATIVE) {

				connections.push(makeConnection(root, local, "partial", parts.tld));
				connections.push(makeConnection(local, tld, "request", parts.full + "?"));

				// TLD returns "com.br"
				if (tld.modeDOM.value === ITERATIVE) {			

					if (parts.inter) {

						// INTER returns "example.com.br"
						if (inter.modeDOM.value === ITERATIVE) {
							connections.push(...[
								makeConnection(tld, local, "partial", parts.inter + "." + parts.tld),
								makeConnection(local, inter, "request", parts.full + "?"),
								makeConnection(inter, local, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
								makeConnection(local, admin, "request", parts.full + "?"),
								makeConnection(admin, local, "full", parts.full)
							]);
						}
						// INTER returns "www.example.com.br"
						else if (inter.modeDOM.value === RECURSIVE) {
							connections.push(...[
								makeConnection(tld, local, "partial", parts.inter + "." + parts.tld),
								makeConnection(local, inter, "request", parts.full + "?"),
								makeConnection(inter, admin, "request", parts.full + "?"),
								makeConnection(admin, inter, "full", parts.full),
								makeConnection(inter, local, "full", parts.full)
							]);
						}
					}
					else {
						connections.push(...[
							makeConnection(tld, local, "partial", parts.admin + "." + parts.tld),
							makeConnection(local, admin, "request", parts.full + "?"),
							makeConnection(admin, local, "full", parts.full)
						]);
					}

				}
				// TLD returns "www.example.com.br"
				else if (tld.modeDOM.value === RECURSIVE) {

					if (parts.inter) {					
						// INTER returns "example.com.br"
						// ADMIN returns "www.example.com.br"
						if (inter.modeDOM.value === ITERATIVE) {
							connections.push(...[
								makeConnection(tld, inter, "request", parts.full + "?"),
								makeConnection(inter, tld, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
								makeConnection(tld, admin, "request", parts.full + "?"),
								makeConnection(admin, tld, "full", parts.full)
							]);
						}
						// INTER returns "www.example.com.br"
						// ADMIN returns "www.example.com.br"
						else if (inter.modeDOM.value === RECURSIVE) {
							connections.push(...[
								makeConnection(tld, inter, "request", parts.full + "?"),
								makeConnection(inter, admin, "request", parts.full + "?"),
								makeConnection(admin, inter, "full", parts.full),
								makeConnection(inter, tld, "full", parts.full)
							]);
						}
					}
					// ADMIN returns "www.example.com.br"
					else {
						connections.push(...[
							makeConnection(tld, admin, "request", parts.full + "?"),
							makeConnection(admin, tld, "full", parts.full)
						]);
					}

					connections.push(makeConnection(tld, local, "full", parts.full));

				}

			}
			// ROOT returns "www.example.com.br"
			else if (root.modeDOM.value === RECURSIVE) {

				connections.push(makeConnection(root, tld, "request", parts.full + "?"));

				// TLD returns "com.br"
				if (tld.modeDOM.value === ITERATIVE) {
					
					if (parts.inter) {

						connections.push(makeConnection(tld, root, "partial", parts.inter + "." + parts.tld));

						// INTER returns "example.com.br"
						// ADMIN returns "www.example.com.br"
						if (inter.modeDOM.value === ITERATIVE) {
							connections.push(...[
								makeConnection(root, inter, "request", parts.full + "?"),
								makeConnection(inter, root, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
								makeConnection(root, admin, "request", parts.full + "?"),
								makeConnection(admin, root, "full", parts.full)
							]);
						}
						// INTER returns "www.example.com.br"
						// ADMIN returns "www.example.com.br"
						else if (inter.modeDOM.value === RECURSIVE) {
							connections.push(...[
								makeConnection(root, inter, "request", parts.full + "?"),
								makeConnection(inter, admin, "request", parts.full + "?"),
								makeConnection(admin, inter, "full", parts.full),
								makeConnection(inter, root, "full", parts.full)
							]);
						}
					}
					else {
						// ADMIN returns "www.example.com.br"
						connections.push(...[
							makeConnection(tld, root, "partial", parts.admin + "." + parts.tld),
							makeConnection(root, admin, "request", parts.full + "?"),
							makeConnection(admin, root, "full", parts.full)
						]);
					}

				}
				// TLD returns "www.example.com.br"
				else if (tld.modeDOM.value === RECURSIVE) {

					if (parts.inter) {
						// INTER returns "example.com.br"
						// ADMIN returns "www.example.com.br"
						if (inter.modeDOM.value === ITERATIVE) {
							connections.push(...[
								makeConnection(tld, inter, "request", parts.full + "?"),
								makeConnection(inter, tld, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
								makeConnection(tld, admin, "request", parts.full + "?"),
								makeConnection(admin, tld, "full", parts.full)
							]);
						}
						// INTER returns "www.example.com.br"
						// ADMIN returns "www.example.com.br"
						else if (inter.modeDOM.value === RECURSIVE) {
							connections.push(...[
								makeConnection(tld, inter, "request", parts.full + "?"),
								makeConnection(inter, admin, "request", parts.full + "?"),
								makeConnection(admin, inter, "full", parts.full),
								makeConnection(inter, tld, "full", parts.full)
							]);
						}
					}
					else {
						// ADMIN returns "www.example.com.br"
						connections.push(...[
							makeConnection(tld, admin, "request", parts.full + "?"),
							makeConnection(admin, tld, "full", parts.full)
						]);
					}

					connections.push(makeConnection(tld, root, "full", parts.full));

				}

				connections.push(makeConnection(root, local, "full", parts.full));

			}

			connections.push(makeConnection(local, client, "full", parts.full));
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
		return { from: from.node, to: to.node, strokeStyle: style, lineWidth: makerWidth, speed: makerSpeed, labelText: msg };
	}

	/**
	 * Deletes all drawables, sets up all Nodes and their Labels.
	 */
	public resetCanvas = () => {

		let pl = 80; // padding
		let pr = 80;
		let pt = 70;
		let pb = 70;

		let w = canvasDOM.width;
		let h = canvasDOM.height;
		
		client.node = new Node({ x: pl, y: h - pb },           60, 60, {l: 10, t: 10, r: 10, b: 10}, clientImage);
		local.node  = new Node({ x: pl, y: h - pb - 180 },     60, 60, {l: 10, t: 10, r: 10, b: 40}, serverImage);
		root.node   = new Node({ x: pl, y: pt + 80 },          60, 60, {l: 10, t: 10, r: 10, b: 10}, serverImage);
		inter.node  = new Node({ x: w - pr, y: pt + 80 },      60, 60, {l: 10, t: 10, r: 10, b: 10}, serverImage);
		tld.node    = new Node({ x: (w+pl-pr)/2, y: pt },      60, 60, {l: 10, t: 10, r: 10, b: 10}, serverImage);
		admin.node  = new Node({ x: w - pr, y: h - pb - 180 }, 60, 60, {l: 10, t: 10, r: 10, b: 10}, serverImage);
		dest.node   = new Node({ x: w - pr, y: h - pb },       60, 60, {l: 10, t: 10, r: 10, b: 10}, clientImage);

		client.label = new Label({x: 0, y: 0}, client.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		local.label  = new Label({x: 0, y: 0}, local.name,  "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		root.label   = new Label({x: 0, y: 0}, root.name,   "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		tld.label    = new Label({x: 0, y: 0}, tld.name,    "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		inter.label  = new Label({x: 0, y: 0}, inter.name,  "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		admin.label  = new Label({x: 0, y: 0}, admin.name,  "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		dest.label   = new Label({x: 0, y: 0}, dest.name,   "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
		
		client.label.pos = getAlignedPoint(client.node, client.label, "bottom", "center");
		local.label.pos  = getAlignedPoint(local.node, local.label, "bottom", "center");
		root.label.pos   = getAlignedPoint(root.node, root.label, "top", "center");
		tld.label.pos    = getAlignedPoint(tld.node, tld.label, "top", "center");
		inter.label.pos  = getAlignedPoint(inter.node, inter.label, "top", "center");
		admin.label.pos  = getAlignedPoint(admin.node, admin.label, "bottom", "center");
		dest.label.pos   = getAlignedPoint(dest.node, dest.label, "bottom", "center");

		drawables = [];

		drawables.push(client.node);
		drawables.push(local.node);
		drawables.push(root.node);
		drawables.push(inter.node);
		drawables.push(admin.node);
		drawables.push(dest.node);
		drawables.push(tld.node);

		drawables.push(client.label);
		drawables.push(local.label);
		drawables.push(root.label);
		drawables.push(inter.label);
		drawables.push(admin.label);
		drawables.push(dest.label);
		drawables.push(tld.label);

		draw();

	}

	constructor(props) {
		super(props);
		this.flowCanvas = React.createRef();
	}
	
	render() {
		return <FlowCanvas ref={this.flowCanvas} width={750} height={560} fixedDeltaTime={1000 / 60}/>;
	}

}