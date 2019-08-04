import React, { FC } from "react";
import Menu from "../../components/Menu";
import ToolItem from "../../components/ToolItem";
import { RouteProps, Route, match, RouteComponentProps } from "react-router";

const Layer3: FC<RouteComponentProps> = ({match}) =>

<Menu title="Camada 3 • Camada de Rede">

    <ToolItem 	name="IPBits"
                path={`${match.path}/ipbits`}
                icon="far fa-dot-circle"
                description="Conversor de binário-decimal para endereços de rede" />
    
    <ToolItem 	name="Planner"
                path={`${match.path}/planner`}
                icon="fas fa-table"
                description="Gerador de planos de endereçamento" />
    
    <ToolItem 	name="Undernets"
                path={`${match.path}/undernets`}
                icon="fas fa-cube"
                description="Visualizador de sub-redes" />
</Menu>


export default Layer3;