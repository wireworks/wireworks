import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer4 extends Component<RouteComponentProps> {

    componentDidMount() {
        document.body.className = "theme-layer4";
    }

    render () {
        return <Menu title="Camada 4 • Camada de Rede">

            <ToolItem 	name="TCP Carrier"
                        path={`${this.props.match.path}/tcpcarrier`}
                        icon="far fa-dot-circle"
                        description="Simulador do protocolo TCP" />

        </Menu>
    }
}

export default Layer4;