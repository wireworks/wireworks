import React, { Component } from "react";
import "./sass/pages/index.scss"


export default class App extends Component {

	render() {
		return (
			<React.Fragment>
				<header>
					<a href="./" className="logo">wireworks</a>
				</header>
				<main>
					<h2>
						Aprenda o funcionamento de redes de computadores de forma fácil
					</h2>

					<ul className="collection">

						<li>
							<div className="spacer">
								<a href="layers/5/" className="layer-5"><i className="fas fa-layer-group"></i> Camada <span className="font-bold">5</span></a>
								<span className="font-big text-extralight">Aplicação</span>
							</div>
						</li>

						<li>
							<div className="spacer">
								<a href="layers/4/" className="layer-4"><i className="fas fa-layer-group"></i> Camada <span className="font-bold">4</span></a>
								<span className="font-big text-extralight">Transporte</span>
							</div>
						</li>
				
						<li>
							<div className="spacer">
								<a href="layers/3/" className="layer-3"><i className="fas fa-layer-group"></i> Camada <span className="font-bold">3</span></a>
								<span className="font-big text-extralight">Rede</span>
							</div>
						</li>					

						<li>
							<div className="spacer">
								<a href="layers/2/" className="layer-2"><i className="fas fa-layer-group"></i> Camada <span className="font-bold">2</span></a>
								<span className="font-big text-extralight">Enlace</span>
							</div>
						</li>

						<li>
							<div className="spacer">
								<a href="layers/1/" className="layer-1"><i className="fas fa-layer-group"></i> Camada <span className="font-bold">1</span></a>
								<span className="font-big text-extralight">Física</span>
							</div>
						</li>
						
					
					</ul>

					<h3>Criado por Henrique Colini e Álvaro Dziadzio <span className="text-light font-light">• Info16 <i className="fas fa-code"></i></span></h3>
				</main>
			</React.Fragment>
		);
	}

}