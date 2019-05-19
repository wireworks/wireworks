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
const localModeDOM = <HTMLSelectElement>id("local_mode");
const rootModeDOM = <HTMLSelectElement>id("root_mode");
const interModeDOM = <HTMLSelectElement>id("intermediate_mode");

const ctx = canvasDOM.getContext("2d");
const fixedDeltaTime = 20;

let requesterNode: Node;
let localNode: Node;
let rootNode: Node;
let interNode: Node;
let adminNode: Node;
let destNode: Node;

let drawables: Drawable[] = [];
let lineIntervals: number[] = [];

const greenWire = "#b0db8a";
const redWire = "#db938a";
const blueWire = "#9ac9ed";
const yellowWire = "#e5c16e";

type Point = {	x: number, y: number }

interface Drawable {

	visible: boolean;
	draw(): void;

}

class Node implements Drawable {
	
	public visible = true;
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
		
		if (this.visible)
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

class Label implements Drawable {
	
	public visible = true;
	public pos: Point;
	public text: string;
	public textColor: string;
	public backgroundColor: string;
	public padding: number;
	public font: string;
	public textHeight: number;

	constructor(pos: Point, text: string, textColor: string, backgroundColor: string, padding: number, font: string, textHeight: number) {
		this.pos = pos;
		this.text = text;
		this.textColor = textColor;
		this.backgroundColor = backgroundColor;
		this.padding = padding;
		this.font = font;
		this.textHeight = textHeight;
	}

	public draw(): void {
		let width = this.getRealWidth();
		let height = this.getRealHeight();
		ctx.fillStyle = this.backgroundColor;
		ctx.fillRect(this.pos.x, this.pos.y, width, height);
		ctx.fillStyle = this.textColor;
		ctx.font = this.font;
		ctx.fillText(this.text, this.pos.x + this.padding, this.pos.y + this.padding + this.textHeight);
	}	
	
	public getRealWidth(): number {
		return ctx.measureText(this.text).width + (2*this.padding);
	}

	public getRealHeight(): number {
		return this.textHeight + (2*this.padding);
	}

}

class Line implements Drawable {

	public visible = true;
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

		if (this.visible){

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
			let domainParts = Domain.extractDomain(tmpRoot, fullName).getFullName().split(".");
			let hasInter = false;

			if (domainParts.length < 2) {
				errStr = "Você deve inserir um domínio com mais partes.";
				throw Error();
			}
			if (domainParts.length == 2) {
				domainParts.unshift("www");
			}
			if (domainParts.length > 3) {
				let middle = "";
				for (let i = 2; i < domainParts.length - 1; i++) middle += domainParts[i] + ((i < domainParts.length - 2)?".":"");
				domainParts = [domainParts[0],domainParts[1],middle,domainParts[domainParts.length-1]];
				hasInter = true;
			}			
			
			console.log(domainParts);

			let speed = 200;
			let width = 10;

			if (localModeDOM.value === "iterative") {

				connectMultipleNodes([
					{ from: requesterNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
					{ from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
					{ from: rootNode, to: localNode, strokeStyle: redWire, lineWidth: width, speed: speed },
					{ from: localNode, to: interNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
					{ from: interNode, to: localNode, strokeStyle: redWire, lineWidth: width, speed: speed },
					{ from: localNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
					{ from: adminNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed },
					{ from: localNode, to: requesterNode, strokeStyle: greenWire, lineWidth: width, speed: speed }
				], onSuccess);

			}
			else if (localModeDOM.value === "recursive") {

				if (rootModeDOM.value === "iterative") {

					connectMultipleNodes([
						{ from: requesterNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
						{ from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
						{ from: rootNode, to: interNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
						{ from: interNode, to: rootNode, strokeStyle: redWire, lineWidth: width, speed: speed },
						{ from: rootNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
						{ from: adminNode, to: rootNode, strokeStyle: greenWire, lineWidth: width, speed: speed },
						{ from: rootNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed },
						{ from: localNode, to: requesterNode, strokeStyle: greenWire, lineWidth: width, speed: speed }
					], onSuccess);

				}
				else if (rootModeDOM.value === "recursive") {

					connectMultipleNodes([
						{ from: requesterNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
						{ from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
						{ from: rootNode, to: interNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
						{ from: interNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed },
						{ from: adminNode, to: interNode, strokeStyle: greenWire, lineWidth: width, speed: speed },
						{ from: interNode, to: rootNode, strokeStyle: greenWire, lineWidth: width, speed: speed },
						{ from: rootNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed },
						{ from: localNode, to: requesterNode, strokeStyle: greenWire, lineWidth: width, speed: speed }
					], onSuccess);

				}

			}
			
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

function onSuccess() {
	connectNodes(requesterNode, destNode, blueWire, 10, 800);
	connectNodes(destNode, requesterNode, blueWire, 10, 800);
}

function connectNodes(from: Node, to: Node, strokeStyle: string, lineWidth: number, speed: number, callback: Function = undefined): Line {

	let line = new Line(from, to, 0, strokeStyle, lineWidth);
	drawables.push(line);

	let interval = setInterval(function(){

		let startPoint = line.getStartPoint();
		let endPoint = line.getEndPoint();

		let distance = Math.sqrt(
			((startPoint.x - endPoint.x)*(startPoint.x - endPoint.x)) + ((startPoint.y - endPoint.y)*(startPoint.y - endPoint.y))
		);

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

function connectMultipleNodes(
	connections: { from: Node, to: Node, strokeStyle: string, lineWidth: number, speed: number }[],
	callback: Function = undefined) {

	function recursiveConnect(index: number) {

		if(index < connections.length){
			let connection = connections[index];
			index++;
					
			connectNodes(connection.from, connection.to, connection.strokeStyle, connection.lineWidth, connection.speed, function () {
				recursiveConnect(index);
			});
		}
		else {
			if (callback) {
				callback();
			}
		}

	}

	recursiveConnect(0);

}

function render() {

	ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);

	for (let i = 0; i < drawables.length; i++) {
		drawables[i].draw();	
	}

}

function resetCanvas() {

	let px = 70; // padding
	let py = 70;
	let w = canvasDOM.width;
	let h = canvasDOM.height;
	
	requesterNode = new Node({x: px, y: h - py},60,60, clientImage);
	localNode = new Node({ x: px, y: h / 2 }, 60, 60, serverImage);
	rootNode = new Node({ x: px, y: py }, 60, 60, serverImage);
	interNode = new Node({ x: w - px, y: py }, 60, 60, serverImage);
	adminNode = new Node({ x: w - px, y: h / 2 }, 60, 60, serverImage);
	destNode = new Node({ x: w - px, y: h - py }, 60, 60, clientImage);

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