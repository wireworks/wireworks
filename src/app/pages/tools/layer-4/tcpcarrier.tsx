import React, { Component, FC, RefObject } from "react";
import "src/sass/pages/tcpcarrier.scss";
import DataCarrier from "../../../components/DataCarrier";
import ErrorBox from "../../../components/ErrorBox";

class TcpCarrier extends Component {

	private txtMessage: RefObject<HTMLInputElement>;
	private txtWindow: RefObject<HTMLInputElement>;
	private carrier: RefObject<DataCarrier>;

	private sender = [] as boolean[];
	private receiver = [] as boolean[];

	state = {
		errorMessage: null as string
	}

	private setup = (str?: string, windowSize?: number) => {
		this.setState({errorMessage: null});
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
				c.setState({lWindowSize: windowSize, rWindowSize: windowSize});
				this.sender = new Array<boolean>(str.length).fill(false);
				this.receiver = new Array<boolean>(str.length).fill(false);
				c.reset(str, this.start);
			}
			else {
				this.setState({errorMessage: "Entrada Inválida. A sua janela deve ser maior que 0."});
			}
		}
		else {
			this.setState({errorMessage: "Entrada Inválida. A sua mensagem deve possuir mais de 0 caracteres."});
		}
	}

	private sendWindow = function* () {
		const c = this.carrier.current;
		for (let i = 0; i < c.lWindowSize; i++) {
			c.send("right", c.lWindow + i, undefined, undefined);
			yield;
		}
	}

	private start = () => {
		let c = this.carrier.current;
		let iter = this.sendWindow();
		let cont = () => {
			setTimeout(()=>{
				let res = iter.next();
				if (!res.done) {
					cont();
				}
			},300);
		};
		cont();
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

				<ErrorBox className="mt-3" errorMessage={this.state.errorMessage}/>

			</main>
		);
	}

}

export default TcpCarrier;