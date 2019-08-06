import React, { Component } from "react";
import "sass/pages/dnstree.scss"
import "app/old/src/app/layer-5/dnstree"
import { init } from "../../../old/src/app/layer-5/dnstree";

class DnsTree extends Component {

    componentDidMount() {

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