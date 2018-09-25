// Autor: Henrique Colini
// Versão: 1.0 (2018-09-23)

const ELEMENT_STYLES = ['ss-0','ss-1','ss-2','ss-3','ss-4','ss-5','ss-6','ss-7'];
let errorWrapper = id("error_wrapper");
let rootBlock = id("root_block");
let rootTree = id("root_tree");
let tooltip = id("tooltip");
let rootNet = undefined;
let firstStart = true;

// updateBlocks() - Atualiza as cores das divs

function updateBlocks() {

	let index = 0;
	[].forEach.call(document.getElementsByClassName("subnet-block"), function(el){
		if (el.children.length == 0) {
			el.classList = "subnet-block " + ELEMENT_STYLES[index++];
			index = (index >= ELEMENT_STYLES.length) ? 0 : index;
		}
		else {
			el.classList = "subnet-block";
		}
	});

}

// divide() - Divide a rede em duas sub-redes

function divide(net) {

	if (net.ipValues.mask < 32 && net.subnets.length === 0) {

		let newMaskNumber = net.ipValues.mask + 1;

		let bytePos = bitIndexToBytePos(newMaskNumber-1);

		let nI = bytePos.i;
		let nJ = bytePos.j;

		let newBytes1 = [net.bytes[0].slice(),net.bytes[1].slice(),net.bytes[2].slice(),net.bytes[3].slice()];
		let newBytes2 = [net.bytes[0].slice(),net.bytes[1].slice(),net.bytes[2].slice(),net.bytes[3].slice()];
		newBytes2[nI][nJ] = 1;

		let newIpValues1 = net.ipValues.slice();
		newIpValues1.mask = newMaskNumber;

		let newIpValues2 = bytesToDecimals(newBytes2);
		newIpValues2.mask = newMaskNumber;

		let newHosts = hostNumber(newMaskNumber);

		let sub1 = {
			ipValues: newIpValues1,
			bytes: newBytes1,
			hosts: newHosts,
			subnets: []
		};

		let sub2 = {
			ipValues: newIpValues2,
			bytes: newBytes2,
			hosts: newHosts,
			subnets: []
		};

		let tmpBlock = net.block.cloneNode(true);
		net.block.parentNode.replaceChild(tmpBlock, net.block);
		net.block = tmpBlock;

		prepElements(sub1);
		prepElements(sub2);

		net.subnets[0] = sub1;
		net.subnets[1] = sub2;

		net.block.appendChild(sub1.block);
		net.block.appendChild(sub2.block);

		let ul = document.createElement("ul");
		let li1 = document.createElement("li");
		let li2 = document.createElement("li");

		li1.appendChild(sub1.treeText);
		li2.appendChild(sub2.treeText);

		ul.appendChild(li1);
		ul.appendChild(li2);

		net.treeText.parentNode.appendChild(ul);

		net.treeText.classList = "subnet-merge";

		return true;
	}
	return false;
}

// merge() - Funde duas sub-redes que já foram juntas um dia

function merge(net) {
	if (net.subnets.length >= 2) {

		net.subnets = [];

		while (net.block.lastChild)
			net.block.removeChild(net.block.lastChild);

		let uls = net.treeText.parentNode.getElementsByTagName('ul');

		for (let i = 0; i < uls.length; i++) {
			while (uls[i].lastChild)
			uls[i].removeChild(uls[i].lastChild);

			uls[i].remove();
		}


		let tmpBlock = net.block.cloneNode(true);
		net.block.parentNode.replaceChild(tmpBlock, net.block);
		net.block = tmpBlock;

		let tmpTree = net.treeText.cloneNode(true);
		net.treeText.parentNode.replaceChild(tmpTree, net.treeText);
		net.treeText = tmpTree;

		prepElements(net);

		return true;
	}
	else {
		return false;
	}
}

// prepElements() - Prepara os elementos do DOM (adiciona classes,eventos etc)

function prepElements(net) {

	if (net.block === undefined)
		net.block = document.createElement("div");

	if (net.treeText === undefined)
		net.treeText = document.createElement("span");

	net.block.classList = "subnet-block";

	let desc = ipValuesToStr(net.ipValues) + " (" + (net.hosts).toLocaleString() + " host" + (net.hosts==1?'':'s') + ")";

	net.block.addEventListener("mouseover",function(){
		tooltip.textContent = desc;
	});
	net.treeText.textContent = desc;
	net.treeText.classList = "subnet-divide";
	if (net.ipValues.mask === 32) {
		net.treeText.classList.add("disabled");
	}
	net.treeText.addEventListener("click",function(){
		if (net.subnets.length > 0) {
			if ((net.subnets[0].subnets.length+net.subnets[1].subnets.length==0) || confirm("Tem certeza de quer fundir essas duas sub-redes?\n\nTodas as sub-redes dessas duas serão apagadas para sempre.")) {
				if(!merge(net))
					alert("Você não pode fundir essas sub-redes");
				updateBlocks();
			}
		}
		else {
			if(!divide(net))
				alert("Você não pode dividir essa rede");
			updateBlocks();
		}
	});
}

// start() - Inicializa toda a lógica, seta os blocos coloridos e a árvore de redes

function start() {

	if (firstStart || confirm("Visualizar rede?\n\nIsso irá excluir todas as sub-redes existentes.")) {

			let values = strToIPValues(id('ipmask').value);
			let errorView = id('error_view');

			if (errorView !== null) {
				errorView.remove();
			}

			let errstr = '';

			if (values !== undefined) {

				let validation = validateIpValues(values);

				if (validation[0] !== V_SUCCESS) {

					for (let i = 0; i < validation.length; i++) {

						switch (validation[i]) {
							case V_BIGBYTES:
								errstr += ' Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).';
								break;
							case V_BIGMASK:
								errstr += ' O valor da máscara é alto demais (deve estar entre 0-32).';
								break;
							default:
								errstr += ' Erro desconhecido.';
						}

					}
				}
				else {

					let netDecimals = getNetDecimals(values);

					if (values[0] == netDecimals[0] && values[1] == netDecimals[1] &&
							values[2] == netDecimals[2] && values[3] == netDecimals[3]) {

						if (firstStart) {
							tooltip.style.display = 'inline-block';
							rootBlock.addEventListener("mouseleave",function(){
								tooltip.textContent = "Passe o mouse para ver informações";
							});
							tooltip.textContent = "Passe o mouse para ver informações";
						}

						while (rootBlock.lastChild)
							rootBlock.removeChild(rootBlock.lastChild);
						while (rootTree.lastChild)
							rootTree.removeChild(rootTree.lastChild);

						rootNet = {
							ipValues: values,
							bytes: decimalsToBytes(values),
							hosts: hostNumber(values.mask),
							subnets: []
						};

						prepElements(rootNet);

						rootBlock.appendChild(rootNet.block);
						rootTree.appendChild(rootNet.treeText);

						firstStart = false;
						updateBlocks();

					}
					else {

						let likelyValues = netDecimals.slice();
						likelyValues.mask = values.mask;
						let likely = ipValuesToStr(likelyValues);

						errstr = `Esse endereço de rede é icompatível com a máscara. Você quis dizer ${likely}?`;

					}

				}
			}
			else {
				errstr = "A entrada deve seguir o seguinte padrão: 0.0.0.0/0";
			}

			if (errstr.length > 0) {
				let table = document.createElement('table');
				table.innerHTML = `
					<td>
						<h2 class="error">Entrada inválida. ${errstr}</h2>
					</td>
				`;
				table.id = "error_view";
				errorWrapper.appendChild(table);
			}
	}

}
