// DNSFlow
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-04-14)

import { id } from "../../core/utils/dom";
import { Domain, ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE } from "../../core/networking/layers/layer-5/domain";
import { clamp } from "../../core/utils/math";

const serverImage = new Image();
serverImage.src = "../../../images/layers/5/server.png";

const clientImage = new Image();
clientImage.src = "../../../images/layers/5/client.png";

const errorWrapperDOM = id("error_wrapper");
const domainDOM = id("domain");
const canvasDOM = <HTMLCanvasElement>id("canvas");
const ctx = canvasDOM.getContext("2d");
const fixedDeltaTime = 20;

let drawables: Drawable[] = [];
let lineIntervals: number[] = [];

type Point = {	x: number, y: number }

interface Drawable {

	draw(): void;

}

class Node implements Drawable {
	
	public pos: Point;
	public width: number;
	public height: number;
	public image: HTMLImageElement;

	constructor(pos: Point, width: number, heigth: number, image: HTMLImageElement) {
		this.pos = pos;
		this.width = width;
		this.height = heigth;
		this.image = image;
	}

	public draw(): void {
		
		ctx.drawImage(this.image, this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);

	}

	public getVertices(): {a: Point, b: Point, c: Point, d: Point} {

		let x = this.pos.x;
		let y = this.pos.y;
		let w2 = this.width / 2;
		let h2 = this.height / 2;

		let a = { x: x - w2, y: y - h2 };
		let b = { x: x + w2, y: y - h2 };
		let c = { x: x + w2, y: y + h2 };
		let d = { x: x - w2, y: y + h2 };

		return {a,b,c,d};

	}

	public getOutput(side: "top" | "bottom" | "left" | "right"): Point {

		let p = this.getVertices();
		let f = 0.3;
		let fw = f * this.width;
		let fh = f * this.height;

		switch (side) {

			case "top":
				return { x: p.a.x + fw, y: p.a.y };
			case "bottom":
				return { x: p.c.x - fw, y: p.c.y };
			case "left":
				return { x: p.d.x, y: p.d.y - fh };
			case "right":
				return { x: p.c.x, y: p.b.y + fh };

		}

	}

	public getInput(side: "top" | "bottom" | "left" | "right"): Point {

		let p = this.getVertices();
		let f = 0.3;
		let fw = f * this.width;
		let fh = f * this.height;

		switch (side) {

			case "top":
				return { x: p.b.x - fw, y: p.a.y };
			case "bottom":
				return { x: p.d.x + fw, y: p.c.y };
			case "left":
				return { x: p.d.x, y: p.a.y + fh };
			case "right":
				return { x: p.c.x, y: p.c.y - fh };

		}

	}

}

class Line implements Drawable {

	public from: Node;
	public to: Node;
	public time: number;
	public strokeStyle: string;
	public lineWidth: number;

	constructor(from: Node, to: Node, time: number, strokeStyle: string, strokeWidth: number) {

		this.from = from;
		this.to = to;
		this.time = time;
		this.strokeStyle = strokeStyle;
		this.lineWidth = strokeWidth;

	}

	public getStartPoint(): Point {

		let offX = this.from.pos.x - this.to.pos.x;
		let offY = this.from.pos.y - this.to.pos.y;

		if (Math.abs(offX) > Math.abs(offY)) {
			if (offX > 0) {
				return this.from.getOutput("left");
			}
			else {
				return this.from.getOutput("right");
			}
		}
		else {
			if (offY > 0) {
				return this.from.getOutput("top");
			}
			else {
				return this.from.getOutput("bottom");
			}
		}

	}

	public getEndPoint(): Point {

		let offX = this.from.pos.x - this.to.pos.x;
		let offY = this.from.pos.y - this.to.pos.y;

		if (Math.abs(offX) > Math.abs(offY)) {
			if (offX > 0) {
				return this.to.getInput("right");
			}
			else {
				return this.to.getInput("left");
			}
		}
		else {
			if (offY > 0) {
				return this.to.getInput("bottom");
			}
			else {
				return this.to.getInput("top");
			}
		}

	}

	public getCurrentEndPoint(fromPoint = this.getStartPoint(), toPoint = this.getEndPoint()): Point {
		return {x: fromPoint.x + (this.time * (toPoint.x - fromPoint.x)), y: fromPoint.y + (this.time * (toPoint.y - fromPoint.y))};
	}

