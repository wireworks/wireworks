import { IP } from "../layer-3/ip";

/**
 * Error name for when a root Domain has a label that isn't "." or undefined.
 */
export const ERROR_INVALID_ROOT_LABEL = "InvalidRootLabelError";

/**
 * Error name for when a Domain has an invalid label.
 */
export const ERROR_INVALID_LABEL = "InvalidLabelError";

/**
 * Error name for when a Domain's full name is greater than 253.
 */
export const ERROR_FULL_NAME_RANGE = "FullNameRangeError";

/**
 * Error name for when a root Domain has an Address.
 */
export const ERROR_ROOT_ADDRESS = "RootAddressError";

/**
 * Error name for when a domain with same label but different address is found during merge.
 */
export const ERROR_MERGE_OVERLAP = "MergeOverlapError";

/**
 * Error name for when two merging domains have different labels.
 */
export const ERROR_MERGE_WRONG_ROOT = "MergeWrongRootError";

/**
 * Error name for when trying to get the parts of an incomplete domain.
 */
export const ERROR_SMALL_DOMAIN = "SmallDomainError"

/**
 * A DNS domain tree.
 * @author Henrique Colini
 */
export class Domain {
	
	/**
	 * The parent Domain. Undefined if this is a root domain.
	 */
	private parent: Domain = undefined;

	/**
	 * This Domain's subdomains.
	 */
	private subdomains: Domain[] = [];

	/**
	 * The IP address this Domain refers to. Undefined if this is not a hostname.
	 */
	private address: IP = undefined;

	/**
	 * This Domain's text label.
	 */
	private label: string;
	
	/**
	 * Constructs a Domain, provided its label, parent and optionally an Address.
	 * @param  {string} label The label of this Domain. Must follow naming conventions.
	 * @param  {Domain} parent The parent of this Domain. If undefined, this is a root domain.
	 * @param  {IP} address The address of this Domain, if it's a hostname. Optional. Defaults to undefined. Must not exist if this is a root domain.
	 */
	constructor(label: string, parent: Domain, address: IP = undefined) {

		this.setParent(parent, false);
		this.setAddress(address);
		this.setLabel(label);

		if (this.getFullName().length > 253) {
			
			let err = new RangeError("The full name of a domain must not exceed 253 characters");
			err.name = ERROR_FULL_NAME_RANGE;
			throw err;

		}

	}

	/**
	 * Extracts a Domain from a string, in the format abc.def.ghi. Returns the last subdomain.
	 * @param  {Domain} root The root domain to be used.
	 * @param  {string} fullName The full name of the domain, in the format abc.def.ghi.
	 */
	public static extractDomain(root: Domain, fullName: string): Domain {

		let parts = fullName.trim().split(".");

		let curr: Domain = root;

		for (let i = parts.length - 1; i >= 0; i--) {

			if (parts[i].length === 0) {
				let err = new Error();
				err.name = ERROR_INVALID_LABEL;
				throw err;
			}

			let next = new Domain(parts[i], curr);
			curr.getSubdomains().push(next);
			curr = next;

		}

		return curr;

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
	public merge(other: Domain, overrideAddresses: "ignore" | "override" | "merge" | "error" = "ignore"): void {
		
		if (other.label !== this.label) {
			let err = new Error(`Attempting to merge domains with different roots ("${this.label}" != "${other.label}")`);
			err.name = ERROR_MERGE_WRONG_ROOT;
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
				let err = new Error("Overlapping Domain addresses");
				err.name = ERROR_MERGE_OVERLAP;
				throw err;
			}

		}

		for (let i = 0; i < other.subdomains.length; i++) {
			const sub = other.subdomains[i];
			const thisSub = this.getSubdomain(sub.label);
			
			if (thisSub) {
				thisSub.merge(sub, overrideAddresses);
			}
			else {
				this.subdomains.push(sub);
				sub.setParent(this);
			}

		}

	}

	/**
	 * Sets the label of this Domain.
	 * @param  {string} label The label to be set. Must follow naming conventions. If empty, the parent should be undefined.
	 */
	public setLabel(label: string): void {

		label = label.toLowerCase();

		if ((label === '.' || label === undefined || label === "") && !this.parent) {
			this.label = '';
		}
		else if (!this.parent) {
			let err = new Error("The root domain's label must be either \".\", \"\" or undefined");
			err.name = ERROR_INVALID_ROOT_LABEL;
			throw err;
		}
		else if ((label === '.' || label === undefined || label === "") && this.parent) {
			let err = new Error("The domain's label must not be \".\", \"\" or undefined");
			err.name = ERROR_INVALID_LABEL;
			throw err;
		}
		else {

			const basicReg = /^[a-zA-Z]$/;
			const reg = /^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/;

			if (!basicReg.test(label) && !reg.test(label)) {

				let err = new Error("Domain label doesn't follow the naming standards");
				err.name = ERROR_INVALID_LABEL;
				throw err;
			}

			this.label = label;
			
		}
	}
	
