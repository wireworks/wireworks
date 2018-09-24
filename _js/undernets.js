// Autor: Henrique Colini
// Versão: 1.0 (2018-09-23)

const ELEMENT_STYLES = ['ss-0','ss-1','ss-2','ss-3','ss-4','ss-5','ss-6','ss-7'];
let rootElement = id("root_block");
let tooltip = id("tooltip");
let rootNet = null;

// updateBlocks() - Atualiza as cores das divs

function updateBlocks() {

	let index = 0;
	[].forEach(document.getElementsByClassName("subnet-block"), function(el){
		el.style.classList = "subnet-block " + ELEMENT_STYLES[index++];
		index = index >= ELEMENT_STYLES.length ? 0 : index;
	});

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

updateBlocks();

rootNet.dom.addEventListener("mouseleave",function(){
	tooltip.textContent = "Passe o mouse para ver informações";
});
