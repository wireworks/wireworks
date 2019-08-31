import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer3 extends Component<RouteComponentProps> {

	render () {
		return <Menu title="Camada 3" description="Camada de Rede" theme="layer3">

            <ToolItem 	name="IPBits"
                        path={`${this.props.match.path}/ipbits`}
                        materialIcon="radio_button_checked"
                        description="Conversor de binário-decimal para endereços de rede" />
            
            <ToolItem 	name="Planner"
                        path={`${this.props.match.path}/planner`}
                        materialIcon="table_chart"
                        description="Gerador de planos de endereçamento" />
            
            <ToolItem 	name="Undernets"
                        path={`${this.props.match.path}/undernets`}
                        materialIcon="account_tree"
                        description="Visualizador de sub-redes" />
        </Menu>
    }
}

export default Layer3;