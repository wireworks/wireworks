import React, { Component, FC, RefObject } from "react";
import "src/sass/pages/tcpcarrier.scss";
import DataCarrier from "../../../components/DataCarrier";
import ErrorBox from "../../../components/ErrorBox";

const delays = {
	slowmo: 30,
	veryslow: 15,
	slow: 10,
	normal: 5,
	fast: 2,
	veryfast: 1
}

class Timer {

	private _paused = false;
	private t: NodeJS.Timeout;
	private loop = false;
	private _delay: number;
	private callback: ()=>void;
	private t0 = 0;
	private totalElapsed = 0;
	private finished = false;

	constructor(callback: ()=>void, delay: number, loop = false, startPaused = false) {
		this.loop = loop;
		this._delay = delay;
		this.callback = callback;

		this.totalElapsed = 0;
		this.mark();
		this.tick();		

		if (startPaused) this.paused = true;
	}

	private tick = (prerun = 0) => {
		if (!this.finished) {
			
			this.t = setTimeout(() => {
				
				if (!this._paused) {					
					this.mark();
					this.totalElapsed = 0;
					this.callback();
					if (this.loop) this.tick();
					else this.finished = true;
				}
	
			}, (1000*this._delay) - prerun);
		}
	}

	private mark = () => { 
		let t1 = performance.now();
		let elapsed = t1 - this.t0;
		this.t0 = t1;
		return elapsed;
	}

	set paused(pause: boolean) {	
				
		if (pause != this._paused) {

			if (pause) {
				this.clear();
				this.totalElapsed += this.mark();
			}
			else if (!this.finished) {
	
				this.mark();
				this.tick(this.totalElapsed);			
	
			}

		}

		this._paused = pause;

	}

	get paused() {
		return this._paused;
	}

	set delay(del: number) {
		let ratio = del / this._delay;
		if (!this.paused){
			this.paused = true;
			this.totalElapsed *= ratio;
			this._delay = del;
			this.paused = false;
		}
		else {
			this.totalElapsed *= ratio;
			this._delay = del;
		}
	}

	clear = () => {
		clearTimeout(this.t);
		this.t = undefined;
	}
}

class TcpCarrier extends Component {

	private txtMessage: RefObject<HTMLInputElement>;
	private txtWindow: RefObject<HTMLInputElement>;
	private carrier: RefObject<DataCarrier>;

	private extraTimers = [] as Timer[];
	private timers = [] as Timer[];
	private sent = [] as boolean[];
	private confirmed = [] as boolean[];
	private receiver = [] as boolean[];
	
	state = {
		errorMessage: null as string,
		paused: true,
		selectedDelay: delays.normal
	}

	private setup = (str?: string, windowSize?: number) => {
		this.setState({ errorMessage: null });
		const c = this.carrier.current;
		if (windowSize === undefined) {
			windowSize = parseInt(this.txtWindow.current.value.trim());
			if (!str) {
				str = this.txtMessage.current.value.trim();
				windowSize = Math.min(windowSize, str.length);
				this.txtWindow.current.value = "" + windowSize;
			}
		}
		if (!str) {
			str = this.txtMessage.current.value.trim();
		}
		if (str.length > 0) {
			if (windowSize >= 1) {
				let okFun = () => {
					c.setState({ lWindowSize: windowSize, rWindowSize: windowSize, lWindow: 0, rWindow: 0 });
					for (let i = 0; i < this.timers.length; i++) { if (this.timers[i]) this.timers[i].clear(); }
					for (let i = 0; i < this.extraTimers.length; i++) { if (this.extraTimers[i]) this.extraTimers[i].clear(); }
					this.timers = [];
					this.extraTimers = [];
					this.sent = new Array<boolean>(str.length).fill(false);
					this.confirmed = new Array<boolean>(str.length).fill(false);
					this.receiver = new Array<boolean>(str.length).fill(false);
					c.reset(str, this.start);
				}
				if (str.length > 50) {
					this.togglePaused(true,()=>{
						let goodToGo = window.confirm("Esta mensagem é muito grande e provavelmente irá travar o seu computador.\nTem CERTEZA que quer simular mesmo assim?");
						if (goodToGo) okFun();
					});					
				}
				else {
					okFun();
				}
			}
			else {
				this.setState({ errorMessage: "Entrada Inválida. A sua janela deve ser maior que 0." });
			}
		}
		else {
			this.setState({ errorMessage: "Entrada Inválida. A sua mensagem deve possuir mais de 0 caracteres." });
		}
	}

