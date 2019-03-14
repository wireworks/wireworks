// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-03-11)
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
    var pageTimedout = dom_1.id("page_timedout");
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
            addressBar.classList.remove("address-error");
            var tmpRoot = new domain_1.Domain(".", undefined);
            var domain = extractDomain(tmpRoot, addressBar.value);
            var tmpCurr = tmpRoot;
            var curr_1 = rootDomain;
            var exit = false;
            while (!exit) {
                tmpCurr = tmpCurr.getSubdomains()[0];
                curr_1 = curr_1.getSubdomain(tmpCurr.getLabel());
                if (!curr_1 || curr_1.getLabel() == domain.getLabel()) {
                    exit = true;
                }
            }
            pageLoaded.classList.add("hidden");
            pageNxdomain.classList.add("hidden");
            pageTimedout.classList.add("hidden");
            if (curr_1) {
                browser.style.cursor = "progress";
                addressBar.style.cursor = "progress";
                setTimeout(function () {
                    // "hashes" a string to a "random" number
                    var seed = 0;
                    var fullName = curr_1.getFullName();
                    for (var i = 0; i < fullName.length; i++) {
                        seed += fullName.charCodeAt(i) * Math.pow(10, i);
                    }
                    var fakeRandom = Math.sin(seed) * 10000;
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
                setTimeout(function () {
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
        loadTree(rootDomain, rootTree);
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
            var site_1 = {
                name: name_1,
                address: address,
                color: "style-" + Math.floor(Math.random() * 6)
            };
            sites.push(site_1);
            var liDOM_1 = dom_2.make("li");
            var spacerDOM = dom_2.make("div", "spacer");
            var contentDOM = dom_2.make("div");
            var siteTitleDOM = dom_2.make("span", "font-medium font-bold site-name", name_1);
            var siteAddressDOM = dom_2.make("span", "font-medium font-light", address.toString(true));
            var deleteDOM = dom_2.make("i", "fas fa-trash fa-lg site-delete");
            deleteDOM.addEventListener("click", function (ev) {
                sites.splice(sites.indexOf(site_1), 1);
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
            var domain = extractDomain(tmpRoot, domainName.value);
            var address = new address_1.Address(domainAddress.value);
            domain.setAddress(address);
            rootDomain.merge(tmpRoot, "merge");
            refreshTree();
        }
        catch (error) {
            var table = document.createElement('table');
            table.id = "domain_error";
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
