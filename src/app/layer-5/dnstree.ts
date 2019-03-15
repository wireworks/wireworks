// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-03-13)

import { id, clearChildren } from "../../core/utils/dom";
import { ERROR_ADDRESS_PARSE, Address } from "../../core/networking/layers/layer-3/address";
import { ERROR_BYTE_RANGE } from "../../core/networking/byte";
import { ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE, Domain } from "../../core/networking/layers/layer-5/domain";
import { make } from "../../core/utils/dom";

let rootDomain = new Domain(".", undefined);

const domainErrorWrapperDOM = id("domain_error_wrapper");
const siteErrorWrapperDOM = id("site_error_wrapper");
const rootTreeDOM = id("root_tree");
const browserDOM = id("browser");
const pageLoadedDOM = id("page_loaded");
const pageNxdomainDOM = id("page_nxdomain");
const nxdomainDescriptionDOM = id("nxdomain_description");
const pageTimedoutDOM = id("page_timedout");
const timedoutDescriptionDOM = id("timedout_description");
const headerDOM = id("loaded_header");
const addressBarDOM = id("address_bar");
const domainNameDOM = id("domain_name");
const domainAddressDOM = id("domain_address");
const siteTitleDOM = id("site_title");
const siteAddressDOM = id("site_address");
const sitesWrapperDOM = id("sites_wrapper");

/**
 * An alias that represents a fake website. Used only for DNSTree.
 */
type Site = {
	name: string,
	address: Address,
	color: string
};

let sites: Site[] = [];

/**
 * Refreshes the fake browser window.
 */
