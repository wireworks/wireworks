// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-03-14)
define(["require", "exports", "../../core/utils/dom", "../../core/networking/layers/layer-3/address", "../../core/networking/byte", "../../core/networking/layers/layer-5/domain", "../../core/utils/dom"], function (require, exports, dom_1, address_1, byte_1, domain_1, dom_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var rootDomain = new domain_1.Domain(".", undefined);
    var domainErrorWrapperDOM = dom_1.id("domain_error_wrapper");
    var siteErrorWrapperDOM = dom_1.id("site_error_wrapper");
    var rootTreeDOM = dom_1.id("root_tree");
    var browserDOM = dom_1.id("browser");
    var pageLoadedDOM = dom_1.id("page_loaded");
    var pageNxdomainDOM = dom_1.id("page_nxdomain");
    var nxdomainDescriptionDOM = dom_1.id("nxdomain_description");
    var pageTimedoutDOM = dom_1.id("page_timedout");
    var timedoutDescriptionDOM = dom_1.id("timedout_description");
    var headerDOM = dom_1.id("loaded_header");
    var addressBarDOM = dom_1.id("address_bar");
    var domainNameDOM = dom_1.id("domain_name");
    var domainAddressDOM = dom_1.id("domain_address");
    var siteTitleDOM = dom_1.id("site_title");
    var siteAddressDOM = dom_1.id("site_address");
    var sitesWrapperDOM = dom_1.id("sites_wrapper");
    var sites = [];
    /**
     * Refreshes the fake browser window.
     */
    function refreshBrowser() {
        try {
            var foundAddress_1 = undefined;
            var domain_2 = undefined;
            var alreadyLoaded = false;
            pageLoadedDOM.classList.add("hidden");
            pageNxdomainDOM.classList.add("hidden");
            pageTimedoutDOM.classList.add("hidden");
            browserDOM.style.cursor = "progress";
            addressBarDOM.style.cursor = "progress";
            try {
                var str = addressBarDOM.value;
                if (str === "localhost") {
                    alreadyLoaded = true;
                    setTimeout(function () {
                        timedoutDescriptionDOM.innerHTML = "<span class=\"font-bold\">localhost</span> demorou muito para responder.";
                        pageTimedoutDOM.classList.remove("hidden");
                        browserDOM.style.cursor = "initial";
                        addressBarDOM.style.cursor = "initial";
                    }, 2000);
                }
                else {
                    foundAddress_1 = new address_1.Address(str);
                }
            }
            catch (error) {
                addressBarDOM.classList.remove("address-error");
                var tmpRoot = new domain_1.Domain(".", undefined);
                domain_2 = domain_1.Domain.extractDomain(tmpRoot, addressBarDOM.value);
                var tmpCurr = tmpRoot;
                var curr = rootDomain;
                var exit = false;
                while (!exit) {
                    tmpCurr = tmpCurr.getSubdomains()[0];
                    curr = curr.getSubdomain(tmpCurr.getLabel());
                    if (!curr || curr.getFullName() == domain_2.getFullName()) {
                        exit = true;
                    }
                }
                if (curr) {
                    foundAddress_1 = curr.getAddress();
                }
            }
            if (!alreadyLoaded) {
                if (foundAddress_1) {
                    var exists = false;
                    var site_1 = undefined;
                    for (var i = 0; !exists && i < sites.length; i++) {
                        site_1 = sites[i];
                        if (site_1.address.compare(foundAddress_1)) {
                            exists = true;
                        }
                    }
                    if (exists) {
                        setTimeout(function () {
                            headerDOM.className = site_1.color;
                            headerDOM.textContent = site_1.name;
                            pageLoadedDOM.classList.remove("hidden");
                            browserDOM.style.cursor = "initial";
                            addressBarDOM.style.cursor = "initial";
                        }, 500);
                    }
                    else {
                        setTimeout(function () {
                            if (domain_2) {
                                timedoutDescriptionDOM.innerHTML = "<span class=\"font-bold\">" + domain_2.getFullName() + "</span> demorou muito para responder.";
                            }
                            else {
                                timedoutDescriptionDOM.innerHTML = "<span class=\"font-bold\">" + foundAddress_1.toString(true) + "</span> demorou muito para responder.";
                            }
                            pageTimedoutDOM.classList.remove("hidden");
                            browserDOM.style.cursor = "initial";
                            addressBarDOM.style.cursor = "initial";
                        }, 2000);
                    }
                }
                else {
                    setTimeout(function () {
                        if (domain_2) {
                            nxdomainDescriptionDOM.innerHTML = "N\u00E3o foi poss\u00EDvel encontrar o endere\u00E7o IP do servidor de <span class=\"font-bold\">" + domain_2.getFullName() + "</span>.";
                        }
                        else {
                            nxdomainDescriptionDOM.innerHTML = "N\u00E3o foi poss\u00EDvel encontrar o endere\u00E7o IP do servidor.";
                        }
                        pageNxdomainDOM.classList.remove("hidden");
                        browserDOM.style.cursor = "initial";
                        addressBarDOM.style.cursor = "initial";
                    }, 1000);
                }
            }
        }
        catch (error) {
            console.error(error);
            addressBarDOM.classList.add("address-error");
            browserDOM.style.cursor = "initial";
            addressBarDOM.style.cursor = "initial";
        }
    }
    /**
     * Refreshes the whole tree.
     */
    function refreshTree() {
        function loadTree(domain, element) {
            var domainDOM = dom_2.make("div", "domain");
            domainDOM.appendChild(dom_2.make("span", "label", domain.toString()));
            if (domain.getAddress()) {
                domainDOM.appendChild(dom_2.make("span", "address", domain.getAddress().toString(true)));
            }
            if (domain.getParent()) {
                var btn = dom_2.make("i", "fas fa-trash fa-lg domain-delete");
                btn.addEventListener("click", function (ev) {
                    if (domain.getSubdomains().length === 0 || confirm("Tem certeza de quer remover esse domínio?\nTodos os seus subdomínios também serão removidos.")) {
                        domain.setAddress(undefined);
                        domain.setParent(undefined, false, true);
                        refreshTree();
                    }
                });
                domainDOM.appendChild(btn);
            }
            if (domain.getAddress()) {
                var btn = dom_2.make("i", "fas fa-trash fa-lg domain-address-delete");
                btn.addEventListener("click", function (ev) {
                    domain.setAddress(undefined);
                    refreshTree();
                });
                domainDOM.appendChild(btn);
            }
            element.appendChild(domainDOM);
            var list = dom_2.make("ul");
            for (var i = 0; i < domain.getSubdomains().length; i++) {
                var sub = domain.getSubdomains()[i];
                var item = dom_2.make("li");
                loadTree(sub, item);
                list.appendChild(item);
            }
            element.appendChild(list);
        }
        dom_1.clearChildren(rootTreeDOM);
        if (rootDomain.getSubdomains().length > 0) {
            loadTree(rootDomain, rootTreeDOM);
        }
    }
    /**
     * Creates a fake website from user input.
     */
    function createSite() {
        var oldTable = dom_1.id('site_error');
        if (oldTable !== null) {
            oldTable.remove();
        }
        var errStr = undefined;
        try {
            var name_1 = siteTitleDOM.value.trim();
            if (name_1 === "") {
                errStr = "Insira o nome do site.";
                throw Error();
            }
            var address = new address_1.Address(siteAddressDOM.value);
            for (var i = 0; i < sites.length; i++) {
                if (sites[i].address.compare(address)) {
                    errStr = "Já existe um site com esse endereço.";
                    throw Error();
                }
            }
            var site_2 = {
                name: name_1,
                address: address,
                color: "style-" + Math.floor(Math.random() * 6)
            };
            sites.push(site_2);
            var liDOM_1 = dom_2.make("li");
            var spacerDOM = dom_2.make("div", "spacer");
            var contentDOM = dom_2.make("div");
            var titleDOM = dom_2.make("span", "font-medium font-bold site-name", name_1);
            var addressDOM = dom_2.make("span", "font-medium font-light", address.toString(true));
            var deleteDOM = dom_2.make("i", "fas fa-trash fa-lg site-delete");
            deleteDOM.addEventListener("click", function (ev) {
                sites.splice(sites.indexOf(site_2), 1);
                liDOM_1.remove();
            });
            contentDOM.appendChild(titleDOM);
            contentDOM.appendChild(addressDOM);
            spacerDOM.appendChild(contentDOM);
            spacerDOM.appendChild(deleteDOM);
            liDOM_1.appendChild(spacerDOM);
            sitesWrapperDOM.appendChild(liDOM_1);
        }
        catch (error) {
            var table = document.createElement('table');
            table.id = "site_error";
            if (!errStr) {
                switch (error.name) {
                    case address_1.ERROR_ADDRESS_PARSE:
                        errStr = "O endereço deve possuir o formato 0.0.0.0.";
                        break;
                    case byte_1.ERROR_BYTE_RANGE:
                        errStr = "Um ou mais octetos do endereço possui um valor alto demais (deve estar entre 0-255).";
                        break;
                    default:
                        errStr = "Erro desconhecido (" + error.name + ").";
                        console.error(error);
                        break;
                }
            }
            table.innerHTML = "\n\t\t\t\t<td>\n\t\t\t\t\t<h2 class=\"font-mono text-danger\">Entrada inv\u00E1lida. " + errStr + "</h2>\n\t\t\t\t</td>\n\t\t\t";
            siteErrorWrapperDOM.appendChild(table);
        }
    }
    /**
     * Registers a domain, from user input.
     */
    function registerDomain() {
        var oldTable = dom_1.id('domain_error');
        if (oldTable !== null) {
            oldTable.remove();
        }
        var errStr = undefined;
        try {
            var tmpRoot = new domain_1.Domain(".", undefined);
            var fullName = domainNameDOM.value;
            if (fullName === "localhost") {
                errStr = "Você não pode usar esse nome.";
                throw Error();
            }
            else {
                var domain = domain_1.Domain.extractDomain(tmpRoot, fullName);
                var addressStr = domainAddressDOM.value.trim();
                if (addressStr !== "") {
                    var address = new address_1.Address(addressStr);
                    domain.setAddress(address);
                }
                else {
                    domain.setAddress(undefined);
                }
                rootDomain.merge(tmpRoot, "merge");
                refreshTree();
            }
        }
        catch (error) {
            var table = document.createElement('table');
            table.id = "domain_error";
            console.error(error);
            if (!errStr) {
                switch (error.name) {
                    case address_1.ERROR_ADDRESS_PARSE:
                        errStr = "O endereço deve possuir o formato 0.0.0.0.";
                        break;
                    case byte_1.ERROR_BYTE_RANGE:
                        errStr = "Um ou mais octetos do endereço possui um valor alto demais (deve estar entre 0-255).";
                        break;
                    case domain_1.ERROR_INVALID_LABEL:
                        errStr = "Esse domínio possui um nome inválido.";
                        break;
                    case domain_1.ERROR_FULL_NAME_RANGE:
                        errStr = "Esse domínio possui um nome grande demais.";
                        break;
                    default:
                        errStr = "Erro desconhecido (" + error.name + ").";
                        console.error(error);
                        break;
                }
            }
            table.innerHTML = "\n\t\t\t\t<td>\n\t\t\t\t\t<h2 class=\"font-mono text-danger\">Entrada inv\u00E1lida. " + errStr + "</h2>\n\t\t\t\t</td>\n\t\t\t";
            domainErrorWrapperDOM.appendChild(table);
        }
    }
    // +==============================================+
    dom_1.id("domain_address").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            registerDomain();
    });
    dom_1.id("domain_name").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            registerDomain();
    });
    dom_1.id("button_add_domain").addEventListener("click", function (ev) {
        registerDomain();
    });
    dom_1.id("site_title").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            createSite();
    });
    dom_1.id("site_address").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            createSite();
    });
    dom_1.id("button_add_site").addEventListener("click", function (ev) {
        createSite();
    });
    addressBarDOM.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
            refreshBrowser();
            addressBarDOM.blur();
        }
    });
    dom_1.id("button_refresh").addEventListener("click", function (ev) {
        refreshBrowser();
    });
});
