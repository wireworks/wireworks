import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer4 extends Component<RouteComponentProps> {

	render () {
		return <Menu title="Camada 4" description="Camada de Transporte">
			

			<ToolItem 	name="TCP Carrier"
						path={`${this.props.match.path}/tcpcarrier`}
						materialIcon="swap_horizontal_circle"
						description="Simulador do protocolo TCP" />

			<ToolItem 	name="UDP Carrier"
						path={`${this.props.match.path}/udpcarrier`}
						materialIcon="swap_horizontal_circle"
						description="Simulador do protocolo UDP" />

			<ToolItem 	name="Server Chat"
						path={`${this.props.match.path}/serverchat`}
						materialIcon="chat"
						description="Visualização do Three-Way-Handshake" />

		</Menu>
	}
}

export default Layer4;