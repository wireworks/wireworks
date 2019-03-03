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
});
