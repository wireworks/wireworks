// DNSFlow
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-04-14)
define(["require", "exports", "../../core/utils/dom", "../../core/networking/layers/layer-5/domain", "../../core/utils/math"], function (require, exports, dom_1, domain_1, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Images used in the canvas.
    var serverImage = new Image();
    serverImage.src = "../../../images/layers/5/server.png";
    var clientImage = new Image();
    clientImage.src = "../../../images/layers/5/client.png";
    // DOM elements.
    var errorWrapperDOM = dom_1.id("error_wrapper");
    var domainDOM = dom_1.id("domain");
    var canvasDOM = dom_1.id("canvas");
    var speedDOM = dom_1.id("speed");
    var ctx = canvasDOM.getContext("2d");
    // Simulation speed constants.
    var verySlowSpeed = 10;
    var slowSpeed = 25;
    var normalSpeed = 100;
    var fastSpeed = 400;
    var veryFastSpeed = 600;
    // Data structures representing servers and hosts in the canvas.
    var client = { name: "Host Cliente", node: undefined, label: undefined, modeDOM: undefined };
    var local = { name: "Local", node: undefined, label: undefined, modeDOM: dom_1.id("local_mode") };
    var root = { name: "Root", node: undefined, label: undefined, modeDOM: dom_1.id("root_mode") };
    var tld = { name: "TLD", node: undefined, label: undefined, modeDOM: dom_1.id("tld_mode") };
    var inter = { name: "Intermediários", node: undefined, label: undefined, modeDOM: dom_1.id("inter_mode") };
    var admin = { name: "Autoritativo", node: undefined, label: undefined, modeDOM: undefined };
    var dest = { name: "Host Destino", node: undefined, label: undefined, modeDOM: undefined };
    // Wire colors.
    var greenWire = "#a9cc78";
    var redWire = "#db938a";
    var blueWire = "#9ac9ed";
    var yellowWire = "#e5c16e";
    // Constants representing the mode of a DNS server.
    var ITERATIVE = "iterative";
    var RECURSIVE = "recursive";
    /**
     * The target duration of each frame while animating lines.
     */
    var fixedDeltaTime = 1000 / 60;
    /**
     * The intervals of each line being drawn.
     */
    var lineIntervals = [];
    /**
     * The list of elements drawn to the canvas.
     */
    var drawables = [];
    /**
     * A Drawable image that has special connecting points. Used to represent servers and clients in the canvas.
     * @author Henrique Colini
     */
    var Node = /** @class */ (function () {
        function Node(pos, width, heigth, margins, image) {
            this.visible = true;
            this.pos = pos;
            this.width = width;
            this.height = heigth;
            this.image = image;
            this.margins = margins;
        }
        Node.prototype.draw = function () {
            if (this.visible)
                ctx.drawImage(this.image, this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);
        };
        /**
         * Returns the 4 vertices of this rectangular Node. A, B, C and D represent the vertices clockwise, starting from the top left corner.
         */
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
        /**
         * Returns an exit point of this Node, given the side.
         * @param side Which side to get the point from.
         */
        Node.prototype.getOutput = function (side) {
            var p = this.getVertices();
            var f = 0.25;
            var fw = f * this.width;
            var fh = f * this.height;
            switch (side) {
                case "top":
                    return { x: p.a.x + fw, y: p.a.y - this.margins.t };
                case "bottom":
                    return { x: p.c.x - fw, y: p.c.y + this.margins.b };
                case "left":
                    return { x: p.d.x - this.margins.l, y: p.d.y - fh };
                case "right":
                    return { x: p.c.x + this.margins.r, y: p.b.y + fh };
            }
        };
        /**
         * Returns an entry point of this Node, given the side.
         * @param side Which side to get the point from.
         */
        Node.prototype.getInput = function (side) {
            var p = this.getVertices();
            var f = 0.25;
            var fw = f * this.width;
            var fh = f * this.height;
            switch (side) {
                case "top":
                    return { x: p.b.x - fw, y: p.a.y - this.margins.t };
                case "bottom":
                    return { x: p.d.x + fw, y: p.c.y + this.margins.b };
                case "left":
                    return { x: p.d.x - this.margins.l, y: p.a.y + fh };
                case "right":
                    return { x: p.c.x + this.margins.r, y: p.c.y - fh };
            }
        };
        return Node;
    }());
    /**
     * A Drawable text box.
     * @author Henrique Colini
     */
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
        /**
         * Returns the width of this Label, considering the width of the text and the padding.
         */
        Label.prototype.getRealWidth = function () {
            ctx.font = this.font;
            return ctx.measureText(this.text).width + (2 * this.padding);
        };
        /**
         * Returns the height of this Label, considering the height of the text and the padding.
         */
        Label.prototype.getRealHeight = function () {
            return this.textHeight + (2 * this.padding);
        };
        return Label;
    }());
    /**
     * A Drawable line that connects the outputs and inputs of Nodes.
     */
    var Line = /** @class */ (function () {
        function Line(from, to, time, strokeStyle, strokeWidth) {
            this.visible = true;
            this.from = from;
            this.to = to;
            this.time = time;
            this.strokeStyle = strokeStyle;
            this.lineWidth = strokeWidth;
        }
        /**
         * Returns the start point of this Line.
         */
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
        /**
         * Returns the end point of this Line.
         */
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
        /**
         * Returns the current end point of this Line in a point of time.
         * @param fromPoint The starting point.
         * @param toPoint The end point to be reached.
         */
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
    /**
     * Draws a rounded rectangle in the canvas.
     * @param x The x coordinate of the rectangle.
     * @param y The y coordinate of the rectangle.
     * @param w The width of the rectangle.
     * @param h The height of the rectangle.
     * @param r The radius of the border.
     */
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
    /**
     * Runs the simulation.
     */
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
                makerWidth = 10;
                switch (speedDOM.value) {
                    case "veryslow":
                        makerSpeed = verySlowSpeed;
                        break;
                    case "slow":
                        makerSpeed = slowSpeed;
                        break;
                    case "normal":
                        makerSpeed = normalSpeed;
                        break;
                    case "fast":
                        makerSpeed = fastSpeed;
                        break;
                    case "veryfast":
                        makerSpeed = veryFastSpeed;
                        break;
                }
                var cons = calculateConnections(domain_1.Domain.extractDomain(tmpRoot, fullName));
                connectMultipleNodes(cons.connections, cons.success ? onSuccess : onFailure);
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
                    case domain_1.ERROR_SMALL_DOMAIN:
                        errStr = "Você deve inserir um domínio com mais partes.";
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
    /**
     * What to do when a DNS query ends in success.
     */
    function onSuccess() {
        connectNodes(client.node, dest.node, blueWire, 10, fastSpeed, undefined);
        connectNodes(dest.node, client.node, blueWire, 10, fastSpeed, undefined);
    }
    /**
     * What to do when a DNS query ends in failure.
     */
    function onFailure() { }
    /**
     * Calculates the connections between servers needed in a DNS query. Returns a list of said connections and whether the query was successful.
     * @param domain The host domain.
     */
    function calculateConnections(domain) {
        var parts = domain.getDomainParts();
        var connections = [
            makeConnection(client, local, "request", parts.full + "?")
        ];
        var success = false;
        // LOCAL returns "."
        if (local.modeDOM.value === ITERATIVE) {
            connections.push(makeConnection(local, client, "partial", "."));
        }
        // LOCAL returns "www.example.com.br"
        else if (local.modeDOM.value === RECURSIVE) {
            connections.push(makeConnection(local, root, "request", parts.full + "?"));
            // ROOT returns "br"
            if (root.modeDOM.value === ITERATIVE) {
                connections.push(makeConnection(root, local, "partial", parts.tld));
                connections.push(makeConnection(local, tld, "request", parts.full + "?"));
                // TLD returns "com.br"
                if (tld.modeDOM.value === ITERATIVE) {
                    if (parts.inter) {
                        // INTER returns "example.com.br"
                        if (inter.modeDOM.value === ITERATIVE) {
                            connections.push.apply(connections, [
                                makeConnection(tld, local, "partial", parts.inter + "." + parts.tld),
                                makeConnection(local, inter, "request", parts.full + "?"),
                                makeConnection(inter, local, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
                                makeConnection(local, admin, "request", parts.full + "?"),
                                makeConnection(admin, local, "full", parts.full)
                            ]);
                        }
                        // INTER returns "www.example.com.br"
                        else if (inter.modeDOM.value === RECURSIVE) {
                            connections.push.apply(connections, [
                                makeConnection(tld, local, "partial", parts.inter + "." + parts.tld),
                                makeConnection(local, inter, "request", parts.full + "?"),
                                makeConnection(inter, admin, "request", parts.full + "?"),
                                makeConnection(admin, inter, "full", parts.full),
                                makeConnection(inter, local, "full", parts.full)
                            ]);
                        }
                    }
                    else {
                        connections.push.apply(connections, [
                            makeConnection(tld, local, "partial", parts.admin + "." + parts.tld),
                            makeConnection(local, admin, "request", parts.full + "?"),
                            makeConnection(admin, local, "full", parts.full)
                        ]);
                    }
                }
                // TLD returns "www.example.com.br"
                else if (tld.modeDOM.value === RECURSIVE) {
                    if (parts.inter) {
                        // INTER returns "example.com.br"
                        // ADMIN returns "www.example.com.br"
                        if (inter.modeDOM.value === ITERATIVE) {
                            connections.push.apply(connections, [
                                makeConnection(tld, inter, "request", parts.full + "?"),
                                makeConnection(inter, tld, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
                                makeConnection(tld, admin, "request", parts.full + "?"),
                                makeConnection(admin, tld, "full", parts.full)
                            ]);
                        }
                        // INTER returns "www.example.com.br"
                        // ADMIN returns "www.example.com.br"
                        else if (inter.modeDOM.value === RECURSIVE) {
                            connections.push.apply(connections, [
                                makeConnection(tld, inter, "request", parts.full + "?"),
                                makeConnection(inter, admin, "request", parts.full + "?"),
                                makeConnection(admin, inter, "full", parts.full),
                                makeConnection(inter, tld, "full", parts.full)
                            ]);
                        }
                    }
                    // ADMIN returns "www.example.com.br"
                    else {
                        connections.push.apply(connections, [
                            makeConnection(tld, admin, "request", parts.full + "?"),
                            makeConnection(admin, tld, "full", parts.full)
                        ]);
                    }
                    connections.push(makeConnection(tld, local, "full", parts.full));
                }
            }
            // ROOT returns "www.example.com.br"
            else if (root.modeDOM.value === RECURSIVE) {
                connections.push(makeConnection(root, tld, "request", parts.full + "?"));
                // TLD returns "com.br"
                if (tld.modeDOM.value === ITERATIVE) {
                    if (parts.inter) {
                        connections.push(makeConnection(tld, root, "partial", parts.inter + "." + parts.tld));
                        // INTER returns "example.com.br"
                        // ADMIN returns "www.example.com.br"
                        if (inter.modeDOM.value === ITERATIVE) {
                            connections.push.apply(connections, [
                                makeConnection(root, inter, "request", parts.full + "?"),
                                makeConnection(inter, root, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
                                makeConnection(root, admin, "request", parts.full + "?"),
                                makeConnection(admin, root, "full", parts.full)
                            ]);
                        }
                        // INTER returns "www.example.com.br"
                        // ADMIN returns "www.example.com.br"
                        else if (inter.modeDOM.value === RECURSIVE) {
                            connections.push.apply(connections, [
                                makeConnection(root, inter, "request", parts.full + "?"),
                                makeConnection(inter, admin, "request", parts.full + "?"),
                                makeConnection(admin, inter, "full", parts.full),
                                makeConnection(inter, root, "full", parts.full)
                            ]);
                        }
                    }
                    else {
                        // ADMIN returns "www.example.com.br"
                        connections.push.apply(connections, [
                            makeConnection(tld, root, "partial", parts.admin + "." + parts.tld),
                            makeConnection(root, admin, "request", parts.full + "?"),
                            makeConnection(admin, root, "full", parts.full)
                        ]);
                    }
                }
                // TLD returns "www.example.com.br"
                else if (tld.modeDOM.value === RECURSIVE) {
                    if (parts.inter) {
                        // INTER returns "example.com.br"
                        // ADMIN returns "www.example.com.br"
                        if (inter.modeDOM.value === ITERATIVE) {
                            connections.push.apply(connections, [
                                makeConnection(tld, inter, "request", parts.full + "?"),
                                makeConnection(inter, tld, "partial", parts.admin + "." + parts.inter + "." + parts.tld),
                                makeConnection(tld, admin, "request", parts.full + "?"),
                                makeConnection(admin, tld, "full", parts.full)
                            ]);
                        }
                        // INTER returns "www.example.com.br"
                        // ADMIN returns "www.example.com.br"
                        else if (inter.modeDOM.value === RECURSIVE) {
                            connections.push.apply(connections, [
                                makeConnection(tld, inter, "request", parts.full + "?"),
                                makeConnection(inter, admin, "request", parts.full + "?"),
                                makeConnection(admin, inter, "full", parts.full),
                                makeConnection(inter, tld, "full", parts.full)
                            ]);
                        }
                    }
                    else {
                        // ADMIN returns "www.example.com.br"
                        connections.push.apply(connections, [
                            makeConnection(tld, admin, "request", parts.full + "?"),
                            makeConnection(admin, tld, "full", parts.full)
                        ]);
                    }
                    connections.push(makeConnection(tld, root, "full", parts.full));
                }
                connections.push(makeConnection(root, local, "full", parts.full));
            }
            connections.push(makeConnection(local, client, "full", parts.full));
            success = true;
        }
        return { connections: connections, success: success };
    }
    /**
     * The speed of the lines the line maker makes.
     */
    var makerWidth = 0;
    /**
     * The width of the lines the line maker makes.
     */
    var makerSpeed = 0;
    /**
     * Creates NodeConnections.
     * @param from What machine to start from.
     * @param to What machine to go to.
     * @param kind What kind of connection to create. Must be either "request", "partial" (responses) or "full" (responses).
     * @param msg What message to carry in the end of the line.
     */
    function makeConnection(from, to, kind, msg) {
        var style;
        switch (kind) {
            case ("request"):
                style = yellowWire;
                break;
            case ("partial"):
                style = redWire;
                break;
            case ("full"):
                style = greenWire;
                break;
        }
        return { from: from.node, to: to.node, strokeStyle: style, lineWidth: makerWidth, speed: makerSpeed, labelText: msg };
    }
    /**
     * Connects two Nodes with a Line, drawing it over time, given a speed.
     * @param from The Node to start the Line from.
     * @param to The Node to get the Line to.
     * @param strokeStyle The stroke style of the Line.
     * @param lineWidth The line width.
     * @param speed The speed of the Line being drawn, in pixels per second.
     * @param labelText The text of the Line's label.
     * @param callback A callback for when the Line finishes drawing.
     */
    function connectNodes(from, to, strokeStyle, lineWidth, speed, labelText, callback) {
        if (callback === void 0) { callback = undefined; }
        var line = new Line(from, to, 0, strokeStyle, lineWidth);
        if (labelText) {
            line.label = new Label({ x: 0, y: 0 }, labelText, "#000000", strokeStyle, 5, 10, "12px Monserrat, sans-serif", 10);
        }
        drawables.push(line);
        var prevTime = Date.now();
        var interval = setInterval(function () {
            var deltaTime = Date.now() - prevTime;
            prevTime = Date.now();
            var startPoint = line.getStartPoint();
            var endPoint = line.getEndPoint();
            var distance = Math.sqrt(((startPoint.x - endPoint.x) * (startPoint.x - endPoint.x)) + ((startPoint.y - endPoint.y) * (startPoint.y - endPoint.y)));
            line.time = math_1.clamp(line.time + ((deltaTime / 1000) * (speed / distance)), 0, 1);
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
    /**
     * Connects multiple nodes, in succession.
     * @param connections The list of connections to be made.
     * @param callback What do to when the last line finishes being drawn.
     */
    function connectMultipleNodes(connections, callback) {
        if (callback === void 0) { callback = undefined; }
        function iterativeConnect(index) {
            if (index < connections.length) {
                var connection = connections[index];
                index++;
                connectNodes(connection.from, connection.to, connection.strokeStyle, connection.lineWidth, connection.speed, connection.labelText, function () {
                    iterativeConnect(index);
                });
            }
            else {
                if (callback) {
                    callback();
                }
            }
        }
        iterativeConnect(0);
    }
    /**
     * Renders all the Drawables to the canvas.
     */
    function render() {
        ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);
        for (var i = 0; i < drawables.length; i++) {
            drawables[i].draw();
        }
    }
    /**
     * Returns the position of a Node or Label when put aligned to another one.
     * @param from The Node or Label to be positioned relative to.
     * @param to The Node or Label to be positioned.
     * @param positionY How to align the Node or Label vertically. Can be "top", "center" or "bottom".
     * @param positionX How to align the Node or Label horizontally. Can be "left", "center" or "right".
     */
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
    /**
     * Deletes all drawables, sets up all Nodes and their Labels.
     */
    function resetCanvas() {
        var pl = 80; // padding
        var pr = 80;
        var pt = 70;
        var pb = 70;
        var w = canvasDOM.width;
        var h = canvasDOM.height;
        client.node = new Node({ x: pl, y: h - pb }, 60, 60, { l: 10, t: 10, r: 10, b: 10 }, clientImage);
        local.node = new Node({ x: pl, y: h - pb - 180 }, 60, 60, { l: 10, t: 10, r: 10, b: 40 }, serverImage);
        root.node = new Node({ x: pl, y: pt + 80 }, 60, 60, { l: 10, t: 10, r: 10, b: 10 }, serverImage);
        inter.node = new Node({ x: w - pr, y: pt + 80 }, 60, 60, { l: 10, t: 10, r: 10, b: 10 }, serverImage);
        tld.node = new Node({ x: (w + pl - pr) / 2, y: pt }, 60, 60, { l: 10, t: 10, r: 10, b: 10 }, serverImage);
        admin.node = new Node({ x: w - pr, y: h - pb - 180 }, 60, 60, { l: 10, t: 10, r: 10, b: 10 }, serverImage);
        dest.node = new Node({ x: w - pr, y: h - pb }, 60, 60, { l: 10, t: 10, r: 10, b: 10 }, clientImage);
        client.label = new Label({ x: 0, y: 0 }, client.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        local.label = new Label({ x: 0, y: 0 }, local.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        root.label = new Label({ x: 0, y: 0 }, root.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        tld.label = new Label({ x: 0, y: 0 }, tld.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        inter.label = new Label({ x: 0, y: 0 }, inter.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        admin.label = new Label({ x: 0, y: 0 }, admin.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        dest.label = new Label({ x: 0, y: 0 }, dest.name, "#505050", "transparent", 6, 0, "14px Montserrat, sans-serif", 14);
        client.label.pos = getAlignedPoint(client.node, client.label, "bottom", "center");
        local.label.pos = getAlignedPoint(local.node, local.label, "bottom", "center");
        root.label.pos = getAlignedPoint(root.node, root.label, "top", "center");
        tld.label.pos = getAlignedPoint(tld.node, tld.label, "top", "center");
        inter.label.pos = getAlignedPoint(inter.node, inter.label, "top", "center");
        admin.label.pos = getAlignedPoint(admin.node, admin.label, "bottom", "center");
        dest.label.pos = getAlignedPoint(dest.node, dest.label, "bottom", "center");
        drawables = [];
        drawables.push(client.node);
        drawables.push(local.node);
        drawables.push(root.node);
        drawables.push(inter.node);
        drawables.push(admin.node);
        drawables.push(dest.node);
        drawables.push(tld.node);
        drawables.push(client.label);
        drawables.push(local.label);
        drawables.push(root.label);
        drawables.push(inter.label);
        drawables.push(admin.label);
        drawables.push(dest.label);
        drawables.push(tld.label);
        render();
    }
    // +==============================================+
    serverImage.onload = render;
    clientImage.onload = render;
    resetCanvas();
    setInterval(render, 2000);
    dom_1.id("run").addEventListener("click", run);
    dom_1.id("domain").addEventListener("keydown", function (ev) {
        if (ev.key === "Enter")
            run();
    });
});
