import React, { Component, FC, ChangeEvent } from "react";
import "src/sass/pages/tcpcarrier.scss";



const TcpPacket: FC<{progress: number}> = (props) =>
<div className="tcp-slider" style={{width: props.progress + "%"}}>
    <div className="tcp-packet"></div>
</div>



class TcpCarrier extends Component<{}, {progress: number[]}> {

    speed = 0.7;

    constructor(props) {
        super(props);
        this.state = {
            progress: [0, 0, 0, 0, 0]
        }
    }

    isComplete = () => this.state.progress.findIndex((val) => val < 100) === -1;

    tick = () => {

        this.setState((state) => {

            let newProgress = state.progress;
            let index = newProgress.findIndex((val) => val < 100);
            if (index !== -1) {
                newProgress[index] += this.speed;
                if(newProgress[index] > 100)
                    newProgress[index] = 100;
                window.requestAnimationFrame(this.tick);
            }

            return {progress: newProgress}
        });
    }

    reset = () => {
        let zero = this.state.progress.fill(0);
        this.setState({progress: zero});
    }

    changeSpeed = (newSpeed: ChangeEvent<HTMLInputElement>) => this.speed = parseFloat(newSpeed.target.value);

    render() {
        return (
            <main id="tcp-carrier">

                {/* TCP animation */}
                <div className="tcp-container">
                    {this.state.progress.map((val, key) => <TcpPacket key={key} progress={val}/>)}
                </div>

                {/* Menu */}
                <div>

                    <button onClick={this.tick}>Start</button>
                    <button onClick={this.reset}>Reset</button>

                    <input type="range" value={this.speed} min={0.1} max={2} step={0.1} onChange={this.changeSpeed}/>

                </div>
                
            </main>
        );
    }

}

export default TcpCarrier;