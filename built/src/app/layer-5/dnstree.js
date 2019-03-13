// DNSTree
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-03-11)
define(["require", "exports", "../../core/utils/dom", "../../core/networking/layers/layer-3/address", "../../core/networking/byte", "../../core/networking/layers/layer-5/domain", "../../core/utils/dom"], function (require, exports, dom_1, address_1, byte_1, domain_1, dom_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var errorWrapper = dom_1.id("error_wrapper");
    var rootTree = dom_1.id("root_tree");
    var rootDomain = new domain_1.Domain(".", undefined);
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
    /**
     * Registers a domain.
     */
    function register() {
        var oldTable = dom_1.id('error');
        if (oldTable !== null) {
            oldTable.remove();
        }
        var errStr = undefined;
        try {
            var parts = dom_1.id('domain').value.trim().split(".");
            var tmpRoot = new domain_1.Domain(".", undefined);
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
            var address = new address_1.Address(dom_1.id('address').value);
            curr.setAddress(address);
            rootDomain.merge(tmpRoot, "merge");
            refreshTree();
        }
        catch (error) {
            var table = document.createElement('table');
            table.id = "error";
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
            errorWrapper.appendChild(table);
        }
    }
    // +==============================================+
    dom_1.id("address").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            register();
    });
    dom_1.id("domain").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            register();
    });
    dom_1.id("button_add").addEventListener("click", function (ev) {
        register();
    });
});
