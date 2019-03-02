var Core;
(function (Core) {
    var Byte = /** @class */ (function () {
        function Byte(decimal) {
            this.setDecimal(decimal);
        }
        Byte.prototype.setDecimal = function (decimal) {
            if (decimal < 0 || decimal > 255 || decimal.toString().indexOf('.') !== -1) {
                throw new RangeError("The decimal value of a byte must be an integer between 0-255 (inclusive)");
            }
            var tmpDecimal = decimal;
            var tmpBits = [false, false, false, false, false, false, false, false];
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
        return Byte;
    }());
    Core.Byte = Byte;
})(Core || (Core = {}));
