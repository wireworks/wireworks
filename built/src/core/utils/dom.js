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
    /**
     * Creates an HTML element.
     * @param  {string} tagName The tag of the element, such as "div", "span", "p" etc.
     * @param  {string|string[]} classes The classes of the element. Optional. Can be either a string or an array of strings.
     * @param  {string} text The text content of this element.
     * @param  {string} id The ID of this element.
     */
    function make(tagName, classes, text, id) {
        if (classes === void 0) { classes = undefined; }
        if (text === void 0) { text = undefined; }
        if (id === void 0) { id = undefined; }
        var dom = document.createElement(tagName);
        if (classes !== undefined) {
            if (typeof classes === "string" && classes.length > 0) {
                classes = classes.trim().split(" ");
            }
            if (typeof classes === "object") {
                for (var i = 0; i < classes.length; i++) {
                    dom.classList.add(classes[i]);
                }
            }
        }
        if (text !== undefined) {
            dom.appendChild(textNode(text));
        }
        if (id !== undefined) {
            dom.id = id;
        }
        return dom;
    }
    exports.make = make;
    /**
     * This removes all children from the element.
     * @param  {HTMLElement} element The parent element.
     */
    function clearChildren(element) {
        while (element.lastChild)
            element.removeChild(element.lastChild);
    }
    exports.clearChildren = clearChildren;
    /**
     * Returns a text node, given a string.
     * @param  {string} text The text of the node.
     */
    function textNode(text) {
        return document.createTextNode(text);
    }
    exports.textNode = textNode;
});
