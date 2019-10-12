import React, { Component } from "react";

class BitFlux extends Component {

	bin_start = [true, false, true, false]
	bin_stop = [false, false, false, false, false, false, false, false];
	bin_arr = new Array<boolean>(12).fill(false);
	open = false;

	state = {
		btn: true
	};

	clock = (val: boolean) => {
		this.bin_arr.unshift(val);
		this.bin_arr.pop();
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
				<div id="flux-clock"></div>
				<button onClick={() => {this.clock(this.state.btn);this.plot()}}>Clock</button>
				<button onClick={() => {
					this.setState((st: {btn: boolean}) => {
						return {btn: !st.btn}
					})
				}}>{this.state.btn ? "1" : "0"}</button>
				<canvas height="200" width="900" id="flux-canvas"></canvas>
			</main>
		);
	}

}

export default BitFlux;