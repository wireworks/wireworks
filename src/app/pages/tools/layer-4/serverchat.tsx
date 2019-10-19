// ServerChat
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-09-06)

import React, { Component, RefObject } from "react";
import "src/sass/pages/serverchat.scss";

type ChatMessage = { from: "server"|"client"; message: string };

type Flowchart = {
	flag: string,
	customLog?: {text: string, from?: "server"|"client"|"any"|"other"}[],
	message: string
	cases: Flowchart[],
	from: "server"|"client"|"any"
}

const DUMMY_DATA_FLAG = "@";
const rootCases: Flowchart[] = []
const connectedCases: Flowchart[] = [];

connectedCases.push(
	{
		from: "any",
		flag: DUMMY_DATA_FLAG,
		customLog: [
			{ from: "any", text: "ACK" },
			{ text: "..." },
			{ from: "other", text: "ACK" }
		],
		message: "Dados enviados! 📤",
		cases: connectedCases
	},
	{
		from: "any",
		flag: "RST",
		customLog: [
			{ from: "any", text: "RST" },
			{ text: "-- Conexão Encerrada --" }
		],
		message: "Algo não está certo na conexão. Teremos que recomeçar.",
		cases: rootCases
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
		currentChart: {
			flag: undefined,
			message: undefined,
			from: undefined,
			cases: rootCases
		} as Flowchart
	};

	public nextChart = (selected: Flowchart, from: "client"|"server") => {
		let history = this.state.history;
		let customLog = undefined;
		if (selected.customLog) {
			customLog = [];
			for (let i = 0; i < selected.customLog.length; i++) {
				const line = selected.customLog[i];
				customLog[i] = {
					text: line.text,
					from: line.from
				}
				if (line.from === "any") customLog[i].from = from;
				if (line.from === "other") customLog[i].from = from === "client" ? "server" : "client";
			}
		}
		history.push({
			flag: selected.flag,
			customLog: customLog,
			message: selected.message,
			from: from,
			cases: []
		});
		this.setState({ history: history, currentChart: selected });		
	}

	public reset = () => {
		this.setState({
			history: [],
			currentChart: {
				flag: undefined,
				message: undefined,
				from: undefined,
				cases: rootCases
			} as Flowchart
		});
	}

	render() {
		return (
			<main>
				<div className="hbox mb-3">
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
				<ConnectionLog history={this.state.history}/>
				<button onClick={this.reset} className="mt-3">Reiniciar simulação</button>
			</main>
		);
	}
}

interface ChatPanelProps {
	displayName: string;
	name: "client"|"server";
	history: Flowchart[];
	currentChart: Flowchart,
	nextChartEvent: (selected: Flowchart, from: "client"|"server") => void
}

class ChatPanel extends Component<ChatPanelProps> {

	private panelRef: RefObject<HTMLDivElement>;

	constructor(props) {
		super(props);
		this.panelRef = React.createRef();
	}

	componentDidUpdate() {	
		this.panelRef.current.scrollBy(0, this.panelRef.current.scrollHeight);
	}

	render() {

		let messages = [];

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
						{caseI.flag === DUMMY_DATA_FLAG ? "Enviar dados 📦" : caseI.flag }	
					</span>
				);
			}
		}

		return (
			<div className="chat-panel">
				<header>
					<div className="subtitle">Visão do</div>
					<div className="name">{this.props.displayName}</div>
				</header>
				<div className="content">
					<div className="messages" ref={this.panelRef} >{messages}</div>
					<div className="input">{options}</div>
				</div>
			</div>
		);
	}
}

interface ConnectionLogProps {
	history: Flowchart[];
}

class ConnectionLog extends Component<ConnectionLogProps> {

	private listRef: RefObject<HTMLUListElement>;

	componentDidUpdate() {
		this.listRef.current.scrollBy(0, this.listRef.current.scrollHeight);
	}

	constructor(props) {
		super(props);
		this.listRef = React.createRef();
	}

	render() {
		let lis = [];

		for (let i = 0; i < this.props.history.length; i++) {
			const msg = this.props.history[i];
			let lines = [] as {from?: "server"|"client"|"any"|"other", text: string}[];
			if (msg.customLog) {
				lines = msg.customLog;
			}
			else {
				lines = [{
					from: msg.from === "any" ? undefined : msg.from,
					text: msg.flag
				}];
			}
			for (let j = 0; j < lines.length; j++) {
				const line = lines[j];
				lis.push(
					<li key={"li_" + i + "_" + j}>
						{ line.from ? (line.from == "client" ? "Cliente -> Servidor " : "Servidor -> Cliente ") : ""}
						{ line.from ? "[" + line.text + "]" : line.text }
					</li>
				);
			}
		}

		return <div className="log-wrapper"><ul ref={this.listRef}>{lis}</ul></div>

	}

}

export default ServerChat;
