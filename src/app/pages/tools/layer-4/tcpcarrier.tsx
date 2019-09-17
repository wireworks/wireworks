import React, { ChangeEvent, Component, FC } from "react";
import variables from "src/sass/pages/tcpcarrier.scss";
import "src/sass/pages/tcpcarrier.scss";
import anime, { AnimeAnimParams, AnimeInstance } from "animejs";


enum TcpFlags {
    none = 0,
    NS   = 1 << 0,
    CWR  = 1 << 1,
    ECE  = 1 << 2,
    URG  = 1 << 3,
    ACK  = 1 << 4,
    PSH  = 1 << 5,
    RST  = 1 << 6,
    SYN  = 1 << 7,
    FIN  = 1 << 8,
}

class TcpHeader {
    sequence: number;
    acknowledgment: number;
    flags: number;
    windowSize: number;
    data: string;
}


const TcpPacket: FC<{id: number}> = (props) =>

<div className="tcp-p-rail">
    <div className="tcp-p-slider">
        <div className="tcp-p-ball"></div>
    </div>
    <div className="tcp-p-ball tcp-p-hint tcp-left">{props.id}</div>
    <div className="tcp-p-ball tcp-p-hint tcp-right">{props.id}</div>
</div>


interface ITcpCarrier {
    progress: Array<number>
}

class TcpCarrier extends Component<{}, ITcpCarrier> {

    state = {
        progress: Array<number>(3).fill(2)
    };

    animation: AnimeInstance;

    addProgress = (index: number) => {
        let p = this.state.progress;
        p[index]--;
        this.setState({progress: p});
    }

    step = () => {

        let reverse = true;
        let ind = this.state.progress.findIndex((value) => value == 1);

        if (ind == -1) {
            ind = this.state.progress.findIndex((value) => value == 2);
            reverse = false;
        }
        
        if (ind != -1) {
            let el = document.getElementsByClassName("tcp-p-slider")[ind];
            anime({
                targets: el,
                translateX: ["0%", "100%"],
                duration: 2000,
                easing: "linear",
                direction: reverse ? "reverse" : "normal",

                complete: () => {
                    this.addProgress(ind);
                    let wind = document.getElementsByClassName("tcp-window-wrapper")[this.state.progress[ind]] as HTMLElement;
                    wind.style.transform = `translateY(${(ind+1) * 100}%)`;
                    this.step();
                }

            });
        }
    }

    start = () => {
        this.step();
        
    }

    //////////////////////////////////////////////////////////////////

    render() {


        let arr = Array(20);
        for (let i = 0; i < 20; i++) {
            arr[i] = <TcpPacket id={i}/>
        }

        return (
            <main id="tcp-carrier">

                {/* TCP animation */}
                <div className="tcp-cont-packet">

                    <div className="tcp-cont-window">
                        <div className="tcp-window-wrapper tcp-left">
                            <div className="tcp-window"></div>
                        </div>
                        <div className="tcp-window-wrapper tcp-right">
                            <div className="tcp-window"></div>
                        </div>
                        
                    </div>

                    {arr}
                </div>

                {/* Menu */}
                <div className="tcp-cont-menu">
                    <div>
                        <button onClick={this.start}>Start</button>
                        <button>Stop</button>
                    </div>
                </div>
                
            </main>
        );
    }

}

export default TcpCarrier;