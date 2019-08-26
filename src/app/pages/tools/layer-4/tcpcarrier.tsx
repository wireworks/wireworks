import React, { Component, FC, ChangeEvent } from "react";
import "src/sass/pages/tcpcarrier.scss";



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

    tick = () => {
        this.setState((state) => {
            if (this.state.progress < 100)
                window.requestAnimationFrame(this.tick);

            if (this.state.progress > 100)
                return {progress: 100}

            return {progress: state.progress + this.speed}
        });
    }

    changeSpeed = (newSpeed: ChangeEvent<HTMLInputElement>) => this.speed = parseFloat(newSpeed.target.value);

    render() {
        return (
            <main id="tcp-carrier">

                {/* TCP animation */}
                <div className="tcp-container">
                    <TcpPacket progress={this.state.progress}></TcpPacket>
                    <TcpPacket progress={this.state.progress}></TcpPacket>
                </div>

                {/* Menu */}
                <div>

                    <button onClick={this.tick}>Start</button>
                    <button onClick={this.tick}>Stop</button>

                    <input type="range" min={0.1} max={2} step={0.1} onChange={this.changeSpeed}/>

                </div>
                
            </main>
        );
    }

}

export default TcpCarrier;