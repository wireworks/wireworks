define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Error name for a when a root Domain has a label that isn't "." or undefined.
     */
    exports.ERROR_INVALID_ROOT_LABEL = "InvalidRootLabelError";
    /**
     * Error name for a when a Domain has an invalid label.
     */
    exports.ERROR_INVALID_LABEL = "InvalidLabelError";
    /**
     * Error name for a when a Domain's full name is greater than 253.
     */
    exports.ERROR_FULL_NAME_RANGE = "FullNameRangeError";
    /**
     * Error name for a when a root Domain has an Address.
     */
    exports.ERROR_ROOT_ADDRESS = "RootAddressError";
    /**
     * A DNS domain tree.
     * @author Henrique Colini
     */
    var Domain = /** @class */ (function () {
        /**
         * Constructs a Domain, provided its label, parent and optionally an Address.
         * @param  {string} label The label of this Domain. Must follow naming conventions.
         * @param  {Domain} parent The parent of this Domain. If undefined, this is a root domain.
         * @param  {Address} address The address of this Domain, if it's a hostname. Optional. Defaults to undefined. Must not exist if this is a root domain.
         */
        function Domain(label, parent, address) {
            if (address === void 0) { address = undefined; }
            /**
             * The parent Domain. Undefined if this is a root domain.
             */
            this.parent = undefined;
            /**
             * This Domain's subdomains.
             */
            this.subdomains = [];
            /**
             * The IP address this Domain refers to. Undefined if this is not a hostname.
             */
            this.address = undefined;
            this.setParent(parent);
            this.setAddress(address);
            this.setLabel(label);
            if (this.getFullName().length > 253) {
                var err = new RangeError("The full name of a domain must not exceed 253 characters");
                err.name = exports.ERROR_FULL_NAME_RANGE;
                throw err;
            }
        }
        /**
         * Sets the label of this Domain.
         * @param  {string} label The label to be set. Must follow naming conventions.
         */
        Domain.prototype.setLabel = function (label) {
            if ((label === '.' || label === undefined || label === "") && !this.parent) {
                this.label = '';
            }
            else if (!this.parent) {
                var err = new Error("The root domain's label must be either \".\" or undefined");
                err.name = exports.ERROR_INVALID_ROOT_LABEL;
                throw err;
            }
            else if (this.parent) {
                var err = new Error("The domain's label must not be \".\" or undefined");
                err.name = exports.ERROR_INVALID_LABEL;
                throw err;
            }
            else {
                var reg = /^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/;
                if (!reg.test(label)) {
                    var err = new Error("Domain label doesn't follow the naming standards");
                    err.name = exports.ERROR_INVALID_LABEL;
                    throw err;
                }
            }
            this.label = label;
        };
        /**
         * Sets the parent of this Domain.
         * @param  {Domain} parent The parent domain to be set. If undefined, the address must also be undefined.
         */
        Domain.prototype.setParent = function (parent) {
            if (this.address && !parent) {
                var err = new Error("The root domain must not have an Address.");
                err.name = exports.ERROR_ROOT_ADDRESS;
                throw err;
            }
            this.parent = parent;
        };
        /**
         * Sets the address of this Domain, making it a hostname.
         * @param  {Address} address The address to be set. If the parent is undefined, this must be undefined as well.
         */
        Domain.prototype.setAddress = function (address) {
            if (address && !this.parent) {
                var err = new Error("The root domain must not have an Address.");
                err.name = exports.ERROR_ROOT_ADDRESS;
                throw err;
            }
            this.address = address;
        };
        /**
         * Sets this Domain's subdomains.
         */
        Domain.prototype.setSubdomains = function (subdomains) {
            this.subdomains = subdomains;
        };
        /**
         * Returns this Domain's label.
         */
        Domain.prototype.getLabel = function () {
            return this.label;
        };
        /**
         * Returns this Domain's parent domain.
         */
        Domain.prototype.getParent = function () {
            return this.parent;
        };
        /**
         * Returns this Domain's address if this is a hostname.
         */
        Domain.prototype.getAddress = function () {
            return this.address;
        };
        /**
         * Returns this Domain's subdomains.
         */
        Domain.prototype.getSubdomains = function () {
            return this.subdomains;
        };
        /**
         * Returns a subdomain, given its label. If not found, returns undefined.
         * @param  {string} label The label of the Domain to be searched.
         */
        Domain.prototype.getSubdomain = function (label) {
            for (var i = 0; i < this.subdomains.length; i++) {
                var sub = this.subdomains[i];
                if (sub.label === label) {
                    return sub;
                }
            }
            return undefined;
        };
        /**
         * Returns a string representation of this Domain. Similar to getLabel(), except it returns "." if this is a root domain.
         */
        Domain.prototype.toString = function () {
            if (!this.parent) {
                return ".";
            }
            return this.getLabel();
        };
        /**
         * Returns the full name of this Domain, recursively adding parents.
         */
        Domain.prototype.getFullName = function () {
            if (!this.parent) {
                return "";
            }
            if (!this.parent.parent) {
                return this.label;
            }
            return this.label + "." + this.parent.getFullName();
        };
        return Domain;
    }());
    exports.Domain = Domain;
});
