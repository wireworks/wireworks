import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer1 extends Component<RouteComponentProps> {

    render () {
		return <Menu title="Camada 1" description="Camada Física">

			<ToolItem 	name="Bit Flux"
						path={`${this.props.match.path}/bitflux`}
						materialIcon="find_in_page"
						description="Visualizador do trânsito de informações em binário" />
    	</Menu>
    }
}

export default Layer1;