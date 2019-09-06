import React, { Component } from "react";

interface MenuProps {
	title?: string,
	description?: string
}

class Menu extends Component<MenuProps> {

	render() {
		return(
			<main>

				<div className="hbox align-center">
					{this.props.title ? <h1 className="mr-1" >{this.props.title} •</h1> : ""}
					{this.props.description ? <h3>{this.props.description}</h3> : ""}
				</div>

				<ul className="collection">
					{this.props.children}
				</ul>
				
			</main>
		);
	}

}

export default Menu;