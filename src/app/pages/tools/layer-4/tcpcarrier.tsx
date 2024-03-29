import React, { Component, FC, RefObject } from "react";
import "src/sass/pages/tcpcarrier.scss";
import DataCarrier from "../../../components/DataCarrier";
import ErrorBox from "../../../components/ErrorBox";
import Timer from "../../../wireworks/utils/timer";

class TcpDelay {
	constructor(readonly delay: number) {}
	get resend () { return this.delay * 2.5 }
	get windowTick () { return this.delay * 0.1 }
	get travel () { return this.delay }
}

const delays = {
	slowmo: new TcpDelay(24),
	veryslow: new TcpDelay(12),
	slow: new TcpDelay(6),
	normal: new TcpDelay(3),
	fast: new TcpDelay(1.5),
	veryfast: new TcpDelay(0.75)
}

class TcpCarrier extends Component {

	private txtMessage: RefObject<HTMLInputElement>;
	private txtWindow: RefObject<HTMLInputElement>;
	private carrier: RefObject<DataCarrier>;

	private windowQueue = [];
	private windowTimer: Timer;
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
					this.timers = [];
					this.windowQueue = [];
					if (this.windowTimer) this.windowTimer.clear();
					this.windowTimer = undefined;
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
		let ball = c.send(
			"right",
			index, () => { c.removeMoving(index, ball) },
			() => { this.receiveData(index) },
			{
				title: c.contentAt(index),
				lines: [
					"Ack: " + 1,
					"Seq: " + (index+1)
				]
			}
		);

		if (!this.timers[index]) {
			this.timers[index] = new Timer(()=>{this.sendData(index)},this.state.selectedDelay.resend,true,this.state.paused);
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

		}, {
			title: c.contentAt(index),
			lines: [
				"Ack: " + (index+2),
				"Seq: " + 1
			]
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

		// if (!this.state.paused) this.windowTimer.paused = false;

		for (let i = 0; i < count; i++) {
			if (!this.sent[startFrom + i]) {
				this.windowQueue.push(startFrom + i);
				this.sent[startFrom + i] = true;
			}
		}
		
		this.windowPreTick();

	}

	private windowPreTick = () => {
		if (!this.windowTimer) {
			this.windowTimer = new Timer(this.windowTick, this.state.selectedDelay.windowTick, false, this.state.paused);
		}
	}

	private windowTick = () => {
				
		this.windowTimer.clear();
		this.windowTimer = undefined;

		if (this.windowQueue.length > 0) {
			this.sendData(this.windowQueue[0]);
			this.windowQueue.shift();
			this.windowPreTick();
		}	

	}

	private start = () => {
		const c = this.carrier.current;
		this.sendMultiple(c.lWindowSize, c.lWindow);
	}

	togglePaused = (pause: boolean, callback?: ()=>void) => {
		this.setState({paused: pause}, ()=>{
			
			if (this.windowTimer) this.windowTimer.paused = pause;

			for (let i = 0; i < this.timers.length; i++) {if (this.timers[i]) this.timers[i].paused = pause;}			
			this.carrier.current.running = !pause;

			if (callback) callback();
		});
	}

	componentDidMount() {
		
		this.carrier.current.delay = this.state.selectedDelay.travel;
		this.togglePaused(true);
		let pausedBefore = true;

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
		if (this.windowTimer) this.windowTimer.clear();
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
				<div className="hbox align-start">					
						
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
									<input className="mr-0" type="text" defaultValue="Wireworks" id="message" ref={this.txtMessage} onKeyDown={(ev) => { if (ev.key === "Enter") this.setup() }} placeholder="Sua mensagem" />
								</div>
							</div>
						</div>

						<div className="hbox align-end mb-3 full-width">
							<div className="full-width">
								<label htmlFor="window_size">Tamanho da Janela</label>
								<div>
									<input className="mr-0" type="number" min="1" defaultValue="4" id="window_size" ref={this.txtWindow} onKeyDown={(ev) => { if (ev.key === "Enter") this.setup() }} placeholder="1" />
								</div>
							</div>
						</div>

						<div className="hbox align-end mb-3 full-width">
							<div className="full-width">
								<label htmlFor="speed">Velocidade</label>
								<div>
									<select className="full-width" name="speed" id="speed" defaultValue="normal" onChange={(evt)=>{
										let delay = delays[evt.target.value] as TcpDelay;
										this.setState({selectedDelay: delay});
										this.carrier.current.delay = delay.travel;
										for (let i = 0; i < this.timers.length; i++) if (this.timers[i]) this.timers[i].delay = delay.resend;
										if (this.windowTimer) this.windowTimer.delay = delay.windowTick;
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
							this.state.selectedDelay.delay <= delays.fast.delay ? 
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