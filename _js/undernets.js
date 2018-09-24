// Autor: Henrique Colini
// Versão: 1.0 (2018-09-23)

const ELEMENT_STYLES = ['ss-0','ss-1','ss-2','ss-3','ss-4','ss-5','ss-6','ss-7'];
let rootElement = id("root_net");
let tooltip = id("tooltip");
let rootNet = null;

// updateElements() - Atualiza as cores das divs

function updateElements(net = rootNet, index = 0) {

	if (net != null) {
		if (net.subnets.length > 0) {
			for (let i = 0; i < net.subnets.length; i++) {
				if (net.subnets[i].subnets.length > 0) {
					updateElements(net.subnets[i], index);
				}
				else {
					net.subnets[i].dom.classList = "subnet " + ELEMENT_STYLES[index++];
					if (index >= ELEMENT_STYLES.length) index = 0;
				}
			}
		}
	}

}

rootNet = {subnets:[],dom:rootElement,parent:null,mask:24};

function divide(net) {

	let dom1 = document.createElement("div");
	let dom2 = document.createElement("div");

	dom1.classList = "subnet";
	dom2.classList = "subnet";
	dom1.name = "foobar";

	let newNet1 = {subnets:[],dom:dom1,parent:net,mask:net.mask+1};
	let newNet2 = {subnets:[],dom:dom2,parent:net,mask:net.mask+1};

	dom1.addEventListener("mouseover",function(){
		let n = hostNumber(newNet1.mask);
		tooltip.textContent = "/"+newNet1.mask+" ("+n+" host"+(n==1?'':'s')+")";
	});

	net.dom.appendChild(newNet1.dom);
	net.dom.appendChild(newNet2.dom);
	net.subnets.push(newNet1);
	net.subnets.push(newNet2);

	return [newNet1,newNet2];
}

divide(
	divide(
		divide(
			divide(
				divide(
					divide(
						divide(
							divide(
								rootNet
							)[1]
						)[1]
					)[1]
				)[1]
			)[1]
		)[1]
	)[1]
);

updateElements();

rootNet.dom.addEventListener("mouseleave",function(){
	tooltip.textContent = "Passe o mouse para ver informações";
});