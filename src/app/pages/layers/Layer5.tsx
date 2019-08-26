import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer5 extends Component<RouteComponentProps> {

    componentDidMount() {
        document.body.className = "theme-layer5";
    }

    render () {
        return <Menu title="Camada 5 • Camada de Aplicação">

            <ToolItem 	name="DNSTree"
                        path={`${this.props.match.path}/dnstree`}
                        icon="fas fa-stream"
                        description="Simulador de registro de domínios" />
            
            <ToolItem 	name="DNSFlow"
                        path={`${this.props.match.path}/dnsflow`}
                        icon="fas fa-search"
                        description="Visualizador de pesquisas de endereços em servidores DNS" />
        </Menu>
    }
}

export default Layer5;