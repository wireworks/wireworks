define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Shorthand for document.getElementById(id).
     * @param  {string} elementId String that specifies the ID value. Case-insensitive.
     */
    function id(elementId) {
        return document.getElementById(elementId);
    }
    exports.id = id;
    /**
     * Copies a string to the user's clipboard.
     * @param  {string} str String to be copied.
     * @param  {(success:boolean)=>void} done What happens on success/failure. Optional.
     */
    function copyToClipboard(str, done) {
        var tmp = document.createElement("textarea");
        tmp.style.position = 'fixed';
        tmp.style.top = "0";
        tmp.style.left = "0";
        tmp.style.opacity = "0";
        tmp.value = str;
        document.body.appendChild(tmp);
        tmp.focus();
        tmp.select();
        var success = document.execCommand('copy');
        document.body.removeChild(tmp);
        if (done) {
            done(success);
        }
    }
    exports.copyToClipboard = copyToClipboard;
});
