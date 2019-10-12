import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";

class Layer1 extends Component {

    render () {
		return <Menu title="Camada 1" description="Camada Física">

			<ToolItem 	name="Bit Flux"
						path={`${this.props.match.path}/bitflux`}
						materialIcon="find_in_page"
						description="Visualisador do transito de informações em binario" />
    	</Menu>
    }
}

export default Layer1;