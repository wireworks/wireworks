import { id } from "../../core/utils/dom";
import { Domain, ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE } from "../../core/networking/layers/layer-5/domain";

// DNSFlow
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-04-14)

const errorWrapperDOM = id("error_wrapper");
const domainDOM = id("domain");
const canvasDOM = <HTMLCanvasElement>id("canvas");
const ctx = canvasDOM.getContext("2d");

type Point = {	x: number, y: number }

interface Drawable {

	draw(): void;

}

class Node implements Drawable {
	
	public pos: Point;
	public width: number;
	public height: number;
	public side: "top"|"bottom"|"left"|"right";
	public fillStyle: string;

	constructor(pos: Point, width: number, heigth: number, side: "top" | "bottom" | "left" | "right", fillStyle: string) {
		this.pos = pos;
		this.width = width;
		this.height = heigth;
		this.side = side;
		this.fillStyle = fillStyle; // tmp!
	}

	draw(): void {
		
		console.log("fill = " + this.fillStyle);
		ctx.fillStyle = this.fillStyle;
		ctx.fillRect(this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);

	}

}

let drawables: Drawable[] = [];

function run() {

	let oldTable = id('domain_error');

	if (oldTable !== null) {
		oldTable.remove();
	}

	let errStr: string = undefined;

	try {
		
		let fullName = (<HTMLInputElement>domainDOM).value;
		
		if (fullName === "localhost") {
			errStr = "Você não pode usar esse nome.";
			throw Error();
		} else {
			
			let tmpRoot = new Domain(".", undefined);
			let domain = Domain.extractDomain(tmpRoot, fullName);
			
		}

	} catch (error) {

		let table = document.createElement('table');
		table.id = "domain_error";

		console.error(error);

		if (!errStr) {

			switch (error.name) {
				case ERROR_INVALID_LABEL:
					errStr = "Esse domínio possui um nome inválido.";
					break;
				case ERROR_FULL_NAME_RANGE:
					errStr = "Esse domínio possui um nome grande demais.";
					break;
				default:
					errStr = "Erro desconhecido (" + error.name + ")."
					console.error(error);
					break;
			}

		}

		table.innerHTML = `
				<td>
					<h2 class="font-mono text-danger">Entrada inválida. ${errStr}</h2>
				</td>
			`;

		errorWrapperDOM.appendChild(table);

	}

}

function render() {

	for (let i = 0; i < drawables.length; i++) {
		drawables[i].draw();	
	}

}

function setupCanvas() {

	let px = 50; // padding
	let py = 50;
	let w = canvasDOM.width;
	let h = canvasDOM.height;
	
	let hostNode = new Node({x: px, y: h - py},60,60,"top", "#FF0000");
	let localNode = new Node({ x: px, y: h / 2 }, 60, 60, "top", "#FFFF00");
	let rootNode = new Node({ x: px, y: py }, 60, 60, "top", "#00FF00");
	let interNode = new Node({ x: w / 2, y: h / 2 }, 60, 60, "top", "#FF00FF");
	let adminNode = new Node({ x: w - px, y: h / 2 }, 60, 60, "top", "#00FFFF");
	let destNode = new Node({ x: w - px, y: h - py }, 60, 60, "top", "#0000FF");

	drawables.push(hostNode);
	drawables.push(localNode);
	drawables.push(rootNode);
	drawables.push(interNode);
	drawables.push(adminNode);
	drawables.push(destNode);

}

setupCanvas();
render();

id("run").addEventListener("click", function(ev: MouseEvent) {

	run();

})