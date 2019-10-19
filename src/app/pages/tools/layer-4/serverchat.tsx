// ServerChat
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-09-06)

import React, { Component, RefObject } from "react";
import "src/sass/pages/serverchat.scss";

type ChatMessage = { from: "server"|"client"; message: string };

type Flowchart = {
	flag: string,
	customLog?: {text: string, from?: "server"|"client"}[],
	message: string
	cases: Flowchart[],
	from: "server"|"client"|"any"
}

const DUMMY_DATA_FLAG = "@";
const rootCases: Flowchart[] = []
const connectedCases: Flowchart[] = [];

connectedCases.push(
	{
		from: "server",
		flag: DUMMY_DATA_FLAG,
		customLog: [
			{ from: "server", text: "ACK" },
			{ from: "client", text: "ACK" },
			{ text: "..." },
			{ from: "client", text: "ACK" }
		],
		message: "Enviando dados... 📤",
		cases: connectedCases
	},
	{
		from: "client",
		flag: DUMMY_DATA_FLAG,
		customLog: [
			{ from: "client", text: "ACK" },
			{ from: "server", text: "ACK" },
			{ text: "..." },
			{ from: "server", text: "ACK" }
		],
		message: "Enviando dados... 📤",
		cases: connectedCases
	},
	{
		from: "server",
		flag: "FIN ACK",
		message: "Ok, acho que terminamos por aqui.",
		cases: [
			{
				from: "client",
				flag: "ACK",
				message: "Entendido.",
				cases: [
					{
						from: "client",
						flag: "FIN ACK",
						message: "Tchau, servidor.",
						cases: [
							{
								from: "server",
								flag: "ACK",
								message: "Tchau, cliente.",
								customLog: [
									{ from: "client", text: "ACK" },
									{ text: "-- Conexão Encerrada --" }
								],
								cases: rootCases
							}
						]
					}
				]
			}
		]
	},
	{
		from: "client",
		flag: "FIN ACK",
		message: "Ok, acho que terminamos por aqui.",
		cases: [
			{
				from: "server",
				flag: "ACK",
				message: "Entendido.",
				cases: [
					{
						from: "server",
						flag: "FIN ACK",
						message: "Tchau, cliente.",
						cases: [
							{
								from: "client",
								flag: "ACK",
								message: "Tchau, servidor.",
								customLog: [
									{ from: "server", text: "ACK" },
									{ text: "-- Conexão Encerrada --" }
								],
								cases: rootCases
							}
						]
					}
				]
			}
		]
	}
);

rootCases.push(
	{
		from: "client",
		flag: "SYN",
		message: "Olá servidor! Podemos começar uma conexão?",
		cases: [
			{
				from: "server",
				flag: "SYN ACK",
				message: "Podemos sim!",
				cases: [
					{
						from: "client",
						flag: "ACK",
						customLog: [
							{ from: "client", text: "ACK" },
							{ text: "-- Conexão Estabelecida --" }
						],
						message: "Entendi, conexão estabelecida.",
						cases: connectedCases
					},
					{
						from: "client",
						flag: "RST",
						message: "Opa, deu algo errado por aqui. Vou tentar do início.",
						cases: rootCases
					}
				]
			},
			{
				from: "server",
				flag: "RST",
				message: "Calma, alguma coisa deu errada. Tente novamente.",
				cases: rootCases
			}
		]
	},
	{
		from: "client",
		flag: "ACK",
		message: "Olá servidor! Conexão estabelecida!",
		cases: [
			{
				from: "server",
				flag: "RST",
				message: "O quê? Não, isso está errado. Recomece.",
				cases: rootCases
			}
		]
	}
)

class ServerChat extends Component {
	
	state = {
		history: [] as Flowchart[],
		flagHistory: [] as string[],
		currentChart: {
			flag: undefined,
			message: undefined,
			from: undefined,
			cases: rootCases
		} as Flowchart
	};

	public nextChart = (selected: Flowchart, from: "client"|"server") => {
		let history = this.state.history;
		history.push({
			flag: selected.flag,
			customLog: selected.customLog,
			message: selected.message,
			from: from,
			cases: []
		});
		this.setState({ history: history, currentChart: selected });		
	}

	render() {
		return (
			<main>
				<div className="hbox">
					<ChatPanel
						displayName="Cliente"
						name="client"
						history={this.state.history}
						currentChart={this.state.currentChart}
						nextChartEvent={this.nextChart}
					/>
					<ChatPanel
						displayName="Servidor"
						name="server"
						history={this.state.history}
						currentChart={this.state.currentChart}
						nextChartEvent={this.nextChart}
					/>
				</div>
			</main>
		);
	}
}

interface ChatPanelProps {
	className?: string;
	displayName: string;
	name: "client"|"server";
	history: Flowchart[];
	currentChart: Flowchart,
	nextChartEvent: (selected: Flowchart, from: "client"|"server") => void
}

class ChatPanel extends Component<ChatPanelProps> {

	private bottomRef: RefObject<HTMLDivElement>;

	constructor(props) {
		super(props);
		this.bottomRef = React.createRef();
	}

	componentDidUpdate() {	
		this.bottomRef.current.scrollBy(0, this.bottomRef.current.clientHeight);
	}

	render() {

		let messages = [];
		let last = "";

		for (let i = 0; i < this.props.history.length; i++) {
			const msg = this.props.history[i];
			messages[i] = (
				<div key={"msg_"+this.props.name+"_"+i} className={"message-wrapper " + ((msg.from === this.props.name) ? "self" : "other")}>
					<div className="message">{msg.message}</div>
				</div>
			);
		}

		let options = [];

		for (let i = 0; i < this.props.currentChart.cases.length; i++) {
			const caseI = this.props.currentChart.cases[i];
			if (caseI.from === this.props.name || caseI.from === "any") {
				options[i] = (
					<span key={"caseI_"+this.props.name+"_"+i} className="flag" onClick={
						() => {
							this.props.nextChartEvent(caseI, this.props.name);
						}
					}>
						{ caseI.flag === DUMMY_DATA_FLAG ? "Enviar dados" : caseI.flag }	
					</span>
				);
			}
		}

		return (
			<div className={ "chat-panel " + (this.props.className ? this.props.className : "") }>
				<header>
					<div className="subtitle">Visão do</div>
					<div className="name">{this.props.displayName}</div>
				</header>
				<div className="content">
					<div className="messages" ref={this.bottomRef} >{messages}</div>
					<div className="input">{options}</div>
				</div>
			</div>
		);
	}
}

export default ServerChat;
