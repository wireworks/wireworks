define(["require", "exports", "../../core/helpers", "../../core/networking/layers/layer-3/address"], function (require, exports, helpers_1, address_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The checkboxes corresponding to the IP bits.
     */
    var IP = [];
    /**
     * The checkboxes corresponding to the mask bits.
     */
    var MASK = [];
    /**
     * Loads the DOM checkboxes into IP and MASK.
     */
    function loadDOMBits() {
        var _loop_1 = function (i) {
            IP[i] = [];
            MASK[i] = [];
            var _loop_2 = function (j) {
                var ipBit = helpers_1.id("byte_ip_" + i + "_" + j);
                var maskBit = helpers_1.id("byte_mask_" + i + "_" + j);
                ipBit.addEventListener("change", function () {
                    updateDisplays();
                });
                maskBit.addEventListener("change", function () {
                    selectMaskBit(joinBitIndex(i, j));
                });
                IP[i][j] = ipBit;
                MASK[i][j] = maskBit;
            };
            for (var j = 0; j < 8; j++) {
                _loop_2(j);
            }
        };
        for (var i = 0; i < 4; i++) {
            _loop_1(i);
        }
    }
    /**
     * Converts a bit in Byte index to a bit in Byte4 index.
     * @param  {number} byteIndex The index of the Byte in a Byte4.
     * @param  {number} bitIndex The index of the bit in the Byte.
     */
    function joinBitIndex(byteIndex, bitIndex) {
        if (byteIndex > 3 || byteIndex < 0) {
            throw new RangeError("The byteIndex must be between 0-3 (inclusive)");
        }
        if (bitIndex > 7 || bitIndex < 0) {
            throw new RangeError("The bitIndex must be between 0-7 (inclusive)");
        }
        return (8 * byteIndex) + (7 - bitIndex);
    }
    /**
     * Converts a bit in Byte4 index to a bit in Byte index.
     * @param  {number} byte4Index The index of the bit in a Byte4.
     */
    function splitBitIndex(byte4Index) {
        if (byte4Index > 31 || byte4Index < 0) {
            throw new RangeError("The byte4Index must be between 0-31 (inclusive)");
        }
        return {
            byteIndex: Math.floor(byte4Index / 8),
            bitIndex: 7 - (byte4Index % 8)
        };
    }
    /**
     * Returns the Address, extracted from the DOM elements.
     */
    function extractAddress() {
        var ipBytes = address_1.Byte4Zero();
        var maskBytes = address_1.Byte4Zero();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 8; j++) {
                ipBytes[i].bit(j, (IP[i][j]).checked ? true : false);
                maskBytes[i].bit(j, (MASK[i][j]).checked ? true : false);
            }
        }
        return new address_1.Address(ipBytes, maskBytes);
    }
    /**
     * Updates the small IP display string.
     * @param  {string} str? The string to be shown. If not given, it will be calculated.
     */
    function updateIPShort(str) {
        helpers_1.id("ip_value").textContent = str ? str : extractAddress().toString();
    }
    /**
     * Updates the small mask display string.
     * @param  {string} str? The string to be shown. If not given, it will be calculated.
     */
    function updateMaskShort(str) {
        helpers_1.id("mask_value").textContent = str ? str : extractAddress().maskString();
    }
    /**
     * Updates the big displays for the IP and mask.
     * @param  {Address} address? The address that will be displayed. If not given, it will be calculated.
     */
    function updateDisplays(address) {
        address = address ? address : extractAddress();
        for (var i = 0; i < 4; i++) {
            helpers_1.id("display_ip_" + i).textContent = "" + address.getIp()[i].getDecimal();
            helpers_1.id("display_mask_" + i).textContent = "" + address.getMask()[i].getDecimal();
        }
        updateIPShort(address.toString(true));
        updateMaskShort(address.maskString());
    }
    /**
     * Selects all the mask bit checkboxes until a given index.
     * @param  {number} index The last checked bit.
     */
    function selectMaskBit(index) {
        var _a = splitBitIndex(index), bitIndex = _a.bitIndex, byteIndex = _a.byteIndex;
        index += (helpers_1.id("byte_mask_" + byteIndex + "_" + bitIndex).checked ? 1 : 0);
        for (var byte4Index = 0; byte4Index < 32; byte4Index++) {
            var _b = splitBitIndex(byte4Index), bitIndex_1 = _b.bitIndex, byteIndex_1 = _b.byteIndex;
            var on = byte4Index < index;
            helpers_1.id("byte_mask_" + byteIndex_1 + "_" + bitIndex_1).checked = on;
            helpers_1.id("byte_ip_" + byteIndex_1 + "_" + bitIndex_1).disabled = on;
        }
        updateDisplays();
    }
    // +==============================================+
    loadDOMBits();
    updateDisplays();
});
