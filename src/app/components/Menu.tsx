import React, { FC } from "react";

interface MenuProps {
	title: string
}

const Menu: FC<MenuProps> = ({title, children}) =>

<main>
	<h2>{title}</h2>

	<ul className="collection">
		{children}
	</ul>

	<h3>Criado por Henrique Colini e Álvaro Dziadzio <span className="text-light font-light">• Info16 <i className="fas fa-code"></i></span></h3>
</main>

export default Menu;