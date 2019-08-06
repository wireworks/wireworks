import React, { Component } from "react";
import Menu from "../../components/Menu";

class Layer4 extends Component {

    componentDidMount() {
        document.body.className = "theme-layer4";
    }

    render () {
        return <Menu title="Camada 4 • Camada de Rede">

        </Menu>
    }
}

export default Layer4;