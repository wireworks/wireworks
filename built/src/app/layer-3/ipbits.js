// IPBits
// +=========================+
// Author: Henrique Colini
// Version: 3.1 (2019-03-03)
define(["require", "exports", "../../core/networking/byte", "../../core/networking/layers/layer-3/address", "../../core/helpers/string", "../../core/helpers/dom", "../../core/helpers/math"], function (require, exports, byte_1, address_1, string_1, dom_1, math_1) {
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
     * A zero-width character used to work around empty contenteditable fields issues.
     */
    var HIDDENCHAR = String.fromCharCode(8205);
    /**
     * Loads the DOM checkboxes into IP and MASK and sets the events for the input displays.
     */
    function loadDOMComponents() {
        var _loop_1 = function (i) {
            IP[i] = [];
            MASK[i] = [];
            var _loop_2 = function (j) {
                var ipBit = dom_1.id("byte_ip_" + i + "_" + j);
                var maskBit = dom_1.id("byte_mask_" + i + "_" + j);
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
            var additionalKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Insert"];
            var display = dom_1.id("display_ip_" + i);
            var resultByte;
            display.addEventListener("focus", function (evt) {
                var range, selection;
                if (document.createRange) {
                    range = document.createRange();
                    range.selectNodeContents(display);
                    selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                var originalAddress = extractAddress();
                resultByte = originalAddress.getIp()[i];
            });
            display.addEventListener("blur", function (evt) {
                setIPByteDOM(resultByte, i, true);
            });
            display.addEventListener("keydown", function (evt) {
                if (evt.key === "Enter") {
                    display.blur();
                }
                if (display.textContent.indexOf(HIDDENCHAR) !== -1 && display.textContent.length > 1) {
                    display.textContent = display.textContent.replace(HIDDENCHAR, "");
                    var range = void 0, selection = void 0;
                    if (document.createRange) {
                        range = document.createRange();
                        range.selectNodeContents(display);
                        range.collapse(false);
                        selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
                if (additionalKeys.indexOf(evt.key) === -1 && !string_1.isCharNumeric(evt.key)) {
                    evt.preventDefault();
                    return;
                }
                var selectedText = window.getSelection().anchorNode.parentNode == display && window.getSelection().toString();
                if (additionalKeys.indexOf(evt.key) === -1 && display.textContent.replace(HIDDENCHAR, "").length == 3 && selectedText.length === 0) {
                    evt.preventDefault();
                }
            });
            display.addEventListener("keyup", function (evt) {
                var next = i < 3 ? dom_1.id("display_ip_" + (i + 1)) : undefined;
                var selectedText = window.getSelection().anchorNode.parentNode == display && window.getSelection().toString();
                if (additionalKeys.indexOf(evt.key) === -1 && display.textContent.replace(HIDDENCHAR, "").length == 3 && selectedText.length === 0) {
                    if (next) {
                        next.focus();
                    }
                }
            });
            display.addEventListener("input", function (evt) {
                if (display.textContent === "") {
                    display.textContent = HIDDENCHAR;
                    var address = extractAddress();
                    var minByte = address.getIp()[i];
                    var mask = address.getMask()[i];
                    for (var i_1 = 0; i_1 < 8; i_1++) {
                        if (!mask.bit(i_1)) {
                            minByte.bit(i_1, false);
                        }
                    }
                    resultByte = minByte;
                }
                else {
                    if (string_1.isStringNumeric(display.textContent)) {
                        var address = extractAddress();
                        var minByte = address.getIp()[i];
                        var maxByte = minByte.clone();
                        var mask = address.getMask()[i];
                        for (var i_2 = 0; i_2 < 8; i_2++) {
                            if (!mask.bit(i_2)) {
                                minByte.bit(i_2, false);
                                maxByte.bit(i_2, true);
                            }
                        }
                        var value = new byte_1.Byte(math_1.clamp(parseInt(display.textContent, 10), minByte.getDecimal(), maxByte.getDecimal()));
                        resultByte = value;
                        setIPByteDOM(value, i, false);
                    }
                }
            });
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
     * Sets the checkboxes and display of a DOM representation of a Byte, given a real one.
     * @param  {Byte} byte The byte to be displayed.
     * @param  {number} index The index of the 4 possible IP DOM bytes.
     * @param  {boolean} updateBig Whether the big displays should be updated as well. Defaults to true.
     * @param  {boolean} updateShort Whether the short display should be updated as well. Defaults to true.
     */
    function setIPByteDOM(byte, index, updateBig, updateShort) {
        if (updateBig === void 0) { updateBig = true; }
        if (updateShort === void 0) { updateShort = true; }
        var dom = IP[index];
        for (var i = 0; i < 8; i++) {
            dom[i].checked = byte.bit(i);
        }
        if (updateBig) {
            updateDisplays();
        }
        else if (updateShort) {
            updateIPShort();
        }
    }
    /**
     * Updates the small IP display string.
     * @param  {string} str? The string to be shown. If not given, it will be calculated.
     */
    function updateIPShort(str) {
        dom_1.id("ip_value").textContent = str ? str : extractAddress().toString(true);
    }
    /**
     * Updates the small mask display string.
     * @param  {string} str? The string to be shown. If not given, it will be calculated.
     */
    function updateMaskShort(str) {
        dom_1.id("mask_value").textContent = str ? str : extractAddress().shortMaskString();
    }
    /**
     * Updates the big displays for the IP and mask.
     * @param  {Address} address? The address that will be displayed. If not given, it will be calculated.
     */
    function updateDisplays(address) {
        address = address ? address : extractAddress();
        for (var i = 0; i < 4; i++) {
            dom_1.id("display_ip_" + i).textContent = "" + address.getIp()[i].getDecimal();
            dom_1.id("display_mask_" + i).textContent = "" + address.getMask()[i].getDecimal();
        }
        updateIPShort(address.toString(true));
        updateMaskShort(address.shortMaskString());
    }
    /**
     * Selects all the mask bit checkboxes until a given index.
     * @param  {number} index The last checked bit.
     */
    function selectMaskBit(index) {
        var _a = splitBitIndex(index), bitIndex = _a.bitIndex, byteIndex = _a.byteIndex;
        index += (dom_1.id("byte_mask_" + byteIndex + "_" + bitIndex).checked ? 1 : 0);
        for (var byte4Index = 0; byte4Index < 32; byte4Index++) {
            var _b = splitBitIndex(byte4Index), bitIndex_1 = _b.bitIndex, byteIndex_1 = _b.byteIndex;
            var on = byte4Index < index;
            dom_1.id("byte_mask_" + byteIndex_1 + "_" + bitIndex_1).checked = on;
            dom_1.id("byte_ip_" + byteIndex_1 + "_" + bitIndex_1).disabled = on;
        }
        updateDisplays();
    }
    /**
     * Copies the IP (in X.X.X.X format) to the clipboard.
     */
    function copyIPToClipboard() {
        dom_1.copyToClipboard(extractAddress().toString(true), function (success) {
            var text = dom_1.id("copy_ip_text");
            text.style.transition = "";
            text.style.opacity = "1";
            setTimeout(function () {
                text.style.transition = "opacity 1s";
                text.style.opacity = "0";
            }, 2000);
        });
    }
    /**
     * Copies the mask (in X.X.X.X format) to the clipboard.
     */
    function copyMaskToClipboard() {
        dom_1.copyToClipboard(extractAddress().maskString(), function (success) {
            var text = dom_1.id("copy_mask_text");
            text.style.transition = "";
            text.style.opacity = "1";
            setTimeout(function () {
                text.style.transition = "opacity 1s";
                text.style.opacity = "0";
            }, 2000);
        });
    }
    // +==============================================+
    loadDOMComponents();
    updateDisplays();
    dom_1.id("copy_ip").addEventListener("click", function (ev) { return copyIPToClipboard(); });
    dom_1.id("copy_mask").addEventListener("click", function (ev) { return copyMaskToClipboard(); });
});
