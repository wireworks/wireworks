import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer5 extends Component<RouteComponentProps> {

    render () {
        return <Menu title="Camada 5" description="Camada de Aplicação" theme="layer5">

            <ToolItem 	name="DNSTree"
                        path={`${this.props.match.path}/dnstree`}
                        materialIcon="input"
                        description="Simulador de registro de domínios" />
            
            <ToolItem 	name="DNSFlow"
                        path={`${this.props.match.path}/dnsflow`}
                        materialIcon="sync_alt"
                        description="Visualizador de pesquisas de endereços em servidores DNS" />
        </Menu>
    }
}

export default Layer5;