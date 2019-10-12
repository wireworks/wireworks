import React, { Component } from "react";
import "src/sass/pages/bitflux.scss";


class BitFlux extends Component {

	readonly bin_start = [true, false, true, false]
	readonly bin_stop = [false, false, false, false, false, false, false, false];
	readonly toShow = 12;
	bin_arr = new Array<boolean>(22).fill(false);
	intervalID;
	open = false;

	state = {
		btn: true,
		clColor: false,
		logArr: []
	};

	componentDidMount() {
		this.plot();
	}

	componentWillUnmount() {
		clearInterval(this.intervalID);
	}

	clock = () => {
		this.bin_arr.unshift(this.state.btn);
		this.bin_arr.pop();
		this.plot();
		this.setState((st: {clColor: boolean}) => {return {clColor: !st.clColor}});
		this.setState({logArr: this.bin_arr.slice(this.toShow, this.bin_arr.length)});
	}

	toggleAuto = () => {
		if (this.intervalID) {
			clearInterval(this.intervalID);
			this.intervalID = 0;
		} else {
			this.intervalID = setInterval(this.clock, 1000);
		}
	}

	toggle = () => {
		this.setState((st: {btn: boolean}) => {
			return {btn: !st.btn}
		});
	}

	plot = () => {

		const canvas = (document.getElementById("flux-canvas") as HTMLCanvasElement);
		const ctx = canvas.getContext('2d');
		const arr = this.bin_arr;
		
		//////////////
		const vOffset = 10;
		const lineSize = canvas.width/this.toShow;
		const drawVerticalSize = canvas.height - (vOffset*2);

		ctx.lineCap = "round";
		ctx.lineJoin = "round";


		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#d0d0d0';
		ctx.moveTo(0, canvas.height/2);
		ctx.lineTo(canvas.width, canvas.height/2);
		ctx.stroke();

		ctx.beginPath();
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#2b2b2b';
		for (let i=0; i<this.toShow; i++) {
			const val = arr[i] ? 0 : 1;
			ctx.lineTo(lineSize * i, vOffset + (drawVerticalSize * val));
			ctx.lineTo(lineSize * (i + 1), vOffset + (drawVerticalSize * val));
		}
		ctx.stroke();

	}

	render () {
		return (
			<main>

				<div id="flux-clock" style={this.state.clColor ? {backgroundColor: "#7d7d7d"} : {backgroundColor: "#ed2d4d"}}></div>

				<input id="flux-auto" type="checkbox" onChange={this.toggleAuto}/>
				<label htmlFor="flux-auto">auto clock</label>

				<button onClick={this.clock}>Clock</button>
				<button onClick={this.toggle}>{this.state.btn ? "1" : "0"}</button>

				<canvas height="200" width="900" id="flux-canvas"></canvas>

				<ul>
					{this.state.logArr.map((el, index) => {
						return <li key={index}>{el ? "1" : "0"}</li>
					})}
				</ul>

			</main>
		);
	}

}

export default BitFlux;