function refreshBrowser(): void {

	try {

		let foundAddress: Address = undefined;
		let domain: Domain = undefined;
		let alreadyLoaded: boolean = false;

		pageLoadedDOM.classList.add("hidden");
		pageNxdomainDOM.classList.add("hidden");
		pageTimedoutDOM.classList.add("hidden");

		browserDOM.style.cursor = "progress";
		addressBarDOM.style.cursor = "progress";

		try {

			let str = ( < HTMLInputElement > addressBarDOM).value;

			if (str === "localhost") {
				alreadyLoaded = true;
				setTimeout(() => {

					timedoutDescriptionDOM.innerHTML = `<span class="font-bold">localhost</span> demorou muito para responder.`;

					pageTimedoutDOM.classList.remove("hidden");
					browserDOM.style.cursor = "initial";
					addressBarDOM.style.cursor = "initial";

				}, 2000);
			} else {
				foundAddress = new Address(str);
			}

		} catch (error) {
			addressBarDOM.classList.remove("address-error");

			let tmpRoot = new Domain(".", undefined);
			domain = extractDomain(tmpRoot, ( < HTMLInputElement > addressBarDOM).value);

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

			if (curr) {
				foundAddress = curr.getAddress();
			}

		}

		if (!alreadyLoaded) {
			
			if (foundAddress) {

				let exists = false;
				let site: Site = undefined;

				for (let i = 0; !exists && i < sites.length; i++) {
					site = sites[i];
					if (site.address.compare(foundAddress)) {
						exists = true;
					}
				}

				if (exists) {

					setTimeout(() => {

						headerDOM.className = site.color;
						headerDOM.textContent = site.name;

						pageLoadedDOM.classList.remove("hidden");

						browserDOM.style.cursor = "initial";
						addressBarDOM.style.cursor = "initial";

					}, 500);

				} else {

					setTimeout(() => {

						if (domain) {
							timedoutDescriptionDOM.innerHTML = `<span class="font-bold">${domain.getFullName()}</span> demorou muito para responder.`;
						} else {
							timedoutDescriptionDOM.innerHTML = `<span class="font-bold">${foundAddress.toString(true)}</span> demorou muito para responder.`;
						}

						pageTimedoutDOM.classList.remove("hidden");
						browserDOM.style.cursor = "initial";
						addressBarDOM.style.cursor = "initial";

					}, 2000);

				}

			} else {

				setTimeout(() => {

					if (domain) {
						nxdomainDescriptionDOM.innerHTML = `Não foi possível encontrar o endereço IP do servidor de <span class="font-bold">${domain.getFullName()}</span>.`;
					} else {
						nxdomainDescriptionDOM.innerHTML = `Não foi possível encontrar o endereço IP do servidor.`;
					}

					pageNxdomainDOM.classList.remove("hidden");
					browserDOM.style.cursor = "initial";
					addressBarDOM.style.cursor = "initial";

				}, 1000);

			}

		}

	} catch (error) {

		console.error(error);

		addressBarDOM.classList.add("address-error");
		browserDOM.style.cursor = "initial";
		addressBarDOM.style.cursor = "initial";

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

		if (domain.getParent()) {
			let btn = make("i", "fas fa-trash fa-lg domain-delete");
			btn.addEventListener("click", function (ev: MouseEvent) {
				if (domain.getSubdomains().length === 0 || confirm("Tem certeza de quer remover esse domínio?\nTodos os seus subdomínios também serão removidos.")) {
					domain.setAddress(undefined);
					domain.setParent(undefined, false, true);
					refreshTree();
				}
			});
			domainDOM.appendChild(btn);
		}

		if (domain.getAddress()) {
			let btn = make("i", "fas fa-trash fa-lg domain-address-delete");
			btn.addEventListener("click", function (ev: MouseEvent) {
				domain.setAddress(undefined);
				refreshTree();
			});
			domainDOM.appendChild(btn);
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

	clearChildren(rootTreeDOM);

	if (rootDomain.getSubdomains().length > 0) {
		loadTree(rootDomain, rootTreeDOM);
	}

}

/**
 * Extracts a Domain from a string, in the format abc.def.ghi. Returns the last subdomain.
 * @param  {Domain} root The root domain to be used.
 * @param  {string} fullName The full name of the domain, in the format abc.def.ghi.
 */
function extractDomain(root: Domain, fullName: string): Domain {

	let parts = fullName.trim().split(".");

	let curr: Domain = root;

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

/**
 * Creates a fake website from user input.
 */
function createSite(): void {

	let oldTable = id('site_error');

	if (oldTable !== null) {
		oldTable.remove();
	}

	let errStr: string = undefined;

	try {

		let name = (<HTMLInputElement>siteTitleDOM).value.trim();

		if (name === "") {
			errStr = "Insira o nome do site.";
			throw Error();
		}

		let address = new Address(( < HTMLInputElement > siteAddressDOM).value);

		for (let i = 0; i < sites.length; i++) {
			if (sites[i].address.compare(address)) {
				errStr = "Já existe um site com esse endereço.";
				throw Error();
			}
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
		let titleDOM = make("span", "font-medium font-bold site-name", name);
		let addressDOM = make("span", "font-medium font-light", address.toString(true));
		let deleteDOM = make("i", "fas fa-trash fa-lg site-delete");

		deleteDOM.addEventListener("click", function (ev: MouseEvent) {
			sites.splice(sites.indexOf(site), 1);
			liDOM.remove();
		});

		contentDOM.appendChild(titleDOM);
		contentDOM.appendChild(addressDOM);

		spacerDOM.appendChild(contentDOM);
		spacerDOM.appendChild(deleteDOM);

		liDOM.appendChild(spacerDOM);

		sitesWrapperDOM.appendChild(liDOM);

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

		siteErrorWrapperDOM.appendChild(table);

	}

}

/**
 * Registers a domain, from user input.
 */
function registerDomain(): void {

	let oldTable = id('domain_error');

	if (oldTable !== null) {
		oldTable.remove();
	}

	let errStr: string = undefined;

	try {

		let tmpRoot = new Domain(".", undefined);

		let fullName = ( < HTMLInputElement > domainNameDOM).value;

		if (fullName === "localhost") {
			errStr = "Você não pode usar esse nome.";
			throw Error();
		} else {
			let domain = extractDomain(tmpRoot, fullName);
			let addressStr = ( < HTMLInputElement > domainAddressDOM).value.trim();

			if (addressStr !== "") {
				let address = new Address(addressStr);
				domain.setAddress(address);
			} else {
				domain.setAddress(undefined);
			}

			rootDomain.merge(tmpRoot, "merge");

			refreshTree();
		}

	} catch (error) {

		let table = document.createElement('table');
		table.id = "domain_error";

		console.error(error);

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

		domainErrorWrapperDOM.appendChild(table);

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

addressBarDOM.addEventListener("keydown", function (ev: KeyboardEvent): void {
	if (ev.key === "Enter") {
		refreshBrowser();
		addressBarDOM.blur();
	}
});

id("button_refresh").addEventListener("click", function (ev: MouseEvent): void {
	refreshBrowser();
});