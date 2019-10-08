// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 2.0 (2019-08-28)

import React, { Component, RefObject } from "react";
import "src/sass/pages/dnstree.scss";
import failImage from "../../../../images/layers/5/unreachable.png";
import { Address, ERROR_ADDRESS_PARSE } from "../../../wireworks/networking/layers/layer-3/address";
import { Domain, ERROR_INVALID_LABEL, ERROR_FULL_NAME_RANGE } from "../../../wireworks/networking/layers/layer-5/domain";
import { ERROR_BYTE_RANGE } from "../../../wireworks/networking/byte";
import ErrorBox from "../../../components/ErrorBox";

/**
 * An alias that represents a fake website. Used only for DNSTree.
 */
type Site = {
	name: string,
	address: Address,
	style: string
};

// +==============================================+

class DnsTree extends Component {

	private txtSiteTitle: RefObject<HTMLInputElement>;
	private txtSiteAddress: RefObject<HTMLInputElement>;
	private txtDomainName: RefObject<HTMLInputElement>;
	private txtDomainAddress: RefObject<HTMLInputElement>;
	private sites: Site[] = [];

	state = {
		siteErrorMessage: null as string,
		domainErrorMessage: null as string,
		sites: undefined as Site[],
		rootDomain: new Domain(".", undefined)
	};

	/**
	 * Creates a fake website from user input.
	 */
	public createSite = () => {

		let errStr: string = undefined;

		try {

			let name = this.txtSiteTitle.current.value.trim();

			if (name === "") {
				errStr = "Insira o nome do site.";
				throw Error();
			}

			let address = new Address(this.txtSiteAddress.current.value);

			for (let i = 0; i < this.sites.length; i++) {
				if (this.sites[i].address.compare(address)) {
					errStr = "Já existe um site com esse endereço.";
					throw Error();
				}
			}
			
			let site = {
				name: name,
				address: address,
				style: "style-" + Math.floor(Math.random() * 6)
			};

			this.sites.push(site);
			this.setState({sites: this.sites, siteErrorMessage: null});

		} catch (error) {

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

			this.setState({siteErrorMessage: "Entrada Inválida. " + errStr});

		}

	}

	/**
	 * Removes a site from a fake "internet".
	 */
	public removeSite = (site: Site) => {
		this.sites.splice(this.sites.indexOf(site), 1);
		this.setState({sites: this.sites});
	}

	/**
	 * Registers a domain, from user input.
	 */
	public registerDomain = () => {

		let errStr: string = undefined;

		try {

			let tmpRoot = new Domain(".", undefined);

			let fullName = this.txtDomainName.current.value;

			if (fullName === "localhost") {
				errStr = "Você não pode usar esse nome.";
				throw Error();
			} else {
				let domain = Domain.extractDomain(tmpRoot, fullName);
				let addressStr = this.txtDomainAddress.current.value.trim();

				if (addressStr !== "") {
					let address = new Address(addressStr);
					domain.setAddress(address);
				} else {
					domain.setAddress(undefined);
				}

				this.state.rootDomain.merge(tmpRoot, "merge");

				this.setState({rootDomain: this.state.rootDomain, domainErrorMessage: null});

			}

		} catch (error) {

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

			this.setState({domainErrorMessage: "Entrada inválida. " + errStr})

		}

	}

	/**
	 * Removes a domain from the known domains list.
	 */
	public removeDomain = (domain: Domain) => {
		if (domain.getSubdomains().length === 0 || window.confirm("Tem certeza de quer remover esse domínio?\nTodos os seus subdomínios também serão removidos.")) {
			domain.setAddress(undefined);
			domain.setParent(undefined, false, true);
			this.setState({rootDomain: this.state.rootDomain});
		}
	}

	/**
	 * Unbinds the IP address from a domain.
	 */
	public removeDomainAddress = (domain: Domain) => {
		domain.setAddress(undefined);
		this.setState({rootDomain: this.state.rootDomain});
	}
	
	constructor(props: any) {
		super(props);
		this.state.sites = this.sites;
		this.txtSiteTitle = React.createRef();
		this.txtSiteAddress = React.createRef();
		this.txtDomainName = React.createRef();
		this.txtDomainAddress = React.createRef();
	}

