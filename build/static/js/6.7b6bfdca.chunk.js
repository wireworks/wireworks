(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{36:function(t,e,r){"use strict";r.d(e,"c",function(){return s}),r.d(e,"b",function(){return o}),r.d(e,"d",function(){return c}),r.d(e,"a",function(){return h});var n=r(12),i=r(13),a=r(37);function s(){return new h([!1,!1,!1,!1,!1,!1,!1,!1])}function o(){return new h([!0,!0,!0,!0,!0,!0,!0,!0])}var c="ByteRangeError",h=function(){function t(e){Object(n.a)(this,t),this.bits=void 0,this.decimal=void 0,"number"===typeof e?this.setDecimal(e):this.setBits(e)}return Object(i.a)(t,[{key:"setDecimal",value:function(t){if(t<0||t>255||t!==Math.floor(t)){var e=new RangeError("The decimal value of a byte must be an integer between 0-255 (inclusive)");throw e.name=c,e}this.bits=function(t){if(t.length>8)throw new RangeError("The boolean array must have a length of 8 or less");for(var e=[!1,!1,!1,!1,!1,!1,!1,!1],r=0;r<t.length;r++)e[r]=void 0!==t[r]&&t[r];return e}(Object(a.c)(t)),this.decimal=t}},{key:"setBits",value:function(t){this.bits=t,this.decimal=Object(a.a)(t)}},{key:"getDecimal",value:function(){return this.decimal}},{key:"getBits",value:function(){return this.bits}},{key:"bit",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0;if(void 0!==e){var r=this.bits;r[t]=e,this.setBits(r)}return this.bits[t]}},{key:"clone",value:function(){return new t(this.bits.slice())}}]),t}()},37:function(t,e,r){"use strict";function n(t,e,r){return Math.min(Math.max(t,e),r)}function i(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(0===t.length)return 0;for(var r=0,n=0;n<t.length;n++){var i=e?t.length-n-1:n;r+=t[i]?Math.pow(2,i):0}return r}function a(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(t<0)throw new RangeError("Attempting to convert negative number to binary");if(t!==Math.floor(t))throw new RangeError("Attempting to convert non-integer number to binary");for(var r=[],n=t,i=0;n>0;)r[i]=!!(n%2),n=Math.floor(n/2),i++;return e&&r.reverse(),r}r.d(e,"b",function(){return n}),r.d(e,"a",function(){return i}),r.d(e,"c",function(){return a})},39:function(t,e,r){"use strict";r.d(e,"a",function(){return s}),r.d(e,"c",function(){return c}),r.d(e,"b",function(){return h}),r.d(e,"d",function(){return d}),r.d(e,"f",function(){return l}),r.d(e,"g",function(){return u}),r.d(e,"e",function(){return v});var n=r(12),i=r(13),a=r(36);function s(){return[Object(a.c)(),Object(a.c)(),Object(a.c)(),Object(a.c)()]}function o(t){t=t.slice();for(var e=0;e<4;e++)t[e]=t[e].clone();return t}var c="MaskRangeError",h="AddressParseError",d="NotNetworkError";function l(t,e){if(t>3||t<0)throw new RangeError("The byteIndex must be between 0-3 (inclusive)");if(e>7||e<0)throw new RangeError("The bitIndex must be between 0-7 (inclusive)");return 8*t+(7-e)}function u(t){if(t>31||t<0)throw new RangeError("The byte4Index must be between 0-31 (inclusive)");return{byteIndex:Math.floor(t/8),bitIndex:7-t%8}}var v=function(){function t(e,r){var i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],a=arguments.length>3&&void 0!==arguments[3]&&arguments[3];if(Object(n.a)(this,t),this.ip=void 0,this.mask=void 0,this.maskShort=void 0,"string"===typeof e?this.parseIP(e,i):this.ip=e,this.mask||(r?"number"===typeof r?this.setMaskShort(r):this.setMask(r):this.setMask(s())),a&&!this.isNetworkAddress(!0)){var o=new Error("Not a Network Address");throw o.name=d,o}}return Object(i.a)(t,[{key:"getNetworkAddress",value:function(){if(arguments.length>0&&void 0!==arguments[0]&&arguments[0]||!(this.maskShort>30)){for(var e=Array(4),r=0;r<4;r++){for(var n=this.ip[r].clone(),i=this.mask[r],a=0;a<8;a++)i.bit(a)||n.bit(a,!1);e[r]=n}return new t(e,o(this.mask))}}},{key:"getBroadcastAddress",value:function(){if(arguments.length>0&&void 0!==arguments[0]&&arguments[0]||!(this.maskShort>30)){for(var e=Array(4),r=0;r<4;r++){for(var n=this.ip[r].clone(),i=this.mask[r],a=0;a<8;a++)i.bit(a)||n.bit(a,!0);e[r]=n}return new t(e,o(this.mask))}}},{key:"isNetworkAddress",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return this.compare(this.getNetworkAddress(t))}},{key:"isBroadcastAddress",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return this.compare(this.getBroadcastAddress(t))}},{key:"compare",value:function(t){if(!t)return!1;if(this===t)return!0;if(this.ip===t.ip&&(this.mask===t.mask||this.maskShort===t.maskShort))return!0;for(var e=0;e<4;e++)for(var r=0;r<8;r++)if(this.ip[e].bit(r)!==t.ip[e].bit(r)||this.mask[e].bit(r)!==t.mask[e].bit(r))return!1;return!0}},{key:"numberOfHosts",value:function(){if(arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&!this.isNetworkAddress(!0)){var t=new Error("Not a network address");throw t.name=d,t}return 31===this.maskShort?2:32===this.maskShort?1:Math.pow(2,32-this.maskShort)-2}},{key:"firstHost",value:function(){var e,r,n=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(n&&!this.isNetworkAddress(!0)){var i=new Error("Not a network address");throw i.name=d,i}if(n)e=o(this.ip),r=o(this.mask);else{var a=this.getNetworkAddress(!0);e=a.ip,r=a.mask}return this.maskShort<31&&e[3].setDecimal(e[3].getDecimal()+1),new t(e,r)}},{key:"lastHost",value:function(){var e,r;if(arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&!this.isNetworkAddress(!0)){var n=new Error("Not a Network Address");throw n.name=d,n}var i=this.getBroadcastAddress(!0);return e=i.ip,r=i.mask,this.maskShort<31&&e[3].setDecimal(e[3].getDecimal()-1),new t(e,r)}},{key:"subdivide",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(e&&!this.isNetworkAddress(!0)){var r=new Error("Not a Network Address");throw r.name=d,r}var n,i=[void 0,void 0];if(32===this.maskShort)return i;e?n=o(this.ip):n=this.getNetworkAddress(!0).ip;i[0]=new t(o(n),this.maskShort+1);var a=o(n),s=u(this.maskShort),c=s.byteIndex,h=s.bitIndex;return a[c].bit(h,!0),i[1]=new t(a,this.maskShort+1),i}},{key:"setMask",value:function(t){for(var e=0,r=!1,n=0;n<4;n++)for(var i=0;i<8;i++)if(t[n].bit(7-i)){if(r){var a=new Error("Mask contains holes");throw a.name="MaskHolesError",a}e++}else r=!0;this.maskShort=e,this.mask=t}},{key:"setMaskShort",value:function(t){if(t<0||t>32){var e=new RangeError("The short mask should be between 0 and 32");throw e.name=c,e}for(var r=s(),n=0;n<4;n++)for(var i=0;i<8;i++)8*n+i<t?r[n].bit(7-i,!0):r[n].bit(7-i,!1);this.maskShort=t,this.mask=r}},{key:"setIp",value:function(t){this.ip=t}},{key:"getMask",value:function(){return this.mask}},{key:"getMaskShort",value:function(){return this.maskShort}},{key:"getIp",value:function(){return this.ip}},{key:"parseIP",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];t=t.trim();var r=/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/.exec(t);if(null!==r){var n=new a.a(parseInt(r[1],10)),i=new a.a(parseInt(r[2],10)),s=new a.a(parseInt(r[3],10)),o=new a.a(parseInt(r[4],10)),d=parseInt(r[5],10);if(d<0||d>32){var l=new RangeError("The short mask should be between 0 and 32");throw l.name=c,l}this.setIp([n,i,s,o]),this.setMaskShort(d)}else{if(e){var u=new Error("Invalid IP/mask address string");throw u.name=h,u}var v=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(t);if(null===v){var f=new Error("Invalid IP/mask address string");throw f.name=h,f}var p=new a.a(parseInt(v[1],10)),g=new a.a(parseInt(v[2],10)),m=new a.a(parseInt(v[3],10)),w=new a.a(parseInt(v[4],10));this.setIp([p,g,m,w])}}},{key:"toString",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return this.ip[0].getDecimal()+"."+this.ip[1].getDecimal()+"."+this.ip[2].getDecimal()+"."+this.ip[3].getDecimal()+(t?"":this.shortMaskString())}},{key:"maskString",value:function(){return this.mask[0].getDecimal()+"."+this.mask[1].getDecimal()+"."+this.mask[2].getDecimal()+"."+this.mask[3].getDecimal()}},{key:"shortMaskString",value:function(){return"/"+this.getMaskShort()}}]),t}()},40:function(t,e,r){"use strict";var n=r(0),i=r.n(n);e.a=function(t){var e=t.errorMessage;return e?i.a.createElement("div",{className:"errorbox"},e):null}},43:function(t,e,r){"use strict";var n=r(16),i=r(14),a=r(17),s=r(15),o=r(12),c=r(13),h=r(0),d=r.n(h),l=r(37);r.d(e,"c",function(){return u}),r.d(e,"a",function(){return v}),r.d(e,"b",function(){return f});var u=function(){function t(e,r,n,i,a){var s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:.25;Object(o.a)(this,t),this.visible=!0,this.pos=void 0,this.margins=void 0,this.width=void 0,this.height=void 0,this.image=void 0,this.connectorOffset=void 0,this.pos=e,this.width=r,this.height=n,this.image=a,this.margins=i,this.connectorOffset=s}return Object(c.a)(t,[{key:"draw",value:function(t){this.visible&&t.drawImage(this.image,this.pos.x-this.width/2,this.pos.y-this.height/2,this.width,this.height)}},{key:"getVertices",value:function(){var t=this.pos.x,e=this.pos.y,r=this.width/2,n=this.height/2;return{a:{x:t-r,y:e-n},b:{x:t+r,y:e-n},c:{x:t+r,y:e+n},d:{x:t-r,y:e+n}}}},{key:"getOutput",value:function(t){var e=this.getVertices(),r=this.connectorOffset*this.width,n=this.connectorOffset*this.height;switch(t){case"top":return{x:e.a.x+r,y:e.a.y-this.margins.t};case"bottom":return{x:e.c.x-r,y:e.c.y+this.margins.b};case"left":return{x:e.d.x-this.margins.l,y:e.d.y-n};case"right":return{x:e.c.x+this.margins.r,y:e.b.y+n}}}},{key:"getInput",value:function(t){var e=this.getVertices(),r=this.connectorOffset*this.width,n=this.connectorOffset*this.height;switch(t){case"top":return{x:e.b.x-r,y:e.a.y-this.margins.t};case"bottom":return{x:e.d.x+r,y:e.c.y+this.margins.b};case"left":return{x:e.d.x-this.margins.l,y:e.a.y+n};case"right":return{x:e.c.x+this.margins.r,y:e.c.y-n}}}}]),t}(),v=function(){function t(e,r,n,i,a,s,c,h){var d=arguments.length>8&&void 0!==arguments[8]?arguments[8]:"left",l=arguments.length>9&&void 0!==arguments[9]?arguments[9]:3;Object(o.a)(this,t),this.visible=!0,this.pos=void 0,this.text=void 0,this.textColor=void 0,this.backgroundColor=void 0,this.padding=void 0,this.borderRadius=void 0,this.font=void 0,this.textHeight=void 0,this.lineDistance=void 0,this.textAlign=void 0,this.pos=e,this.text=r,this.textColor=n,this.backgroundColor=i,this.padding=a,this.borderRadius=s,this.font=c,this.textHeight=h,this.lineDistance=l,this.textAlign=d}return Object(c.a)(t,[{key:"draw",value:function(t){if(this.visible){var e=this.getRealWidth(t),r=this.getRealHeight();t.fillStyle=this.backgroundColor,function(t,e,r,n,i,a){return n<2*a&&(a=n/2),i<2*a&&(a=i/2),t.beginPath(),t.moveTo(e+a,r),t.arcTo(e+n,r,e+n,r+i,a),t.arcTo(e+n,r+i,e,r+i,a),t.arcTo(e,r+i,e,r,a),t.arcTo(e,r,e+n,r,a),t.closePath(),t}(t,this.pos.x-e/2,this.pos.y-r/2,e,r,this.borderRadius).fill(),t.fillStyle=this.textColor,t.font=this.font;for(var n=this.text.split("\n"),i=0;i<n.length;i++){var a=n[i],s=e-(t.measureText(a).width+2*this.padding);switch(this.textAlign){default:case"left":s=0;break;case"center":s/=2}t.fillText(a,this.pos.x+this.padding-e/2+s,this.pos.y+this.padding+(i+1)*this.textHeight+i*this.lineDistance-r/2)}}}},{key:"getRealWidth",value:function(t){var e=0;t.font=this.font;for(var r=this.text.split("\n"),n=0;n<r.length;n++){var i=r[n],a=t.measureText(i).width+2*this.padding;a>e&&(e=a)}return e}},{key:"getRealHeight",value:function(){var t=this.text.split("\n").length;return t*this.textHeight+(t-1)*this.lineDistance+2*this.padding}}]),t}(),f=function(){function t(e,r,n,i,a){Object(o.a)(this,t),this.visible=!0,this.from=void 0,this.to=void 0,this.time=void 0,this.strokeStyle=void 0,this.lineWidth=void 0,this.label=void 0,this.from=e,this.to=r,this.time=n,this.strokeStyle=i,this.lineWidth=a}return Object(c.a)(t,[{key:"getStartPoint",value:function(){var t=this.from.pos.x-this.to.pos.x,e=this.from.pos.y-this.to.pos.y;return Math.abs(t)>Math.abs(e)?t>0?this.from.getOutput("left"):this.from.getOutput("right"):e>0?this.from.getOutput("top"):this.from.getOutput("bottom")}},{key:"getEndPoint",value:function(){var t=this.from.pos.x-this.to.pos.x,e=this.from.pos.y-this.to.pos.y;return Math.abs(t)>Math.abs(e)?t>0?this.to.getInput("right"):this.to.getInput("left"):e>0?this.to.getInput("bottom"):this.to.getInput("top")}},{key:"getCurrentEndPoint",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.getStartPoint(),e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.getEndPoint();return{x:t.x+this.time*(e.x-t.x),y:t.y+this.time*(e.y-t.y)}}},{key:"draw",value:function(t){if(this.visible){var e=this.getStartPoint(),r=this.getCurrentEndPoint(e);t.beginPath(),t.strokeStyle=this.strokeStyle,t.lineWidth=this.lineWidth,t.lineCap="round",t.moveTo(e.x,e.y),t.lineTo(r.x,r.y),t.stroke(),this.label&&(this.label.pos=r,this.label.draw(t))}}}]),t}(),p=function(t){function e(t){var r;return Object(o.a)(this,e),(r=Object(n.a)(this,Object(i.a)(e).call(this,t))).drawables=[],r.canvas=void 0,r.lineIntervals=[],r.addDrawable=function(t){r.drawables.push(t)},r.removeDrawable=function(t){var e=r.drawables.indexOf(t);return!(e<0)&&(r.drawables.splice(e,1),!0)},r.clearDrawables=function(){r.drawables=[]},r.getDrawables=function(){return r.drawables},r.stopLineAnimations=function(){for(var t=0;t<r.lineIntervals.length;t++)clearInterval(r.lineIntervals[t])},r.connectNodes=function(t,e,n,i,s,o){var c=arguments.length>6&&void 0!==arguments[6]?arguments[6]:void 0,h=new f(t,e,0,n,i);o&&(h.label=new v({x:0,y:0},o,"#000000",n,5,10,"12px Monserrat, sans-serif",10)),r.addDrawable(h);var d=Date.now(),u=Object(a.a)(r),p=setInterval(function(){var t=Date.now()-d;d=Date.now();var e=h.getStartPoint(),r=h.getEndPoint(),n=Math.sqrt((e.x-r.x)*(e.x-r.x)+(e.y-r.y)*(e.y-r.y));h.time=Object(l.b)(h.time+t/1e3*(s/n),0,1),u.draw(),h.time>=1&&(h.time=1,h.label=void 0,c&&c(),clearInterval(p),u.draw())},r.props.fixedDeltaTime);return r.lineIntervals.push(p),h},r.connectMultipleNodes=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0;!function n(i){if(i<t.length){var a=t[i];i++,r.connectNodes(a.from,a.to,a.strokeStyle,a.lineWidth,a.speed,a.labelText,function(){n(i)})}else e&&e()}(0)},r.getAlignedPoint=function(t,e,n,i){var a,s,o,c,h,d;switch(i){case"left":a=-.5;break;case"center":a=0;break;case"right":a=.5}switch(n){case"top":s=-.5;break;case"center":s=0;break;case"bottom":s=.5}return t instanceof u&&(o=t.width,c=t.height),e instanceof u&&(h=e.width,d=e.height),t instanceof v&&(o=t.getRealWidth(r.canvas.current.getContext("2d")),c=t.getRealHeight()),e instanceof v&&(h=e.getRealWidth(r.canvas.current.getContext("2d")),d=e.getRealHeight()),{x:t.pos.x+a*(o+h),y:t.pos.y+s*(c+d)}},r.draw=function(){var t=r.canvas.current.getContext("2d");if(t.clearRect(0,0,r.props.width,r.props.height),r.drawables)for(var e=0;e<r.drawables.length;e++)r.drawables[e].draw(t)},r.canvas=d.a.createRef(),r}return Object(s.a)(e,t),Object(c.a)(e,[{key:"componentWillUnmount",value:function(){this.stopLineAnimations()}},{key:"render",value:function(){return d.a.createElement("canvas",{width:this.props.width,height:this.props.height,ref:this.canvas,className:"flow-canvas"})}}]),e}(h.Component);e.d=p},66:function(t,e,r){"use strict";r.r(e);var n=r(12),i=r(13),a=r(16),s=r(14),o=r(15),c=r(0),h=r.n(c),d=r(43),l=r(39),u=r(40),v=r(36);var f="AddressParseError",p=["A","B","C","D","E","F","0","1","2","3","4","5","6","7","8","9"],g=function(){function t(e){Object(n.a)(this,t),this.bytes=[Object(v.c)(),Object(v.c)(),Object(v.c)(),Object(v.c)(),Object(v.c)(),Object(v.c)()],this.asString=void 0,"string"===typeof e?this.parseAddress(e):this.setBytes(e)}return Object(i.a)(t,[{key:"parseAddress",value:function(t){if(12!==(t=t.toUpperCase().replace(/[:.-]/g,"")).length){var e=new Error("Invalid MAC address string");throw e.name=f,e}for(var r=0;r<t.length;r++){var n=t[r];if(-1===p.indexOf(n)){var i=new Error("Invalid MAC address string");throw i.name=f,i}}this.asString="";for(var a=0;a<6;a++){var s=t[2*a]+t[2*a+1];this.bytes[a]=new v.a(parseInt(s,16)),this.asString+=s,a<5&&(this.asString+="-")}}},{key:"compare",value:function(t){if(!t)return!1;if(this===t)return!0;if(this.bytes===t.bytes)return!0;for(var e=0;e<6;e++)for(var r=0;r<8;r++)if(this.bytes[e].bit(r)!==t.bytes[e].bit(r))return!1;return!0}},{key:"setBytes",value:function(t){this.bytes=t,this.asString="";for(var e=0;e<6;e++){var r=t[e].getDecimal().toString(16).toUpperCase();this.asString+=(r.length<2?"0":"")+r,e<5&&(this.asString+="-")}}},{key:"getBytes",value:function(){return this.bytes}},{key:"toString",value:function(){return this.asString}}]),t}(),m=new Image,w=new Image,b=new Image,k=new Image;r.e(15).then(r.t.bind(null,59,7)).then(function(t){return m.src=t.default}),r.e(17).then(r.t.bind(null,60,7)).then(function(t){return w.src=t.default}),r.e(16).then(r.t.bind(null,61,7)).then(function(t){return b.src=t.default}),r.e(18).then(r.t.bind(null,62,7)).then(function(t){return k.src=t.default});var y={veryslow:10,slow:25,normal:50,fast:200,veryfast:600},x="#aaaaaa",S="#a9cc78",A="#e5c16e",E=function(t){function e(t){var r;return Object(n.a)(this,e),(r=Object(a.a)(this,Object(s.a)(e).call(this,t))).txtTarget=void 0,r.selectOrigin=void 0,r.selectSpeed=void 0,r.macCanvas=void 0,r.state={errorMessage:null,origin:void 0,target:void 0,speed:void 0},r.run=function(){var t=null;r.setState({errorMessage:null});try{var e;if(r.props.ipFetch)e=new g(r.txtTarget.current.value);else if((e=new l.e(r.txtTarget.current.value,void 0,!0)).isNetworkAddress())throw t="Este \xe9 um endere\xe7o de rede. Escolha outro endere\xe7o.",Error;r.setState({origin:r.selectOrigin.current.value,target:e,speed:r.selectSpeed.current.value},r.macCanvas.current.run)}catch(n){if(!t)switch(n.name){case f:t="O MAC do destino deve possuir o formato 00-00-00-00-00-00.";break;case l.b:t="O IP do destino deve possuir o formato 0.0.0.0/0.";break;case l.c:t="O valor da m\xe1scara \xe9 alto demais (deve estar entre 0-32).";break;case v.d:t="Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).";break;default:t="Erro desconhecido ("+n.name+").",console.error(n)}r.setState({errorMessage:"Entrada inv\xe1lida. "+t})}},r.txtTarget=h.a.createRef(),r.selectSpeed=h.a.createRef(),r.selectOrigin=h.a.createRef(),r.macCanvas=h.a.createRef(),r}return Object(o.a)(e,t),Object(i.a)(e,[{key:"render",value:function(){var t=this;return h.a.createElement("main",null,h.a.createElement("div",{className:"hbox align-end mb-3"},h.a.createElement("div",null,h.a.createElement("label",{htmlFor:"origin"},"Host de Origem"),h.a.createElement("div",null,h.a.createElement("select",{id:"origin",ref:this.selectOrigin,defaultValue:"A"},h.a.createElement("option",{value:"A"},"Computador A"),h.a.createElement("option",{value:"B"},"Computador B"),h.a.createElement("option",{value:"C"},"Computador C")))),h.a.createElement("div",null,h.a.createElement("label",{htmlFor:"target_ip"},this.props.ipFetch?"MAC":"IP"," de Destino"),h.a.createElement("div",null,h.a.createElement("input",{type:"text",id:"target_ip",ref:this.txtTarget,onKeyDown:function(e){"Enter"===e.key&&t.run()},placeholder:this.props.ipFetch?"00-00-00-00-00-00":"0.0.0.1/0"}))),h.a.createElement("div",null,h.a.createElement("label",{htmlFor:"speed"},"Velocidade"),h.a.createElement("div",null,h.a.createElement("select",{name:"speed",id:"speed",ref:this.selectSpeed,defaultValue:"normal"},h.a.createElement("option",{value:"veryslow"},"Muito Lento"),h.a.createElement("option",{value:"slow"},"Lento"),h.a.createElement("option",{value:"normal"},"Normal"),h.a.createElement("option",{value:"fast"},"R\xe1pido"),h.a.createElement("option",{value:"veryfast"},"Muito R\xe1pido")),h.a.createElement("button",{onClick:this.run},"Visualizar")))),h.a.createElement(u.a,{errorMessage:this.state.errorMessage}),h.a.createElement(O,{ref:this.macCanvas,origin:this.state.origin,target:this.state.target,speed:this.state.speed,ipFetch:this.props.ipFetch}))}}]),e}(c.Component),O=(e.default=E,function(t){function e(t){var r;return Object(n.a)(this,e),(r=Object(a.a)(this,Object(s.a)(e).call(this,t))).flowCanvas=void 0,r.mSwitch={ip:void 0,mac:void 0,connections:[],isSwitch:!0,node:void 0},r.pcA={ip:new l.e("10.10.0.2/24"),mac:new g("00-00-00-AA-AA-AA"),connections:[r.mSwitch],isSwitch:!1,node:void 0},r.pcB={ip:new l.e("10.10.0.3/24"),mac:new g("00-00-00-BB-BB-BB"),connections:[r.mSwitch],isSwitch:!1,node:void 0},r.pcC={ip:new l.e("10.10.0.4/24"),mac:new g("00-00-00-CC-CC-CC"),connections:[r.mSwitch],isSwitch:!1,node:void 0},r.router={ip:new l.e("10.10.0.1/24"),mac:new g("00-00-00-F0-F0-F0"),connections:[r.mSwitch],isSwitch:!1,node:void 0},r.fixedLines=[],r.origins={A:r.pcA,B:r.pcB,C:r.pcC},r.run=function(){var t=y[r.props.speed],e=r.flowCanvas.current,n=r.router,i=r.props.ipFetch;e.stopLineAnimations();for(var a=e.getDrawables(),s=a.length;s--;)a[s]instanceof d.b&&r.fixedLines.indexOf(a[s])<0&&e.removeDrawable(a[s]);var o=r.props.target;!function r(a,s,c){c.push(s);for(var h=function(h){var d=s.connections[h];if(d!==a)var l=e.connectNodes(s.node,d.node,A,5,t,(i?"IP de ":"MAC de ")+o.toString()+"?",function(){e.removeDrawable(l),d.connections.length>1?r(s,d,c):d.isSwitch||(i?d.mac.compare(o):d.ip.compare(o)||d===n&&!d.ip.getNetworkAddress().compare(o.getNetworkAddress()))&&(c.push(d),function(r){for(var n=(i?r[r.length-1].ip:r[r.length-1].mac).toString(),a=[],s=r.length-1;s>=1;s--){var o=r[s];a.push({from:o.node,to:r[s-1].node,strokeStyle:S,lineWidth:5,speed:t,labelText:n})}e.connectMultipleNodes(a)}(c))})},d=0;d<s.connections.length;d++)h(d)}(void 0,r.origins[r.props.origin],[])},r.resetCanvas=function(){var t=r.flowCanvas.current,e=t.props.width,n=t.props.height,i=new d.c({x:100,y:50},60,60,{l:10,t:10,r:10,b:10},b,.5);r.router.node=new d.c({x:e/2,y:50},60,60,{l:10,t:10,r:10,b:10},w,.5),r.pcB.node=new d.c({x:e/2,y:n-90},60,60,{l:10,t:10,r:10,b:10},m,.5),r.mSwitch.node=new d.c({x:e/2,y:(r.pcB.node.pos.y+r.router.node.pos.y)/2},60,30,{l:10,t:10,r:10,b:10},k,.5),r.pcA.node=new d.c({x:100,y:(r.mSwitch.node.pos.y+r.pcB.node.pos.y)/2},60,60,{l:10,t:10,r:10,b:10},m,.5),r.pcC.node=new d.c({x:e-100,y:(r.mSwitch.node.pos.y+r.pcB.node.pos.y)/2},60,60,{l:10,t:10,r:10,b:10},m,.5);var a=new d.a({x:0,y:0},"Internet","#505050","transparent",6,0,"14px Work Sans, Montserrat, sans-serif",12);a.pos=t.getAlignedPoint(i,a,"bottom","center");var s=new d.a({x:0,y:0},"Computador A\n"+r.pcA.ip.toString()+"\n"+r.pcA.mac.toString(),"#505050","transparent",6,0,"14px Work Sans, Montserrat, sans-serif",12,"center"),o=new d.a({x:0,y:0},"Computador B\n"+r.pcB.ip.toString()+"\n"+r.pcB.mac.toString(),"#505050","transparent",6,0,"14px Work Sans, Montserrat, sans-serif",12,"center"),c=new d.a({x:0,y:0},"Computador C\n"+r.pcC.ip.toString()+"\n"+r.pcC.mac.toString(),"#505050","transparent",6,0,"14px Work Sans, Montserrat, sans-serif",12,"center"),h=new d.a({x:0,y:0},"Roteador\n"+r.router.ip.toString()+"\n"+r.router.mac.toString(),"#505050","transparent",6,0,"14px Work Sans, Montserrat, sans-serif",12);s.pos=t.getAlignedPoint(r.pcA.node,s,"bottom","center"),o.pos=t.getAlignedPoint(r.pcB.node,o,"bottom","center"),c.pos=t.getAlignedPoint(r.pcC.node,c,"bottom","center"),h.pos=t.getAlignedPoint(r.router.node,h,"center","right"),r.fixedLines=[new d.b(r.pcA.node,r.mSwitch.node,1,x,10),new d.b(r.pcB.node,r.mSwitch.node,1,x,10),new d.b(r.pcC.node,r.mSwitch.node,1,x,10),new d.b(r.router.node,r.mSwitch.node,1,x,10),new d.b(r.router.node,i,1,x,10)],t.clearDrawables(),t.addDrawable(r.pcA.node),t.addDrawable(r.pcB.node),t.addDrawable(r.pcC.node),t.addDrawable(r.mSwitch.node),t.addDrawable(r.router.node),t.addDrawable(i),t.addDrawable(s),t.addDrawable(o),t.addDrawable(c),t.addDrawable(h),t.addDrawable(a);for(var l=0;l<r.fixedLines.length;l++)t.addDrawable(r.fixedLines[l]);t.draw()},r.flowCanvas=h.a.createRef(),r.mSwitch.connections=[r.pcA,r.pcB,r.pcC,r.router],r}return Object(o.a)(e,t),Object(i.a)(e,[{key:"componentDidMount",value:function(){this.resetCanvas(),m.onload=this.flowCanvas.current.draw,w.onload=this.flowCanvas.current.draw,k.onload=this.flowCanvas.current.draw}},{key:"render",value:function(){return h.a.createElement(d.d,{ref:this.flowCanvas,width:750,height:560,fixedDeltaTime:1e3/60})}}]),e}(c.Component))}}]);
//# sourceMappingURL=6.7b6bfdca.chunk.js.map