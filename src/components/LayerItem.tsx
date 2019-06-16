import React, { Component } from "react";
import { Link } from "react-router-dom";

interface LayerItemProps {
	num: number,
	name: string
}

export default class LayerItem extends Component<LayerItemProps> {
	render() {
		return (
			<li>
				<div className="spacer">
					<Link to={"layers/" + this.props.num} className={"layer-" + this.props.num}><i className="fas fa-layer-group"></i> Camada <span className="font-bold">{this.props.num}</span></Link>
					<span className="font-big text-extralight">{this.props.name}</span>
				</div>
			</li>
		);
	}
}