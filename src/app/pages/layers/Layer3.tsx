import React, { FC } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";

const Layer3: FC = () =>

<Menu title="Camada 3 • Camada de Rede">

    <ToolItem 	name="IPBits"
                icon="far fa-dot-circle"
                description="Conversor de binário-decimal para endereços de rede" />
    
    <ToolItem 	name="Planner"
                icon="fas fa-table"
                description="Gerador de planos de endereçamento" />
    
    <ToolItem 	name="Undernets"
                icon="fas fa-cube"
                description="Visualizador de sub-redes" />
</Menu>


export default Layer3;