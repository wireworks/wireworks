// ServerChat
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-09-06)

import React, { Component, RefObject } from "react";
import "src/sass/pages/serverchat.scss";

type ChatMessage = {from: string, message: string};

class ServerChat extends Component {

    state = {
        chat: [] as ChatMessage[]
    }

    componentDidMount () {
        this.setState({chat: [
            {from: "client", message: "Olá servidor! Podemos começar uma conexão?"},
            {from: "server", message: "Claro, cliente! Vamos começar?"},
            {from: "client", message: "Tudo bem, conexão iniciada..."}
        ]});
    }

    render() {
        return(
            <main>
                <div className="hbox">
                    <ChatPanel displayName="Cliente" name="client" chat={this.state.chat}/>
                    <ChatPanel displayName="Servidor" name="server" chat={this.state.chat}/>
                </div>
            </main>
        );
    }

}

interface ChatPanelProps {
    className?: string,
    displayName: string,
    name: string,
    chat: ChatMessage[];
}

class ChatPanel extends Component<ChatPanelProps> {

    render() {

        let messages = [];

        for (let i=0; i<this.props.chat.length; i++) {

            const msg = this.props.chat[i];
            messages[i] = <div className={msg.from === this.props.name? "self" : "other"}>{ msg.message }</div>

        }

        return (
            <div className={"chat-panel " + (this.props.className? this.props.className : "")}>
                <header>
                    <div className="subtitle">Visão do</div>
                    <div className="name">{this.props.displayName}</div>
                </header>
                <div className="content">
                    <div className="messages">
                        {messages}
                    </div>
                </div>
            </div>
        );
    }

}

export default ServerChat;