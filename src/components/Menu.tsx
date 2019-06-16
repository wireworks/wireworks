import React, { Component } from "react";

interface MenuProps {
	title: string
}

export default class Menu extends Component<MenuProps> {

	render() {

		console.log(typeof this.props.children)

		return (
			<main>
				<h2>{this.props.title}</h2>

				<ul className="collection">
					{this.props.children}
				</ul>

				<h3>Criado por Henrique Colini e Álvaro Dziadzio <span className="text-light font-light">• Info16 <i className="fas fa-code"></i></span></h3>
			</main>
		);
	}

}