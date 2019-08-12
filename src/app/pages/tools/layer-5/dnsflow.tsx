// DNSFlow
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-04-14)

import React, { Component } from "react";

import "src/sass/pages/dnsflow.scss"
import { id } from "../../../wireworks/utils/dom";
import { Domain, ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE, ERROR_SMALL_DOMAIN } from "../../../wireworks/networking/layers/layer-5/domain";
import { clamp } from "../../../wireworks/utils/math";

// Images used in the canvas.

const serverImage = new Image();
const clientImage = new Image();

import("src/images/layers/5/client.png").then(res => clientImage.src = res.default);
import("src/images/layers/5/server.png").then(res => serverImage.src = res.default);

// DOM elements.

let errorWrapperDOM: HTMLElement;
let domainDOM: HTMLElement;
let canvasDOM: HTMLCanvasElement;
let speedDOM: HTMLSelectElement;
let ctx: CanvasRenderingContext2D;

export function init() {	
	errorWrapperDOM = id("error_wrapper");
	domainDOM = id("domain");
	canvasDOM = id("canvas") as HTMLCanvasElement;
	speedDOM = id("speed") as HTMLSelectElement;
	ctx = canvasDOM.getContext("2d");


	client = { name: "Host Cliente", node: undefined, label: undefined, modeDOM: undefined };
	local = { name: "Local", node: undefined, label: undefined, modeDOM: id("local_mode") as HTMLSelectElement };
	root = { name: "Root", node: undefined, label: undefined, modeDOM: id("root_mode") as HTMLSelectElement };
	tld = { name: "TLD", node: undefined, label: undefined, modeDOM: id("tld_mode") as HTMLSelectElement };
	inter = { name: "Intermediários", node: undefined, label: undefined, modeDOM: id("inter_mode") as HTMLSelectElement };
	admin = { name: "Autoritativo", node: undefined, label: undefined, modeDOM: undefined };
	dest = { name: "Host Destino", node: undefined, label: undefined, modeDOM: undefined };

}

// Simulation speed constants.

const verySlowSpeed = 10;
const slowSpeed = 25;
const normalSpeed = 100;
const fastSpeed = 400;
const veryFastSpeed = 600;

// Data structures representing servers and hosts in the canvas.

let client: Machine;
let local: Machine;
let root: Machine;
let tld: Machine;
let inter: Machine;
let admin: Machine;
let dest: Machine;

// Wire colors.

const greenWire = "#a9cc78";
const redWire = "#db938a";
const blueWire = "#9ac9ed";
const yellowWire = "#e5c16e";

// Constants representing the mode of a DNS server.

const ITERATIVE = "iterative";
const RECURSIVE = "recursive";

/**
 * The target duration of each frame while animating lines.
 */
const fixedDeltaTime = 1000 / 60;

/**
 * The intervals of each line being drawn.
 */
let lineIntervals: NodeJS.Timeout[] = [];

/**
 * The list of elements drawn to the canvas.
 */
let drawables: Drawable[] = [];

/**
 * A 2D point.
 */
type Point = {	x: number, y: number }

/**
 * Interface representing anything that can be drawn on the canvas.
 */
interface Drawable {

	visible: boolean;
	draw(): void;

}

/**
 * A Drawable image that has special connecting points. Used to represent servers and clients in the canvas.
 * @author Henrique Colini
 */
class Node implements Drawable {
	
	public visible = true;
	public pos: Point;
	public margins: { l: number, t: number, r: number, b: number };
	public width: number;
	public height: number;
	public image: HTMLImageElement;

	constructor(pos: Point, width: number, heigth: number, margins: { l: number, t: number, r: number, b: number }, image: HTMLImageElement) {
		this.pos = pos;
		this.width = width;
		this.height = heigth;
		this.image = image;
		this.margins = margins;
	}

	public draw(): void {
		
		if (this.visible)
			ctx.drawImage(this.image, this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);

	}

	/**
	 * Returns the 4 vertices of this rectangular Node. A, B, C and D represent the vertices clockwise, starting from the top left corner.
	 */
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

