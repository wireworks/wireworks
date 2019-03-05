// Undernets
// +=========================+
// Author: Henrique Colini
// Version: 2.0 (2019-03-03)
define(["require", "exports", "../../core/utils/dom", "../../core/networking/layers/layer-3/address", "../../core/utils/array", "../../core/networking/byte"], function (require, exports, dom_1, address_1, array_1, byte_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A list of color classes used in the Visual Networks.
     */
    var COLORS = [];
    for (var i = 0; i < 10; i++)
        COLORS[i] = 'ss-' + i;
    /**
     * The queue of colors that will be applied to future subnets.
     */
    var COLOR_QUEUE = COLORS.slice();
    var errorWrapper = dom_1.id("error_wrapper");
    var rootBlock = dom_1.id("root_block");
    var rootTree = dom_1.id("root_tree");
    var tooltip = dom_1.id("tooltip");
    var rootNet = undefined;
    var firstTime = true;
    /**
     * Resets the Visual Networks.
     */
    function reset() {
        if (firstTime || confirm("Tem certeza de que quer visualizar uma nova rede?\nIsso irá excluir todas as sub-redes existentes.")) {
            var oldTable = dom_1.id('error');
            if (oldTable !== null) {
                oldTable.remove();
            }
            var errStr = undefined;
            try {
                var rootAddress = new address_1.Address(dom_1.id('address').value);
                try {
                    rootAddress = new address_1.Address(dom_1.id("address").value, undefined, true, true);
                }
                catch (error) {
                    if (error.name === address_1.ERROR_NOT_NETWORK) {
                        errStr = "Este não é um endereço de rede. Você quis dizer " + rootAddress.getNetworkAddress(true).toString() + "?";
                    }
                    throw error;
                }
                if (firstTime) {
                    tooltip.style.display = 'inline-block';
                    tooltip.style.transform = "scaleY(0)";
                    tooltip.style.opacity = "0";
                    rootBlock.addEventListener("mouseleave", function () {
                        tooltip.style.opacity = "0";
                        tooltip.style.transform = "scaleY(0)";
                    });
                }
                while (rootBlock.lastChild)
                    rootBlock.removeChild(rootBlock.lastChild);
                while (rootTree.lastChild)
                    rootTree.removeChild(rootTree.lastChild);
                rootNet = new VisualNetwork(rootAddress, undefined, "ss-0");
                rootNet.prepElements();
                rootBlock.appendChild(rootNet.block);
                rootTree.appendChild(rootNet.treeText);
                firstTime = false;
            }
            catch (error) {
                var table = document.createElement('table');
                table.id = "error";
                if (!errStr) {
                    switch (error.name) {
                        case address_1.ERROR_ADDRESS_PARSE:
                            errStr = "A entrada deve possuir o formato 0.0.0.0/0.";
                            break;
                        case address_1.ERROR_MASK_RANGE:
                            errStr = "O valor da máscara é alto demais (deve estar entre 0-32).";
                            break;
                        case byte_1.ERROR_BYTE_RANGE:
                            errStr = "Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).";
                            break;
                        default:
                            errStr = "Erro desconhecido (" + error.name + ").";
                            break;
                    }
                }
                table.innerHTML = "\n\t\t\t\t<td>\n\t\t\t\t\t<h2 class=\"font-mono text-danger\">Entrada inv\u00E1lida. " + errStr + "</h2>\n\t\t\t\t</td>\n\t\t\t";
                errorWrapper.appendChild(table);
            }
        }
    }
    /**
     * A binary tree that combines Addresses and DOM Elements. Used only by Undernets.
     * @author Henrique Colini
     */
    var VisualNetwork = /** @class */ (function () {
        function VisualNetwork(address, parent, color, subnets, block, treeText) {
            if (color === void 0) { color = undefined; }
            if (subnets === void 0) { subnets = [undefined, undefined]; }
            if (block === void 0) { block = undefined; }
            if (treeText === void 0) { treeText = undefined; }
            this.address = address;
            this.parent = parent;
            this.color = color;
            this.subnets = subnets;
            this.block = block;
            this.treeText = treeText;
        }
        /**
         * Returns whether this Visual Network has any subnets.
         */
        VisualNetwork.prototype.hasSubnets = function () {
            return this.subnets[0] !== undefined && this.subnets[1] !== undefined;
        };
        /**
         * Prepares all the DOM elements.
         */
        VisualNetwork.prototype.prepElements = function () {
            if (this.block === undefined)
                this.block = document.createElement("div");
            if (this.treeText === undefined)
                this.treeText = document.createElement("span");
            this.block.className = "subnet-block " + this.color;
            var desc = this.address.toString() + " (" + (this.address.numberOfHosts()).toLocaleString() + " host" + (this.address.numberOfHosts() == 1 ? '' : 's') + ")";
            this.block.addEventListener("mouseover", function () {
                tooltip.textContent = desc;
                tooltip.style.opacity = "1";
                tooltip.style.transform = "scaleY(1)";
            });
            this.treeText.textContent = desc;
            this.treeText.className = "subnet-divide " + this.color;
            if (this.address.getMaskShort() === 32) {
                this.treeText.classList.add("disabled");
            }
            var net = this;
            if (this.address.getMaskShort() != 32) {
                this.treeText.addEventListener("click", function () {
                    if (net.hasSubnets()) {
                        if ((!net.subnets[0].hasSubnets() && !net.subnets[1].hasSubnets()) ||
                            confirm("Tem certeza de quer fundir essas duas sub-redes?\nTodas as sub-redes dessas duas serão apagadas para sempre.")) {
                            if (!net.merge())
                                alert("Você não pode fundir essas sub-redes");
                        }
                    }
                    else {
                        if (!net.divide())
                            alert("Você não pode dividir essa rede");
                    }
                    net.block.classList.add("highlight");
                });
            }
            this.treeText.addEventListener("mouseover", function () {
                net.block.classList.add("highlight");
            });
            this.treeText.addEventListener("mouseleave", function () {
                net.block.classList.remove("highlight");
            });
        };
        /**
         * Recursively returns the first (non split) subnet in this network.
         */
        VisualNetwork.prototype.firstSubnet = function () {
            if (this.subnets[0])
                return this.subnets[0].firstSubnet();
            else
                return this;
        };
        /**
         * Recursively returns the last (non split) subnet in this network.
         */
        VisualNetwork.prototype.lastSubnet = function () {
            if (this.subnets[1])
                return this.subnets[1].lastSubnet();
            else
                return this;
        };
        /**
         * Returns this network's previous sibling.
         */
        VisualNetwork.prototype.subnetBefore = function () {
            if (this.parent) {
                if (this.parent.subnets[0] === this) {
                    return this.parent.subnetBefore();
                }
                else {
                    return this.parent.subnets[0].lastSubnet();
                }
            }
            else {
                return undefined;
            }
        };
        /**
         * Returns this network's next sibling.
         */
        VisualNetwork.prototype.subnetAfter = function () {
            if (this.parent) {
                if (this.parent.subnets[1] === this) {
                    return this.parent.subnetAfter();
                }
                else {
                    return this.parent.subnets[1].firstSubnet();
                }
            }
            else {
                return undefined;
            }
        };
        /**
         * Splits this network into subnets. Returns false on failure.
         */
        VisualNetwork.prototype.divide = function () {
            if (this.address.getMaskShort() < 32 && !this.hasSubnets()) {
                COLOR_QUEUE.unshift(COLOR_QUEUE[COLOR_QUEUE.length - 1]);
                COLOR_QUEUE.pop();
                var colorList = COLOR_QUEUE.slice();
                var before = this.subnetBefore();
                var after = this.subnetAfter();
                array_1.removeItem(colorList, this.color);
                if (before)
                    array_1.removeItem(colorList, before.color);
                if (after)
                    array_1.removeItem(colorList, after.color);
                var color = colorList[0];
                var subnetAddresses = this.address.subdivide();
                var sub1 = new VisualNetwork(subnetAddresses[0], this, this.color);
                var sub2 = new VisualNetwork(subnetAddresses[1], this, color);
                var tmpBlock = this.block.cloneNode(true);
                this.block.parentNode.replaceChild(tmpBlock, this.block);
                this.block = tmpBlock;
                sub1.prepElements();
                sub2.prepElements();
                this.subnets[0] = sub1;
                this.subnets[1] = sub2;
                this.block.appendChild(sub1.block);
                this.block.appendChild(sub2.block);
                var ul = document.createElement("ul");
                var li1 = document.createElement("li");
                var li2 = document.createElement("li");
                li1.appendChild(sub1.treeText);
                li2.appendChild(sub2.treeText);
                ul.appendChild(li1);
                ul.appendChild(li2);
                this.treeText.parentNode.appendChild(ul);
                this.block.className = "subnet-block";
                this.treeText.className = "subnet-merge";
                return true;
            }
            return false;
        };
        /**
         * Merges this network's subnets. Returns false on failure.
         */
        VisualNetwork.prototype.merge = function () {
            if (this.hasSubnets()) {
                COLOR_QUEUE.push(COLOR_QUEUE[0]);
                COLOR_QUEUE.shift();
                this.subnets = [undefined, undefined];
                while (this.block.lastChild)
                    this.block.removeChild(this.block.lastChild);
                var uls = this.treeText.parentNode.getElementsByTagName('ul');
                for (var i = 0; i < uls.length; i++) {
                    while (uls[i].lastChild)
                        uls[i].removeChild(uls[i].lastChild);
                    uls[i].remove();
                }
                var tmpBlock = this.block.cloneNode(true);
                this.block.parentNode.replaceChild(tmpBlock, this.block);
                this.block = tmpBlock;
                var tmpTree = this.treeText.cloneNode(true);
                this.treeText.parentNode.replaceChild(tmpTree, this.treeText);
                this.treeText = tmpTree;
                this.prepElements();
                return true;
            }
            else {
                return false;
            }
        };
        return VisualNetwork;
    }());
    // +==============================================+
    dom_1.id("address").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            reset();
    });
    dom_1.id("button_generate").addEventListener("click", function (ev) {
        reset();
    });
});
