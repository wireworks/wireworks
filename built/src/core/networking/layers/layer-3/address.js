define(["require", "exports", "../../byte"], function (require, exports, byte_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Returns a Byte4 corresponding to 0, 0, 0, 0.
     */
    function Byte4Zero() {
        return [byte_1.ByteZero(), byte_1.ByteZero(), byte_1.ByteZero(), byte_1.ByteZero()];
    }
    exports.Byte4Zero = Byte4Zero;
    /**
     * Returns a Byte4 corresponding to 255, 255, 255, 255.
     */
    function Byte4Max() {
        return [byte_1.ByteMax(), byte_1.ByteMax(), byte_1.ByteMax(), byte_1.ByteMax()];
    }
    exports.Byte4Max = Byte4Max;
    /**
     * A full IP/Mask address.
     * @author Henrique Colini
     */
    var Address = /** @class */ (function () {
        /**
         * Constructs an Address, given an IP and a mask.
         * @constructor
         * @param  {Byte4|string} ip The IP of this Address. May be a Byte4 or a formatted string.
         * @param  {Byte4|number} mask Optional. The mask of this Address. May be a Byte4 or its numerical representation.
         */
        function Address(ip, mask) {
            if (typeof ip === "string") {
                this.parseAddress(ip, false);
            }
            else {
                this.ip = ip;
            }
            if (!this.mask) {
                if (mask) {
                    if (typeof mask === "number") {
                        this.setMaskShort(mask);
                    }
                    else {
                        this.setMask(mask);
                    }
                }
                else {
                    this.mask = Byte4Zero();
                }
            }
        }
        /**
         * Sets this Address' mask.
         * @param  {Byte4} mask
         */
        Address.prototype.setMask = function (mask) {
            var maskShortTmp = 0;
            var end = false;
            for (var i = 0; !end && i < 4; i++) {
                for (var j = 0; !end && j < 8; j++) {
                    if (mask[i].bit(8 - 1 - j)) {
                        maskShortTmp++;
                    }
                    else {
                        end = true;
                    }
                }
                end = true;
            }
            this.maskShort = maskShortTmp;
            this.mask = mask;
        };
        /**
         * Sets this Address' mask, given its numerical representation (0-32).
         * @param  {number} maskShort
         */
        Address.prototype.setMaskShort = function (maskShort) {
            if (maskShort < 0 || maskShort > 32) {
                throw new RangeError("The short mask should be between 0 and 32");
            }
            var tmpMask = Byte4Zero();
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 8; j++) {
                    if (((8 * i) + j) < maskShort) {
                        tmpMask[i].bit(8 - 1 - j, true);
                    }
                    else {
                        tmpMask[i].bit(8 - 1 - j, false);
                    }
                }
            }
            this.maskShort = maskShort;
            this.mask = tmpMask;
        };
        /**
         * Sets this Address' IP value.
         * @param  {Byte4} ip
         */
        Address.prototype.setIp = function (ip) {
            this.ip = ip;
        };
        /**
         * Returns this Address' mask.
         */
        Address.prototype.getMask = function () {
            return this.mask;
        };
        /**
         * Returns the numerical representation of this Address' mask.
         */
        Address.prototype.getMaskShort = function () {
            return this.maskShort;
        };
        /**
         * Returns this Address' IP value.
         */
        Address.prototype.getIp = function () {
            return this.ip;
        };
        /**
         * Sets this Address IP/Mask values from a parsed string.
         * @param  {string} address The full address, in the X.X.X.X/X format. If requireMask is false, the mask can be ommited and defaults to /0.
         * @param  {boolean=true} requireMask Whether the address requires the mask to be given.
         */
        Address.prototype.parseAddress = function (address, requireMask) {
            if (requireMask === void 0) { requireMask = true; }
            address = address.trim();
            var fullRegex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/;
            var ipRegex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
            var match = fullRegex.exec(address);
            if (match !== null) {
                var ipByte0 = new byte_1.Byte(parseInt(match[1], 10));
                var ipByte1 = new byte_1.Byte(parseInt(match[2], 10));
                var ipByte2 = new byte_1.Byte(parseInt(match[3], 10));
                var ipByte3 = new byte_1.Byte(parseInt(match[4], 10));
                var maskShort = parseInt(match[5], 10);
                if (maskShort < 0 || maskShort > 32) {
                    throw new RangeError("The short mask should be between 0 and 32");
                }
                this.setIp([ipByte0, ipByte1, ipByte2, ipByte3]);
                this.setMaskShort(maskShort);
            }
            else if (!requireMask) {
                var matchIp = ipRegex.exec(address);
                if (matchIp !== null) {
                    var ipByte0 = new byte_1.Byte(parseInt(matchIp[1], 10));
                    var ipByte1 = new byte_1.Byte(parseInt(matchIp[2], 10));
                    var ipByte2 = new byte_1.Byte(parseInt(matchIp[3], 10));
                    var ipByte3 = new byte_1.Byte(parseInt(matchIp[4], 10));
                    this.setIp([ipByte0, ipByte1, ipByte2, ipByte3]);
                }
                else {
                    throw new Error("Invalid IP/mask address string");
                }
            }
            else {
                throw new Error("Invalid IP/mask address string");
            }
        };
        return Address;
    }());
    exports.Address = Address;
});
