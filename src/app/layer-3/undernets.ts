// Undernets
// +=========================+
// Author: Henrique Colini
// Version: 2.0 (2019-03-03)

import { id } from "../../core/utils/dom";
import { Address, ERROR_NOT_NETWORK, ERROR_ADDRESS_PARSE, ERROR_MASK_RANGE } from "../../core/networking/layers/layer-3/address";
import { removeItem } from "../../core/utils/array";
import { ERROR_BYTE_RANGE } from "../../core/networking/byte";

/**
 * A list of color classes used in the Visual Networks.
 */
const COLORS = [];
for (let i = 0; i < 10; i++) COLORS[i] = 'ss-'+i;
/**
 * The queue of colors that will be applied to future subnets.
 */
const COLOR_QUEUE = COLORS.slice();

let errorWrapper = id("error_wrapper");
let rootBlock = id("root_block");
let rootTree = id("root_tree");
let tooltip = id("tooltip");
let rootNet: VisualNetwork = undefined;
let firstTime = true;

/**
 * Resets the Visual Networks.
 */
function reset() {

	if (firstTime || confirm("Tem certeza de que quer visualizar uma nova rede?\nIsso irá excluir todas as sub-redes existentes.")) {

		let oldTable = id('error');

		if (oldTable !== null) {
			oldTable.remove();
		}

		let errStr: string = undefined;

		try {
			
			let rootAddress = new Address((<HTMLInputElement>id('address')).value);

			try {

				rootAddress = new Address((<HTMLInputElement>id("address")).value, undefined, true, true);

			} catch (error) {

				if (error.name === ERROR_NOT_NETWORK) {
					errStr = "Este não é um endereço de rede. Você quis dizer " + rootAddress.getNetworkAddress(true).toString() + "?";
				}

				throw error;

			}

			if (firstTime) {
				tooltip.style.display = 'inline-block';
				tooltip.style.transform = "scaleY(0)";
				tooltip.style.opacity = "0";
				rootBlock.addEventListener("mouseleave", function () {
					tooltip.style.opacity = "0";
					tooltip.style.transform = "scaleY(0)";
				});
			}

			while (rootBlock.lastChild)
				rootBlock.removeChild(rootBlock.lastChild);
			while (rootTree.lastChild)
				rootTree.removeChild(rootTree.lastChild);

			rootNet = new VisualNetwork(rootAddress, undefined, "ss-0");

			rootNet.prepElements();

			rootBlock.appendChild(rootNet.block);
			rootTree.appendChild(rootNet.treeText);

			firstTime = false;

		} catch (error) {
			
			let table = document.createElement('table');
			table.id = "error";

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
						break;
				}

			}

			table.innerHTML = `
				<td>
					<h2 class="error">Entrada inválida. ${errStr}</h2>
				</td>
			`;

			errorWrapper.appendChild(table);

		}

	}
}

/**
 * A binary tree that combines Addresses and DOM Elements. Used only by Undernets.
 * @author Henrique Colini
 */
class VisualNetwork {

	address: Address;
	parent: VisualNetwork;
	color: string;
	subnets: [VisualNetwork, VisualNetwork];
	block: HTMLElement;
	treeText: HTMLElement

	constructor(address: Address, parent: VisualNetwork, color: string = undefined, subnets: [VisualNetwork, VisualNetwork] = [undefined, undefined], block: HTMLElement = undefined, treeText: HTMLElement = undefined) {
		this.address = address;
		this.parent = parent;
		this.color = color;
		this.subnets = subnets;
		this.block = block;
		this.treeText = treeText;
	}

	/**
	 * Returns whether this Visual Network has any subnets.
	 */
	public hasSubnets(): boolean {
		return this.subnets[0] !== undefined && this.subnets[1] !== undefined;
	}

	/**
	 * Prepares all the DOM elements.
	 */
	public prepElements(): void {

		if (this.block === undefined)
			this.block = document.createElement("div");

		if (this.treeText === undefined)
			this.treeText = document.createElement("span");

		this.block.className = "subnet-block " + this.color;

		let desc = this.address.toString() + " (" + (this.address.numberOfHosts()).toLocaleString() + " host" + (this.address.numberOfHosts() == 1 ? '' : 's') + ")";

		this.block.addEventListener("mouseover", function () {
			tooltip.textContent = desc;
			tooltip.style.opacity = "1";
			tooltip.style.transform = "scaleY(1)";
		});

		this.treeText.textContent = desc;
		this.treeText.className = "subnet-divide " + this.color;

		if (this.address.getMaskShort() === 32) {
			this.treeText.classList.add("disabled");
		}

		let net = this;

		if (this.address.getMaskShort() != 32) {
			
			this.treeText.addEventListener("click", function () {
				if (net.hasSubnets()) {
					if ((!net.subnets[0].hasSubnets() && !net.subnets[1].hasSubnets()) ||
						confirm("Tem certeza de quer fundir essas duas sub-redes?\nTodas as sub-redes dessas duas serão apagadas para sempre.")) {

						if (!net.merge())
							alert("Você não pode fundir essas sub-redes");
					}
				}
				else {
					if (!net.divide())
						alert("Você não pode dividir essa rede");
				}
				net.block.classList.add("highlight");
			});
		}

		this.treeText.addEventListener("mouseover", function () {
			net.block.classList.add("highlight");
		});

		this.treeText.addEventListener("mouseleave", function () {
			net.block.classList.remove("highlight");
		});

	}