	/**
	 * Returns an exit point of this Node, given the side.
	 * @param side Which side to get the point from.
	 */
	public getOutput(side: "top" | "bottom" | "left" | "right"): Point {

		let p = this.getVertices();
		let f = 0.25;
		let fw = f * this.width;
		let fh = f * this.height;

		switch (side) {

			case "top":
				return { x: p.a.x + fw, y: p.a.y - this.margins.t };
			case "bottom":
				return { x: p.c.x - fw, y: p.c.y + this.margins.b };
			case "left":
				return { x: p.d.x - this.margins.l, y: p.d.y - fh };
			case "right":
				return { x: p.c.x + this.margins.r, y: p.b.y + fh };

		}

	}

	/**
	 * Returns an entry point of this Node, given the side.
	 * @param side Which side to get the point from.
	 */
	public getInput(side: "top" | "bottom" | "left" | "right"): Point {

		let p = this.getVertices();
		let f = 0.25;
		let fw = f * this.width;
		let fh = f * this.height;

		switch (side) {

			case "top":
				return { x: p.b.x - fw, y: p.a.y - this.margins.t };
			case "bottom":
				return { x: p.d.x + fw, y: p.c.y + this.margins.b };
			case "left":
				return { x: p.d.x - this.margins.l, y: p.a.y + fh };
			case "right":
				return { x: p.c.x + this.margins.r, y: p.c.y - fh };

		}

	}

}

/**
 * A Drawable text box.
 * @author Henrique Colini
 */
class Label implements Drawable {
	
	public visible = true;
	public pos: Point;
	public text: string;
	public textColor: string;
	public backgroundColor: string;
	public padding: number;
	public borderRadius: number;
	public font: string;
	public textHeight: number;

	constructor(pos: Point, text: string, textColor: string, backgroundColor: string, padding: number, borderRadius: number, font: string, textHeight: number) {
		this.pos = pos;
		this.text = text;
		this.textColor = textColor;
		this.backgroundColor = backgroundColor;
		this.padding = padding;
		this.borderRadius = borderRadius;
		this.font = font;
		this.textHeight = textHeight;
	}

	public draw(): void {
		if (this.visible) {
			let width = this.getRealWidth();
			let height = this.getRealHeight();

			ctx.fillStyle = this.backgroundColor;
			roundRect(this.pos.x - (width / 2), this.pos.y - (height / 2), width, height, this.borderRadius).fill();

			ctx.fillStyle = this.textColor;
			ctx.font = this.font;
			ctx.fillText(this.text, this.pos.x + this.padding - (width / 2), this.pos.y + this.padding + this.textHeight - (height / 2));
		}
	}	
	
	/**
	 * Returns the width of this Label, considering the width of the text and the padding.
	 */
	public getRealWidth(): number {
		ctx.font = this.font;
		return ctx.measureText(this.text).width + (2*this.padding);
	}

	/**
	 * Returns the height of this Label, considering the height of the text and the padding.
	 */
	public getRealHeight(): number {
		return this.textHeight + (2*this.padding);
	}

}

/**
 * A Drawable line that connects the outputs and inputs of Nodes.
 */
class Line implements Drawable {

	public visible = true;
	public from: Node;
	public to: Node;
	public time: number;
	public strokeStyle: string;
	public lineWidth: number;
	public label: Label;

	constructor(from: Node, to: Node, time: number, strokeStyle: string, strokeWidth: number) {

		this.from = from;
		this.to = to;
		this.time = time;
		this.strokeStyle = strokeStyle;
		this.lineWidth = strokeWidth;

	}

	/**
	 * Returns the start point of this Line.
	 */
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

	/**
	 * Returns the end point of this Line.
	 */
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

	/**
	 * Returns the current end point of this Line in a point of time.
	 * @param fromPoint The starting point.
	 * @param toPoint The end point to be reached.
	 */
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

			if (this.label) {								
				this.label.pos = currEnd;
				this.label.draw();
			}
		}

	}

}

/**
 * A data structure that represents servers and hosts.
 */
type Machine = {
	name: string,
	node: Node,
	label: Label,
	modeDOM: HTMLSelectElement|undefined
}

/**
 * A helper data structure used to represent the connection between two Nodes when creating a line. 
 */
type NodeConnection = {
	from: Node, 
	to: Node, 
	strokeStyle: string, 
	lineWidth: number, 
	speed: number, 
	labelText: string | undefined 
};

