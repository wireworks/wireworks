define(["require", "exports", "./byte"], function (require, exports, byte_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BIT8_ZERO = [false, false, false, false, false, false, false, false];
    exports.BIT8_FULL = [true, true, true, true, true, true, true, true];
    exports.BYTE_ZERO = new byte_1.Byte(exports.BIT8_ZERO);
    exports.BYTE_FULL = new byte_1.Byte(exports.BIT8_FULL);
    exports.BYTE4_ZERO = [exports.BYTE_ZERO.clone(), exports.BYTE_ZERO.clone(), exports.BYTE_ZERO.clone(), exports.BYTE_ZERO.clone()];
    exports.BYTE4_FULL = [exports.BYTE_FULL.clone(), exports.BYTE_FULL.clone(), exports.BYTE_FULL.clone(), exports.BYTE_FULL.clone()];
});
