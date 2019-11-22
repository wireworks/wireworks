import React, { Component } from "react";

export interface IO {
	io: {
		onImport: (data: any) => void,
		onExport: () => any,
	}
}

class Exporter extends Component<IO> {

	ref = React.createRef<HTMLAnchorElement>();
	reg = /layers\/\d\/(\w+)/;

	handleImport = (ev) => {

		const reader = new FileReader();
		reader.onload = (a) => {
			this.props.io.onImport(JSON.parse(a.target["result"]));
		}
		reader.readAsText(ev.target.files[0])

	}

	handleExport = (ev) => {

		let fileName = "wireworks"
		if (this.reg.test(window.location.pathname))
			fileName = window.location.pathname.match(this.reg)[1]

		const anc = this.ref.current;

		anc.href = "data:text/plain;charset=utf-8," + JSON.stringify(this.props.io.onExport());
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