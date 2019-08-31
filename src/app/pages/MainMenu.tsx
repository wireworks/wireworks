import Menu from "../components/Menu";
import LayerItem from "../components/LayerItem";
import React, { FC } from "react";

const MainMenu: FC = () => <Menu title="Redes, desmistificadas." description="Escolha uma das camadas para começar" theme="wireworks">
	<LayerItem num={5} name="Aplicação" />
	<LayerItem num={4} name="Transporte" />
	<LayerItem num={3} name="Rede" />
	<LayerItem num={2} name="Enlace" />
	<LayerItem num={1} name="Física" />
</Menu>

export default MainMenu;