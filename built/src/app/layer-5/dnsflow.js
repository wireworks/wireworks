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
    var localModeDOM = dom_1.id("local_mode");
    var rootModeDOM = dom_1.id("root_mode");
    var interModeDOM = dom_1.id("intermediate_mode");
    var speedDOM = dom_1.id("speed");
    var ctx = canvasDOM.getContext("2d");
    var fixedDeltaTime = 20;
    var verySlowSpeed = 10;
    var slowSpeed = 25;
    var normalSpeed = 100;
    var fastSpeed = 400;
    var veryFastSpeed = 600;
    var clientNode;
    var localNode;
    var rootNode;
    var interNode;
    var adminNode;
    var destNode;
    var clientLabel;
    var localLabel;
    var rootLabel;
    var interLabel;
    var adminLabel;
    var destLabel;
    var drawables = [];
    var lineIntervals = [];
    var greenWire = "#b0db8a";
    var redWire = "#db938a";
    var blueWire = "#9ac9ed";
    var yellowWire = "#e5c16e";
    var Node = /** @class */ (function () {
        function Node(pos, width, heigth, image) {
            this.visible = true;
            this.pos = pos;
            this.width = width;
            this.height = heigth;
            this.image = image;
        }
        Node.prototype.draw = function () {
            if (this.visible)
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
    var Label = /** @class */ (function () {
        function Label(pos, text, textColor, backgroundColor, padding, borderRadius, font, textHeight) {
            this.visible = true;
            this.pos = pos;
            this.text = text;
            this.textColor = textColor;
            this.backgroundColor = backgroundColor;
            this.padding = padding;
            this.borderRadius = borderRadius;
            this.font = font;
            this.textHeight = textHeight;
        }
        Label.prototype.draw = function () {
            if (this.visible) {
                var width = this.getRealWidth();
                var height = this.getRealHeight();
                ctx.fillStyle = this.backgroundColor;
                roundRect(this.pos.x - (width / 2), this.pos.y - (height / 2), width, height, this.borderRadius).fill();
                ctx.fillStyle = this.textColor;
                ctx.font = this.font;
                ctx.fillText(this.text, this.pos.x + this.padding - (width / 2), this.pos.y + this.padding + this.textHeight - (height / 2));
            }
        };
        Label.prototype.getRealWidth = function () {
            ctx.font = this.font;
            return ctx.measureText(this.text).width + (2 * this.padding);
        };
        Label.prototype.getRealHeight = function () {
            return this.textHeight + (2 * this.padding);
        };
        return Label;
    }());
    var Line = /** @class */ (function () {
        function Line(from, to, time, strokeStyle, strokeWidth) {
            this.visible = true;
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
            if (this.visible) {
                var fromPoint = this.getStartPoint();
                var currEnd = this.getCurrentEndPoint(fromPoint);
                ctx.beginPath();
                ctx.strokeStyle = this.strokeStyle;
                ctx.lineWidth = this.lineWidth;
                ctx.lineCap = "round";
                ctx.moveTo(fromPoint.x, fromPoint.y);
                ctx.lineTo(currEnd.x, currEnd.y);
                ctx.stroke();
                if (this.label) {
                    this.label.pos = currEnd;
                    this.label.draw();
                }
            }
        };
        return Line;
    }());
    function roundRect(x, y, w, h, r) {
        if (w < 2 * r)
            r = w / 2;
        if (h < 2 * r)
            r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        return ctx;
    }
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
                var domainParts = domain_1.Domain.extractDomain(tmpRoot, fullName).getFullName().split(".");
                if (domainParts.length < 2) {
                    errStr = "Você deve inserir um domínio com mais partes.";
                    throw Error();
                }
                var hasInter = false;
                var fullStr = "";
                var rootStr = domainParts[domainParts.length - 1];
                var destStr = domainParts[0];
                var interStr = "";
                var adminStr = "";
                if (domainParts.length == 2) {
                    domainParts.unshift("www");
                    destStr = "www";
                }
                else if (domainParts.length > 3) {
                    var middle = "";
                    for (var i = 2; i < domainParts.length - 1; i++)
                        middle += domainParts[i] + ((i < domainParts.length - 2) ? "." : "");
                    domainParts = [domainParts[0], domainParts[1], middle, domainParts[domainParts.length - 1]];
                    hasInter = true;
                    interStr = middle;
                }
                for (var i = 0; i < domainParts.length; i++)
                    fullStr += domainParts[i] + ((i < domainParts.length - 1) ? "." : "");
                adminStr = domainParts[1];
                var speed = void 0;
                var width = 10;
                switch (speedDOM.value) {
                    case "veryslow":
                        speed = verySlowSpeed;
                        break;
                    case "slow":
                        speed = slowSpeed;
                        break;
                    case "normal":
                        speed = normalSpeed;
                        break;
                    case "fast":
                        speed = fastSpeed;
                        break;
                    case "veryfast":
                        speed = veryFastSpeed;
                        break;
                }
                interNode.visible = hasInter;
                interLabel.visible = hasInter;
                if (localModeDOM.value === "iterative") {
                    if (hasInter) {
                        connectMultipleNodes([
                            { from: clientNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                            { from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                            { from: rootNode, to: localNode, strokeStyle: redWire, lineWidth: width, speed: speed, labelText: interStr + "." + rootStr },
                            { from: localNode, to: interNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                            { from: interNode, to: localNode, strokeStyle: redWire, lineWidth: width, speed: speed, labelText: adminStr + "." + interStr + "." + rootStr },
                            { from: localNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                            { from: adminNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                            { from: localNode, to: clientNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr }
                        ], onSuccess);
                    }
                    else {
                        connectMultipleNodes([
                            { from: clientNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                            { from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                            { from: rootNode, to: localNode, strokeStyle: redWire, lineWidth: width, speed: speed, labelText: adminStr + "." + rootStr },
                            { from: localNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                            { from: adminNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                            { from: localNode, to: clientNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr }
                        ], onSuccess);
                    }
                }
                else if (localModeDOM.value === "recursive") {
                    if (rootModeDOM.value === "iterative") {
                        if (hasInter) {
                            connectMultipleNodes([
                                { from: clientNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: rootNode, to: interNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: interNode, to: rootNode, strokeStyle: redWire, lineWidth: width, speed: speed, labelText: adminStr + "." + interStr + "." + rootStr },
                                { from: rootNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: adminNode, to: rootNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: rootNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: localNode, to: clientNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr }
                            ], onSuccess);
                        }
                        else {
                            connectMultipleNodes([
                                { from: clientNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: rootNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: adminNode, to: rootNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: rootNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: localNode, to: clientNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr }
                            ], onSuccess);
                        }
                    }
                    else if (rootModeDOM.value === "recursive") {
                        if (hasInter) {
                            connectMultipleNodes([
                                { from: clientNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: rootNode, to: interNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: interNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: adminNode, to: interNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: interNode, to: rootNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: rootNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: localNode, to: clientNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr }
                            ], onSuccess);
                        }
                        else {
                            connectMultipleNodes([
                                { from: clientNode, to: localNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: localNode, to: rootNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: rootNode, to: adminNode, strokeStyle: yellowWire, lineWidth: width, speed: speed, labelText: fullStr + "?" },
                                { from: adminNode, to: rootNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: rootNode, to: localNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr },
                                { from: localNode, to: clientNode, strokeStyle: greenWire, lineWidth: width, speed: speed, labelText: fullStr }
                            ], onSuccess);
                        }
                    }
                }
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
    function onSuccess() {
        connectNodes(clientNode, destNode, blueWire, 10, fastSpeed, undefined);
        connectNodes(destNode, clientNode, blueWire, 10, fastSpeed, undefined);
    }
    function connectNodes(from, to, strokeStyle, lineWidth, speed, labelText, callback) {
        if (callback === void 0) { callback = undefined; }
        var line = new Line(from, to, 0, strokeStyle, lineWidth);
        if (labelText) {
            line.label = new Label({ x: 0, y: 0 }, labelText, "#000000", strokeStyle, 5, 10, "12px Monserrat, sans-serif", 10);
        }
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
                line.label = undefined;
                if (callback) {
                    callback();
                }
                clearInterval(interval);
            }
        }, fixedDeltaTime);
        lineIntervals.push(interval);
        return line;
    }
    function connectMultipleNodes(connections, callback) {
        if (callback === void 0) { callback = undefined; }
        function recursiveConnect(index) {
            if (index < connections.length) {
                var connection = connections[index];
                index++;
                connectNodes(connection.from, connection.to, connection.strokeStyle, connection.lineWidth, connection.speed, connection.labelText, function () {
                    recursiveConnect(index);
                });
            }
            else {
                if (callback) {
                    callback();
                }
            }
        }
        recursiveConnect(0);
    }
    function render() {
        ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);
        for (var i = 0; i < drawables.length; i++) {
            drawables[i].draw();
        }
    }
    function getAlignedPoint(from, to, positionY, positionX) {
        var offX;
        var offY;
        switch (positionX) {
            case "left":
                offX = -0.5;
                break;
            case "center":
                offX = 0;
                break;
            case "right":
                offX = 0.5;
                break;
        }
        switch (positionY) {
            case "top":
                offY = -0.5;
                break;
            case "center":
                offY = 0;
                break;
            case "bottom":
                offY = 0.5;
                break;
        }
        var fromWidth;
        var fromHeight;
        var toWidth;
        var toHeight;
        if (from instanceof Node) {
            fromWidth = from.width;
            fromHeight = from.height;
        }
        if (to instanceof Node) {
            toWidth = to.width;
            toHeight = to.height;
        }
        if (from instanceof Label) {
            fromWidth = from.getRealWidth();
            fromHeight = from.getRealHeight();
        }
        if (to instanceof Label) {
            toWidth = to.getRealWidth();
            toHeight = to.getRealHeight();
        }
        return {
            x: from.pos.x + offX * (fromWidth + toWidth),
            y: from.pos.y + offY * (fromHeight + toHeight)
        };
    }
    function resetCanvas() {
        var pl = 100; // padding
        var pr = 170;
        var pt = 50;
        var pb = 70;
        var w = canvasDOM.width;
        var h = canvasDOM.height;
        clientNode = new Node({ x: pl, y: h - pb }, 60, 60, clientImage);
        localNode = new Node({ x: pl, y: h / 2 }, 60, 60, serverImage);
        rootNode = new Node({ x: pl, y: pt }, 60, 60, serverImage);
        interNode = new Node({ x: w - pr, y: pt }, 60, 60, serverImage);
        adminNode = new Node({ x: w - pr, y: h / 2 }, 60, 60, serverImage);
        destNode = new Node({ x: w - pr, y: h - pb }, 60, 60, clientImage);
        clientLabel = new Label({ x: 0, y: 0 }, "Host Cliente", "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        localLabel = new Label({ x: 0, y: 0 }, "Local", "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        rootLabel = new Label({ x: 0, y: 0 }, "Root", "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        interLabel = new Label({ x: 0, y: 0 }, "Intermediários", "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        adminLabel = new Label({ x: 0, y: 0 }, "Administrativo", "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        destLabel = new Label({ x: 0, y: 0 }, "Host Destino", "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        clientLabel.pos = getAlignedPoint(clientNode, clientLabel, "bottom", "center");
        localLabel.pos = getAlignedPoint(localNode, localLabel, "center", "left");
        rootLabel.pos = getAlignedPoint(rootNode, rootLabel, "center", "left");
        interLabel.pos = getAlignedPoint(interNode, interLabel, "center", "right");
        adminLabel.pos = getAlignedPoint(adminNode, adminLabel, "center", "right");
        destLabel.pos = getAlignedPoint(destNode, destLabel, "bottom", "center");
        drawables = [];
        drawables.push(clientNode);
        drawables.push(localNode);
        drawables.push(rootNode);
        drawables.push(interNode);
        drawables.push(adminNode);
        drawables.push(destNode);
        drawables.push(clientLabel);
        drawables.push(localLabel);
        drawables.push(rootLabel);
        drawables.push(interLabel);
        drawables.push(adminLabel);
        drawables.push(destLabel);
    }
    serverImage.onload = render;
    clientImage.onload = render;
    resetCanvas();
    setInterval(render, 2000);
    dom_1.id("run").addEventListener("click", function (ev) {
        run();
    });
});
