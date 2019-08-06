import React, { Component } from "react";
import Menu from "../../components/Menu";

class Layer2 extends Component {

    componentDidMount() {
        document.body.className = "theme-layer2";
    }

    render () {
        return <Menu title="Camada 2 • Camada de Rede">

        </Menu>
    }
}


export default Layer2;