import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./sass/pages/index.scss"
import Menu from "./components/Menu";
import LayerItem from "./components/LayerItem";
import ToolItem from "./components/ToolItem";


export default class App extends Component {

	render() {
		return (
			<Router>
				<header>
					<Link to="/" className="logo">wireworks</Link>
				</header>

				<Switch>
					<Route path="/" exact render={() =>
						<Menu title="Aprenda o funcionamento de redes de computadores de forma fácil">
							<LayerItem num={5} name="Aplicação"/>
							<LayerItem num={4} name="Transporte"/>
							<LayerItem num={3} name="Rede"/>
							<LayerItem num={2} name="Enlace"/>
							<LayerItem num={1} name="Física"/>
						</Menu>
					}/>

					<Route path="/layers/3" render={() =>
						<Menu title="Camada 3 • Camada de Rede">

							<ToolItem 	name="IPBits"
										icon="far fa-dot-circle"
										description="Conversor de binário-decimal para endereços de rede" />
							
							<ToolItem 	name="Planner"
										icon="fas fa-table"
										description="Gerador de planos de endereçamento" />
							
							<ToolItem 	name="Undernets"
										icon="fas fa-cube"
										description="Visualizador de sub-redes" />
						</Menu>
					}/>

					<Route component={() =>
						<main>
							<h2 className="font-big">Nada aqui <span style={{fontFamily: "monospace"}}>¯\_(ツ)_/¯</span></h2>
						</main>
					}/>

				</Switch>
				
			</Router>
		);
	}

}