	private receiveData = (recI: number) => {
		
		const c = this.carrier.current;

		this.receiver[recI] = true;
		c.setPkgState("right", recI, "ok");

		for (let i = 0; i < this.receiver.length + 1; i++) {
			if (!this.receiver[i]) {
				if (i !== 0) {
					let newWinSize = Math.max(Math.min(c.rWindowSize, c.length - (i)),1);
					c.changeWindow("right", Math.min(i,c.length-1), newWinSize);
					this.confirmData(i-1);
				}
				break;
			}
		}
	}

	private sendData = (index: number) => {

		const c = this.carrier.current;

		this.sent[index] = true;
		let ball = c.send("right", index, () => { c.removeMoving(index, ball) }, () => { this.receiveData(index) });

		if (!this.timers[index]) {
			this.timers[index] = new Timer(()=>{this.sendData(index)},this.state.selectedDelay,true,this.state.paused);
		}

	}

	private confirmData = (index: number) => {

		const c = this.carrier.current;

		let ball = c.send("left", index, () => { c.removeMoving(index, ball) }, () => {

			if (!this.confirmed[index]) {
				this.markConfirmed(index);

				if (index < c.length) {
					let newWin = index + 1;
					let newWinSize = Math.min(c.lWindowSize, c.length - (index + 1));

					for (let i = 0; i < newWin; i++) {
						this.markConfirmed(i);
					}

					if (newWin < c.length) {
						c.changeWindow("left", newWin, newWinSize);
					}
					else {
						c.changeWindow("left", c.length - 1, 1);
					}

					this.sendMultiple(newWinSize, newWin);

				}
			}

		});

	}

	private markConfirmed = (index: number) => {

		this.confirmed[index] = true;
		this.sent[index] = true;

		this.carrier.current.setPkgState("left", (index), "ok");

		if (this.timers[index]) {
			this.timers[index].clear();
			this.timers[index] = undefined;
		}

	}

	private sendMultiple = (count: number, startFrom: number) => {

		console.log("Someone called me. " + count + " balls from " + startFrom);
		
		let tcp = this;
		let willSend = [] as number[];

		for (let i = 0; i < count; i++) {
			if (!this.sent[startFrom + i]) {
				willSend.push(startFrom + i);
				this.sent[startFrom + i] = true;
			}
		}		

		const iterator = function* () {			
			for (let i = 0; i < willSend.length; i++) {
				tcp.sendData(willSend[i]);
				yield;
			}
		}();
		
		const nextBall = () => {
			let extra = new Timer(() => {
				let res = iterator.next();
				if (!res.done) {
					nextBall();
				}
				this.extraTimers.splice(this.extraTimers.indexOf(extra), 1);
			}, 0.04 * this.state.selectedDelay, false, this.state.paused);
			this.extraTimers.push(extra);
		};

		nextBall();
	}

	private start = () => {
		const c = this.carrier.current;
		this.sendMultiple(c.lWindowSize, c.lWindow);
	}

	togglePaused = (pause: boolean, callback?: ()=>void) => {
		this.setState({paused: pause}, ()=>{
			
			for (let i = 0; i < this.timers.length; i++) {if (this.timers[i]) this.timers[i].paused = pause;}
			for (let i = 0; i < this.extraTimers.length; i++) {if (this.extraTimers[i]) this.extraTimers[i].paused = pause;}
			
			this.carrier.current.running = !pause;
			if (callback) callback();
		});
	}

