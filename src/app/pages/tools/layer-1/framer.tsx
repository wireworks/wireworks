import React, { Component } from "react";


class Framer extends Component {

	state = {
		data: "AA"
	};

	componentDidMount() {

		const reg = /(A{14})(AB)(.*?)(0{24})/g
		const st = "AAAAAAAAAAAAAAAB342423598381928392382398000000000000000000000000123123123123123AAAAAAAAAAAAAAAB3424235AAAA98381928392382398000000000000000000000000000AAAAAAAAAAAAAAAB342423598381";

		const ty = ["Noise", "Preamble", "SFD", "Frame Data", "FCS"];

		const data = st.split(reg);
		for (let i in data) {
			console.log(ty[parseInt(i)%ty.length] + " " + data[parseInt(i)]);
		}

	}

	render() {
		return (
			<main>
				<h1>Hello</h1>
				
			</main>
		); 
	} 

}

export default Framer;