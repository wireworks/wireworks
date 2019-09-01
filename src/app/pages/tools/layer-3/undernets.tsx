// Undernets
// +=========================+
// Author: Henrique Colini
// Version: 3.0 (2019-08-26)

import React, { Component, RefObject } from "react";
import ErrorBox from "../../../components/ErrorBox";
import { removeItem } from "../../../wireworks/utils/array";
import { Address, ERROR_NOT_NETWORK, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE, Byte4Zero } from "../../../wireworks/networking/layers/layer-3/address";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";
import "src/sass/pages/undernets.scss"

/**
 * A list of color classes used in the Visual Networks.
 */
const COLORS = [];

for (let i = 0; i < 10; i++) COLORS[i] = 'ss-'+i;

/**
 * The queue of colors that will be applied to future subnets.
 */
const COLOR_QUEUE = COLORS.slice();

// +==============================================+

class Undernets extends Component {

	/**
	 * Whether it's the first time the user has created a network.
	 */
	private firstTime = true;
	/**
	 * The text input for the base address.
	 */
	private txtAddress: RefObject<HTMLInputElement>;
	/**
	 * A reference to the root colored block component.
	 */
	private rootBlockRef: RefObject<SubnetBlock>;

	state = {
		errorMessage: null,
		showTree: false,
		rootAddress: new Address(Byte4Zero())
	};

	/**
	 * Resets Undernets.
	 */
	private reset = () => {

		if (this.firstTime || window.confirm("Tem certeza de que quer visualizar uma nova rede?\nIsso irá excluir todas as sub-redes existentes.")) {

			this.setState({errorMessage: null, showTree: false, rootAddress: undefined});

			let errStr: string = undefined;

			try {
				
				let rootAddress = new Address(this.txtAddress.current.value);

				try {

					rootAddress = new Address(this.txtAddress.current.value, undefined, true, true);

				} catch (error) {

					if (error.name === ERROR_NOT_NETWORK) {
						errStr = "Este não é um endereço de rede. Você quis dizer " + rootAddress.getNetworkAddress(true).toString() + "?";
					}

					throw error;

				}				

				this.setState({showTree: true, rootAddress: rootAddress});
				this.firstTime = false;

			} catch (error) {
				
				if (!errStr) {

					switch (error.name) {
						case ERROR_ADDRESS_PARSE:
							errStr = "A entrada deve possuir o formato 0.0.0.0/0.";
							break;
						case ERROR_MASK_RANGE:
							errStr = "O valor da máscara é alto demais (deve estar entre 0-32).";
							break;
						case ERROR_BYTE_RANGE:
							errStr = "Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).";
							break;
						default:
							errStr = "Erro desconhecido (" + error.name + ")."
							console.error(error);
							break;
					}

				}

				this.setState({errorMessage: errStr});

			}

		}

	}

	constructor(props: any) {
		super(props);
		this.state.rootAddress = undefined;
		this.txtAddress = React.createRef();
		this.rootBlockRef = React.createRef();
	}

	componentDidMount() {

		document.body.className = "theme-layer3";       

	}

	render() {
		return (
			<main>
				<label htmlFor="address">Rede/Máscara</label>

				<h1>
					<input type="text" name="address" ref={this.txtAddress} onKeyDown={(evt) => { if (evt.key === "Enter") this.reset()}} placeholder="0.0.0.0/0"/>
					<button type="button" onClick={this.reset}>Visualizar Rede</button>
				</h1>

				<ErrorBox errorMessage={this.state.errorMessage}/>

				<SubnetStrip address={this.state.rootAddress} blockRef={this.rootBlockRef}/>

				{
					this.state.showTree &&
						<SubnetTree address={this.state.rootAddress} blockRef={this.rootBlockRef}/>
				}

			</main>
		);
	}

}

interface SubnetTreeProps {
	address: Address,
	blockRef: RefObject<SubnetBlock>
}

/**
 * Component representing the subnet tree.
 */
class SubnetTree extends Component<SubnetTreeProps> {

	constructor(props: SubnetTreeProps) {
		super(props);		
	}
		
	render() {
		return (
			<div className="subnet-tree">
				<SubnetBranch address={this.props.address} parent={null} color="ss-0" blockRef={this.props.blockRef}/>
			</div>
		);
	}

}

