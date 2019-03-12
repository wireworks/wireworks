// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-03-11)

import { id, clearChildren } from "../../core/utils/dom";
import { ERROR_ADDRESS_PARSE, Address } from "../../core/networking/layers/layer-3/address";
import { ERROR_BYTE_RANGE } from "../../core/networking/byte";
import { ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE, Domain } from "../../core/networking/layers/layer-5/domain";
import { make } from "../../core/utils/dom";

const errorWrapper = id("error_wrapper");
const treeWrapper = id("tree_wrapper");
let rootDomain = new Domain(".", undefined);

/**
 * Refreshes the whole tree.
 */
function refreshTree(): void {

	function loadTree(domain: Domain, element: HTMLElement) {

		element.appendChild(make("span", "domain", domain.toString()));

		let list = make("ul");

		for (let i = 0; i < domain.getSubdomains().length; i++) {
			const sub = domain.getSubdomains()[i];
			let item = make("li");
			loadTree(sub, item);
			list.appendChild(item);
		}

		element.appendChild(list);

	}	

	let rootTree = make("li");

	loadTree(rootDomain, rootTree);

	clearChildren(treeWrapper);
	treeWrapper.appendChild(rootTree);

}

/**
 * Registers a domain.
 */
function register(): void {

	let oldTable = id('error');

	if (oldTable !== null) {
		oldTable.remove();
	}

	let errStr: string = undefined;

	try {

		let address = new Address((<HTMLInputElement>id('address')).value);

		let parts = (<HTMLInputElement>id('domain')).value.trim().split(".");

		let tmpRoot = new Domain(".", undefined);
		let curr: Domain = tmpRoot;

		for (let i = parts.length-1; i >= 0; i--) {

			if (parts[i].length === 0) {
				let err = new Error();
				err.name = ERROR_INVALID_LABEL;
				throw err;
			}

			let next = new Domain(parts[i], curr);
			curr.getSubdomains().push(next);
			curr = next;

		}

		curr.setAddress(address);

		rootDomain.merge(tmpRoot, "override");

		refreshTree();

	} catch (error) {

		let table = document.createElement('table');
		table.id = "error";

		if (!errStr) {

			switch (error.name) {
				case ERROR_ADDRESS_PARSE:
					errStr = "O endereço deve possuir o formato 0.0.0.0.";
					break;
				case ERROR_BYTE_RANGE:
					errStr = "Um ou mais octetos do endereço possui um valor alto demais (deve estar entre 0-255).";
					break;
				case ERROR_INVALID_LABEL:
					errStr = "Esse domínio possui um nome inválido.";
					break;
				case ERROR_FULL_NAME_RANGE:
					errStr = "Esse domínio possui um nome grande demais.";
					break;
				default:
					errStr = "Erro desconhecido (" + error.name + ")."
					console.error(error);
					break;
			}

		}

		table.innerHTML = `
				<td>
					<h2 class="font-mono text-danger">Entrada inválida. ${errStr}</h2>
				</td>
			`;

		errorWrapper.appendChild(table);

	}
	
}

// +==============================================+

id("address").addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter")
		register();
});

id("domain").addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter")
		register();
});

id("button_add").addEventListener("click", function (ev: MouseEvent): void {
	register();
});