	/**
	 * Sets the parent of this Domain.
	 * @param  {Domain} parent The parent domain to be set. If undefined, the address must also be undefined.
	 * @param  {boolean} revalidateLabel Optional. Whether the label should also be revalidated. Defaults to true.
	 * @param  {boolean} detach Optional. Whether this should be removed from the old parent's subdomains list. Defaults to false.
	 */
	public setParent(parent: Domain, revalidateLabel: boolean = true, detach: boolean = false): void {
		
		if (this.address && !parent) {
			let err = new Error("The root domain must not have an Address.");
			err.name = ERROR_ROOT_ADDRESS;
			throw err;
		}
		
		if (detach) {
			this.parent.subdomains.splice(this.parent.subdomains.indexOf(this), 1);
		}

		this.parent = parent;

		if (revalidateLabel) {
			this.setLabel(this.label);
		}

	}
		
	/**
	 * Sets the address of this Domain, making it a hostname.
	 * @param  {IP} address The address to be set. If the parent is undefined, this must be undefined as well.
	 */
	public setAddress(address: IP): void {
		if (address && !this.parent) {
			let err = new Error("The root domain must not have an Address.");
			err.name = ERROR_ROOT_ADDRESS;
			throw err;
		}
		this.address = address;
	}

	/**
	 * Sets this Domain's subdomains.
	 */
	public setSubdomains(subdomains: Domain[]) {
		this.subdomains = subdomains;
	}

	/**
	 * Returns this Domain's label.
	 */
	public getLabel(): string {
		return this.label;
	}

	/**
	 * Returns this Domain's parent domain.
	 */
	public getParent(): Domain {
		return this.parent;
	}

	/**
	 * Returns this Domain's address if this is a hostname.
	 */
	public getAddress(): IP {
		return this.address;
	}
	
	/**
	 * Returns this Domain's subdomains.
	 */
	public getSubdomains(): Domain[] {
		return this.subdomains;
	}
	
	/**
	 * Returns a subdomain, given its label. If not found, returns undefined.
	 * @param  {string} label The label of the Domain to be searched.
	 */
	public getSubdomain(label: string): Domain {
		
		for (let i = 0; i < this.subdomains.length; i++) {
			const sub = this.subdomains[i];
			if (sub.label === label) {
				return sub;
			}
		}

		return undefined;

	}

	/**
	 * Returns a string representation of this Domain. Similar to getLabel(), except it returns "." if this is a root domain.
	 */
	public toString(): string {
		if (!this.parent) {
			return ".";
		}
		return this.getLabel();
	}

	/**
	 * Returns the full name of this Domain, recursively adding parents.
	 */
	public getFullName(): string {
		if (!this.parent) {
			return "";
		}
		if (!this.parent.parent) {
			return this.label;
		}
		return this.label + "." + this.parent.getFullName();
	}
	
	/**
	 * Returns the parts of a complete domain (such as the full domain, top-level domain etc), as strings. Adds "www" if missing.
	 */
	public getDomainParts(): { full: string, tld: string, dest: string, inter: string, admin: string } {

		let domainParts = this.getFullName().split(".");

		if (domainParts.length < 2) {
			let error = Error();
			error.name = ERROR_SMALL_DOMAIN;
			throw error;
		}

		let fullStr = "";
		let tldStr = domainParts[domainParts.length - 1];
		let destStr = domainParts[0];
		let interStr = "";
		let adminStr = "";

		if (domainParts.length === 2 || destStr !== "www") {
			domainParts.unshift("www");
			destStr = "www";
		}
		
		if (domainParts.length > 3) {
			let middle = "";
			for (let i = 2; i < domainParts.length - 1; i++) middle += domainParts[i] + ((i < domainParts.length - 2) ? "." : "");
			domainParts = [domainParts[0], domainParts[1], middle, domainParts[domainParts.length - 1]];
			interStr = middle;
		}

		for (let i = 0; i < domainParts.length; i++) fullStr += domainParts[i] + ((i < domainParts.length - 1) ? "." : "");
		adminStr = domainParts[1];

		return { full: fullStr, tld: tldStr, dest: destStr, inter: interStr, admin: adminStr };

	}

	/**
	 * Returns a neatly formatted string showing the whole tree. Raw method.
	 * @param  {boolean} first Whether this is the root of the tree.
	 * @param  {string} prefix The prefix of this line of the tree.
	 * @param  {boolean} isTail Whether this line is the tail of the tree.
	 */
	private getTreeStrRaw(first: boolean, prefix: string, isTail: boolean): string {

		let str = (first ? "" : (prefix + (isTail ? "└── " : "├── "))) + this.toString() + (this.address ? ` <${this.address.toString(true)}>` : "") + "\n";
	
		for (let i = 0; i < this.subdomains.length - 1; i++) {
			str += this.subdomains[i].getTreeStrRaw(false, (first ? "" : (prefix + (isTail ? "    " : "│   "))), false);
		}

		if (this.subdomains.length > 0) {
			str += this.subdomains[this.subdomains.length - 1].getTreeStrRaw(false, (first ? "" : (prefix + (isTail ? "    " : "│   "))), true);
		}

		return str;

	}

	/**
	 * Returns a neatly formatted string showing the whole tree.
	 */
	public getTreeStr(): string {
		return this.getTreeStrRaw(true, "", true);
	}

}