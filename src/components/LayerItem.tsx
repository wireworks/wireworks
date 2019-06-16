import React, { Component } from "react";

interface LayerItemProps {
	num: number,
	name: string
}

export default class LayerItem extends Component<LayerItemProps> {
	render() {
		return (
			<li>
				<div className="spacer">
					<a href="layers/5/" className={"layer-" + this.props.num}><i className="fas fa-layer-group"></i> Camada <span className="font-bold">{this.props.num}</span></a>
					<span className="font-big text-extralight">{this.props.name}</span>
				</div>
			</li>
		);
	}
}