	public draw(): void {

		let fromPoint = this.getStartPoint();
		let currEnd = this.getCurrentEndPoint(fromPoint);

		ctx.beginPath();
		ctx.strokeStyle = this.strokeStyle;
		ctx.lineWidth = this.lineWidth;
		ctx.lineCap = "round";

		ctx.moveTo(fromPoint.x, fromPoint.y);
		ctx.lineTo(currEnd.x, currEnd.y);

		ctx.stroke();

	}

}

type WalkerPath = {
	condition: [boolean, boolean],
	paths: {
		node: 'o' | 'l' | 'r' | 'i' | 'a' | 'd' | '<',
		carry: undefined | 'host' | 'inter' | 'top'
	}	
};

class Walker {

	private requesterNode: Node;
	private localNode: Node;
	private rootNode: Node;
	private interNode: Node;
	private adminNode: Node;
	private destNode: Node;
	private paths: WalkerPath[];

	public walk(condition: [boolean, boolean]): boolean {

		let found: WalkerPath = undefined;

		for (let i = 0; i < this.paths.length && !found; i++) {
			const wpath = this.paths[i];
			
			if(wpath.condition[0] == condition[0] && wpath.condition[1] == condition[1]) {
				found = wpath;
			}

		}

		if(!found) {
			return false;
		}

		

	}

	public setNodes(requester: Node, local: Node, root: Node, inter: Node, admin: Node, dest: Node)	{
		this.requesterNode = requester;
		this.localNode = local;
		this.rootNode = root;
		this.interNode = inter;
		this.adminNode = admin;
		this.destNode = dest;
	}

	public addPath(path: WalkerPath) {
		this.paths.push(path);
	}	

}

function run() {

	let drawIndex = drawables.length;

	while(drawIndex--) {
		if(drawables[drawIndex] instanceof Line) {
			drawables.splice(drawIndex,1);
		}
	}

	for (let i = 0; i < lineIntervals.length; i++) {
		clearInterval(lineIntervals[i]);
	}

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

			//connectNodes(requesterNode, destNode, "#9ac9ed", 10, 600);
			//connectNodes(destNode, requesterNode, "#9ac9ed", 10, 600);

			//connectNodes(requesterNode, localNode, "#b0db8a", 10, 100, function() {
			//	connectNodes(localNode, rootNode, "#b0db8a", 10, 100, function () {
			//		connectNodes(rootNode, localNode, "#db938a", 10, 100);
			//	});
			//});
			
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

function connectNodes(from: Node, to: Node, strokeStyle: string, lineWidth: number, speed: number, callback: Function = undefined): Line {

	let line = new Line(from, to, 0, strokeStyle, lineWidth);
	drawables.push(line);

	let interval = setInterval(function(){

		let startPoint = line.getStartPoint();
		let endPoint = line.getEndPoint();

		let distance = Math.sqrt(((startPoint.x - endPoint.x)*(startPoint.x - endPoint.x)) + ((startPoint.y - endPoint.y)*(startPoint.y - endPoint.y)));

		line.time = clamp(line.time + ((fixedDeltaTime/1000) * (speed/distance)), 0, 1);

		render();
		
		if (line.time >= 1) {

			line.time = 1;
			render();

			if (callback) {
				callback();
			}

			clearInterval(interval);
		}

	}, fixedDeltaTime);

	lineIntervals.push(interval);

	return line;

}

function render() {

	ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);

	for (let i = 0; i < drawables.length; i++) {
		drawables[i].draw();	
	}

}

function resetCanvas() {

	let px = 50; // padding
	let py = 50;
	let w = canvasDOM.width;
	let h = canvasDOM.height;
	
	let requesterNode = new Node({x: px, y: h - py},60,60, clientImage);
	let localNode = new Node({ x: px, y: h / 2 }, 60, 60, serverImage);
	let rootNode = new Node({ x: px, y: py }, 60, 60, serverImage);
	let interNode = new Node({ x: w / 2, y: h / 2 }, 60, 60, serverImage);
	let adminNode = new Node({ x: w - px, y: h / 2 }, 60, 60, serverImage);
	let destNode = new Node({ x: w - px, y: h - py }, 60, 60, clientImage);


	drawables = [];

	drawables.push(requesterNode);
	drawables.push(localNode);
	drawables.push(rootNode);
	drawables.push(interNode);
	drawables.push(adminNode);
	drawables.push(destNode);

}

resetCanvas();

serverImage.onload = render;
clientImage.onload = render;

id("run").addEventListener("click", function(ev: MouseEvent) {

	run();

})