// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-03-11)

import { id, clearChildren } from "../../core/utils/dom";
import { ERROR_ADDRESS_PARSE, Address } from "../../core/networking/layers/layer-3/address";
import { ERROR_BYTE_RANGE } from "../../core/networking/byte";
import { ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE, Domain } from "../../core/networking/layers/layer-5/domain";
import { make } from "../../core/utils/dom";

const domainErrorWrapper = id("domain_error_wrapper");
const siteErrorWrapper = id("site_error_wrapper");
const rootTree = id("root_tree");
let rootDomain = new Domain(".", undefined);
let browser = id("browser");
let pageLoaded = id("page_loaded");
let pageNxdomain = id("page_nxdomain");
let pageTimedout = id("page_timedout");
let header = id("loaded_header");
let addressBar = id("address_bar");
let domainName = id("domain_name");
let domainAddress = id("domain_address");
let siteTitle = id("site_title");
let siteAddress = id("site_address");
let sitesWrapper = id("sites_wrapper");
let sites: {name: string, address: Address, color: string}[] = [];

function refreshPage() {

	try {
		
		addressBar.classList.remove("address-error");

		let tmpRoot = new Domain(".", undefined);
		let domain = extractDomain(tmpRoot, (<HTMLInputElement>addressBar).value);

		let tmpCurr: Domain = tmpRoot;
		let curr: Domain = rootDomain;

		let exit = false;

		while (!exit) {
			
			tmpCurr = tmpCurr.getSubdomains()[0];
			curr = curr.getSubdomain(tmpCurr.getLabel());

			if (!curr || curr.getLabel() == domain.getLabel()) {
				exit = true;
			}

		}

		pageLoaded.classList.add("hidden");
		pageNxdomain.classList.add("hidden");
		pageTimedout.classList.add("hidden");

		if (curr) {
			
			browser.style.cursor = "progress";
			addressBar.style.cursor = "progress";

			setTimeout(() => {
				
				// "hashes" a string to a "random" number

				let seed = 0;
				let fullName = curr.getFullName();

				for (let i = 0; i < fullName.length; i++) {
					seed += fullName.charCodeAt(i) * Math.pow(10, i);
				}

				let fakeRandom = Math.sin(seed) * 10000;
				fakeRandom -= Math.floor(fakeRandom);

				header.className = "style-" + Math.floor(fakeRandom * 6);
				header.textContent = fullName;

				pageLoaded.classList.remove("hidden");

				browser.style.cursor = "initial";
				addressBar.style.cursor = "initial";

			}, 500);

		}

		else {

			browser.style.cursor = "progress";
			addressBar.style.cursor = "progress";

			setTimeout(() => {

				pageNxdomain.classList.remove("hidden");
				browser.style.cursor = "initial";
				addressBar.style.cursor = "initial";

			}, 1000);

		}


	} catch (error) {

		console.error(error);
		
		addressBar.classList.add("address-error");

	}		

}

/**
 * Refreshes the whole tree.
 */
function refreshTree(): void {

	function loadTree(domain: Domain, element: HTMLElement) {

		let domainDOM = make("div", "domain");
		domainDOM.appendChild(make("span", "label", domain.toString()));
		if (domain.getAddress()) {
			domainDOM.appendChild(make("span", "address", domain.getAddress().toString(true)));
		}

		element.appendChild(domainDOM);

		let list = make("ul");

		for (let i = 0; i < domain.getSubdomains().length; i++) {
			const sub = domain.getSubdomains()[i];
			let item = make("li");
			loadTree(sub, item);
			list.appendChild(item);
		}

		element.appendChild(list);

	}	

	clearChildren(rootTree);
	loadTree(rootDomain, rootTree);

}

function extractDomain(tmpRoot: Domain, fullName: string): Domain {

	let parts = fullName.trim().split(".");

	let curr: Domain = tmpRoot;

	for (let i = parts.length - 1; i >= 0; i--) {

		if (parts[i].length === 0) {
			let err = new Error();
			err.name = ERROR_INVALID_LABEL;
			throw err;
		}

		let next = new Domain(parts[i], curr);
		curr.getSubdomains().push(next);
		curr = next;

	}

	return curr;

}

function createSite() {

	let oldTable = id('site_error');

	if (oldTable !== null) {
		oldTable.remove();
	}

	let errStr: string = undefined;

	try {

		let address = new Address((<HTMLInputElement>siteAddress).value);

		for (let i = 0; i < sites.length; i++) {
			if (sites[i].address.compare(address)) {
				errStr = "Já existe um site com esse endereço.";
				throw Error();
			}
		}

		let name = (<HTMLInputElement>siteTitle).value.trim();

		if (name === "") {
			errStr = "Insira o nome do site.";
			throw Error();
		}		

		let site = {
			name: name,
			address: address,
			color: "style-" + Math.floor(Math.random() * 6)
		};

		sites.push(site);

		let liDOM = make("li");
		let spacerDOM = make("div", "spacer");
		let contentDOM = make("div");
		let siteTitleDOM = make("span", "font-medium font-bold site-name", name);
		let siteAddressDOM = make("span", "font-medium font-light", address.toString(true));
		let deleteDOM = make("i", "fas fa-trash fa-lg site-delete");

		deleteDOM.addEventListener("click", function(ev: MouseEvent) {
			sites.splice(sites.indexOf(site), 1);
			liDOM.remove();
		});

		contentDOM.appendChild(siteTitleDOM);
		contentDOM.appendChild(siteAddressDOM);

		spacerDOM.appendChild(contentDOM);
		spacerDOM.appendChild(deleteDOM);

		liDOM.appendChild(spacerDOM);

		sitesWrapper.appendChild(liDOM);

	} catch (error) {

		let table = document.createElement('table');
		table.id = "site_error";

		if (!errStr) {

			switch (error.name) {
				case ERROR_ADDRESS_PARSE:
					errStr = "O endereço deve possuir o formato 0.0.0.0.";
					break;
				case ERROR_BYTE_RANGE:
					errStr = "Um ou mais octetos do endereço possui um valor alto demais (deve estar entre 0-255).";
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

		siteErrorWrapper.appendChild(table);

	}

}


/**
 * Registers a domain.
 */
function registerDomain(): void {

	let oldTable = id('domain_error');

	if (oldTable !== null) {
		oldTable.remove();
	}

	let errStr: string = undefined;

	try {

		let tmpRoot = new Domain(".", undefined);

		let domain = extractDomain(tmpRoot, (<HTMLInputElement>domainName).value);

		let address = new Address((<HTMLInputElement>domainAddress).value);

		domain.setAddress(address);

		rootDomain.merge(tmpRoot, "merge");

		refreshTree();

	} catch (error) {

		let table = document.createElement('table');
		table.id = "domain_error";

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

		domainErrorWrapper.appendChild(table);

	}
	
}

// +==============================================+

id("domain_address").addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter")
		registerDomain();
});

id("domain_name").addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter")
		registerDomain();
});

id("button_add_domain").addEventListener("click", function (ev: MouseEvent): void {
	registerDomain();
});

id("site_title").addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter")
		createSite();
});

id("site_address").addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter")
		createSite();
});

id("button_add_site").addEventListener("click", function (ev: MouseEvent): void {
	createSite();
});

addressBar.addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter"){
		refreshPage();
		addressBar.blur();
	}
});

id("button_refresh").addEventListener("click", function (ev: MouseEvent): void {
	refreshPage();
});