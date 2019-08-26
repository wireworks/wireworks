import React, { FC, Component } from "react";
import Menu from "../../components/Menu";

class Layer1 extends Component {

    componentDidMount() {
        document.body.className = "theme-layer1";
    }

    render () {
        return <Menu title="Camada 1 • Camada Física">

        </Menu>
    }
}


export default Layer1;