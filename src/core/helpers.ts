export function id(id: string) {
	return document.getElementById(id);
}

export function copyToClipboard(str: string, done: (success: boolean) => void): void {

	let tmp = document.createElement("textarea");

	tmp.style.position = 'fixed';
	tmp.style.top = "0";
	tmp.style.left = "0";
	tmp.style.opacity = "0";
	tmp.value = str;

	document.body.appendChild(tmp);
	tmp.focus();
	tmp.select();

	let success = document.execCommand('copy');
	document.body.removeChild(tmp);

	done(success);

}