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
     * Clones a Byte4.
     * @param  {Byte4} byte4 The Byte4 to be cloned.
     */
    function cloneByte4(byte4) {
        byte4 = byte4.slice();
        for (var i = 0; i < 4; i++) {
            byte4[i] = byte4[i].clone();
        }
        return byte4;
    }
    exports.cloneByte4 = cloneByte4;
    /**
     * Error name for a mask with holes.
     */
    exports.ERROR_MASK_HOLES = "MaskHolesError";
    /**
     * Error name for a mask outside the correct range.
     */
    exports.ERROR_MASK_RANGE = "MaskRangeError";
    /**
     * Error name for a malformated address string.
     */
    exports.ERROR_ADDRESS_PARSE = "AddressParseError";
    /**
     * Error name for a when an Address should be a Network Address, but isn't.
     */
    exports.ERROR_NOT_NETWORK = "NotNetworkError";
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
         * Returns the Network Address of this Address.
         */
        Address.prototype.getNetworkAddress = function () {
            var bytes = Array(4);
            for (var i = 0; i < 4; i++) {
                var minByte = this.ip[i].clone();
                var maskByte = this.mask[i];
                for (var i_1 = 0; i_1 < 8; i_1++) {
                    if (!maskByte.bit(i_1)) {
                        minByte.bit(i_1, false);
                    }
                }
                bytes[i] = minByte;
            }
            return new Address(bytes, cloneByte4(this.mask));
        };
        /**
         * Returns the Broadcast Address of this Address' network.
         */
        Address.prototype.getBroadcastAddress = function () {
            var bytes = Array(4);
            for (var i = 0; i < 4; i++) {
                var maxByte = this.ip[i].clone();
                var maskByte = this.mask[i];
                for (var i_2 = 0; i_2 < 8; i_2++) {
                    if (!maskByte.bit(i_2)) {
                        maxByte.bit(i_2, true);
                    }
                }
                bytes[i] = maxByte;
            }
            return new Address(bytes, cloneByte4(this.mask));
        };
        /**
         * Returns whether this Address is a Network Address.
         */
        Address.prototype.isNetworkAddress = function () {
            return this.compare(this.getNetworkAddress());
        };
        ;
        /**
         * Returns whether this Address is a Broadcast Address.
         */
        Address.prototype.isBroadcastAddress = function () {
            return this.compare(this.getBroadcastAddress());
        };
        ;
        /**
         * Returns true if this Address is the same as another.
         * @param {Address} other the Address to be compared with.
         */
        Address.prototype.compare = function (other) {
            if (this === other)
                return true;
            if (this.ip === other.ip && (this.mask === other.mask || this.maskShort === other.maskShort))
                return true;
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 8; j++) {
                    if ((this.ip[i].bit(j) !== other.ip[i].bit(j)) || (this.mask[i].bit(j) !== other.mask[i].bit(j))) {
                        return false;
                    }
                }
            }
            return true;
        };
        /**
         * Returns the amount of hosts that this Address' network has.
         * @param {boolean} requireNetwork Optional. If true, throws an error if this is not a Network Address.
         */
        Address.prototype.numberOfHosts = function (requireNetwork) {
            if (requireNetwork === void 0) { requireNetwork = false; }
            if (requireNetwork && !this.isNetworkAddress()) {
                var err = new Error("Not a Network Address");
                err.name = exports.ERROR_NOT_NETWORK;
                throw err;
            }
            if (this.maskShort == 31)
                return 2;
            if (this.maskShort == 32)
                return 1;
            return (Math.pow(2, 32 - this.maskShort) - 2);
        };
        /**
         * Returns the first valid host Address of this network.
         * @param  {boolean} requireNetwork Optional. If true, throws an error if this is not a Network Address.
         */
        Address.prototype.firstHost = function (requireNetwork) {
            if (requireNetwork === void 0) { requireNetwork = false; }
            if (requireNetwork && !this.isNetworkAddress()) {
                var err = new Error("Not a Network Address");
                err.name = exports.ERROR_NOT_NETWORK;
                throw err;
            }
            var ipBytes;
            var maskBytes;
            if (requireNetwork) {
                ipBytes = cloneByte4(this.ip);
                maskBytes = cloneByte4(this.mask);
            }
            else {
                var net = this.getNetworkAddress();
                ipBytes = net.ip;
                maskBytes = net.mask;
            }
            if (this.maskShort < 31) {
                ipBytes[3].setDecimal(ipBytes[3].getDecimal() + 1);
            }
            return new Address(ipBytes, maskBytes);
        };
        /**
         * Returns the last valid host Address of this network.
         * @param  {boolean} requireNetwork Optional. If true, throws an error if this is not a Network Address.
         */
        Address.prototype.lastHost = function (requireNetwork) {
            if (requireNetwork === void 0) { requireNetwork = false; }
            if (requireNetwork && !this.isNetworkAddress()) {
                var err = new Error("Not a Network Address");
                err.name = exports.ERROR_NOT_NETWORK;
                throw err;
            }
            var ipBytes;
            var maskBytes;
            var net = this.getBroadcastAddress();
            ipBytes = net.ip;
            maskBytes = net.mask;
            if (this.maskShort < 31) {
                ipBytes[3].setDecimal(ipBytes[3].getDecimal() - 1);
            }
            return new Address(ipBytes, maskBytes);
        };
        /**
         * Sets this Address' mask.
         * @param  {Byte4} mask The Byte4 mask to be set.
         */
        Address.prototype.setMask = function (mask) {
            var maskShortTmp = 0;
            var end = false;
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 8; j++) {
                    if (mask[i].bit(8 - 1 - j)) {
                        if (!end) {
                            maskShortTmp++;
                        }
                        else {
                            var err = new Error("Mask contains holes");
                            err.name = exports.ERROR_MASK_HOLES;
                            throw err;
                        }
                    }
                    else {
                        end = true;
                    }
                }
            }
            this.maskShort = maskShortTmp;
            this.mask = mask;
        };
        /**
         * Sets this Address' mask, given its numerical representation (0-32).
         * @param  {number} maskShort The numerical mask to be set.
         */
        Address.prototype.setMaskShort = function (maskShort) {
            if (maskShort < 0 || maskShort > 32) {
                var err = new RangeError("The short mask should be between 0 and 32");
                err.name = exports.ERROR_MASK_RANGE;
                throw err;
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
                    var err = new RangeError("The short mask should be between 0 and 32");
                    err.name = exports.ERROR_MASK_RANGE;
                    throw err;
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
                    var err = new Error("Invalid IP/mask address string");
                    err.name = exports.ERROR_ADDRESS_PARSE;
                    throw err;
                }
            }
            else {
                var err = new Error("Invalid IP/mask address string");
                err.name = exports.ERROR_ADDRESS_PARSE;
                throw err;
            }
        };
        /**
         * Returns the string representation of this Address in the X.X.X.X/X format.
         * @param  {boolean} omitMask Whether the mask should be ommited. Defaults to false.
         */
        Address.prototype.toString = function (omitMask) {
            if (omitMask === void 0) { omitMask = false; }
            return "" +
                this.ip[0].getDecimal() + "." +
                this.ip[1].getDecimal() + "." +
                this.ip[2].getDecimal() + "." +
                this.ip[3].getDecimal() + (omitMask ? "" : this.shortMaskString());
        };
        /**
         * Returns the string representation of the mask.
         */
        Address.prototype.maskString = function () {
            return "" +
                this.mask[0].getDecimal() + "." +
                this.mask[1].getDecimal() + "." +
                this.mask[2].getDecimal() + "." +
                this.mask[3].getDecimal();
        };
        Address.prototype.shortMaskString = function () {
            return "/" + this.getMaskShort();
        };
        return Address;
    }());
    exports.Address = Address;
});
