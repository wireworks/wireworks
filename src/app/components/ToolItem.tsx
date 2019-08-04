import React, { FC } from "react";
import { Link } from "react-router-dom";

interface ToolItemProps {
	name: string,
	icon: string
	description: string,
	path: string
}

const ToolItem: FC<ToolItemProps> = ({name, icon, description, path}) =>

<li>
	<h2><span className="font-bold"><Link to={path}><i className={icon}></i> {name}</Link></span></h2>
	<p>{description}</p>
</li>

export default ToolItem