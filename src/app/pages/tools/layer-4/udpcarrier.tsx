import React, { Component, FC, RefObject } from "react";
import "src/sass/pages/tcpcarrier.scss";
import DataCarrier from "../../../components/DataCarrier";
import ErrorBox from "../../../components/ErrorBox";
import Timer from "../../../wireworks/utils/timer";
import { shuffle } from "../../../wireworks/utils/array";

class UdpDelay {
	constructor(readonly delay: number) {}
	get windowTick () { return this.delay * 0.1 }
	get travel () { return this.delay }
}

const delays = {
	slowmo: new UdpDelay(24),
	veryslow: new UdpDelay(12),
	slow: new UdpDelay(6),
	normal: new UdpDelay(3),
	fast: new UdpDelay(1.5),
	veryfast: new UdpDelay(0.75)
}

class UdpCarrier extends Component {

	private txtMessage: RefObject<HTMLInputElement>;
	private carrier: RefObject<DataCarrier>;

	private windowQueue = [];
	private windowTimer: Timer;
	
	state = {
		errorMessage: null as string,
		paused: true,
		selectedDelay: delays.normal
	}

	private setup = (str?: string) => {
		this.setState({ errorMessage: null });
		const c = this.carrier.current;
		if (!str) {
			str = this.txtMessage.current.value.trim();
		}
		if (str.length > 0) {
			let okFun = () => {
				this.windowQueue = [];
				if (this.windowTimer) this.windowTimer.clear();
				this.windowTimer = undefined;
				let randomizedStr = "";
				shuffle(str.split("")).forEach((char)=>{randomizedStr+=char});
				c.reset(randomizedStr, this.start);
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
			this.setState({ errorMessage: "Entrada Inválida. A sua mensagem deve possuir mais de 0 caracteres." });
		}
	}

	private receiveData = (recI: number) => {
		
		const c = this.carrier.current;
		c.setPkgState("right", recI, "ok");

	}

	private sendData = (index: number) => {

		const c = this.carrier.current;
		
		c.setPkgState("left", index, "ok");

		let ball = c.send(
			"right",
			index, () => { c.removeMoving(index, ball) },
			() => { this.receiveData(index) }
		);



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
		for (let i = 0; i < c.length; i++) this.windowQueue.push(i);
		shuffle(this.windowQueue);
		this.windowPreTick();
	}

	togglePaused = (pause: boolean, callback?: ()=>void) => {
		this.setState({paused: pause}, ()=>{
			
			if (this.windowTimer) this.windowTimer.paused = pause;	
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

		this.setup(Math.random() > 0.0001 ? "Wireworks" : "Machinna");
	}

	componentWillUnmount() {
		if (this.windowTimer) this.windowTimer.clear();
	}

	constructor(props) {
		super(props);
		this.carrier = React.createRef();
		this.txtMessage = React.createRef();
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
								<label htmlFor="speed">Velocidade</label>
								<div>
									<select className="full-width" name="speed" id="speed" defaultValue="normal" onChange={(evt)=>{
										let delay = delays[evt.target.value] as UdpDelay;
										this.setState({selectedDelay: delay});
										this.carrier.current.delay = delay.travel;
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

export default UdpCarrier;