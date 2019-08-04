import React, { FC } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./sass/pages/index.scss"
import MainMenu from "./app/pages/MainMenu";
import Menu from "./app/components/Menu";
import ToolItem from "./app/components/ToolItem";

export const App: FC = () =>

<Router>
	

	<Switch>
		<Route path="/" exact component={MainMenu}/>

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