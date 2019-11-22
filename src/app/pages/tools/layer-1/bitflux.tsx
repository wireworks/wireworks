import React, { Component } from "react";
import "src/sass/pages/bitflux.scss";
import Tool from "../../../components/Tool";


class BitFlux extends Tool {

	readonly bin_start = [true, false, true, false]
	readonly bin_stop = [false, false, false, false, false, false, false, false];
	readonly toShow = 10;
	bin_arr = new Array<boolean>(18).fill(false);
	intervalID;
	open = false;

	mustHold = false;

	state = {
		btn: true,
		clColor: false,
		logArr: []
	};

	onImport = (data: any) => {
		console.log(data);
	}

	componentDidMount() {
		super.componentDidMount()
		this.plot();
		this.toggleAuto();
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

	toggleHold = () => {
		this.mustHold = !this.mustHold;
		this.setState({btn: false});
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

				<div className="flux-clock-wrapper">
					<div id="flux-clock" className={this.state.clColor ? "toggled" : ""} onClick={this.clock}>Clock</div>
				</div>

				<div className="flux-panel">
					<button 
						onMouseDown={this.toggle}
						onMouseUp={()=>{if(this.mustHold)this.toggle()}}
						onMouseLeave={()=>{if(this.mustHold && this.state.btn)this.toggle()}}>{this.state.btn ? "1" : "0"}</button>

					<canvas height="260" width="900" id="flux-canvas"></canvas>

					<ul>
						{this.state.logArr.map((el, index) => {
							return <li key={index}>{el ? "1" : "0"}</li>
						})}
					</ul>
				</div>

				<div className="checkbox">
					<input id="flux-auto" type="checkbox" onChange={this.toggleAuto} defaultChecked/>
					<label htmlFor="flux-auto">Clock automático</label>				
				</div>

				<div className="checkbox">
					<input id="flux-press" type="checkbox" onChange={this.toggleHold}/>
					<label htmlFor="flux-press">Segurar botão</label>				
				</div>

			</main>
		);
	}

}

export default BitFlux;