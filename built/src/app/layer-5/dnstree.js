// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-03-13)
define(["require", "exports", "../../core/utils/dom", "../../core/networking/layers/layer-3/address", "../../core/networking/byte", "../../core/networking/layers/layer-5/domain", "../../core/utils/dom"], function (require, exports, dom_1, address_1, byte_1, domain_1, dom_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var domainErrorWrapper = dom_1.id("domain_error_wrapper");
    var siteErrorWrapper = dom_1.id("site_error_wrapper");
    var rootTree = dom_1.id("root_tree");
    var rootDomain = new domain_1.Domain(".", undefined);
    var browser = dom_1.id("browser");
    var pageLoaded = dom_1.id("page_loaded");
    var pageNxdomain = dom_1.id("page_nxdomain");
    var nxdomainDescription = dom_1.id("nxdomain_description");
    var pageTimedout = dom_1.id("page_timedout");
    var timedoutDescription = dom_1.id("timedout_description");
    var header = dom_1.id("loaded_header");
    var addressBar = dom_1.id("address_bar");
    var domainName = dom_1.id("domain_name");
    var domainAddress = dom_1.id("domain_address");
    var siteTitle = dom_1.id("site_title");
    var siteAddress = dom_1.id("site_address");
    var sitesWrapper = dom_1.id("sites_wrapper");
    var sites = [];
    function refreshPage() {
        try {
            var foundAddress_1 = undefined;
            var domain_2 = undefined;
            pageLoaded.classList.add("hidden");
            pageNxdomain.classList.add("hidden");
            pageTimedout.classList.add("hidden");
            browser.style.cursor = "progress";
            addressBar.style.cursor = "progress";
            try {
                var str = addressBar.value;
                if (str === "localhost") {
                    setTimeout(function () {
                        timedoutDescription.innerHTML = "<span class=\"font-bold\">localhost</span> demorou muito para responder.";
                        pageTimedout.classList.remove("hidden");
                        browser.style.cursor = "initial";
                        addressBar.style.cursor = "initial";
                    }, 2000);
                }
                else {
                    foundAddress_1 = new address_1.Address(str);
                }
            }
            catch (error) {
                addressBar.classList.remove("address-error");
                var tmpRoot = new domain_1.Domain(".", undefined);
                domain_2 = extractDomain(tmpRoot, addressBar.value);
                var tmpCurr = tmpRoot;
                var curr = rootDomain;
                var exit = false;
                while (!exit) {
                    tmpCurr = tmpCurr.getSubdomains()[0];
                    curr = curr.getSubdomain(tmpCurr.getLabel());
                    if (!curr || curr.getLabel() == domain_2.getLabel()) {
                        exit = true;
                    }
                }
                if (curr) {
                    foundAddress_1 = curr.getAddress();
                }
            }
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
                        header.className = site_1.color;
                        header.textContent = site_1.name;
                        pageLoaded.classList.remove("hidden");
                        browser.style.cursor = "initial";
                        addressBar.style.cursor = "initial";
                    }, 500);
                }
                else {
                    setTimeout(function () {
                        if (domain_2) {
                            timedoutDescription.innerHTML = "<span class=\"font-bold\">" + domain_2.getFullName() + "</span> demorou muito para responder.";
                        }
                        else {
                            timedoutDescription.innerHTML = "<span class=\"font-bold\">" + foundAddress_1.toString(true) + "</span> demorou muito para responder.";
                        }
                        pageTimedout.classList.remove("hidden");
                        browser.style.cursor = "initial";
                        addressBar.style.cursor = "initial";
                    }, 2000);
                }
            }
            else {
                setTimeout(function () {
                    if (domain_2) {
                        nxdomainDescription.innerHTML = "N\u00E3o foi poss\u00EDvel encontrar o endere\u00E7o IP do servidor de <span class=\"font-bold\">" + domain_2.getFullName() + "</span>.";
                    }
                    else {
                        nxdomainDescription.innerHTML = "N\u00E3o foi poss\u00EDvel encontrar o endere\u00E7o IP do servidor.</span>.";
                    }
                    pageNxdomain.classList.remove("hidden");
                    browser.style.cursor = "initial";
                    addressBar.style.cursor = "initial";
                }, 1000);
            }
        }
        catch (error) {
            console.error(error);
            addressBar.classList.add("address-error");
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
        dom_1.clearChildren(rootTree);
        if (rootDomain.getSubdomains().length > 0) {
            loadTree(rootDomain, rootTree);
        }
    }
    function extractDomain(tmpRoot, fullName) {
        var parts = fullName.trim().split(".");
        var curr = tmpRoot;
        for (var i = parts.length - 1; i >= 0; i--) {
            if (parts[i].length === 0) {
                var err = new Error();
                err.name = domain_1.ERROR_INVALID_LABEL;
                throw err;
            }
            var next = new domain_1.Domain(parts[i], curr);
            curr.getSubdomains().push(next);
            curr = next;
        }
        return curr;
    }
    function createSite() {
        var oldTable = dom_1.id('site_error');
        if (oldTable !== null) {
            oldTable.remove();
        }
        var errStr = undefined;
        try {
            var address = new address_1.Address(siteAddress.value);
            for (var i = 0; i < sites.length; i++) {
                if (sites[i].address.compare(address)) {
                    errStr = "Já existe um site com esse endereço.";
                    throw Error();
                }
            }
            var name_1 = siteTitle.value.trim();
            if (name_1 === "") {
                errStr = "Insira o nome do site.";
                throw Error();
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
            var siteTitleDOM = dom_2.make("span", "font-medium font-bold site-name", name_1);
            var siteAddressDOM = dom_2.make("span", "font-medium font-light", address.toString(true));
            var deleteDOM = dom_2.make("i", "fas fa-trash fa-lg site-delete");
            deleteDOM.addEventListener("click", function (ev) {
                sites.splice(sites.indexOf(site_2), 1);
                liDOM_1.remove();
            });
            contentDOM.appendChild(siteTitleDOM);
            contentDOM.appendChild(siteAddressDOM);
            spacerDOM.appendChild(contentDOM);
            spacerDOM.appendChild(deleteDOM);
            liDOM_1.appendChild(spacerDOM);
            sitesWrapper.appendChild(liDOM_1);
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
            siteErrorWrapper.appendChild(table);
        }
    }
    /**
     * Registers a domain.
     */
    function registerDomain() {
        var oldTable = dom_1.id('domain_error');
        if (oldTable !== null) {
            oldTable.remove();
        }
        var errStr = undefined;
        try {
            var tmpRoot = new domain_1.Domain(".", undefined);
            var fullName = domainName.value;
            if (fullName === "localhost") {
                errStr = "Você não pode usar esse nome.";
                throw Error();
            }
            else {
                var domain = extractDomain(tmpRoot, fullName);
                var addressStr = domainAddress.value.trim();
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
            domainErrorWrapper.appendChild(table);
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
    addressBar.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
            refreshPage();
            addressBar.blur();
        }
    });
    dom_1.id("button_refresh").addEventListener("click", function (ev) {
        refreshPage();
    });
});
