// ServerChat
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-09-06)

import React, { Component, RefObject } from "react";
import "src/sass/pages/serverchat.scss";

type ChatMessage = { from: "server"|"client"; message: string };

type Flowchart = {
	flag: string,
	message: string
	cases: Flowchart[],
	from: "server"|"client"|"any"
}

const rootCases: Flowchart[] = []

rootCases.push(
	{
		from: "client",
		flag: "SYN",
		message: "Olá servidor! Podemos começar uma conexão?",
		cases: [
			{
				from: "server",
				flag: "SYN ACK",
				message: "Podemos sim. Vamos começar?",
				cases: [
					{
						from: "client",
						flag: "ACK",
						message: "Ok, conexão estabelecida.",
						cases: []
					}
				]
			},
			{
				from: "server",
				flag: "RST",
				message: "Calma lá, volte do início.",
				cases: rootCases
			}
		]
	},
	{
		from: "client",
		flag: "RST",
		message: "Vamos recomeçar.",
		cases: rootCases
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
		history.push(selected);
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

		for (let i = 0; i < this.props.history.length; i++) {
			const msg = this.props.history[i];
			messages[i] = (
				<div key={"msg_"+this.props.name+"_"+i} className={"message-wrapper " + ((msg.from === this.props.name || msg.from === "any") ? "self" : "other")}>
					<div className="message">{msg.message}</div>
				</div>
			);
		}

		let options = [];

		for (let i = 0; i < this.props.currentChart.cases.length; i++) {
			const caseI = this.props.currentChart.cases[i];
			if (caseI.from === this.props.name || caseI.from === "any") {
				options[i] = (
					<span key={"caseI_"+this.props.name+"_"+i} style={{background: "yellow", margin: "5px"}} onClick={
						() => {
							this.props.nextChartEvent(caseI, this.props.name);
						}
					}>
						{ caseI.flag }	
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
