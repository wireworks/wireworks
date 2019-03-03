define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function id(id) {
        return document.getElementById(id);
    }
    exports.id = id;
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
        done(success);
    }
    exports.copyToClipboard = copyToClipboard;
});