/**
 * Draws a rounded rectangle in the canvas.
 * @param x The x coordinate of the rectangle.
 * @param y The y coordinate of the rectangle.
 * @param w The width of the rectangle.
 * @param h The height of the rectangle.
 * @param r The radius of the border.
 */
function roundRect(x: number, y: number, w: number, h: number, r: number): CanvasRenderingContext2D {
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
	return ctx;
}

/**
 * Runs the simulation.
 */
export function run() {

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
		
		let fullName = (domainDOM as HTMLInputElement).value;
		
		if (fullName === "localhost") {
			errStr = "Você não pode usar esse nome.";
			throw Error();
		} else {
			
			let tmpRoot = new Domain(".", undefined);
									
			makerWidth = 10;

			switch (speedDOM.value) {
				case "veryslow": makerSpeed = verySlowSpeed; break;
				case "slow": makerSpeed = slowSpeed; break;
				case "normal": makerSpeed = normalSpeed; break;
				case "fast": makerSpeed = fastSpeed; break;
				case "veryfast": makerSpeed = veryFastSpeed; break;
			}

			let cons = calculateConnections(Domain.extractDomain(tmpRoot, fullName));
			
			connectMultipleNodes(cons.connections, cons.success ? onSuccess : onFailure);
			
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
				case ERROR_SMALL_DOMAIN:
					errStr = "Você deve inserir um domínio com mais partes.";
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

/**
 * What to do when a DNS query ends in success. 
 */
function onSuccess() {
	connectNodes(client.node, dest.node, blueWire, 10, fastSpeed, undefined);
	connectNodes(dest.node, client.node, blueWire, 10, fastSpeed, undefined);
}

/**
 * What to do when a DNS query ends in failure.
 */
function onFailure() {}

/**
 * Calculates the connections between servers needed in a DNS query. Returns a list of said connections and whether the query was successful.
 * @param domain The host domain.
 */
function calculateConnections(domain: Domain): { connections: NodeConnection[], success: boolean} {
		
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
let makerWidth = 0;

/**
 * The width of the lines the line maker makes.
 */
let makerSpeed = 0;

/**
 * Creates NodeConnections.
 * @param from What machine to start from.
 * @param to What machine to go to.
 * @param kind What kind of connection to create. Must be either "request", "partial" (responses) or "full" (responses).
 * @param msg What message to carry in the end of the line.
 */
function makeConnection(from: Machine, to: Machine, kind: "request" | "partial" | "full", msg: string): NodeConnection {
	let style: string;
	switch (kind) {
		case ("request"): style = yellowWire; break;
		case ("partial"): style = redWire; break;
		case ("full"): style = greenWire; break;
	}
	return { from: from.node, to: to.node, strokeStyle: style, lineWidth: makerWidth, speed: makerSpeed, labelText: msg };
}

/**
 * Connects two Nodes with a Line, drawing it over time, given a speed. 
 * @param from The Node to start the Line from.
 * @param to The Node to get the Line to.
 * @param strokeStyle The stroke style of the Line.
 * @param lineWidth The line width.
 * @param speed The speed of the Line being drawn, in pixels per second.
 * @param labelText The text of the Line's label.
 * @param callback A callback for when the Line finishes drawing.
 */
function connectNodes(from: Node, to: Node, strokeStyle: string, lineWidth: number, speed: number, labelText: string|undefined, callback: Function = undefined): Line {

	let line = new Line(from, to, 0, strokeStyle, lineWidth);

	if (labelText) {
		line.label = new Label({x:0,y:0}, labelText, "#000000", strokeStyle, 5, 10, "12px Monserrat, sans-serif", 10);
	}
	drawables.push(line);

	let prevTime = Date.now();

	let interval = setInterval(function(){

		let deltaTime = Date.now() - prevTime;
		prevTime = Date.now();

		let startPoint = line.getStartPoint();
		let endPoint = line.getEndPoint();

		let distance = Math.sqrt(
			((startPoint.x - endPoint.x)*(startPoint.x - endPoint.x)) + ((startPoint.y - endPoint.y)*(startPoint.y - endPoint.y))
		);

		line.time = clamp(line.time + ((deltaTime/1000) * (speed/distance)), 0, 1);

		myRender();
		
		if (line.time >= 1) {

			line.time = 1;
			myRender();

			line.label = undefined;

			if (callback) {
				callback();
			}

			clearInterval(interval);
		}

	}, fixedDeltaTime);

	lineIntervals.push(interval);

	return line;

}

/**
 * Connects multiple nodes, in succession.
 * @param connections The list of connections to be made.
 * @param callback What do to when the last line finishes being drawn.
 */
function connectMultipleNodes(
	connections: NodeConnection[],
	callback: Function = undefined) {

	function iterativeConnect(index: number) {

		if(index < connections.length){
			let connection = connections[index];
			index++;
					
			connectNodes(connection.from, connection.to, connection.strokeStyle, connection.lineWidth, connection.speed, connection.labelText, function () {
				iterativeConnect(index);
			});
		}
		else {
			if (callback) {
				callback();
			}
		}

	}

	iterativeConnect(0);

}

/**
 * Renders all the Drawables to the canvas.
 */
export function myRender() {

	ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);

	for (let i = 0; i < drawables.length; i++) {
		drawables[i].draw();	
	}

}

/**
 * Returns the position of a Node or Label when put aligned to another one.
 * @param from The Node or Label to be positioned relative to.
 * @param to The Node or Label to be positioned.
 * @param positionY How to align the Node or Label vertically. Can be "top", "center" or "bottom".
 * @param positionX How to align the Node or Label horizontally. Can be "left", "center" or "right".
 */
function getAlignedPoint(from: Node|Label, to: Node|Label, positionY: "top"|"center"|"bottom", positionX: "left"|"center"|"right"): Point {

	let offX: number;	
	let offY: number;	

	switch (positionX) {
		case "left": offX = -0.5; break;
		case "center": offX = 0; break;
		case "right": offX = 0.5; break;
	}

	switch (positionY) {
		case "top": offY = -0.5; break;
		case "center": offY = 0; break;
		case "bottom": offY = 0.5; break;
	}

	let fromWidth: number;
	let fromHeight: number;
	let toWidth: number;
	let toHeight: number;

	if (from instanceof Node) {
		fromWidth = from.width;		
		fromHeight = from.height;		
	}
	if (to instanceof Node) {
		toWidth = to.width;		
		toHeight = to.height;		
	}
	if (from instanceof Label) {
		fromWidth = from.getRealWidth();		
		fromHeight = from.getRealHeight();		
	}
	if (to instanceof Label) {
		toWidth = to.getRealWidth();		
		toHeight = to.getRealHeight();		
	}

	return {
		x: from.pos.x + offX * (fromWidth + toWidth),
		y: from.pos.y + offY * (fromHeight + toHeight)
	};

}

/**
 * Deletes all drawables, sets up all Nodes and their Labels.
 */
export function resetCanvas() {

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

	myRender();

}

// +==============================================+

serverImage.onload = myRender;
clientImage.onload = myRender;


class DnsFlow extends Component {

    componentDidMount() {
		
		document.body.className = "theme-layer5";

        init();

        resetCanvas();

        setInterval(myRender, 2000);

        id("run").addEventListener("click", run);

        id("domain").addEventListener("keydown", function (ev: KeyboardEvent): void {
            if (ev.key === "Enter")
                run();
        });
    }

    render () {
        return (
			<main>
				<div className="hbox">
					<div>
						<label htmlFor="domain">Domínio</label>
						<h1>
							<input type="text" name="domain" id="domain" placeholder="www.exemplo.com.br"/>
						</h1>
					</div>
					<div>
						<label htmlFor="speed">Velocidade</label>
						<h1>
							<select name="speed" id="speed">
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
				
				<div id="error_wrapper"></div>

				<canvas id="canvas" width="750" height="560"></canvas>

				<div className="hbox">

					<div>
						<label>Local</label>
						<h1>
							<select id="local_mode">
								<option value="iterative">Iterativo</option>
								<option value="recursive" selected>Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>Root</label>
						<h1>
							<select id="root_mode">
								<option value="iterative" selected>Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>TLD</label>
						<h1>
							<select id="tld_mode">
								<option value="iterative" selected>Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>Intermediários</label>
						<h1>
							<select id="inter_mode">
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