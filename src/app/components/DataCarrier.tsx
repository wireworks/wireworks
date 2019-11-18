import React, { Component, FC } from "react";
import { ballSize, marginSize } from "../../sass/components/_datacarrier.scss";
import TooltipTrigger from "react-popper-tooltip";
import Tooltip, { TooltipBody } from "./Tooltip";

type HoverText = {title?: string, lines?: string[]};

interface Progress {
	onClick?: () => void,
	onArrive?: () => void,
	hoverText?: HoverText
	toSide: "left" | "right",
	prog: number
}

interface Pkg {
	content: string
	lState: "ok" | "waiting" | "blank",
	rState: "ok" | "waiting" | "blank",
	progress: Array<Progress>
}

const TcpPacket: FC<Pkg> = (props) =>

	<div className="carrier-p-rail">
		<div className="carrier-p-asd">
			<div className={`carrier-p-ball carrier-state-${props.lState}`}> {props.lState === "blank" ? "" : props.content} </div>
			<div className={`carrier-p-ball carrier-state-${props.rState}`}> {props.rState === "blank" ? "" : props.content} </div>
		</div>
		{props.progress.map((el, ind) => {
			return (
				<div key={ind} className="carrier-p-slider" style={{ transform: `translateX(${100*(el.toSide === "left" ? 1 - el.prog : el.prog)}%)` }}>
					<div className="carrier-p-ball carrier-state-moving" onClick={el.onClick}>
						{el.hoverText ? 
							<Tooltip placement="top" trigger="hover" hideArrow={false} tooltip={<TooltipBody title={el.hoverText.title} lines={el.hoverText.lines}/>}>
								<span>{props.content}</span>
							</Tooltip> :
							<span>{props.content}</span>
						}						
					</div>
				</div>
			);
		})}
	</div>

export default class DataCarrier extends Component {

	private _running = true;
	private lastStamp = performance.now();

	state = {
		lWindow: 0,
		rWindow: 0,

		lWindowSize: 1,
		rWindowSize: 1,

		delay: 3,
		arr: new Array<Pkg>()
	}

	componentDidMount() {
		if (this.running) window.requestAnimationFrame(this.update);
	}

	componentWillUnmount() {
		this.running = false;
	}

	private clamp = (n: number, min = 0, max = 1) => {
		if (n > max)
			return max;
		if (n < min)
			return min;
		return n;
	}

	update = (timestamp: DOMHighResTimeStamp) => {

		let deltaTime = (timestamp - this.lastStamp)/1000;
		this.lastStamp = timestamp;
		
		if (this.running) {

			const arr = this.state.arr;

			for (let pkg of arr) {
				for (let i = pkg.progress.length - 1; i >= 0; i--) {
					const ball = pkg.progress[i];
					if (ball.prog < 1) {
						ball.prog = this.clamp(ball.prog + (deltaTime/this.state.delay));
						if (ball.prog >= 1) {
							if (ball.onArrive) ball.onArrive();
							pkg.progress.splice(i, 1);
						}
					}
				}
			}

			this.setState({ arr: arr });
			window.requestAnimationFrame(this.update);
		}
	}

	set running (run: boolean) {
		if (!this._running && run) {
			this.lastStamp = performance.now();
			window.requestAnimationFrame(()=>{window.requestAnimationFrame(this.update)});
		}
		this._running = run;
	}

	get running () {
		return this._running;
	}

	//////////////////////////////////////////////////////////////////

	get length() {
		return this.state.arr.length;
	}

	get lWindowSize() {
		return this.state.lWindowSize;
	}

	get lWindow() {
		return this.state.lWindow;
	}

	get rWindowSize() {
		return this.state.rWindowSize;
	}

	get rWindow() {
		return this.state.rWindow;
	}

	set delay(del: number) {
		this.setState({ delay: del });
	}

	contentAt = (index: number) => {
		return this.state.arr[index].content;
	}

	reset = (msg: string, callback?: () => void) => {
		const arr = new Array<Pkg>();
		for (let f of msg) {
			const p = {
				content: f,
				lState: "waiting",
				rState: "blank",
				progress: new Array<{ prog: number, toSide: "left" | "right" }>()
			} as Pkg;
			arr.push(p);
		}
		this.setState({ arr: arr }, callback);
	}

	setPkgState = (side: "left" | "right", index: number, state: "ok" | "waiting" | "blank") => {
		const arr = this.state.arr;
		if (side == "left") {
			arr[index].lState = state;
		} else {
			arr[index].rState = state;
		}
	}

	send = (to: "left" | "right", index: number, onClick?: () => void, onArrive?: () => void, hoverText?: HoverText): Progress => {
		const p = {
			toSide: to,
			onClick: onClick,
			onArrive: onArrive,
			prog: 0,
			hoverText: hoverText
		};
		this.state.arr[index].progress.push(p);
		return p;
	}

	removeMoving = (index: number, prog: Progress) => {
		this.state.arr[index].progress.splice(this.state.arr[index].progress.indexOf(prog),1);
		this.setState({ arr: this.state.arr });
	}

	changeWindow = (side: "left" | "right", toIndex: number, toSize: number) => {
		if (side == "left") {
			this.setState({ lWindow: toIndex, lWindowSize: toSize });
		} else {
			this.setState({ rWindow: toIndex, rWindowSize: toSize });
		}
	}

	//////////////////////////////////////////////////////////////////

	render() {

		return (
			<div className="data-carrier">

				<div className="carrier-cont-window">
					<div style={{ transform: `translateY(${this.state.lWindow * 100}%)` }} className="carrier-window-wrapper carrier-left">
						<div style={{ minHeight: ((parseInt(ballSize) + parseInt(marginSize) * 2) * this.state.lWindowSize) + "px" }} className="carrier-window"></div>
					</div>
					<div style={{ transform: `translateY(${this.state.rWindow * 100}%)` }} className="carrier-window-wrapper carrier-right">
						<div style={{ height: ((parseInt(ballSize) + parseInt(marginSize) * 2) * this.state.rWindowSize) }} className="carrier-window"></div>
					</div>
				</div>

				{this.state.arr.map((el, ind) => {
					return <TcpPacket key={ind} rState={el.rState} lState={el.lState} content={el.content} progress={el.progress} />
				})}

			</div>
		);
	}
}