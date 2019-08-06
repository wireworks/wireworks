import React, { Component } from "react";
import Menu from "../../components/Menu";

class Layer5 extends Component {

    componentDidMount() {
        document.body.className = "theme-layer5";
    }

    render () {
        return <Menu title="Camada 5 • Camada de Rede">

        </Menu>
    }
}

export default Layer5;