interface SubnetBranchProps {
	address: Address,
	parent: SubnetBranch,
	color: string,
	blockRef: RefObject<SubnetBlock>
}

/**
 * A branch of the subnet tree. Usually contains other branches.
 */
class SubnetBranch extends Component<SubnetBranchProps> {

	state = {
		divided: false
	};

	/**
	 * The calculated subnets of this branch's network.
	 */
	private subnets: [Address, Address];
	/**
	 * The references to the subnet branch components child to this branch.
	 */
	private subnetComponents: [RefObject<SubnetBranch>, RefObject<SubnetBranch>];
	/**
	 * The color of the second child SubnetBranch.
	 */
	private nextColor: string;

	/**
	 * Recursively returns the first (non split) subnet in this network.
	 */
	public firstSubnet = (): SubnetBranch => {

		if (this.subnetComponents[0].current)
			return this.subnetComponents[0].current.firstSubnet();
		else
			return this;
	}

	/**
	 * Recursively returns the last (non split) subnet in this network.
	 */
	public lastSubnet = (): SubnetBranch => {

		if (this.subnetComponents[1].current)
			return this.subnetComponents[1].current.lastSubnet();
		else
			return this;
	}

	/**
	 * Returns this network's previous sibling.
	 */
	public subnetBefore = (): SubnetBranch => {

		if (this.props.parent) {
			if (this.props.parent.subnetComponents[0].current === this) {
				return this.props.parent.subnetBefore();
			}
			else {
				return this.props.parent.subnetComponents[0].current.lastSubnet();
			}
		}
		else {
			return undefined;
		}
	}

	/**
	 * Returns this network's next sibling.
	 */
	public subnetAfter = (): SubnetBranch => {

		if (this.props.parent) {
			if (this.props.parent.subnetComponents[1].current === this) {
				return this.props.parent.subnetAfter();
			}
			else {
				return this.props.parent.subnetComponents[1].current.firstSubnet();
			}
		}
		else {
			return undefined;
		}
	}

	/**
	 * Whether this branch's subnet can be further divided (i.e. mask is lower than 32).
	 */
	public canDivide = (): boolean =>  {
		return (this.subnets[0] && true) && (this.subnets[1] && true);
	}

	/**
	 * Handles click events of this branch.
	 */
	private handleClick = () => {
	
		if (this.state.divided) {

			if ((!this.subnetComponents[0].current.state.divided && !this.subnetComponents[1].current.state.divided) ||
					window.confirm("Tem certeza de quer fundir essas duas sub-redes?\nTodas as sub-redes dessas duas serão apagadas para sempre.")) {
				
				COLOR_QUEUE.push(COLOR_QUEUE[0]);
				COLOR_QUEUE.shift();
				
				this.props.blockRef.current.setState({divided: false, nextColor: "", subnets: undefined});
				this.setState({divided: false});	
			}

		}
		else if (this.canDivide()) {

			COLOR_QUEUE.unshift(COLOR_QUEUE[COLOR_QUEUE.length - 1]);
			COLOR_QUEUE.pop();

			let colorList = COLOR_QUEUE.slice();

			let before = this.subnetBefore();
			let after = this.subnetAfter();

			removeItem(colorList, this.props.color);
			if (before) removeItem(colorList, before.props.color);
			if (after) removeItem(colorList, after.props.color);

			this.nextColor = colorList[0];

			this.props.blockRef.current.setState({divided: true, nextColor: this.nextColor, subnets: this.subnets});
			this.setState({divided: !this.state.divided});

		}


	}

	/**
	 * Handles mouse entering events of this branch.
	 */
	private handleMouseEnter = () => {
		if (this.props.parent)
			this.props.blockRef.current.setState({highlighted: true});
	}

	/**
	 * Handles mouse leaving events of this branch.
	 */
	private handleMouseLeave = () => {
		if (this.props.parent)
			this.props.blockRef.current.setState({highlighted: false});
	}

	componentWillReceiveProps(props: SubnetBranchProps) {		
		this.subnets = props.address.subdivide();
		this.setState({divided: false});
		props.blockRef.current.setState({divided: false});
	}

	constructor(props: SubnetBranchProps) {
		super(props);		
		this.subnets = props.address.subdivide();
		this.subnetComponents = [React.createRef(), React.createRef()];
	}	

