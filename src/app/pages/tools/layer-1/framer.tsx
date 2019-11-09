import React, { Component } from "react";


class Framer extends Component {

	ty = ["Noise", "Preamble", "SFD", "Frame Data", "FCS"];
	reg = /(A{14})(AB)(.*?)(0{24})/g

	state = {
		data: "AAAAAAAAAAAAAAAB342423598381928392382398000000000000000000000000123123123123123AAAAAAAAAAAAAAAB3424235AAAA98381928392382398000000000000000000000000000AAAAAAAAAAAAAAAB342423598381"
	};

	componentDidMount() {

	}

	render() {

		let arr = new Array()

		const segments = this.state.data.split(this.reg);
		for (let ind in segments) {
			const i = parseInt(ind);
			const cName = "framer-" + this.ty[i%this.ty.length].replace(" ", "").toLowerCase();
			if (segments[i] !== "")
				arr.push(<span key={i} className={cName}>{segments[i]}</span>)
		}

		return (
			<main>
				<h1>Hello</h1>
				<div className="framer-container">
					{arr}
				</div>
			</main>
		); 
	} 

}

export default Framer;