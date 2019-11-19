import React, { Component } from "react";

class Exporter extends Component {

	render() {
		return (
			<>
				<button>Export</button>
				<label htmlFor="exporter-input">Import</label>
				<div className="hide">
					<input id="exporter-input" type="file"/>
				</div>
			</>
		);
	}

}

export default Exporter;