var Core;
(function (Core) {
    var Layers;
    (function (Layers) {
        var Layer3;
        (function (Layer3) {
            Layer3.BYTE4_ZERO = [Layers.BYTE_ZERO.clone(), Layers.BYTE_ZERO.clone(), Layers.BYTE_ZERO.clone(), Layers.BYTE_ZERO.clone()];
            Layer3.BYTE4_FULL = [Layers.BYTE_FULL.clone(), Layers.BYTE_FULL.clone(), Layers.BYTE_FULL.clone(), Layers.BYTE_FULL.clone()];
            var Address = /** @class */ (function () {
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
                            this.mask = Layer3.BYTE4_ZERO.slice();
                        }
                    }
                }
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
                Address.prototype.setMaskShort = function (maskShort) {
                    if (maskShort < 0 || maskShort > 32) {
                        throw new RangeError("The short mask should be between 0 and 32");
                    }
                    var tmpMask = Layer3.BYTE4_ZERO.slice();
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
                Address.prototype.setIp = function (ip) {
                    this.ip = ip;
                };
                Address.prototype.getMask = function () {
                    return this.mask;
                };
                Address.prototype.getMaskShort = function () {
                    return this.maskShort;
                };
                Address.prototype.getIp = function () {
                    return this.ip;
                };
                Address.prototype.parseAddress = function (address, requireMask) {
                    if (requireMask === void 0) { requireMask = true; }
                    address = address.trim();
                    var fullRegex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/;
                    var ipRegex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
                    var match = fullRegex.exec(address);
                    if (match !== null) {
                        var ipByte0 = new Layers.Byte(parseInt(match[1], 10));
                        var ipByte1 = new Layers.Byte(parseInt(match[2], 10));
                        var ipByte2 = new Layers.Byte(parseInt(match[3], 10));
                        var ipByte3 = new Layers.Byte(parseInt(match[4], 10));
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
                            var ipByte0 = new Layers.Byte(parseInt(matchIp[1], 10));
                            var ipByte1 = new Layers.Byte(parseInt(matchIp[2], 10));
                            var ipByte2 = new Layers.Byte(parseInt(matchIp[3], 10));
                            var ipByte3 = new Layers.Byte(parseInt(matchIp[4], 10));
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
            Layer3.Address = Address;
        })(Layer3 = Layers.Layer3 || (Layers.Layer3 = {}));
    })(Layers = Core.Layers || (Core.Layers = {}));
})(Core || (Core = {}));
