define(["require", "exports", "../../core/helpers", "../../core/networking/layers/layer-3/address"], function (require, exports, helpers_1, address_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IP = [];
    var MASK = [];
    for (var i = 0; i < 4; i++) {
        IP[i] = [];
        MASK[i] = [];
        for (var j = 0; j < 8; j++) {
            IP[i][j] = helpers_1.id("byte_ip_" + i + "_" + j);
            MASK[i][j] = helpers_1.id("byte_ip_" + i + "_" + j);
        }
    }
    function extractDOMByte4(from) {
        var bytes = address_1.Byte4Zero();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 8; j++) {
                bytes[i].bit(j, from[i][j].checked ? true : false);
            }
        }
        return bytes;
    }
    console.log("HELLO!!!!");
    console.log(extractDOMByte4(IP));
});
