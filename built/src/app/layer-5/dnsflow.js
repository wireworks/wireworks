define(["require", "exports", "../../core/utils/dom", "../../core/networking/layers/layer-5/domain"], function (require, exports, dom_1, domain_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // DNSFlow
    // +=========================+
    // Author: Henrique Colini
    // Version: 1.0 (2019-04-14)
    var errorWrapperDOM = dom_1.id("error_wrapper");
    var domainDOM = dom_1.id("domain");
    var canvasDOM = dom_1.id("canvas");
    var ctx = canvasDOM.getContext("2d");
    var Node = /** @class */ (function () {
        function Node(pos, width, heigth, side, fillStyle) {
            this.pos = pos;
            this.width = width;
            this.height = heigth;
            this.side = side;
            this.fillStyle = fillStyle; // tmp!
        }
        Node.prototype.draw = function () {
            console.log("fill = " + this.fillStyle);
            ctx.fillStyle = this.fillStyle;
            ctx.fillRect(this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);
        };
        return Node;
    }());
    var drawables = [];
    function run() {
        var oldTable = dom_1.id('domain_error');
        if (oldTable !== null) {
            oldTable.remove();
        }
        var errStr = undefined;
        try {
            var fullName = domainDOM.value;
            if (fullName === "localhost") {
                errStr = "Você não pode usar esse nome.";
                throw Error();
            }
            else {
                var tmpRoot = new domain_1.Domain(".", undefined);
                var domain = domain_1.Domain.extractDomain(tmpRoot, fullName);
            }
        }
        catch (error) {
            var table = document.createElement('table');
            table.id = "domain_error";
            console.error(error);
            if (!errStr) {
                switch (error.name) {
                    case domain_1.ERROR_INVALID_LABEL:
                        errStr = "Esse domínio possui um nome inválido.";
                        break;
                    case domain_1.ERROR_FULL_NAME_RANGE:
                        errStr = "Esse domínio possui um nome grande demais.";
                        break;
                    default:
                        errStr = "Erro desconhecido (" + error.name + ").";
                        console.error(error);
                        break;
                }
            }
            table.innerHTML = "\n\t\t\t\t<td>\n\t\t\t\t\t<h2 class=\"font-mono text-danger\">Entrada inv\u00E1lida. " + errStr + "</h2>\n\t\t\t\t</td>\n\t\t\t";
            errorWrapperDOM.appendChild(table);
        }
    }
    function render() {
        for (var i = 0; i < drawables.length; i++) {
            drawables[i].draw();
        }
    }
    function setupCanvas() {
        var px = 50; // padding
        var py = 50;
        var w = canvasDOM.width;
        var h = canvasDOM.height;
        var hostNode = new Node({ x: px, y: h - py }, 60, 60, "top", "#FF0000");
        var localNode = new Node({ x: px, y: h / 2 }, 60, 60, "top", "#FFFF00");
        var rootNode = new Node({ x: px, y: py }, 60, 60, "top", "#00FF00");
        var interNode = new Node({ x: w / 2, y: h / 2 }, 60, 60, "top", "#FF00FF");
        var adminNode = new Node({ x: w - px, y: h / 2 }, 60, 60, "top", "#00FFFF");
        var destNode = new Node({ x: w - px, y: h - py }, 60, 60, "top", "#0000FF");
        drawables.push(hostNode);
        drawables.push(localNode);
        drawables.push(rootNode);
        drawables.push(interNode);
        drawables.push(adminNode);
        drawables.push(destNode);
    }
    setupCanvas();
    render();
    dom_1.id("run").addEventListener("click", function (ev) {
        run();
    });
});
