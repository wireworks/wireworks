var Core;
(function (Core) {
    var Layers;
    (function (Layers) {
        Layers.BIT8_ZERO = [false, false, false, false, false, false, false, false];
        Layers.BIT8_FULL = [true, true, true, true, true, true, true, true];
        var Byte = /** @class */ (function () {
            function Byte(value) {
                if (typeof value === "number") {
                    this.setDecimal(value);
                }
                else {
                    this.setBits(value);
                }
            }
            Byte.prototype.setDecimal = function (decimal) {
                if (decimal < 0 || decimal > 255 || decimal.toString().indexOf('.') !== -1) {
                    throw new RangeError("The decimal value of a byte must be an integer between 0-255 (inclusive)");
                }
                var tmpDecimal = decimal;
                var tmpBits = Layers.BIT8_ZERO.slice();
                for (var i = 0; i < 8; i++) {
                    tmpBits[i] = tmpDecimal % 2 ? true : false;
                    tmpDecimal = Math.floor(tmpDecimal / 2);
                }
                this.bits = tmpBits;
                this.decimal = decimal;
            };
            Byte.prototype.setBits = function (bits) {
                this.decimal = 0;
                this.bits = bits;
                for (var i = 0; i < bits.length; i++)
                    this.decimal += this.bits[i] ? Math.pow(2, i) : 0;
            };
            Byte.prototype.getDecimal = function () {
                return this.decimal;
            };
            Byte.prototype.getBits = function () {
                return this.bits;
            };
            Byte.prototype.bit = function (index, value) {
                if (value === void 0) { value = undefined; }
                if (value !== undefined) {
                    var bits = this.bits;
                    bits[index] = value;
                    this.setBits(bits);
                }
                return this.bits[index];
            };
            Byte.prototype.clone = function () {
                return new Byte(this.bits.slice());
            };
            return Byte;
        }());
        Layers.Byte = Byte;
        Layers.BYTE_ZERO = new Byte(Layers.BIT8_ZERO);
        Layers.BYTE_FULL = new Byte(Layers.BIT8_FULL);
    })(Layers = Core.Layers || (Core.Layers = {}));
})(Core || (Core = {}));
