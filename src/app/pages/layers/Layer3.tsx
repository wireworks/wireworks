import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer3 extends Component<RouteComponentProps> {

    componentDidMount() {
        document.body.className = "theme-layer3";
    }

    render () {
        return <Menu title="Camada 3 • Camada de Rede">

            <ToolItem 	name="IPBits"
                        path={`${this.props.match.path}/ipbits`}
                        icon="far fa-dot-circle"
                        description="Conversor de binário-decimal para endereços de rede" />
            
            <ToolItem 	name="Planner"
                        path={`${this.props.match.path}/planner`}
                        icon="fas fa-table"
                        description="Gerador de planos de endereçamento" />
            
            <ToolItem 	name="Undernets"
                        path={`${this.props.match.path}/undernets`}
                        icon="fas fa-cube"
                        description="Visualizador de sub-redes" />
        </Menu>
    }
}

export default Layer3;