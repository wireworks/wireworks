import React, { Component, FC, RefObject } from "react";
import "src/sass/pages/tcpcarrier.scss";
import DataCarrier from "../../../components/DataCarrier";
import ErrorBox from "../../../components/ErrorBox";

class TcpCarrier extends Component {

	private txtMessage: RefObject<HTMLInputElement>;
	private txtWindow: RefObject<HTMLInputElement>;
	private carrier: RefObject<DataCarrier>;

	state = {
		errorMessage: null as string
	}

	private start = (str?: string, windowSize?: number) => {
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
				c.reset(str);
				let i = 0;
				let timer = setInterval(()=>{
					c.setState({lWindow: i, lWindowSize: Math.min(windowSize, c.length-i)});
					c.send("right", i);
					i++;
					if (i >= c.length) clearInterval(timer);
				},500);

			}
			else {
				this.setState({errorMessage: "Entrada Inválida. A sua janela deve ser maior que 0."});
			}
		}
		else {
			this.setState({errorMessage: "Entrada Inválida. A sua mensagem deve possuir mais de 0 caracteres."});
		}
	}

	constructor(props) {
		super(props);
		this.carrier = React.createRef();
		this.txtMessage = React.createRef();
		this.txtWindow = React.createRef();
	}

	componentDidMount() {
		this.start(Math.random() > 0.0001 ? "Wireworks" : "Machinna", 4);
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
									<input className="mr-0" type="text" id="message" ref={this.txtMessage} onKeyDown={(ev) => { if (ev.key === "Enter") this.start() }} placeholder="Sua mensagem" />
								</div>
							</div>
						</div>

						<div className="hbox align-end mb-3">
							<div>
								<label htmlFor="window_size">Tamanho da Janela</label>
								<div>
									<input className="mr-0" type="number" min="1" id="window_size" ref={this.txtWindow} onKeyDown={(ev) => { if (ev.key === "Enter") this.start() }} placeholder="1" />
								</div>
							</div>
						</div>

						<div className="hbox fill">
							<button onClick={() => { this.start() }}>Iniciar</button>
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