	componentDidMount() {
		
		this.carrier.current.delay = this.state.selectedDelay / 2.5;
		this.togglePaused(true);
		let pausedBefore = false;

		window.onfocus = ()=> {
			if (!pausedBefore) this.togglePaused(false);
		};

		window.onblur = ()=>{
			pausedBefore = this.state.paused;
			this.togglePaused(true);
		};

		this.setup(Math.random() > 0.0001 ? "Wireworks" : "Machinna", 4);
	}

	componentWillUnmount() {
		for (let i = 0; i < this.timers.length; i++) if (this.timers[i]) this.timers[i].clear();
		for (let i = 0; i < this.extraTimers.length; i++) if (this.extraTimers[i]) this.extraTimers[i].clear();
	}

	constructor(props) {
		super(props);
		this.carrier = React.createRef();
		this.txtMessage = React.createRef();
		this.txtWindow = React.createRef();
	}

	render() {
		return (
			<main>
				<div className="hbox">					
						
					<div className="carrier-wrapper">
						<div className="spacer px-1">
							<label>Enviador</label>
							<label>Receptor</label>
						</div>
						<DataCarrier ref={this.carrier} />
					</div>

					<div className="tcp-settings">

						<div className="hbox align-end mb-3 full-width">
							<div className="full-width">
								<label htmlFor="message">Mensagem</label>
								<div>
									<input className="mr-0" type="text" id="message" ref={this.txtMessage} onKeyDown={(ev) => { if (ev.key === "Enter") this.setup() }} placeholder="Sua mensagem" />
								</div>
							</div>
						</div>

						<div className="hbox align-end mb-3 full-width">
							<div className="full-width">
								<label htmlFor="window_size">Tamanho da Janela</label>
								<div>
									<input className="mr-0" type="number" min="1" id="window_size" ref={this.txtWindow} onKeyDown={(ev) => { if (ev.key === "Enter") this.setup() }} placeholder="1" />
								</div>
							</div>
						</div>

						<div className="hbox align-end mb-3 full-width">
							<div className="full-width">
								<label htmlFor="speed">Velocidade</label>
								<div>
									<select className="full-width" name="speed" id="speed" defaultValue="normal" onChange={(evt)=>{
										let delay = delays[evt.target.value];
										this.setState({selectedDelay: delay});
										this.carrier.current.delay = delay / 2.5;
										for (let i = 0; i < this.timers.length; i++) if (this.timers[i]) this.timers[i].delay = delay;
										for (let i = 0; i < this.extraTimers.length; i++) if (this.extraTimers[i]) this.extraTimers[i].delay = delay * 0.04;
									}}>
										<option value="slowmo">Muito, muito lento</option>
										<option value="veryslow">Muito lento</option>
										<option value="slow">Lento</option>
										<option value="normal">Normal</option>
										<option value="fast">Rápido</option>
										<option value="veryfast">Muito rápido</option>
									</select>
								</div>
							</div>
						</div>

						<button className="full-width mb-3" onClick={() => { this.setup() }}>
							<i className="material-icons">replay</i> Reiniciar
						</button>

						<button className="full-width mb-3" onClick={()=>{
							this.togglePaused(!this.state.paused);
						}}>
							{
								this.state.paused ?
									<><i className="material-icons">play_arrow</i> Continuar</>:
									<><i className="material-icons">pause</i> Pausar</>
							}
						</button>

						{
							this.state.selectedDelay <= delays.fast ? 
								<p>* Velocidades altas são instáveis e podem quebrar a simulação.</p> : ""
						}

					</div>
				</div>

				<ErrorBox className="mt-3" errorMessage={this.state.errorMessage} />

			</main>
		);
	}

}

export default TcpCarrier;