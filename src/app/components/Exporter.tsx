import React, { Component } from "react";

class Exporter extends Component {

	ref = React.createRef<HTMLAnchorElement>();
	reg = /layers\/\d\/(\w+)/;

	handleImport = (ev) => {

		const reader = new FileReader();
		reader.onload = (a) => {
			console.log(JSON.parse(a.target.result));
		}
		reader.readAsText(ev.target.files[0])

	}

	handleExport = (ev) => {
		const obj = {
			aa: "nice",
			ab: [1, 2, 3, 4, "five", {banana: "fine"}],
			ba: 123,
			bb: {
				ff: "nice again",
				fa: [1, 2, 3],
			}
		}

		let fileName = "wireworks"
		if (this.reg.test(window.location.pathname))
			fileName = window.location.pathname.match(this.reg)[1]

		const anc = this.ref.current;

		anc.href = "data:text/plain;charset=utf-8," + JSON.stringify(obj);
		anc.download = fileName + ".wworks";
		this.ref.current.click();
	}

	render() {
		return (
			<>
				<button onClick={this.handleExport}>Export</button>
				<label htmlFor="exporter-input">Import</label>
				<div className="hide">
					<input onInput={this.handleImport} accept="json" id="exporter-input" type="file"/>
					<a download="aa.wworks" ref={this.ref}>AA</a>
				</div>
			</>
		);
	}

}

export default Exporter;