import React, { Component } from "react";
import ErrorBox from "../../../components/ErrorBox";
import "src/sass/pages/framer.scss";

class Framer extends Component {

	ty = ["Noise", "Preamble", "SFD", "Frame Data", "FCS"];
	reg = /(A{14})(AB)(.*?)(0{24})/g;
	reg2 = /.{2}/g;

	start = "AAAAAAAAAAAAAAAB";
	end = "000000000000000000000000";

	state = {
		data: "",
		num: "0",
		errorMessage: null as string
	};

	insert = (str: string) => {
		let data = this.state.data;
		data += str;
		this.setState({ data: data });
	}

	customInsert = () => {
		this.setState({errorMessage: null});
		if (+this.state.num >= 0 && +this.state.num <= 255) this.insert((+this.state.num).toString(16).toUpperCase().padStart(2, "0"));
		else this.setState({errorMessage: "Entrada inválida. Digite um valor entre 0 e 255."});
	}

	handleInput = (ev) => {

		let val = ev.target.value > 255 ? 255 : ev.target.value;
		val = val < 0 ? 0 : val;		
		this.setState({ num: val });

	}

	render() {

		let arr = []

		const segments = this.state.data.split(this.reg);
		for (let ind in segments) {
			const i = parseInt(ind);
			const cName = "framer-" + this.ty[i % this.ty.length].replace(" ", "").toLowerCase();
			if (segments[i] !== "") {
				const bits = segments[i].match(this.reg2)
				for (let d in bits) {
					arr.push(<span key={`s${i}-i${d}`} className={cName}>{bits[parseInt(d)]}</span>)
				}
			}
		}

		return (
			<main>
				<div className="framer-wrapper">
					<div className="framer-container-wrapper">
						<label>Bytes</label>
						<div className="framer-container">
							{arr}
						</div>
					</div>
					<div className="framer-configs">
						<div className="vbox align-stretch">
							<label>Opções</label>
							<button className="mb-3" onClick={() => this.insert(this.start)}>Inserir Início</button>
							<button className="mb-3" onClick={() => this.insert(this.end)}>Inserir Fim</button>
							<div className="hbox fill mb-3">
								<input className="full-width" type="number" onChange={this.handleInput} onBlur={()=>{if(!this.state.num) this.setState({num: "0"})}} value={this.state.num} />
								<button className="full-width" onClick={this.customInsert}>Inserir</button>
							</div>
							<button onClick={() => this.insert(Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, "0"))}>Inserir Aleatório</button>
						</div>
						<button className="full-width" onClick={() => this.setState({ data: "" })}> <i className="material-icons">delete</i> Limpar</button>
					</div>
				</div>

				<ErrorBox className="mt-3" errorMessage={this.state.errorMessage} />

			</main>
		);
	}

}

export default Framer;