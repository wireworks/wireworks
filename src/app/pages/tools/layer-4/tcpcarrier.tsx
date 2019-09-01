import React, { ChangeEvent, Component, FC } from "react";
import "src/sass/pages/tcpcarrier.scss";



const TcpPacket: FC<{progress: number}> = (props) =>

<div className="tcp-slider">
    <div className="tcp-packet tcp-p-hint tcp-p-left"></div>
    <div className="tcp-packet tcp-p-hint tcp-p-right"></div>
    <div className="tcp-slider tcp-25padding" style={{width: props.progress + "%"}}>
        <div className="tcp-packet tcp-p-real tcp-p-right"></div>
    </div>
</div>



class TcpCarrier extends Component<{}, {progress: number[], speed: number}> {

    constructor(props) {
        super(props);
        this.state = {
            speed: 1.1,
            progress: Array(10).fill(0)
        }
    }

    tick = () => {

        this.setState((state) => {

            let newProgress = state.progress;
            let index = newProgress.findIndex((val) => val < 100);

            if (index !== -1) {
                newProgress[index] += this.state.speed;

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

    changeSpeed = (newSpeed: ChangeEvent<HTMLInputElement>) => 
        this.setState({speed: parseFloat(newSpeed.target.value)})


    //////////////////////////////////////////////////////////////////

    render() {
        return (
            <main id="tcp-carrier">

                {/* TCP animation */}
                <div className="tcp-container">
                    <div>
                        <div className="tcp-window-slider tcp-p-left">
                            <div className="tcp-window"/>
                        </div>
                        {this.state.progress.map((val, key) => <TcpPacket key={key} progress={val}/>)}
                    </div>
                </div>

                {/* Menu */}
                <div>

                    <button onClick={this.tick}>Start</button>
                    <button onClick={this.reset}>Reset</button>

                    <input type="range" value={this.state.speed} min={0.1} max={2} step={0.1} onChange={this.changeSpeed}/>

                </div>
                
            </main>
        );
    }

}

export default TcpCarrier;