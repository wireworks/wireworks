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

	public draw(): void {

		let offX = this.from.pos.x - this.to.pos.x;
		let offY = this.from.pos.y - this.to.pos.y;

		let fromPoint: Point;
		let toPoint: Point;

		if (Math.abs(offX) > Math.abs(offY)) {
			if (offX > 0) {
				fromPoint = this.from.getOutput("left");
				toPoint = this.to.getInput("right");
			}
			else {
				fromPoint = this.from.getOutput("right");
				toPoint = this.to.getInput("left");
			}
		}
		else {
			if (offY > 0) {
				fromPoint = this.from.getOutput("top");
				toPoint = this.to.getInput("bottom");
			}
			else {
				fromPoint = this.from.getOutput("bottom");
				toPoint = this.to.getInput("top");
			}
		}

		ctx.beginPath();
		ctx.strokeStyle = this.strokeStyle;
		ctx.lineWidth = this.lineWidth;
		ctx.lineCap = "round";

		ctx.moveTo(fromPoint.x, fromPoint.y);
		ctx.lineTo(fromPoint.x + (this.time * (toPoint.x - fromPoint.x)), fromPoint.y + (this.time * (toPoint.y - fromPoint.y)));

		ctx.stroke();

	}

}

let drawables: Drawable[] = [];
let lineIntervals: number[] = [];

let hostNode: Node;
let localNode: Node;
let rootNode: Node;
let interNode: Node;
let adminNode: Node;
let destNode: Node;

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

			connectNodes(hostNode, localNode, "#b0db8a", 10, 500, function() {
				connectNodes(localNode, rootNode, "#b0db8a", 10, 500, function () {
					connectNodes(rootNode, localNode, "#db938a", 10, 500);
				});
			});
			
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

function connectNodes(from: Node, to: Node, strokeStyle: string, lineWidth: number, delay: number, callback: Function = undefined) {

	let spent = 0;
	let line = new Line(from, to, 0, strokeStyle, lineWidth);
	drawables.push(line);

	let interval = setInterval(function(){

		line.time = clamp(spent / delay, 0, 1);

		render();

		spent += fixedDeltaTime;
		
		if (spent >= delay) {

			line.time = 1;
			render();

			if (callback) {
				callback();
			}

			clearInterval(interval);
		}

	}, fixedDeltaTime);

	lineIntervals.push(interval);

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
	
	hostNode = new Node({x: px, y: h - py},60,60, clientImage);
	localNode = new Node({ x: px, y: h / 2 }, 60, 60, serverImage);
	rootNode = new Node({ x: px, y: py }, 60, 60, serverImage);
	interNode = new Node({ x: w / 2, y: h / 2 }, 60, 60, serverImage);
	adminNode = new Node({ x: w - px, y: h / 2 }, 60, 60, serverImage);
	destNode = new Node({ x: w - px, y: h - py }, 60, 60, clientImage);

	drawables = [];

	drawables.push(hostNode);
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