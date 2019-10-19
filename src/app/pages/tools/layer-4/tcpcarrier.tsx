import React, { Component, FC } from "react";
import "src/sass/pages/tcpcarrier.scss";
import { ballSize, marginSize } from "src/sass/pages/tcpcarrier.scss";


interface Pkg {
    content: string
    lState: "ok" | "waiting"| "blank",
    rState: "ok" | "waiting" | "blank",
    progress: Array<{
        onClick?: () => void,
        onArrive?: () => void,
        toSide: "left"|"right",
        prog: number
    }>
}

const TcpPacket: FC<Pkg> = (props) =>

<div className="tcp-p-rail">
    {props.progress.map((el, ind) => {
        return (
            <div key={ind} className="tcp-p-slider" style={{transform: `translateX(${el.toSide === "left" ? 100 - el.prog : el.prog}%)`}}>
                <div className="tcp-p-ball" onClick={el.onClick}> <span >{props.content}</span> </div>
            </div>
        );
    })}
    
    <div className="tcp-p-asd">
        <div className={`tcp-p-ball tcp-state-${props.lState}`}> <span>{props.content}</span> </div>
        <div className={`tcp-p-ball tcp-state-${props.rState}`}> <span>{props.content}</span> </div>
    </div>
</div>


class TcpCarrier extends Component {

    running = true;

    state = {
        lWindow: 0,
        rWindow: 0,

        lWindowSize: 1,
        rWindowSize: 1,

        speed: 0.5,
        arr: new Array<Pkg>()
    }

    componentDidMount() {
        this.reset("Hello World");
        window.requestAnimationFrame(this.update);
    }

    componentWillUnmount() {
        this.running = false;
    }

    private clamp = (n: number) => {
        if (n > 100)
            return 100
        if (n < 0)
            return 0
        return n;
    }

    update = () => {
        if (this.running) {

            const arr = this.state.arr;

            for (let i of arr) {
                for (let o of i.progress) {
                    if (o.prog != 100) {
                        let newVal = o.prog + this.state.speed;
                        if (newVal >= 100) {
                            newVal = 100;
                            o.onArrive();
                        }
                        o.prog = newVal;
                    }
                }
            }

            this.setState({arr: arr});
            window.requestAnimationFrame(this.update);
        }
    }

    //////////////////////////////////////////////////////////////////

    test = () => {
        this.reset("time to die!!!");
    }

    get length() {
        return this.state.arr.length;
    }

    set speed(spd: number) {
        this.setState({speed: spd});
    }

    reset = (msg: string) => {
        const arr = new Array<Pkg>();
        for (let f of msg) {
            const p = {
                content: f,
                lState: "waiting",
                rState: "waiting",
                progress: new Array<{prog: number, toSide: "left"|"right"}>()
            }
            arr.push(p);
        }
        this.setState({arr: arr});
    }

    setPkgState = (side: "left"|"right", index: number, state: "ok"|"waiting"|"blank") => {
        const arr = this.state.arr;
        if (side == "left") {
            arr[index].lState = state;
        } else {
            arr[index].rState = state;
        }
    }

    send = (to: "left"|"right", index: number, onClick?: () => void, onArrive?: () => void) => {
        const p = {
            toSide: to,
            onClick: onClick,
            onArrive: onArrive,
            prog: 0,
        };
        this.state.arr[index].progress.push(p);
    }

    changeWindow = (side: "left"|"right", toIndex: number, toSize: number) => {
        if (side == "left") {
            this.setState({lWindow: toIndex, lWindowSize: toSize});
        } else {
            this.setState({rWindow: toIndex, rWindowSize: toSize});
        }
    }

    //////////////////////////////////////////////////////////////////

    render() {

        return (
            <main id="tcp-carrier">

                {/* TCP animation */}
                <div className="tcp-cont-packet">

                    <div className="tcp-cont-window"> 
                        <div style={{transform: `translateY(${this.state.lWindow*100}%)`}} className="tcp-window-wrapper tcp-left">
                            <div style={{minHeight: ((parseInt(ballSize) + parseInt(marginSize) * 2) * this.state.lWindowSize) + "px"}} className="tcp-window"></div>
                        </div>
                        <div style={{transform: `translateY(${this.state.rWindow*100}%)`}} className="tcp-window-wrapper tcp-right">
                            <div style={{height: ((parseInt(ballSize) + parseInt(marginSize) * 2) * this.state.rWindowSize)}} className="tcp-window"></div>
                        </div>
                    </div>

                    {this.state.arr.map((el, ind) => {
                        return <TcpPacket key={ind} rState={el.rState} lState={el.lState} content={el.content} progress={el.progress}/>
                    })}

                </div>

                {/* Menu */}
                <div className="tcp-cont-menu">
                    <div>
                        <button onClick={this.test}>Start</button>
                        <button>Stop</button>
                    </div>
                </div>
                
            </main>
        );
    }

}

export default TcpCarrier;