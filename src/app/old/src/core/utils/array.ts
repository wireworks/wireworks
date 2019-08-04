/**
 * Removes an item from an array.
 * @param  {any[]} list The array that will have the item removed.
 * @param  {any} item The item to be removed.
 */
export function removeItem(list: any[], item: any): void {
	let index = list.indexOf(item);
	if (index > -1) {
		list.splice(index, 1);
	}
}