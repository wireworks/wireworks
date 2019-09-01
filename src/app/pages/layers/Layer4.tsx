import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer4 extends Component<RouteComponentProps> {

    render () {
		return <Menu title="Camada 4" description="Camada de Transporte" theme="layer4">

            <ToolItem 	name="TCP Carrier"
                        path={`${this.props.match.path}/tcpcarrier`}
                        materialIcon="swap_horizontal_circle"
                        description="Simulador do protocolo TCP" />

        </Menu>
    }
}

export default Layer4;