// Undernets
// +=========================+
// Autor: Henrique Colini
// Versão: 1.0 (2018-09-23)

// --------------------------------------------------------------------------------------------------------------------------
// Variáveis globais
// --------------------------------------------------------------------------------------------------------------------------

const COLORS = [];
for (let i = 0; i < 10; i++) COLORS[i] = 'ss-'+i;
const COLOR_QUEUE = COLORS.slice();

let errorWrapper = id("error_wrapper");
let rootBlock = id("root_block");
let rootTree = id("root_tree");
let tooltip = id("tooltip");
let rootNet = undefined;
let firstStart = true;

// --------------------------------------------------------------------------------------------------------------------------
// firstSubnet() - Primeira sub-rede de uma rede
// --------------------------------------------------------------------------------------------------------------------------

function firstSubnet(net) {
	if (net.subnets[0])
		return firstSubnet(net.subnets[0]);
	else
		return net;
}

// --------------------------------------------------------------------------------------------------------------------------
// lastSubnet() - Última sub-rede de uma rede
// --------------------------------------------------------------------------------------------------------------------------

function lastSubnet(net) {
	if (net.subnets[1])
		return lastSubnet(net.subnets[1]);
	else
		return net;
}

// --------------------------------------------------------------------------------------------------------------------------
// subnetBefore() - Sub-rede anterior (na lista)
// --------------------------------------------------------------------------------------------------------------------------

function subnetBefore(net) {
	if (net.parent) {
		if (net.parent.subnets[0] === net) {
			return subnetBefore(net.parent);
		}
		else {
			return lastSubnet(net.parent.subnets[0]);
		}
	}
	else {
		return null;
	}
}

// --------------------------------------------------------------------------------------------------------------------------
// subnetAfter() - Sub-rede seguinte (na lista)
// --------------------------------------------------------------------------------------------------------------------------

function subnetAfter(net) {
	if (net.parent) {
		if (net.parent.subnets[1] === net) {
			return subnetAfter(net.parent);
		}
		else {
			return firstSubnet(net.parent.subnets[1]);
		}
	}
	else {
		return null;
	}
}

// --------------------------------------------------------------------------------------------------------------------------
// removeItem() - Remove um item de um array
// --------------------------------------------------------------------------------------------------------------------------

function removeItem(list,item) {
	let index = list.indexOf(item);
	if (index > -1) {
		list.splice(index, 1);
	}
}


// --------------------------------------------------------------------------------------------------------------------------
// divide() - Divide a rede em duas sub-redes
// --------------------------------------------------------------------------------------------------------------------------

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

		COLOR_QUEUE.unshift(COLOR_QUEUE[COLOR_QUEUE.length-1]);
		COLOR_QUEUE.pop();

		let colorList = COLOR_QUEUE.slice();

		let before = subnetBefore(net);
		let after = subnetAfter(net);

		removeItem(colorList,net.color);
		if(before) removeItem(colorList,before.color);
		if(after) removeItem(colorList,after.color);

		let color = colorList[0];

		let sub1 = {
			ipValues: newIpValues1,
			bytes: newBytes1,
			hosts: newHosts,
			subnets: [],
			parent: net,
			color: net.color
		};

		let sub2 = {
			ipValues: newIpValues2,
			bytes: newBytes2,
			hosts: newHosts,
			subnets: [],
			parent: net,
			color: color
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

		net.block.classList = "subnet-block";
		net.treeText.classList = "subnet-merge";

		return true;
	}
	return false;

}

// --------------------------------------------------------------------------------------------------------------------------
// merge() - Funde duas sub-redes que já foram juntas um dia
// --------------------------------------------------------------------------------------------------------------------------

