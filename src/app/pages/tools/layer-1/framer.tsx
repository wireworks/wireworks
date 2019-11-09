import React, { Component } from "react";
import "src/sass/pages/framer.scss";


class Framer extends Component {

	ty = ["Noise", "Preamble", "SFD", "Frame Data", "FCS"];
	reg = /(A{14})(AB)(.*?)(0{24})/g;
	reg2 = /.{2}/g;

	start = "AAAAAAAAAAAAAAAB";
	end = "000000000000000000000000";

	state = {
		data: "",
		num: 0
	};

	componentDidMount() {

	}

	insert = (str: string) => {
		let data = this.state.data;
		data += str;
		this.setState({data: data});
	}

	handleInput = (ev) => {
		let val = ev.target.value > 255 ? 255 : ev.target.value;
		val = val < 0 ? 0 : val;
		this.setState({num: parseInt(val)});
	}

	render() {

		let arr = []

		const segments = this.state.data.split(this.reg);
		for (let ind in segments) {
			const i = parseInt(ind);
			const cName = "framer-" + this.ty[i%this.ty.length].replace(" ", "").toLowerCase();
			if (segments[i] !== "") {
				const bits = segments[i].match(this.reg2)
				for (let d in bits) {
					arr.push(<span key={`s${i}-i${d}`} className={cName}>{bits[parseInt(d)]}</span>)
				}
			}
		}

		return (
			<main>
				<button onClick={() => this.insert(this.start)}>Inserir Inicio</button>
				<button onClick={() => this.insert(this.end)}>Inserir Fim</button>
				<input type="number" onChange={this.handleInput} value={this.state.num}/>
				<button onClick={() => this.insert(this.state.num.toString(16).toUpperCase().padStart(2, "0"))}>Inserir</button>
				<button onClick={() => this.insert(Math.floor(Math.random()*255).toString(16).toUpperCase().padStart(2, "0"))}>Inserir Aleatorio</button>
				<div className="framer-container">
					{arr}
				</div>
			</main>	
		); 
	} 

}

export default Framer;