    render () {
        return (
			<main>

				<FakeBrowser sites={this.state.sites} rootDomain={this.state.rootDomain}/>
				
				<h1 className="text-light">Criação de Websites</h1>

				<div className="hbox align-end mb-3">
					<div>
						<label htmlFor="site_title">Título</label>
						<div>
							<input type="text" id="site_title" ref={this.txtSiteTitle} onKeyDown={ (ev) => { if(ev.key === "Enter") this.createSite() }} placeholder="Nome do Website"/>
						</div>
					</div>
					<div>
						<label htmlFor="site_address">Endereço</label>
						<div>
							<input type="text" id="site_address" ref={this.txtSiteAddress} onKeyDown={ (ev) => { if(ev.key === "Enter") this.createSite() }} placeholder="0.0.0.0"/>
						</div>
					</div>
					<button type="button" onClick={this.createSite}>Criar</button>
				</div>

				<ErrorBox errorMessage={this.state.siteErrorMessage}/>

				<SiteList sites={this.state.sites} removeSite={this.removeSite}/>				

				<h1 className="text-light">Registro de Domínios</h1>

				<div className="hbox align-end mb-3">
					<div>
						<label htmlFor="domain_name">Domínio</label>
						<div>
							<input type="text" id="domain_name" ref={this.txtDomainName} onKeyDown={ (ev) => { if(ev.key === "Enter") this.registerDomain() }} placeholder="www.exemplo.com.br"/>
						</div>
					</div>
					<div>
						<label htmlFor="domain_address">Endereço</label>
						<div>
							<input type="text" id="domain_address" ref={this.txtDomainAddress} onKeyDown={ (ev) => { if(ev.key === "Enter") this.registerDomain() }} placeholder="0.0.0.0"/>
						</div>
					</div>
					<button type="button" onClick={this.registerDomain}>Registrar</button>
				</div>

				<ErrorBox errorMessage={this.state.domainErrorMessage}/>

				<DomainTree rootDomain={this.state.rootDomain} removeDomain={this.removeDomain} removeDomainAddress={this.removeDomainAddress}/>

			</main>
        );
    }
}

export default DnsTree;

interface FakeBrowserProps {
	sites: Site[],
	rootDomain: Domain
}

/**
 * A component that represents a fake internet browser.
 */
class FakeBrowser extends Component<FakeBrowserProps> {

	/**
	 * The reference to the browser's address bar.
	 */
	private addressBar: RefObject<HTMLInputElement>;

	state = {
		pageStatus: undefined as undefined | "loaded" | "failed",
		addressError: false,
		pageStyle: "",
		pageTitle: "",
		failMessage: null,
		loading: false
	};

