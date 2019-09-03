import React, { Component } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteComponentProps } from "react-router";

class Layer2 extends Component<RouteComponentProps> {

    render () {
		return <Menu title="Camada 2" description="Camada de Enlace" theme="layer2">
			
			<ToolItem 	name="MAC Fetch"
                        path={`${this.props.match.path}/macfetch`}
                        materialIcon="find_in_page"
                        description="Visualisador de consultas ARP de endereços MAC" />
			
      <ToolItem 	name="IP Fetch"
                        path={`${this.props.match.path}/ipfetch`}
                        materialIcon="find_in_page"
                        description="Visualisador de consultas RARP de endereços IP" />

		</Menu>
    }
}

export default Layer2;