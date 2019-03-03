// Planner
// +=========================+
// Author: Henrique Colini
// Version: 2.0 (2019-03-03)
define(["require", "exports", "../../core/helpers/dom", "../../core/networking/layers/layer-3/address", "../../core/networking/byte"], function (require, exports, dom_1, address_1, byte_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates the network plan table.
     */
    function createPlan() {
        var oldPlan = dom_1.id('plan');
        if (oldPlan !== null) {
            oldPlan.remove();
        }
        var table = document.createElement('table');
        table.id = "plan";
        var errStr = undefined;
        try {
            var address = new address_1.Address(dom_1.id("address").value, undefined, true);
            var firstValidStr = void 0;
            var lastValidStr = void 0;
            try {
                firstValidStr = address.firstHost(true).toString(true);
                lastValidStr = address.lastHost(true).toString(true);
            }
            catch (error) {
                if (error.name === address_1.ERROR_NOT_NETWORK) {
                    errStr = "Este não é um endereço de rede. Você quis dizer " + address.getNetworkAddress(true).toString() + "?";
                }
                throw error;
            }
            var maskStr = address.maskString();
            var hostsStr = '' + address.numberOfHosts().toLocaleString();
            var network = address.getNetworkAddress();
            var broadcast = address.getBroadcastAddress();
            var networkStr = network ? network.toString() : "N/A";
            var broadcastStr = broadcast ? broadcast.toString(true) : "N/A";
            table.innerHTML = "\n\t\t\t\t<tr>\n\t\t\t\t\t<th>Rede</th>\n\t\t\t\t\t<th>M\u00E1scara</th>\n\t\t\t\t\t<th>Primeiro V\u00E1lido</th>\n\t\t\t\t\t<th>\u00DAltimo V\u00E1lido</th>\n\t\t\t\t\t<th>Broadcast</th>\n\t\t\t\t\t<th>Hosts</th>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td>" + networkStr + "</td>\n\t\t\t\t\t<td>" + maskStr + "</td>\n\t\t\t\t\t<td>" + firstValidStr + "</td>\n\t\t\t\t\t<td>" + lastValidStr + "</td>\n\t\t\t\t\t<td>" + broadcastStr + "</td>\n\t\t\t\t\t<td>" + hostsStr + "</td>\n\t\t\t\t</tr>\n\t\t\t";
        }
        catch (error) {
            if (!errStr) {
                switch (error.name) {
                    case address_1.ERROR_ADDRESS_PARSE:
                        errStr = "A entrada deve possuir o formato 0.0.0.0/0.";
                        break;
                    case address_1.ERROR_MASK_RANGE:
                        errStr = "O valor da máscara é alto demais (deve estar entre 0-32).";
                        break;
                    case byte_1.ERROR_BYTE_RANGE:
                        errStr = "Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).";
                        break;
                    default:
                        errStr = "Erro desconhecido (" + error.name + ").";
                        break;
                }
            }
            table.innerHTML = "\n\t\t\t\t<td>\n\t\t\t\t\t<h2 class=\"error\">Entrada inv\u00E1lida. " + errStr + "</h2>\n\t\t\t\t</td>\n\t\t\t";
        }
        dom_1.id('container').appendChild(table);
    }
    // +==============================================+
    dom_1.id("address").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            createPlan();
    });
    dom_1.id("button_generate").addEventListener("click", function (ev) {
        createPlan();
    });
});
