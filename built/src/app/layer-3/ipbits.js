define(["require", "exports", "../../core/helpers", "../../core/networking/layers/layer-3/address"], function (require, exports, helpers_1, address_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IP = [];
    var MASK = [];
    for (var i = 0; i < 4; i++) {
        IP[i] = [];
        MASK[i] = [];
        for (var j = 0; j < 8; j++) {
            var ipBit = helpers_1.id("byte_ip_" + i + "_" + j);
            var maskBit = helpers_1.id("byte_mask_" + i + "_" + j);
            ipBit.addEventListener("change", function () {
                updateIPDisplay();
            });
            IP[i][j] = ipBit;
            MASK[i][j] = maskBit;
        }
    }
    function extractAddress() {
        var ipBytes = address_1.Byte4Zero();
        var maskBytes = address_1.Byte4Zero();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 8; j++) {
                ipBytes[i].bit(j, IP[i][j].checked ? true : false);
                maskBytes[i].bit(j, MASK[i][j].checked ? true : false);
            }
        }
        return new address_1.Address(ipBytes, maskBytes);
    }
    function updateIPShort(str) {
        helpers_1.id("ip_value").textContent = str ? str : extractAddress().toString();
    }
    function updateIPDisplay() {
        var address = extractAddress();
        for (var i = 0; i < 4; i++)
            helpers_1.id("display_ip_" + i).textContent = "" + address.getIp()[i].getDecimal();
        updateIPShort(address.toString());
    }
});
