// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-03-14)

import React, { Component } from "react";
import "sass/pages/dnstree.scss";
import { id, make, clearChildren } from "../../../wireworks/utils/dom";
import { Address, ERROR_ADDRESS_PARSE } from "../../../wireworks/networking/layers/layer-3/address";
import { Domain, ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE } from "../../../wireworks/networking/layers/layer-5/domain";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";

let rootDomain = new Domain(".", undefined);

let domainErrorWrapperDOM: HTMLElement;
let siteErrorWrapperDOM: HTMLElement;
let rootTreeDOM: HTMLElement;
let browserDOM: HTMLElement;
let pageLoadedDOM: HTMLElement;
let pageNxdomainDOM: HTMLElement;
let nxdomainDescriptionDOM: HTMLElement;
let pageTimedoutDOM: HTMLElement;
let timedoutDescriptionDOM: HTMLElement;
let headerDOM: HTMLElement;
let addressBarDOM: HTMLElement;
let domainNameDOM: HTMLElement;
let domainAddressDOM: HTMLElement;
let siteTitleDOM: HTMLElement;
let siteAddressDOM: HTMLElement;
let sitesWrapperDOM: HTMLElement;

export function init() {
	domainErrorWrapperDOM = id("domain_error_wrapper");
	siteErrorWrapperDOM = id("site_error_wrapper");
	rootTreeDOM = id("root_tree");
	browserDOM = id("browser");
	pageLoadedDOM = id("page_loaded");
	pageNxdomainDOM = id("page_nxdomain");
	nxdomainDescriptionDOM = id("nxdomain_description");
	pageTimedoutDOM = id("page_timedout");
	timedoutDescriptionDOM = id("timedout_description");
	headerDOM = id("loaded_header");
	addressBarDOM = id("address_bar");
	domainNameDOM = id("domain_name");
	domainAddressDOM = id("domain_address");
	siteTitleDOM = id("site_title");
	siteAddressDOM = id("site_address");
	sitesWrapperDOM = id("sites_wrapper");

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

}

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

			let str = (addressBarDOM as HTMLInputElement).value;

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
			domain = Domain.extractDomain(tmpRoot, (addressBarDOM as HTMLInputElement).value);

			let tmpCurr: Domain = tmpRoot;
			let curr: Domain = rootDomain;

			let exit = false;

			while (!exit) {
				
				tmpCurr = tmpCurr.getSubdomains()[0];
				curr = curr.getSubdomain(tmpCurr.getLabel());

				if (!curr || curr.getFullName() == domain.getFullName()) {
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
				if (domain.getSubdomains().length === 0 || window.confirm("Tem certeza de quer remover esse domínio?\nTodos os seus subdomínios também serão removidos.")) {
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
 * Creates a fake website from user input.
 */
function createSite(): void {

	let oldTable = id('site_error');

	if (oldTable !== null) {
		oldTable.remove();
	}

	let errStr: string = undefined;

	try {

		let name = (siteTitleDOM as HTMLInputElement).value.trim();

		if (name === "") {
			errStr = "Insira o nome do site.";
			throw Error();
		}

		let address = new Address((siteAddressDOM as HTMLInputElement).value);

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

		let fullName = (domainNameDOM as HTMLInputElement).value;

		if (fullName === "localhost") {
			errStr = "Você não pode usar esse nome.";
			throw Error();
		} else {
			let domain = Domain.extractDomain(tmpRoot, fullName);
			let addressStr = (domainAddressDOM as HTMLInputElement).value.trim();

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

class DnsTree extends Component {

    componentDidMount() {

		document.body.className = "theme-layer5";
        init();

    }

    render () {
        return (
			<main>

				<div className="browser" id="browser">
					<div className="top-bar">
						<div className="previous disabled" id="button_previous"><i className="fas fa-arrow-left fa-lg"></i></div>
						<div className="next disabled" id="button_next"><i className="fas fa-arrow-right fa-lg"></i></div>
						<div className="reload" id="button_refresh"><i className="fas fa-redo-alt fa-lg"></i></div>
						<input type="text" name="address_bar" id="address_bar" className="address-bar"/>
					</div>
					<div className="browser-content">
						
						<div className="page hidden" id="page_loaded">
							<h1 className="style-0" id="loaded_header">www.example.com</h1>
							<div className="separator"></div>
							<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae expedita dolorem eligendi perferendis voluptatem doloribus illo labore culpa.</p>
						</div>

						<div className="page hidden" id="page_nxdomain">
							<img src="../../../images/unreachable.png"/>
							<h2 className="font-bold">Não é possível acessar esse site</h2>
							<h3 className="text-light" id="nxdomain_description">Domínio inexistente</h3>
						</div>

						<div className="page hidden" id="page_timedout">
							<img src="../../../images/unreachable.png"/>
							<h2 className="font-bold">Não é possível acessar esse site</h2>
							<h3 className="text-light" id="timedout_description">O host demorou muito tempo para responder</h3>
						</div>

					</div>
				</div>
				
				<h1 className="text-light">Criação de Websites</h1>

				<div className="hbox align-end">
					<div>
						<label htmlFor="site_title">Título</label>
						<h1>
							<input type="text" name="site_title" id="site_title" placeholder="Nome do Website"/>
						</h1>
					</div>
					<div>
						<label htmlFor="site_address">Endereço</label>
						<h1>
							<input type="text" name="site_address" id="site_address" placeholder="0.0.0.0"/>
						</h1>
					</div>
					<button type="button" className="mb-3" id="button_add_site">Criar</button>
				</div>

				<div id="site_error_wrapper"></div>

				<ul className="collection" id="sites_wrapper"></ul>

				<h1 className="text-light">Registro de Domínios</h1>

				<div className="hbox align-end">
					<div>
						<label htmlFor="domain_name">Domínio</label>
						<h1>
							<input type="text" name="domain_name" id="domain_name" placeholder="www.exemplo.com.br"/>
						</h1>
					</div>
					<div>
						<label htmlFor="domain_address">Endereço</label>
						<h1>
							<input type="text" name="domain_address" id="domain_address" placeholder="0.0.0.0"/>
						</h1>
					</div>
					<button type="button"  className="mb-3" id="button_add_domain">Registrar</button>
				</div>

				<div id="domain_error_wrapper"></div>

				<div className="domain-tree" id="root_tree"></div>

			</main>
        );
    }
}

export default DnsTree;