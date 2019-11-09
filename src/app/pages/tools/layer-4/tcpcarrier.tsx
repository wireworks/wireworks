import React, { Component, FC, RefObject } from "react";
import "src/sass/pages/tcpcarrier.scss";
import DataCarrier from "../../../components/DataCarrier";
import ErrorBox from "../../../components/ErrorBox";

class TcpCarrier extends Component {

	private txtMessage: RefObject<HTMLInputElement>;
	private txtWindow: RefObject<HTMLInputElement>;
	private carrier: RefObject<DataCarrier>;

	private ogWinSize = 1;
	private timers = [] as NodeJS.Timeout[];
	private sent = [] as boolean[];
	private confirmed = [] as boolean[];
	private receiver = [] as boolean[];

	state = {
		errorMessage: null as string
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
				c.setState({ lWindowSize: windowSize, rWindowSize: windowSize, lWindow: 0, rWindow: 0 });
				for (let i = 0; i < this.timers.length; i++) clearTimeout(this.timers[i]);
				this.timers = [];
				this.sent = new Array<boolean>(str.length).fill(false);
				this.confirmed = new Array<boolean>(str.length).fill(false);
				this.receiver = new Array<boolean>(str.length).fill(false);
				this.ogWinSize = windowSize;
				c.reset(str, this.start);
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
			this.timers[index] = setInterval(()=>{this.sendData(index)},8000);
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
			clearInterval(this.timers[index]);
			this.timers[index] = undefined;
		}

	}

	private sendMultiple = (count: number, startFrom: number) => {

		let tcp = this;

		const iterator = function* () {			
			for (let i = 0; i < count; i++) {
				if (!tcp.sent[startFrom + i]) {
					tcp.sendData(startFrom + i);
					yield;
				}
			}
		}();
		
		const nextBall = () => {
			setTimeout(() => {
				let res = iterator.next();
				if (!res.done) {
					nextBall();
				}
			}, 300);
		};

		nextBall();
	}

	private start = () => {
		const c = this.carrier.current;
		this.sendMultiple(c.lWindowSize, c.lWindow);
	}

	constructor(props) {
		super(props);
		this.carrier = React.createRef();
		this.txtMessage = React.createRef();
		this.txtWindow = React.createRef();
	}

	componentDidMount() {
		this.setup(Math.random() > 0.0001 ? "Wireworks" : "Machinna", 4);
	}

	render() {
		return (
			<main>
				<div className="hbox">
					<DataCarrier ref={this.carrier} />

					<div className="ml-3">

						<div className="hbox align-end mb-3">
							<div>
								<label htmlFor="message">Mensagem</label>
								<div>
									<input className="mr-0" type="text" id="message" ref={this.txtMessage} onKeyDown={(ev) => { if (ev.key === "Enter") this.setup() }} placeholder="Sua mensagem" />
								</div>
							</div>
						</div>

						<div className="hbox align-end mb-3">
							<div>
								<label htmlFor="window_size">Tamanho da Janela</label>
								<div>
									<input className="mr-0" type="number" min="1" id="window_size" ref={this.txtWindow} onKeyDown={(ev) => { if (ev.key === "Enter") this.setup() }} placeholder="1" />
								</div>
							</div>
						</div>

						<div className="hbox fill">
							<button onClick={() => { this.setup() }}>Iniciar</button>
							<button className="ml-2">Parar</button>
						</div>

					</div>
				</div>

				<ErrorBox className="mt-3" errorMessage={this.state.errorMessage} />

			</main>
		);
	}

}

export default TcpCarrier;