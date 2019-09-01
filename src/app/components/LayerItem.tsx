import React, { FC } from "react";
import { Link } from "react-router-dom";

interface LayerItemProps {
	num: number,
	name: string
}

const LayerItem: FC<LayerItemProps> = ({num, name}) =>

<li>
	<div className="spacer">
			<Link to={"layers/" + num} className={"layer-" + num}><span className="font-bold"><i className="material-icons">layers</i> Camada {num}</span></Link>
		<span className="font-big text-extralight">{name}</span>
	</div>
</li>

export default LayerItem;