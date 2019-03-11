import { Address } from "../layer-3/address";

/**
 * Error name for a when a root Domain has a label that isn't "." or undefined.
 */
export const ERROR_INVALID_ROOT_LABEL = "InvalidRootLabelError";

/**
 * Error name for a when a Domain has an invalid label.
 */
export const ERROR_INVALID_LABEL = "InvalidLabelError";

/**
 * Error name for a when a Domain's full name is greater than 253.
 */
export const ERROR_FULL_NAME_RANGE = "FullNameRangeError";

/**
 * Error name for a when a root Domain has an Address.
 */
export const ERROR_ROOT_ADDRESS = "RootAddressError";

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
	private address: Address = undefined;

	/**
	 * This Domain's text label.
	 */
	private label: string;
	
	/**
	 * Constructs a Domain, provided its label, parent and optionally an Address.
	 * @param  {string} label The label of this Domain. Must follow naming conventions.
	 * @param  {Domain} parent The parent of this Domain. If undefined, this is a root domain.
	 * @param  {Address} address The address of this Domain, if it's a hostname. Optional. Defaults to undefined. Must not exist if this is a root domain.
	 */
	constructor(label: string, parent: Domain, address: Address = undefined) {

		this.setParent(parent);
		this.setAddress(address);
		this.setLabel(label);

		if (this.getFullName().length > 253) {
			
			let err = new RangeError("The full name of a domain must not exceed 253 characters");
			err.name = ERROR_FULL_NAME_RANGE;
			throw err;

		}

	}
	
	/**
	 * Sets the label of this Domain.
	 * @param  {string} label The label to be set. Must follow naming conventions.
	 */
	public setLabel(label: string): void {
		if ((label === '.' || label === undefined || label === "") && !this.parent) {
			this.label = '';
		}
		else if (!this.parent) {
			let err = new Error("The root domain's label must be either \".\" or undefined");
			err.name = ERROR_INVALID_ROOT_LABEL;
			throw err;
		}
		else if (this.parent) {
			let err = new Error("The domain's label must not be \".\" or undefined");
			err.name = ERROR_INVALID_LABEL;
			throw err;
		}
		else {

			const reg = /^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/;

			if (!reg.test(label)) {
				let err = new Error("Domain label doesn't follow the naming standards");
				err.name = ERROR_INVALID_LABEL;
				throw err;
			}

		}
		this.label = label;
	}
	
	/**
	 * Sets the parent of this Domain.
	 * @param  {Domain} parent The parent domain to be set. If undefined, the address must also be undefined.
	 */
	public setParent(parent: Domain): void {
		if (this.address && !parent) {
			let err = new Error("The root domain must not have an Address.");
			err.name = ERROR_ROOT_ADDRESS;
			throw err;
		}
		this.parent = parent;
	}
	
	/**
	 * Sets the address of this Domain, making it a hostname.
	 * @param  {Address} address The address to be set. If the parent is undefined, this must be undefined as well.
	 */
	public setAddress(address: Address): void {
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
	public getAddress(): Address {
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

}