import React, { FC } from "react";
import { Link } from "react-router-dom";

interface ToolItemProps {
	name: string,
	icon: string
	description: string,
}

const ToolItem: FC<ToolItemProps> = ({name, icon, description}) =>

<li>
	<h2><span className="font-bold"><Link to={"/" + name.trim().toLowerCase()}><i className={icon}></i> {name}</Link></span></h2>
	<p>{description}</p>
</li>

export default ToolItem