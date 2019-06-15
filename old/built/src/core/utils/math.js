define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    /**
     * Converts a binary number (as a string, boolean array, or number array) to a decimal number.
     * @param  {boolean[]} binary The number to be converted. An array of booleans, read from left to right (e.g. 001 equals 4).
     * @param  {boolean} reversed Optional. Whether the input should be reversed (read from right to left). Defaults to false.
     */
    function binaryToDecimal(binary, reversed) {
        if (reversed === void 0) { reversed = false; }
        if (binary.length === 0) {
            return 0;
        }
        var decimal = 0;
        for (var realIndex = 0; realIndex < binary.length; realIndex++) {
            var i = reversed ? binary.length - realIndex - 1 : realIndex;
            decimal += binary[i] ? Math.pow(2, i) : 0;
        }
        return decimal;
    }
    exports.binaryToDecimal = binaryToDecimal;
    /**
     * Converts a decimal number (must be a positive integer) to an array of booleans (read from left to right, such that 001 equals 4).
     * @param  {number} decimal The number to be converted. Must be a positive integer.
     * @param  {boolean} reversed Optional. Whether the output should be reversed (read from right to left). Defaults to false.
     */
    function decimalToBinary(decimal, reversed) {
        if (reversed === void 0) { reversed = false; }
        if (decimal < 0) {
            throw new RangeError("Attempting to convert negative number to binary");
        }
        if (decimal !== Math.floor(decimal)) {
            throw new RangeError("Attempting to convert non-integer number to binary");
        }
        var binary = [];
        var tmpDecimal = decimal, i = 0;
        while (tmpDecimal > 0) {
            binary[i] = tmpDecimal % 2 ? true : false;
            tmpDecimal = Math.floor(tmpDecimal / 2);
            i++;
        }
        if (reversed) {
            binary.reverse();
        }
        return binary;
    }
    exports.decimalToBinary = decimalToBinary;
});
