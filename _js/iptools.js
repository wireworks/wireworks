// Autor: Henrique Colini
// Versão: 1.1 (2018-09-25)

// Códigos de erro

const V_SUCCESS = 0;
const V_BIGBYTES = 1; // values[0] > 255 || values[1] > 255 || values[2] > 255 || values[3] > 255
const V_SMALLBYTES = 2;
const V_BIGMASK = 3;
const V_SMALLMASK = 4;
const V_TOOMANYBYTES = 5;
const V_TOOFEWBYTES = 6;

// id() - Abreviação de document.getElementById()

function id (id) {
	return document.getElementById(id);
}

// byteToDecimal() - Converte um byte (array de bits) em um número decimal. Exemplo: byteToDecimal([1,1,0,0,0,0,0,0]) = 192

function byteToDecimal (byte) {

	let decimal = 0;

	for (let i=0; i<8;i++)
		decimal += byte[i] ? 128/Math.pow(2,i) : 0;

	return decimal;

}

// decimalToByte() - Converte um número decimal (entre 0 e 255) em um byte (array de bits).

function decimalToByte(decimal) {
	let byte = [0,0,0,0,0,0,0,0];

	if (decimal > 0 && decimal < 256) {
		for (let i=0; i<8;i++) {
			byte[i] = decimal%2;
			decimal = Math.floor(decimal/2);
		}
		byte = byte.reverse();
	}

	return byte;
}

// bytesToDecimals() - Coverte 4 bytes em 4 decimais

function bytesToDecimals(bytes) {
	let decimals = [];
	decimals[0] = byteToDecimal(bytes[0]);
	decimals[1] = byteToDecimal(bytes[1]);
	decimals[2] = byteToDecimal(bytes[2]);
	decimals[3] = byteToDecimal(bytes[3]);
	return decimals;
}

// decimalsToBytes() - Coverte 4 decimais em 4 bytes

function decimalsToBytes(decimals) {
	let bytes = [];
	bytes[0] = decimalToByte(decimals[0]);
	bytes[1] = decimalToByte(decimals[1]);
	bytes[2] = decimalToByte(decimals[2]);
	bytes[3] = decimalToByte(decimals[3]);
	return bytes;
}

// bitIndexToBytePos() - Transforma um índice de bit (0..31) em uma posição no byte (0..3,0..7)

function bitIndexToBytePos(bitIndex) {
	return {
		i: Math.floor(bitIndex/8),
		j: bitIndex%8
	};
}

// bytePosToBitIndex() - Transforma uma posição no byte (0..3,0..7) em um índice de bit (0..31)

function bytePosToBitIndex(i,j) {
	return (8*i)+j;
}

// forEachBit() - Itera por todos os bits de uma série de bytes

function forEachBit(bytes,callback,starting=0) {
	let running = true;
	let str = '';
	let bytePos = bitIndexToBytePos(starting);
	let startI = bytePos.i;
	let startJ = bytePos.j;

	for (let i = startI; i < 4 && running; i++) {
		for (let j = startJ; j < 8 && running; j++) {
			str+=bytes[i][j];
			if (callback(bytes[i][j],bytePosToBitIndex(i,j),i,j) === false) {
				running = false;
			}
		}
	}
}

// validateIpValues() - Valida um endereço IP+máscara

function validateIpValues(values) {
	let validation = [];

	if (values.length && values.length > 4)
		validation.push(V_TOOMANYBYTES);

	if (!values.length || values.length < 4)
		validation.push(V_TOOFEWBYTES);

	if (values.mask && values.mask > 32)
		validation.push(V_BIGMASK);

	if (!values.mask || values.mask < 0)
		validation.push(V_SMALLMASK);

	if (values.length) {
		let tooBig = false;
		let tooSmall = false;
		for (let i = 0; !(tooBig && tooSmall) && i < values.length; i++) {
			if(values[i] > 255)
				tooBig = true;
			if (values[i] < 0)
				tooSmall = true;
		}
		if (tooBig)
			validation.push(V_BIGBYTES);
		if (tooSmall)
			validation.push(V_SMALLBYTES);
	}

	if (validation.length == 0)
		validation.push(V_SUCCESS);

	return validation;
}

// getNetDecimals() - Retorna o endereço de rede de um endereço IP+máscara qualquer

function getNetDecimals(ipValues) {

	let netBytes = [[],[],[],[]];

	forEachBit(decimalsToBytes(ipValues),function(bit,bitIndex,i,j){
		netBytes[i][j] = bitIndex >= ipValues.mask ? 0 : bit;
	});

	let netDecimals = bytesToDecimals(netBytes);
	return netDecimals;

}

// getBroadcastDecimals() - Retorna o endereço de broadcast de um endereço IP+máscara qualquer

function getBroadcastDecimals(ipValues) {

	let broadcastBytes = [[],[],[],[]];

	forEachBit(decimalsToBytes(ipValues),function(bit,bitIndex,i,j){
		broadcastBytes[i][j] = bitIndex >= ipValues.mask ? 1 : bit;
	});

	let broadcastDecimals = bytesToDecimals(broadcastBytes);
	return broadcastDecimals;

}

// strToIPValues() - Converte uma string de ip (exemplo "192.168.0.0/24") em um ipValue (array de octetos + máscara)

function strToIPValues(ipmask) {
	if (ipmask && typeof ipmask === 'string') {
		ipmask = ipmask.trim();
		const regex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/;
		if ((match = regex.exec(ipmask)) !== null) {
			let values = [];
			values[0] = parseInt(match[1],10);
			values[1] = parseInt(match[2],10);
			values[2] = parseInt(match[3],10);
			values[3] = parseInt(match[4],10);
			values.mask = parseInt(match[5],10);
			return values;
		}
		else {
			return undefined;
		}
	}
	return undefined;
}

// maskNumberToBytes() - Converte uma máscara de número para bytes (exemplo: /24 -> 255.255.255.0)

function maskNumberToBytes(number) {
	let bytes = [];
	if (number >= 0 && number <= 32) {
		for (let i = 0; i < 4; i++) {
			bytes[i] = [];
			for (let j = 0; j < 8; j++) {
				if (((8*i)+j) < number) {
					bytes[i][j] = 1;
				}
				else {
					bytes[i][j] = 0;
				}
			}
		}
	}
	else {
		for (let i = 0; i < 4; i++) {
			bytes[i] = [];
			for (let j = 0; j < 8; j++) {
				bytes[i][j] = 0;
			}
		}
	}
	return bytes;
}

// decimalsToStr() - Converte array de decimais em uma string

function decimalsToStr(decimals) {
	return `${decimals[0]}.${decimals[1]}.${decimals[2]}.${decimals[3]}`;
}

// ipValuesToStr() - Converte array de decimais + máscara em uma string

function ipValuesToStr(ipValues) {
	return `${ipValues[0]}.${ipValues[1]}.${ipValues[2]}.${ipValues[3]}/${ipValues.mask}`;
}

// hostNumber() - Retorna a quantidade de hosts que essa máscara possui

function hostNumber(mask) {
	if (mask==31)
		return '2';
	if (mask==32)
		return '1';
	return (Math.pow(2,32-mask)-2);
}
