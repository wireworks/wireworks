import React, { Component, FC } from "react";
import { ballSize, marginSize } from "../../sass/components/_datacarrier.scss";

interface Progress {
	onClick?: () => void,
	onArrive?: () => void,
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
			<div className={`carrier-p-ball carrier-state-${props.lState}`}> <span>{props.lState === "blank" ? "" : props.content}</span> </div>
			<div className={`carrier-p-ball carrier-state-${props.rState}`}> <span>{props.rState === "blank" ? "" : props.content}</span> </div>
		</div>
		{props.progress.map((el, ind) => {
			return (
				<div key={ind} className="carrier-p-slider" style={{ transform: `translateX(${el.toSide === "left" ? 100 - el.prog : el.prog}%)` }}>
					<div className="carrier-p-ball carrier-state-moving" onClick={el.onClick}> <span>{props.content}</span> </div>
				</div>
			);
		})}
	</div>

export default class DataCarrier extends Component {
	running = true;

	state = {
		lWindow: 0,
		rWindow: 0,

		lWindowSize: 1,
		rWindowSize: 1,

		speed: 0.5,
		arr: new Array<Pkg>()
	}

	componentDidMount() {
		window.requestAnimationFrame(this.update);
	}

	componentWillUnmount() {
		this.running = false;
	}

	private clamp = (n: number) => {
		if (n > 100)
			return 100
		if (n < 0)
			return 0
		return n;
	}

	update = () => {
		if (this.running) {

			const arr = this.state.arr;

			for (let pkg of arr) {
				for (let i = pkg.progress.length - 1; i >= 0; i--) {
					const ball = pkg.progress[i];
					if (ball.prog != 100) {
						let newVal = ball.prog + this.state.speed;
						if (newVal >= 100) {
							newVal = 100;
							if (ball.onArrive) ball.onArrive();
							pkg.progress.splice(i, 1);
						}
						ball.prog = newVal;
					}
				}
			}

			this.setState({ arr: arr });
			window.requestAnimationFrame(this.update);
		}
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

	set speed(spd: number) {
		this.setState({ speed: spd });
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

	send = (to: "left" | "right", index: number, onClick?: () => void, onArrive?: () => void): Progress => {
		const p = {
			toSide: to,
			onClick: onClick,
			onArrive: onArrive,
			prog: 0,
		};
		this.state.arr[index].progress.push(p);
		return p;
	}

	removeMoving = (index: number, prog: Progress) => {
		this.state.arr[index].progress.splice(this.state.arr[index].progress.indexOf(prog),1);
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