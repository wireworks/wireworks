import React, { Component } from "react";


class Framer extends Component {

	state = {
		data: new Array<{
			num: number,
			type: string
		}>()
	};

	componentDidMount() {
		const dt = this.state.data;

		dt.push({num: 0b10101010, type: "preamble"});

		this.setState({data: dt});

	}


	render() {
		return (
			<main>
				<h1>Hello</h1>
				<ul>
					{this.state.data.map((it, k) => <li key={k}>{it.type + it.num}</li>)}
				</ul>
			</main>
		); 
	} 

}

export default Framer;