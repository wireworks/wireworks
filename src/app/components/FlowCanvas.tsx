import React, { Component, RefObject } from "react";
import { clamp } from "../wireworks/utils/math";
import { roundRect } from "../wireworks/utils/canvas";

/**
 * A 2D point.
 */
export type Point = { x: number, y: number }

/**
 * Interface representing anything that can be drawn on the canvas.
 */
export interface Drawable {

	visible: boolean;
	draw(ctx: CanvasRenderingContext2D): void;

}

/**
 * A Drawable image that has special connecting points. Used to represent servers and clients in the canvas.
 */
export class Node implements Drawable {
	
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

	public draw(ctx: CanvasRenderingContext2D): void {
		
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
 */
export class Label implements Drawable {
	
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

	public draw(ctx: CanvasRenderingContext2D): void {
		if (this.visible) {
			let width = this.getRealWidth(ctx);
			let height = this.getRealHeight();

			ctx.fillStyle = this.backgroundColor;
			roundRect(ctx, this.pos.x - (width / 2), this.pos.y - (height / 2), width, height, this.borderRadius).fill();

			ctx.fillStyle = this.textColor;
			ctx.font = this.font;
			ctx.fillText(this.text, this.pos.x + this.padding - (width / 2), this.pos.y + this.padding + this.textHeight - (height / 2));
		}
	}	
	
	/**
	 * Returns the width of this Label, considering the width of the text and the padding.
	 */
	public getRealWidth(ctx: CanvasRenderingContext2D): number {
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
export class Line implements Drawable {

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

	public draw(ctx: CanvasRenderingContext2D): void {

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
				this.label.draw(ctx);
			}
		}

	}

}

/**
 * A helper data structure used to represent the connection between two Nodes when creating a line. 
 */
export type NodeConnection = {
	from: Node, 
	to: Node, 
	strokeStyle: string, 
	lineWidth: number, 
	speed: number, 
	labelText: string | undefined 
};

export interface FlowCanvasProps {
	width: number,
	height: number,
	fixedDeltaTime: number
};

class FlowCanvas extends Component<FlowCanvasProps> {

	/**
	 * The list of elements drawn to the canvas.
	 */
	private drawables: Drawable[] = [];

	/**
	 * The reference to the canvas.
	 */
	protected canvas: RefObject<HTMLCanvasElement>;		
	
	/**
	 * The intervals of each line being drawn.
	 */
	protected lineIntervals: NodeJS.Timeout[] = [];

	/**
	 * Adds a drawable to this FlowCanvas.
	 * @param drawable The drawable to be added.
	 */
	public addDrawable = (drawable: Drawable) => {
		this.drawables.push(drawable);
	}

	/**
	 * Removes a drawable from this FlowCanvas.
	 * @param drawable The drawable to be removed.
	 */
	public removeDrawable = (drawable: Drawable): boolean => {
		let index = this.drawables.indexOf(drawable);		
		if (index < 0) return false;
		this.drawables.splice(index, 1);
		return true;
	}

	/**
	 * Removes all drawables from this FlowCanvas.
	 */
	public clearDrawables = () => {
		this.drawables = [];
	}

	/**
	 * Returns the list of drawables of this FlowCanvas.
	 */
	public getDrawables = (): Drawable[] => {
		return this.drawables;
	}

	/**
	 * Stops all line animations.
	 */
	public stopLineAnimations = () => {
		for (let i = 0; i < this.lineIntervals.length; i++) {
			clearInterval(this.lineIntervals[i]);
		}
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
	public connectNodes = (from: Node, to: Node, strokeStyle: string, lineWidth: number, speed: number, labelText: string|undefined, callback: Function = undefined): Line => {

		let line = new Line(from, to, 0, strokeStyle, lineWidth);

		if (labelText) {
			line.label = new Label({x:0,y:0}, labelText, "#000000", strokeStyle, 5, 10, "12px Monserrat, sans-serif", 10);
		}
		this.addDrawable(line);

		let prevTime = Date.now();
		let scope: FlowCanvas = this;

		let interval = setInterval(function(){

			let deltaTime = Date.now() - prevTime;
			prevTime = Date.now();

			let startPoint = line.getStartPoint();
			let endPoint = line.getEndPoint();

			let distance = Math.sqrt(
				((startPoint.x - endPoint.x)*(startPoint.x - endPoint.x)) + ((startPoint.y - endPoint.y)*(startPoint.y - endPoint.y))
			);

			line.time = clamp(line.time + ((deltaTime/1000) * (speed/distance)), 0, 1);

			scope.draw();
			
			if (line.time >= 1) {

				line.time = 1;
				scope.draw();

				line.label = undefined;

				if (callback) {
					callback();
				}

				clearInterval(interval);
			}

		}, this.props.fixedDeltaTime);

		this.lineIntervals.push(interval);

		return line;

	}

	/**
	 * Connects multiple nodes, in succession.
	 * @param connections The list of connections to be made.
	 * @param callback What do to when the last line finishes being drawn.
	 */
	public connectMultipleNodes = (connections: NodeConnection[], callback: Function = undefined) => {

		let iterativeConnect = (index: number) => {

			if(index < connections.length){
				let connection = connections[index];
				index++;
						
				this.connectNodes(connection.from, connection.to, connection.strokeStyle, connection.lineWidth, connection.speed, connection.labelText, function () {
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
	 * Returns the position of a Node or Label when put aligned to another one.
	 * @param from The Node or Label to be positioned relative to.
	 * @param to The Node or Label to be positioned.
	 * @param positionY How to align the Node or Label vertically. Can be "top", "center" or "bottom".
	 * @param positionX How to align the Node or Label horizontally. Can be "left", "center" or "right".
	 */
	public getAlignedPoint = (from: Node|Label, to: Node|Label, positionY: "top"|"center"|"bottom", positionX: "left"|"center"|"right"): Point => {

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
			fromWidth = from.getRealWidth(this.canvas.current.getContext("2d"));		
			fromHeight = from.getRealHeight();		
		}
		if (to instanceof Label) {
			toWidth = to.getRealWidth(this.canvas.current.getContext("2d"));		
			toHeight = to.getRealHeight();		
		}

		return {
			x: from.pos.x + offX * (fromWidth + toWidth),
			y: from.pos.y + offY * (fromHeight + toHeight)
		};

	}

	/**
	* Renders all the Drawables to the canvas.
	*/
	public draw = () => {

		let ctx = this.canvas.current.getContext("2d");

		ctx.clearRect(0, 0, this.props.width, this.props.height);

		if (this.drawables) {
			for (let i = 0; i < this.drawables.length; i++) {
				this.drawables[i].draw(ctx);	
			}
		}

	}

	constructor(props: any) {
		super(props);
		this.canvas = React.createRef();
	}	

	componentWillUnmount() {
		this.stopLineAnimations();
	}

	render() {
		return <canvas width={this.props.width} height={this.props.height} ref={this.canvas} className="flow-canvas"></canvas>;
	}

}

export default FlowCanvas;