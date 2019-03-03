define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    /**
     * Shorthand for document.getElementById(id).
     * @param  {string} elementId String that specifies the ID value. Case-insensitive.
     */
    function id(elementId) {
        return document.getElementById(elementId);
    }
    exports.id = id;
    /**
     * Copies a string to the user's clipboard.
     * @param  {string} str String to be copied.
     * @param  {(success:boolean)=>void} done What happens on success/failure. Optional.
     */
    function copyToClipboard(str, done) {
        var tmp = document.createElement("textarea");
        tmp.style.position = 'fixed';
        tmp.style.top = "0";
        tmp.style.left = "0";
        tmp.style.opacity = "0";
        tmp.value = str;
        document.body.appendChild(tmp);
        tmp.focus();
        tmp.select();
        var success = document.execCommand('copy');
        document.body.removeChild(tmp);
        if (done) {
            done(success);
        }
    }
    exports.copyToClipboard = copyToClipboard;
    /**
     * Returns whether a character is a number.
     * @param  {string} str The character to be anyalized.
    */
    function isCharNumeric(str) {
        return exports.NUMBERS.indexOf(str) !== -1;
    }
    exports.isCharNumeric = isCharNumeric;
    /**
     * Returns whether a string is composed of numbers only.
     * @param  {string} str The string to be anyalized.
     */
    function isStringNumeric(str) {
        for (var i = 0; i < str.length; i++) {
            if (!isCharNumeric(str.charAt(i)))
                return false;
        }
        return true;
    }
    exports.isStringNumeric = isStringNumeric;
    /**
     * Returns a value, clamped between max and min.
     * @param  {number} value The number to be clamped.
     * @param  {number} min The minimum possible number.
     * @param  {number} max The maximum possible number.
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    exports.clamp = clamp;
    ;
});
