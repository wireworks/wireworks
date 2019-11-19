import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer1 extends Component<RouteComponentProps> {

    render () {
		return <Menu title="Camada 1" description="Camada Física">

			<ToolItem 	name="Bit Flux"
						path={`${this.props.match.path}/bitflux`}
						materialIcon="swap_calls"
						description="Visualizador do trânsito de informações em binário" />
			
			<ToolItem 	name="Framer"
						path={`${this.props.match.path}/framer`}
						materialIcon="border_outer"
						description="Visualizador da estrutura de um pacote em binário" />
    	</Menu>
    }
}

export default Layer1;