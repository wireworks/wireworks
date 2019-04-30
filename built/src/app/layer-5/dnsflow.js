// DNSFlow
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-04-14)
define(["require", "exports", "../../core/utils/dom", "../../core/networking/layers/layer-5/domain", "../../core/utils/math"], function (require, exports, dom_1, domain_1, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var serverImage = new Image();
    serverImage.src = "../../../images/layers/5/server.png";
    var clientImage = new Image();
    clientImage.src = "../../../images/layers/5/client.png";
    var errorWrapperDOM = dom_1.id("error_wrapper");
    var domainDOM = dom_1.id("domain");
    var canvasDOM = dom_1.id("canvas");
    var ctx = canvasDOM.getContext("2d");
    var fixedDeltaTime = 20;
    var drawables = [];
    var lineIntervals = [];
    var Node = /** @class */ (function () {
        function Node(pos, width, heigth, image) {
            this.pos = pos;
            this.width = width;
            this.height = heigth;
            this.image = image;
        }
        Node.prototype.draw = function () {
            ctx.drawImage(this.image, this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);
        };
        Node.prototype.getVertices = function () {
            var x = this.pos.x;
            var y = this.pos.y;
            var w2 = this.width / 2;
            var h2 = this.height / 2;
            var a = { x: x - w2, y: y - h2 };
            var b = { x: x + w2, y: y - h2 };
            var c = { x: x + w2, y: y + h2 };
            var d = { x: x - w2, y: y + h2 };
            return { a: a, b: b, c: c, d: d };
        };
        Node.prototype.getOutput = function (side) {
            var p = this.getVertices();
            var f = 0.3;
            var fw = f * this.width;
            var fh = f * this.height;
            switch (side) {
                case "top":
                    return { x: p.a.x + fw, y: p.a.y };
                case "bottom":
                    return { x: p.c.x - fw, y: p.c.y };
                case "left":
                    return { x: p.d.x, y: p.d.y - fh };
                case "right":
                    return { x: p.c.x, y: p.b.y + fh };
            }
        };
        Node.prototype.getInput = function (side) {
            var p = this.getVertices();
            var f = 0.3;
            var fw = f * this.width;
            var fh = f * this.height;
            switch (side) {
                case "top":
                    return { x: p.b.x - fw, y: p.a.y };
                case "bottom":
                    return { x: p.d.x + fw, y: p.c.y };
                case "left":
                    return { x: p.d.x, y: p.a.y + fh };
                case "right":
                    return { x: p.c.x, y: p.c.y - fh };
            }
        };
        return Node;
    }());
    var Line = /** @class */ (function () {
        function Line(from, to, time, strokeStyle, strokeWidth) {
            this.from = from;
            this.to = to;
            this.time = time;
            this.strokeStyle = strokeStyle;
            this.lineWidth = strokeWidth;
        }
        Line.prototype.getStartPoint = function () {
            var offX = this.from.pos.x - this.to.pos.x;
            var offY = this.from.pos.y - this.to.pos.y;
            if (Math.abs(offX) > Math.abs(offY)) {
                if (offX > 0) {
                    return this.from.getOutput("left");
                }
                else {
                    return this.from.getOutput("right");
                }
            }
            else {
                if (offY > 0) {
                    return this.from.getOutput("top");
                }
                else {
                    return this.from.getOutput("bottom");
                }
            }
        };
        Line.prototype.getEndPoint = function () {
            var offX = this.from.pos.x - this.to.pos.x;
            var offY = this.from.pos.y - this.to.pos.y;
            if (Math.abs(offX) > Math.abs(offY)) {
                if (offX > 0) {
                    return this.to.getInput("right");
                }
                else {
                    return this.to.getInput("left");
                }
            }
            else {
                if (offY > 0) {
                    return this.to.getInput("bottom");
                }
                else {
                    return this.to.getInput("top");
                }
            }
        };
        Line.prototype.getCurrentEndPoint = function (fromPoint, toPoint) {
            if (fromPoint === void 0) { fromPoint = this.getStartPoint(); }
            if (toPoint === void 0) { toPoint = this.getEndPoint(); }
            return { x: fromPoint.x + (this.time * (toPoint.x - fromPoint.x)), y: fromPoint.y + (this.time * (toPoint.y - fromPoint.y)) };
        };
        Line.prototype.draw = function () {
            var fromPoint = this.getStartPoint();
            var currEnd = this.getCurrentEndPoint(fromPoint);
            ctx.beginPath();
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth;
            ctx.lineCap = "round";
            ctx.moveTo(fromPoint.x, fromPoint.y);
            ctx.lineTo(currEnd.x, currEnd.y);
            ctx.stroke();
        };
        return Line;
    }());
    function run() {
        var drawIndex = drawables.length;
        while (drawIndex--) {
            if (drawables[drawIndex] instanceof Line) {
                drawables.splice(drawIndex, 1);
            }
        }
        for (var i = 0; i < lineIntervals.length; i++) {
            clearInterval(lineIntervals[i]);
        }
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
                //connectNodes(requesterNode, destNode, "#9ac9ed", 10, 600);
                //connectNodes(destNode, requesterNode, "#9ac9ed", 10, 600);
                //connectNodes(requesterNode, localNode, "#b0db8a", 10, 100, function() {
                //	connectNodes(localNode, rootNode, "#b0db8a", 10, 100, function () {
                //		connectNodes(rootNode, localNode, "#db938a", 10, 100);
                //	});
                //});
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
    function connectNodes(from, to, strokeStyle, lineWidth, speed, callback) {
        if (callback === void 0) { callback = undefined; }
        var line = new Line(from, to, 0, strokeStyle, lineWidth);
        drawables.push(line);
        var interval = setInterval(function () {
            var startPoint = line.getStartPoint();
            var endPoint = line.getEndPoint();
            var distance = Math.sqrt(((startPoint.x - endPoint.x) * (startPoint.x - endPoint.x)) + ((startPoint.y - endPoint.y) * (startPoint.y - endPoint.y)));
            line.time = math_1.clamp(line.time + ((fixedDeltaTime / 1000) * (speed / distance)), 0, 1);
            render();
            if (line.time >= 1) {
                line.time = 1;
                render();
                if (callback) {
                    callback();
                }
                clearInterval(interval);
            }
        }, fixedDeltaTime);
        lineIntervals.push(interval);
        return line;
    }
    function render() {
        ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);
        for (var i = 0; i < drawables.length; i++) {
            drawables[i].draw();
        }
    }
    function resetCanvas() {
        var px = 50; // padding
        var py = 50;
        var w = canvasDOM.width;
        var h = canvasDOM.height;
        var requesterNode = new Node({ x: px, y: h - py }, 60, 60, clientImage);
        var localNode = new Node({ x: px, y: h / 2 }, 60, 60, serverImage);
        var rootNode = new Node({ x: px, y: py }, 60, 60, serverImage);
        var interNode = new Node({ x: w / 2, y: h / 2 }, 60, 60, serverImage);
        var adminNode = new Node({ x: w - px, y: h / 2 }, 60, 60, serverImage);
        var destNode = new Node({ x: w - px, y: h - py }, 60, 60, clientImage);
        drawables = [];
        drawables.push(requesterNode);
        drawables.push(localNode);
        drawables.push(rootNode);
        drawables.push(interNode);
        drawables.push(adminNode);
        drawables.push(destNode);
    }
    resetCanvas();
    serverImage.onload = render;
    clientImage.onload = render;
    dom_1.id("run").addEventListener("click", function (ev) {
        run();
    });
});