	/**
	 * Refreshes the browser.
	 */
	private refreshBrowser = () => {

		try {

			let foundAddress: Address = undefined;
			let domain: Domain = undefined;
			let alreadyLoaded: boolean = false;
		
			this.setState({
				loading: true,
				addressError: false,
				pageStatus: undefined
			});
	
			try {
	
				let str = this.addressBar.current.value;
	
				if (str === "localhost") {
					alreadyLoaded = true;
					setTimeout(() => {
	
						this.setState({
							loading: false,
							pageStatus: "failed",
							failMessage: <><span className="font-bold">localhost</span> demorou muito para responder.</>
						});

	
					}, 2000);
				} else {
					foundAddress = new Address(str);
				}
	
			} catch (error) {
	
				let tmpRoot = new Domain(".", undefined);
				domain = Domain.extractDomain(tmpRoot, this.addressBar.current.value);
	
				let tmpCurr: Domain = tmpRoot;
				let curr: Domain = this.props.rootDomain;
	
				let exit = false;
	
				while (!exit) {
					
					tmpCurr = tmpCurr.getSubdomains()[0];
					curr = curr.getSubdomain(tmpCurr.getLabel());
	
					if (!curr || curr.getFullName() === domain.getFullName()) {
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
	
					for (let i = 0; !exists && i < this.props.sites.length; i++) {
						site = this.props.sites[i];
						if (site.address.compare(foundAddress)) {
							exists = true;
						}
					}
	
					if (exists) {
	
						setTimeout(() => {

							this.setState({
								loading: false,
								pageStatus: "loaded",
								pageStyle: site.style,
								pageTitle: site.name
							});
	
						}, 500);
	
					} else {
	
						setTimeout(() => {

							let displayName = domain ? domain.getFullName() : foundAddress.toString(true);
	
							this.setState({
								loading: false,
								pageStatus: "failed",
								failMessage: <><span className="font-bold">{displayName}</span> demorou muito para responder.</>
							});
	
						}, 2000);
	
					}
	
				} else {
	
					setTimeout(() => {
	
						this.setState({
							loading: false,
							pageStatus: "failed",
							failMessage: <>Não foi possível encontrar o endereço IP do servidor de <span className="font-bold">{domain.getFullName()}</span>.</>
						});
	
					}, 1000);
	
				}
	
			}
	
		} catch (error) {
		
			this.setState({
				loading: false,
				addressError: true
			});
	
		}

	}

	constructor(props) {
		super(props);
		this.addressBar = React.createRef();
	}

	render() {
		return (
			<div className={"browser " + (this.state.loading ? "loading" : "") }>
				<div className="top-bar">
					<div className="previous disabled"><i className="fas fa-arrow-left fa-lg"></i></div>
					<div className="next disabled"><i className="fas fa-arrow-right fa-lg"></i></div>
					<div className="reload" onClick={this.refreshBrowser}><i className="fas fa-redo-alt fa-lg"></i></div>
					<input 
						type="text"
						name="address_bar"
						ref={this.addressBar}
						className={
							"address-bar " +
							(this.state.loading ? "loading" : "") +
							(this.state.addressError ? "address-error" : "")
						}
						onKeyDown= { (ev) => {if (ev.key === "Enter") this.refreshBrowser() } }/>
				</div>
				<div className="browser-content">
					
					{ 
						this.state.pageStatus === "loaded" && 
						<div className="page">
							<h1 className={this.state.pageStyle}>{this.state.pageTitle}</h1>
							<div className="separator"></div>
							<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae expedita dolorem eligendi perferendis voluptatem doloribus illo labore culpa.</p>
						</div>
					}

					{
						this.state.pageStatus === "failed" &&
						<div className="page">
							<img src={failImage} alt=""/>
							<h2 className="font-bold">Não é possível acessar esse site</h2>
							<h3 className="text-light">{this.state.failMessage}</h3>
						</div>
					}

				</div>
			</div>
		);
	}

}

interface SiteListProps {
	sites: Site[],
	removeSite: (site: Site) => void
}

/**
 * A component that represents a list of all sites.
 */
class SiteList extends Component<SiteListProps> {

	render() {
		
		let siteComponents = [];

		for (let i = 0; i < this.props.sites.length; i++) {
			
			siteComponents[i] = <li>
				<div className="spacer">
					<div>
						<span className="font-medium font-bold site-name">{this.props.sites[i].name}</span>
						<span className="font-medium font-light">{this.props.sites[i].address.toString(true)}</span>
					</div>
					<i className="fas fa-trash fa-lg site-delete" onClick={() => { this.props.removeSite(this.props.sites[i]) }}/>
				</div>
			</li>

		}

		return <ul className="collection">{ siteComponents }</ul>;
	}

}

interface DomainTreeProps {
	rootDomain: Domain,
	removeDomain: (domain: Domain) => void,
	removeDomainAddress: (domain: Domain) => void
}

/**
 * A component that shows the entire DNS tree.
 */
class DomainTree extends Component<DomainTreeProps> {

	/**
	 * Returns a single branch of the tree.
	 */
	private renderBranch = (domain: Domain) => {

		let address = domain.getAddress();
		let subdomains = [];

		for (let i = 0; i < domain.getSubdomains().length; i++) {
			subdomains[i] = <li>
				{this.renderBranch(domain.getSubdomains()[i])}
			</li>
		}

		return <>
			<div className="domain">
				<span className="label">{domain.toString()}</span>
				{ (address && true) && <span className="address">{address.toString(true)}</span>}
				{ (domain.getParent() && true) && <i className="fas fa-trash fa-lg domain-delete" onClick={() => {this.props.removeDomain(domain)}}/>}
				{ (address && true) && <i className="fas fa-trash fa-lg domain-address-delete" onClick={() => {this.props.removeDomainAddress(domain)}}/>}
			</div>
			<ul>
				{subdomains}
			</ul>
		</>
	}

	render() {
		if (this.props.rootDomain.getSubdomains().length === 0) return null;
		return <div className="domain-tree" id="root_tree">{this.renderBranch(this.props.rootDomain)}</div>;
	}

}