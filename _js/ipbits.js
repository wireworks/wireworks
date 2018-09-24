// Autor: Henrique Colini
// Versão: 2.2.1 (2018-09-23)

const numbers = ['0','1','2','3','4','5','6','7','8','9'];
const IP = [];
const MASK = [];

// Pega os "elementos de bit" (os números 0 e 1 clicáveis como checkboxes) da página

for (let i=0; i<4; i++) {
	IP[i] = [];
	MASK[i] = [];
	for (let j=0; j<8; j++) {
		IP[i][j] = id("byte_"+i+"_"+j);
		MASK[i][j] = id("maskbyte_"+(j+(i*8)));
	}
}

// getBytes() - Retorna os valores dos bits da página em grupos de 4 bytes. Podem ser os bytes do IP ou da máscara

function getBytes(kind) {

	let bytes = [];

	if (kind == IP || kind == MASK) {
		for (let i=0; i<4; i++) {
			bytes[i] = [];
			for (let j=0; j<8; j++) {
				bytes[i][j] = kind[i][j].checked ? 1 : 0;
			}
		}
	}

	return bytes;

}

// setByte() - Transforma um número decimal em elementos de bit do IP, dado o índice do byte

function setByte (decimal, index) {

	let byte = decimalToByte(decimal);

	for (let i = 0; i < 8; i++) {
		id("byte_"+index+"_"+i).checked = byte[i] == 1;
	}

}

// updateIPShort() - Atualiza o pequeno texto cinza contendo o valor do IP.

function updateIPShort() {

	let ipStr = decimalsToStr(bytesToDecimals(getBytes(IP)));

	id("ip_value").textContent = ipStr;

}

// updateIPDisplay() - Atualiza o display do IP (ou seja, as caixas vermelhas) baseado no valor dos elementos de bit

function updateIPDisplay() {

	let bytes = getBytes(IP);

	for (let i=0; i<4; i++)
		id("display_" + i).textContent = byteToDecimal(bytes[i]);

	updateIPShort();

}

// updateMaskDisplay() - Atualiza o display da máscara (ou seja, as caixas azuis). O valor passado é o índice do último bit

function updateMaskDisplay(lastBit) {

	maskNumber = lastBit + (id("maskbyte_"+lastBit).checked?1:0);
	maskBytes = maskNumberToBytes(maskNumber);

	forEachBit(maskBytes,function(bit,bitIndex,i,j){
		id("maskbyte_"+bitIndex).checked = bit == 1;
		id("byte_"+i+"_"+j).disabled = bit == 1;

		if (j==0) id("maskdisplay_" + i).textContent = byteToDecimal(maskBytes[i]);
	});

	id("mask_value").textContent = "/"+maskNumber;

}

// copyDecimals() - [EVENTO: onclick nos ícones de copiar IP/Máscara] Copia decimais para a área de transferência

function copyDecimals(type) {

	let bytes = getBytes(type);
	let str = decimalsToStr(bytesToDecimals(getBytes(type)));

	let tmp = document.createElement("textarea");

	tmp.style.position = 'fixed';
	tmp.style.top = 0;
	tmp.style.left = 0;
	tmp.style.opacity = 0;
	tmp.value = str;

	document.body.appendChild(tmp);
	tmp.focus();
	tmp.select();

	let success = document.execCommand('copy');
	document.body.removeChild(tmp);

	if(success){
		let text = id(type===IP ? "copy_ip_text" : "copy_mask_text");
		text.style.transition = "";
		text.style.opacity = "1";
		setTimeout(function(){
			text.style.transition = "opacity 1s";
			text.style.opacity = "0";
		}, 1000);
	}

}

// validateInput() - [EVENTO: oninput nos displays de IP] Verifica se o valor digitado nos bytes de IP é válido, e limpa-o caso não seja.

function validateInput(evt,display,index) {

	let str = "";

	for (let i = 0; i < display.textContent.length; i++) {
		let char = display.textContent.charAt(i);
		str += numbers.indexOf(char) == -1 ? '' : char;
	}

	let value = parseInt(str,10);

	let minByte = getBytes(IP)[index];
	let maxByte = minByte.slice();
	let mask = getBytes(MASK)[index];

	for (let i = 0; i < minByte.length; i++) {
		if (mask[i] == 0) {
			minByte[i] = 0;
			maxByte[i] = 1;
		}
	}

	let minValue = byteToDecimal(minByte);
	let maxValue = byteToDecimal(maxByte);

	if (value < minValue) {
		value = minValue;
	}

	if (value > maxValue) {
		value = maxValue;
	}

	if (isNaN(value) || value == undefined) {
		value = minValue;
	}

	if (String(value) != display.textContent) {

		display.textContent = value;

		let range = document.createRange();
		let text = display.firstChild;

		range.setStart(text,display.textContent.length);
		range.setEnd(text,display.textContent.length);

		let selection = window.getSelection();

		selection.removeAllRanges();
		selection.addRange(range);
	}

	setByte(value, index);
	updateIPShort();

}

// validateKey() - [EVENTO: onkeypress nos displays de IP] Verifica se o caractere digitado num byte de IP é válido.
//                 Semelhante ao validateInput(), mas faz verificações mais simples que cancelam a entrada de um caractere,
//                 como quando o usuário digita uma letra.

function validateKey(evt,display,nextFocus){

	let charCode = evt.which ? evt.which : evt.keyCode;

	if (charCode == 9 || charCode == 8 || charCode == 46 || charCode == 37 ||
		charCode == 39 || charCode == 35 || charCode == 36 || (charCode >= 112 && charCode <= 123))
		return true;

	if (charCode < 48 || charCode > 57)
		return false;

	if (display.textContent.length >= 3 &&
		!(window.getSelection().anchorNode.parentNode == display && window.getSelection().toString().length > 0))
		return false;

	if (display.textContent == '0') {
		display.textContent = "";
	}

	return true;

}

// Limpa os campos, pois há casos no qual navegadores mantém os valores mesmo após um F5 (e ctrl+F5 para limpar campos não é legal)

setByte(0,0);
setByte(0,1);
setByte(0,2);
setByte(0,3);

updateIPDisplay();
updateMaskDisplay(0);
