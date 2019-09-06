// ServerChat
// +=========================+
// Author: Henrique Colini
// Version: 1.0 (2019-09-06)

import React, { Component, RefObject } from "react";
import "src/sass/pages/serverchat.scss";

class ServerChat extends Component {

    render() {
        return(
            <main>
                <div className="hbox">
                    <ChatPanel name="Cliente"/>
                    <ChatPanel name="Servidor"/>
                </div>
            </main>
        );
    }

}

interface ChatPanelProps {
    className?: string,
    name: string
}

class ChatPanel extends Component<ChatPanelProps> {

    render() {
        return (
            <div className={"chat-panel " + (this.props.className? this.props.className : "")}>
                <header>
                    <div className="subtitle">Visão do</div>
                    <div className="name">{this.props.name}</div>
                </header>
                <div className="content">
                    aaa
                </div>
            </div>
        );
    }

}

export default ServerChat;