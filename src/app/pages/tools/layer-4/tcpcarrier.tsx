import React, { Component, FC } from "react";
import "src/sass/pages/tcpcarrier.scss";

class Computer {

}

class TcpHeader {

}

class Router {
    
}

/////////////////////////////////////

const TcpPacket: FC<{progress: number}> = (props) =>
<div className="tcp-slider" style={{width: props.progress + "%"}}>
    <div className="tcp-packet"></div>
</div>

class TcpCarrier extends Component<{}, {progress: number}> {

    speed = 1.5;

    constructor(props) {
        super(props);
        this.state = {
            progress: 0
        }
    }

    componentDidMount() {
        this.tick();
    }

    tick = () => {
        this.setState((state) => {
            if (this.state.progress < 100)
                window.requestAnimationFrame(this.tick);

            if (this.state.progress > 100)
                return {progress: 100}

            return {progress: state.progress + this.speed}
        });
    }

    render() {
        return (
            <div>

                {/* TCP animation */}
                <div className="tcp-container">
                    <TcpPacket progress={this.state.progress}></TcpPacket>
                    <TcpPacket progress={this.state.progress}></TcpPacket>
                </div>

                {/* Menu */}
                <div>
                </div>
                
            </div>
        );
    }

}

export default TcpCarrier;