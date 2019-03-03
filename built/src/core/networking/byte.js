define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Returns a Bit8 filled with false.
     */
    function Bit8Zero() {
        return [false, false, false, false, false, false, false, false];
    }
    exports.Bit8Zero = Bit8Zero;
    /**
     * Returns a Bit8 filled with true.
     */
    function Bit8Max() {
        return [true, true, true, true, true, true, true, true];
    }
    exports.Bit8Max = Bit8Max;
    /**
     * Returns a Byte corresponding to the number 0.
     */
    function ByteZero() {
        return new Byte(Bit8Zero());
    }
    exports.ByteZero = ByteZero;
    /**
     * Returns a Byte corresponding to the number 255.
     */
    function ByteMax() {
        return new Byte(Bit8Max());
    }
    exports.ByteMax = ByteMax;
    /**
     * Error name for a byte outside the correct range.
     */
    exports.ERROR_BYTE_RANGE = "ByteRangeError";
    /**
     * A Byte, composed of 8 bits (boolean values).
     * @author Henrique Colini
     */
    var Byte = /** @class */ (function () {
        /**
         * Constructs a Byte from a number (0-255) or a Bit8.
         * @constructor
         * @param  {number|Bit8} value The value of this Byte.
         */
        function Byte(value) {
            if (typeof value === "number") {
                this.setDecimal(value);
            }
            else {
                this.setBits(value);
            }
        }
        /**
         * Sets the value of this Byte, using a number (0-255).
         * @param  {number} decimal
         */
        Byte.prototype.setDecimal = function (decimal) {
            if (decimal < 0 || decimal > 255 || decimal.toString().indexOf('.') !== -1) {
                var err = new RangeError("The decimal value of a byte must be an integer between 0-255 (inclusive)");
                err.name = exports.ERROR_BYTE_RANGE;
                throw err;
            }
            var tmpDecimal = decimal;
            var tmpBits = Bit8Zero();
            for (var i = 0; i < 8; i++) {
                tmpBits[i] = tmpDecimal % 2 ? true : false;
                tmpDecimal = Math.floor(tmpDecimal / 2);
            }
            this.bits = tmpBits;
            this.decimal = decimal;
        };
        /**
         * Sets the value of this Byte, using a Bit8.
         * @param  {Bit8} bits
         */
        Byte.prototype.setBits = function (bits) {
            this.decimal = 0;
            this.bits = bits;
            for (var i = 0; i < bits.length; i++)
                this.decimal += this.bits[i] ? Math.pow(2, i) : 0;
        };
        /**
         * Returns this Byte's numeric value.
         */
        Byte.prototype.getDecimal = function () {
            return this.decimal;
        };
        /**
         * Returns this Byte's Bit8 representation.
         */
        Byte.prototype.getBits = function () {
            return this.bits;
        };
        /**
         * Getter/Setter of a single bit from this Byte.
         * @param  {number} index The index of the bit.
         * @param  {boolean|undefined=undefined} value Optional. Sets the value for this bit.
         */
        Byte.prototype.bit = function (index, value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined) {
                var bits = this.bits;
                bits[index] = value;
                this.setBits(bits);
            }
            return this.bits[index];
        };
        /**
         * Clones this Byte.
         */
        Byte.prototype.clone = function () {
            return new Byte(this.bits.slice());
        };
        return Byte;
    }());
    exports.Byte = Byte;
});
