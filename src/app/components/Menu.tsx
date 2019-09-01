import React, { Component } from "react";

interface MenuProps {
	title?: string,
	description?: string,
	theme?: string
}

class Menu extends Component<MenuProps> {

	componentDidMount() {
		if (this.props.theme)
			document.body.className = "theme-"+this.props.theme;
	}

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