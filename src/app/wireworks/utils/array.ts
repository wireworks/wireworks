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

/**
 * Shuffles an array and returns it.
 * @param {any[]} array The array to be shuffled.
 */
export function shuffle(array: any[]) {
	let currentIndex = array.length, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex],array[randomIndex]] = [array[randomIndex],array[currentIndex]];
	}
	return array;
}