	render() {
		return (
			<>
				<span
					onMouseEnter={this.handleMouseEnter}
					onMouseLeave={this.handleMouseLeave}
					className={this.props.color + " " + (this.state.divided ? "subnet-merge" : "subnet-divide") + (this.canDivide()? "" : " disabled")}
					onClick={this.handleClick}>

					{this.props.address.toString() + " (" + this.props.address.numberOfHosts() + " hosts)"}
				</span>
				{
					this.state.divided && 
						<ul>
							<li><SubnetBranch blockRef={this.props.blockRef.current.subnetBlockComponents[0]} ref={this.subnetComponents[0]} address={this.subnets[0]} parent={this} color={this.props.color}/></li>
							<li><SubnetBranch blockRef={this.props.blockRef.current.subnetBlockComponents[1]} ref={this.subnetComponents[1]} address={this.subnets[1]} parent={this} color={this.nextColor}/></li>
						</ul>
				}
			</>
		);
	}

}

interface SubnetStripProps {
	address: Address,
	blockRef: RefObject<SubnetBlock>
}

/**
 * The component representing the strip of colored blocks.
 */
class SubnetStrip extends Component<SubnetStripProps> {

	/**
	 * A reference to the tooltip of the colored strip.
	 */
	private tooltip: RefObject<HTMLSpanElement>;

	/**
	 * Displays a certain text through the tooltip.
	 */
	private showTooltip = (text: string) => {
		this.tooltip.current.textContent = text;
		this.tooltip.current.style.opacity = "1";
		this.tooltip.current.style.transform = "scaleY(1)";
		this.tooltip.current.style.display = 'inline-block';
	}

	/**
	 * Hides the tooltip.
	 */
	private hideTooltip = () => {
		this.tooltip.current.style.opacity = "0";
		this.tooltip.current.style.transform = "scaleY(0)";
	}

	componentWillReceiveProps(props: SubnetStripProps) {
		if (!props.address) {
			this.props.blockRef.current.setState({divided: false});
		}
	}

	constructor(props) {
		super(props);
		this.tooltip = React.createRef();
	}

	render() {
		return (
			<div className="blocks-wrapper " onMouseLeave={this.hideTooltip}>
				<SubnetBlock ref={this.props.blockRef} address={this.props.address} color="ss-0" id="root_block" content={ !this.props.address? "Insira a sua rede" : ""} showTooltip={this.showTooltip}/>
				<div className="tooltip-wrapper">
					<span id="tooltip" ref={this.tooltip}>Informações das suas sub-redes ficarão aqui</span>
				</div>
			</div>
		);
	}

}

interface SubnetBlockProps {
	address: Address,
	color: string,
	id?: string
	content?: string
	showTooltip: (string)=>void
}

/**
 * The component representing a colored block.
 */
class SubnetBlock extends Component<SubnetBlockProps> {

	/**
	 * The references to the child blocks (subnets of this block's network).
	 */
	public subnetBlockComponents: [RefObject<SubnetBlock>, RefObject<SubnetBlock>];

	state = {
		highlighted: false,
		divided: false,
		subnets: [undefined, undefined],
		nextColor: ""
	}

	/**
	 * Handles mouse entering events.
	 */
	private handleMouseEnter = () => {
		if (this.props.address && !this.state.divided)
			this.props.showTooltip(this.props.address.toString() + " (" + this.props.address.numberOfHosts() + " hosts)");
	}

	constructor(props: SubnetBlockProps) {
		super(props);
		this.subnetBlockComponents = [React.createRef(), React.createRef()];
	}
	
	render() {
		return (
			<div id={this.props.id} className={"subnet-block " + this.props.color + (this.state.highlighted? " highlight" : "")} onMouseEnter={this.handleMouseEnter}>
				{ this.props.content? <h1>{this.props.content}</h1>:""}
				{ 
					this.state.divided &&
					<>
						<SubnetBlock address={this.state.subnets[0]} color={this.props.color} ref={this.subnetBlockComponents[0]} showTooltip={this.props.showTooltip}/>
						<SubnetBlock address={this.state.subnets[1]} color={this.state.nextColor} ref={this.subnetBlockComponents[1]} showTooltip={this.props.showTooltip}/>
					</>
				}
			</div>
		);
	}

}

export default Undernets;