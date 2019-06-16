import React, { Component } from "react";
import { Link } from "react-router-dom";

interface ToolItemProps {
	name: string,
	icon: string
	description: string,

}

export default class ToolItem extends Component<ToolItemProps> {
	
	render() {
		const p = this.props;
		return (
			<li>
				<h2><span className="font-bold"><Link to={"/" + p.name.trim().toLowerCase()}><i className={p.icon}></i> {p.name}</Link></span></h2>
				<p>{p.description}</p>
			</li>
		);
	}
}