import React, { FC } from "react";
import { Link } from "react-router-dom";

interface ToolItemProps {
	name: string,
	awesomeIcon?: string,
	materialIcon?: string,
	description: string,
	path: string
}

const ToolItem: FC<ToolItemProps> = ({ name, awesomeIcon, materialIcon, description, path}) =>

<li className="spacer">
	<div className="font-big">
		<span className="">
			<Link to={path}>
				<span className="mr-2">
					{awesomeIcon ? <i className={awesomeIcon}></i> : ""}
					{materialIcon ? <i className="material-icons">{materialIcon}</i> : ""}
				</span>
				{name}
			</Link>
		</span>
	</div>
	<p>{description}</p>
</li>

export default ToolItem