define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Removes an item from an array.
     * @param  {any[]} list The array that will have the item removed.
     * @param  {any} item The item to be removed.
     */
    function removeItem(list, item) {
        var index = list.indexOf(item);
        if (index > -1) {
            list.splice(index, 1);
        }
    }
    exports.removeItem = removeItem;
});