function merge(net) {
	if (net.subnets.length >= 2) {

		COLOR_QUEUE.push(COLOR_QUEUE[0]);
		COLOR_QUEUE.shift();

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

// --------------------------------------------------------------------------------------------------------------------------
// prepElements() - Prepara os elementos do DOM (adiciona classes,eventos etc)
// --------------------------------------------------------------------------------------------------------------------------

function prepElements(net) {

	if (net.block === undefined)
		net.block = document.createElement("div");

	if (net.treeText === undefined)
		net.treeText = document.createElement("span");

	net.block.classList = "subnet-block " + net.color;

	let desc = ipValuesToStr(net.ipValues) + " (" + (net.hosts).toLocaleString() + " host" + (net.hosts==1?'':'s') + ")";

	net.block.addEventListener("mouseover",function(){
		tooltip.textContent = desc;
		tooltip.style.opacity = 1;
		tooltip.style.transform = "scaleY(1)";
	});

	net.treeText.textContent = desc;
	net.treeText.classList = "subnet-divide " + net.color;

	if (net.ipValues.mask === 32) {
		net.treeText.classList.add("disabled");
	}

	if (net.ipValues.mask != 32) {
		net.treeText.addEventListener("click",function(){
			if (net.subnets.length > 0) {
				if ((net.subnets[0].subnets.length+net.subnets[1].subnets.length==0) || confirm("Tem certeza de quer fundir essas duas sub-redes?\nTodas as sub-redes dessas duas serão apagadas para sempre.")) {
					if(!merge(net))
						alert("Você não pode fundir essas sub-redes");
				}
			}
			else {
				if(!divide(net))
					alert("Você não pode dividir essa rede");
			}
			net.block.classList.add("highlight");
		});
	}

	net.treeText.addEventListener("mouseover",function() {
		net.block.classList.add("highlight");
	});

	net.treeText.addEventListener("mouseleave",function() {
		net.block.classList.remove("highlight");
	});

}

// --------------------------------------------------------------------------------------------------------------------------
// start() - Inicializa toda a lógica, seta os blocos coloridos e a árvore de redes
// --------------------------------------------------------------------------------------------------------------------------

function start() {

	if (firstStart || confirm("Tem certeza de que quer visualizar uma nova rede?\nIsso irá excluir todas as sub-redes existentes.")) {

		let values = parseIpValues(id('ipmask').value);
		let errorView = id('error_view');

		if (errorView !== null) {
			errorView.remove();
		}

		let errstr = '';

		if (values !== undefined) {

			let validation = validateIpValues(values, true);

			if (validation[0] !== V_SUCCESS) {

				for (let i = 0; i < validation.length; i++) {

					switch (validation[i]) {
						case V_BIGBYTES:
							errstr += ' Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).';
							break;
						case V_BIGMASK:
							errstr += ' O valor da máscara é alto demais (deve estar entre 0-32).';
							break;
						case V_NOTNETADDRESS:
							let likelyValues = getNetDecimals(values);
							likelyValues.mask = values.mask;
							let likely = ipValuesToStr(likelyValues);
							errstr += ` Esse endereço de rede é icompatível com a máscara. Você quis dizer ${likely}?`;
							break;
						default:
							errstr += ' Erro desconhecido.';
					}

				}
			}
			else {

				if (firstStart) {
					tooltip.style.display = 'inline-block';
					tooltip.style.transform = "scaleY(0)";
					tooltip.style.opacity = 0;
					rootBlock.addEventListener("mouseleave",function(){
						tooltip.style.opacity = 0;
						tooltip.style.transform = "scaleY(0)";
					});
				}

				while (rootBlock.lastChild)
					rootBlock.removeChild(rootBlock.lastChild);
				while (rootTree.lastChild)
					rootTree.removeChild(rootTree.lastChild);

				rootNet = {
					ipValues: values,
					bytes: decimalsToBytes(values),
					hosts: hostNumber(values.mask),
					color: 'ss-0',
					subnets: [],
					parent: null
				};

				prepElements(rootNet);

				rootBlock.appendChild(rootNet.block);
				rootTree.appendChild(rootNet.treeText);

				firstStart = false;

			}
		}
		else {
			errstr = " A entrada deve seguir o seguinte padrão: 0.0.0.0/0";
		}

		if (errstr.length > 0) {
			let table = document.createElement('table');
			table.innerHTML = `
				<td>
					<h2 class="error">Entrada inválida.${errstr}</h2>
				</td>
			`;
			table.id = "error_view";
			errorWrapper.appendChild(table);
		}
	}
}
