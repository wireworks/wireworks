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
     * Error name for a when a domain with same label but different address is found during merge.
     */
    exports.ERROR_MERGE_OVERLAP = "MergeOverlapError";
    /**
     * Error name for a when two merging domains have different labels.
     */
    exports.ERROR_MERGE_WRONG_ROOT = "MergeWrongRootError";
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
            this.setParent(parent, false);
            this.setAddress(address);
            this.setLabel(label);
            if (this.getFullName().length > 253) {
                var err = new RangeError("The full name of a domain must not exceed 253 characters");
                err.name = exports.ERROR_FULL_NAME_RANGE;
                throw err;
            }
        }
        /**
         * Merges two domains (combines their subdomains) given the original two have the same label. It has options for what to do when domains with the same labels and different addresses are found:
         * "ignore" - Nothing happens. The original address is kept.
         * "override" - The new address replaces the old one, no matter what.
         * "merge" - The new address replaces the old one only if the new one exists.
         * "error" - Throws an error when this happens.
         * @param  {Domain} other The domain to be merged with this.
         * @param  {string} overrideAddresses What to do when domains with the same labels and different addresses are found. May be "ignore", "override", "merge" or "error".
         */
        Domain.prototype.merge = function (other, overrideAddresses) {
            if (overrideAddresses === void 0) { overrideAddresses = "ignore"; }
            if (other.label !== this.label) {
                var err = new Error("Attempting to merge domains with different roots (\"" + this.label + "\" != \"" + other.label + "\")");
                err.name = exports.ERROR_MERGE_WRONG_ROOT;
                throw err;
            }
            if (this.address !== other.address && ((this.address && !this.address.compare(other.address)) || !other.address.compare(this.address))) {
                if (overrideAddresses === "override") {
                    this.address = other.address;
                }
                if (overrideAddresses === "merge") {
                    if (other.address) {
                        this.address = other.address;
                    }
                }
                if (overrideAddresses === "error") {
                    var err = new Error("Overlapping Domain addresses");
                    err.name = exports.ERROR_MERGE_OVERLAP;
                    throw err;
                }
            }
            for (var i = 0; i < other.subdomains.length; i++) {
                var sub = other.subdomains[i];
                var thisSub = this.getSubdomain(sub.label);
                if (thisSub) {
                    thisSub.merge(sub, overrideAddresses);
                }
                else {
                    this.subdomains.push(sub);
                    sub.setParent(this);
                }
            }
        };
        /**
         * Sets the label of this Domain.
         * @param  {string} label The label to be set. Must follow naming conventions. If empty, the parent should be undefined.
         */
        Domain.prototype.setLabel = function (label) {
            if ((label === '.' || label === undefined || label === "") && !this.parent) {
                this.label = '';
            }
            else if (!this.parent) {
                var err = new Error("The root domain's label must be either \".\", \"\" or undefined");
                err.name = exports.ERROR_INVALID_ROOT_LABEL;
                throw err;
            }
            else if ((label === '.' || label === undefined || label === "") && this.parent) {
                var err = new Error("The domain's label must not be \".\", \"\" or undefined");
                err.name = exports.ERROR_INVALID_LABEL;
                throw err;
            }
            else {
                var basicReg = /^[a-zA-Z]$/;
                var reg = /^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/;
                if (!basicReg.test(label) && !reg.test(label)) {
                    var err = new Error("Domain label doesn't follow the naming standards");
                    err.name = exports.ERROR_INVALID_LABEL;
                    throw err;
                }
                this.label = label;
            }
        };
        /**
         * Sets the parent of this Domain.
         * @param  {Domain} parent The parent domain to be set. If undefined, the address must also be undefined.
         * @param  {boolean} revalidateLabel Optional. Whether the label should also be revalidated. Defaults to true.
         * @param  {boolean} detach Optional. Whether this should be removed from the old parent's subdomains list. Defaults to false.
         */
        Domain.prototype.setParent = function (parent, revalidateLabel, detach) {
            if (revalidateLabel === void 0) { revalidateLabel = true; }
            if (detach === void 0) { detach = false; }
            if (this.address && !parent) {
                var err = new Error("The root domain must not have an Address.");
                err.name = exports.ERROR_ROOT_ADDRESS;
                throw err;
            }
            if (detach) {
                this.parent.subdomains.splice(this.parent.subdomains.indexOf(this), 1);
            }
            this.parent = parent;
            if (revalidateLabel) {
                this.setLabel(this.label);
            }
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
        /**
         * Returns a neatly formatted string showing the whole tree. Raw method.
         * @param  {boolean} first Whether this is the root of the tree.
         * @param  {string} prefix The prefix of this line of the tree.
         * @param  {boolean} isTail Whether this line is the tail of the tree.
         */
        Domain.prototype.getTreeStrRaw = function (first, prefix, isTail) {
            var str = (first ? "" : (prefix + (isTail ? "└── " : "├── "))) + this.toString() + (this.address ? " <" + this.address.toString(true) + ">" : "") + "\n";
            for (var i = 0; i < this.subdomains.length - 1; i++) {
                str += this.subdomains[i].getTreeStrRaw(false, (first ? "" : (prefix + (isTail ? "    " : "│   "))), false);
            }
            if (this.subdomains.length > 0) {
                str += this.subdomains[this.subdomains.length - 1].getTreeStrRaw(false, (first ? "" : (prefix + (isTail ? "    " : "│   "))), true);
            }
            return str;
        };
        /**
         * Returns a neatly formatted string showing the whole tree.
         */
        Domain.prototype.getTreeStr = function () {
            return this.getTreeStrRaw(true, "", true);
        };
        return Domain;
    }());
    exports.Domain = Domain;
});
