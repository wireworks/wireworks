import React, { ChangeEvent, Component, FC } from "react";
import variables from "src/sass/pages/tcpcarrier.scss";
import "src/sass/pages/tcpcarrier.scss";
import anime from "animejs";


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
    <div id={"packet-" + props.id} className="tcp-p-slider">
        <div className="tcp-p-ball"></div>
    </div>
    <div className="tcp-p-ball tcp-p-hint tcp-left"></div>
    <div className="tcp-p-ball tcp-p-hint tcp-right"></div>
</div>



class TcpCarrier extends Component<{}, {stream1: string,
stream2: string,
window1: number,
window2: number}> {

    state = {
        stream1: "abcdefghijklmnopqrstuvwxyz",
        stream2: "",
        window1: 0,
        window2: 0
    }

    start = () => {

        anime.set("#packet-0", {
            translateX: "0%"
        });

        let a = anime({
            targets: "#packet-0",
            translateX: "100%",
            easing: "linear",
            duration: 700,
            delay: 0,
            complete: () => {
                this.setState((st) => {return {window2: st.window2+1}});
            }
        });

    }

    //////////////////////////////////////////////////////////////////

    render() {


        let arr = Array(5);
        for (let i = 0; i < 5; i++) {
            arr[i] = <TcpPacket id={i}/>
        }

        return (
            <main id="tcp-carrier">

                {/* TCP animation */}
                <div className="tcp-cont-packet">

                    <div className="tcp-cont-window">
                        <div className="tcp-window-wrapper tcp-left" style={{transform: `translateY(${this.state.window1*100}%)`}}>
                            <div className="tcp-window"></div>
                        </div>
                        <div className="tcp-window-wrapper tcp-right" style={{transform: `translateY(${this.state.window2*100}%)`}}>
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