	/**
	 * Recursively returns the first (non split) subnet in this network.
	 */
	public firstSubnet(): VisualNetwork {

		if (this.subnets[0])
			return this.subnets[0].firstSubnet();
		else
			return this;
	}
	
	/**
	 * Recursively returns the last (non split) subnet in this network.
	 */
	public lastSubnet(): VisualNetwork {

		if (this.subnets[1])
			return this.subnets[1].lastSubnet();
		else
			return this;
	}

	/**
	 * Returns this network's previous sibling.
	 */
	public subnetBefore(): VisualNetwork {

		if (this.parent) {
			if (this.parent.subnets[0] === this) {
				return this.parent.subnetBefore();
			}
			else {
				return this.parent.subnets[0].lastSubnet();
			}
		}
		else {
			return undefined;
		}
	}

	/**
	 * Returns this network's next sibling.
	 */
	public subnetAfter(): VisualNetwork {

		if (this.parent) {
			if (this.parent.subnets[1] === this) {
				return this.parent.subnetAfter();
			}
			else {
				return this.parent.subnets[1].firstSubnet();
			}
		}
		else {
			return undefined;
		}
	}

	/**
	 * Splits this network into subnets. Returns false on failure.
	 */
	public divide(): boolean {

		if (this.address.getMaskShort() < 32 && !this.hasSubnets()) {

			COLOR_QUEUE.unshift(COLOR_QUEUE[COLOR_QUEUE.length - 1]);
			COLOR_QUEUE.pop();

			let colorList = COLOR_QUEUE.slice();

			let before = this.subnetBefore();
			let after = this.subnetAfter();

			removeItem(colorList, this.color);
			if (before) removeItem(colorList, before.color);
			if (after) removeItem(colorList, after.color);

			let color = colorList[0];

			let subnetAddresses = this.address.subdivide();

			let sub1 = new VisualNetwork(subnetAddresses[0], this, this.color);
			let sub2 = new VisualNetwork(subnetAddresses[1], this, color);

			let tmpBlock = this.block.cloneNode(true) as HTMLElement;
			this.block.parentNode.replaceChild(tmpBlock, this.block);
			this.block = tmpBlock;

			sub1.prepElements();
			sub2.prepElements();

			this.subnets[0] = sub1;
			this.subnets[1] = sub2;

			this.block.appendChild(sub1.block);
			this.block.appendChild(sub2.block);

			let ul = document.createElement("ul");
			let li1 = document.createElement("li");
			let li2 = document.createElement("li");

			li1.appendChild(sub1.treeText);
			li2.appendChild(sub2.treeText);

			ul.appendChild(li1);
			ul.appendChild(li2);

			this.treeText.parentNode.appendChild(ul);

			this.block.className = "subnet-block";
			this.treeText.className = "subnet-merge";

			return true;
		}
		return false;

	}

	/**
	 * Merges this network's subnets. Returns false on failure.
	 */
	public merge(): boolean {

		if (this.hasSubnets()) {

			COLOR_QUEUE.push(COLOR_QUEUE[0]);
			COLOR_QUEUE.shift();

			this.subnets = [undefined, undefined];

			while (this.block.lastChild)
				this.block.removeChild(this.block.lastChild);

			let uls = (this.treeText.parentNode as HTMLElement).getElementsByTagName('ul');

			for (let i = 0; i < uls.length; i++) {
				while (uls[i].lastChild)
					uls[i].removeChild(uls[i].lastChild);

				uls[i].remove();
			}

			let tmpBlock = this.block.cloneNode(true) as HTMLElement;
			this.block.parentNode.replaceChild(tmpBlock, this.block);
			this.block = tmpBlock;

			let tmpTree = this.treeText.cloneNode(true) as HTMLElement;
			this.treeText.parentNode.replaceChild(tmpTree, this.treeText);
			this.treeText = tmpTree;

			this.prepElements();
			return true;
		}
		else {
			return false;
		}
	}

}

// +==============================================+

id("address").addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter")
		reset();
});

id("button_generate").addEventListener("click", function (ev: MouseEvent): void {
	reset();
});