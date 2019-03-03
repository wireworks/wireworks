define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
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
});
