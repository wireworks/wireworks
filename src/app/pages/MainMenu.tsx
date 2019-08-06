import Menu from "../components/Menu";
import LayerItem from "../components/LayerItem";
import React, { Component } from "react";

class MainMenu extends Component {

    componentDidMount() {
        document.body.className = "theme-wireworks";
    }

    render() {
        return <Menu title="Aprenda o funcionamento de redes de computadores de forma fácil">
            <LayerItem num={5} name="Aplicação"/>
            <LayerItem num={4} name="Transporte"/>
            <LayerItem num={3} name="Rede"/>
            <LayerItem num={2} name="Enlace"/>
            <LayerItem num={1} name="Física"/>
        </Menu>
    }

}

export default MainMenu;