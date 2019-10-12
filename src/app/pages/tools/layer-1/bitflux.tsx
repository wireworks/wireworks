import React, { Component } from "react";
import "src/sass/pages/bitflux.scss";


class BitFlux extends Component {

	bin_start = [true, false, true, false]
	bin_stop = [false, false, false, false, false, false, false, false];
	bin_arr = new Array<boolean>(12).fill(false);
	intervalID;
	open = false;

	state = {
		btn: true,
		clColor: false
	};

	clock = () => {
		this.bin_arr.unshift(this.state.btn);
		this.bin_arr.pop();
		this.setState((st: {clColor: boolean}) => {return {clColor: !st.clColor}});
		this.plot();
	}

	toggleAuto = () => {
		if (this.intervalID) {
			clearInterval(this.intervalID);
			this.intervalID = 0;
		} else {
			this.intervalID = setInterval(this.clock, 500);
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
		const lineSize = canvas.width/arr.length;
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
		for (const it in arr) {
			const val = arr[it] ? 0 : 1;
			const index = parseInt(it);
			ctx.lineTo(lineSize * index, vOffset + (drawVerticalSize * val));
			ctx.lineTo(lineSize * (index + 1), vOffset + (drawVerticalSize * val));
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
			</main>
		);
	}

}

export default BitFlux;