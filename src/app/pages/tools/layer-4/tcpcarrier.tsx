import React, { ChangeEvent, Component, FC } from "react";
import variables from "src/sass/pages/tcpcarrier.scss";
import "src/sass/pages/tcpcarrier.scss";



const TcpPacket: FC = () =>

<div className="tcp-p-rail">
    <div className="tcp-p-slider">
        <div className="tcp-p-ball"></div>
    </div>
    <div className="tcp-p-ball tcp-p-hint tcp-left"></div>
    <div className="tcp-p-ball tcp-p-hint tcp-right"></div>
</div>



class TcpCarrier extends Component {

    test = () => {
        document.getElementsByClassName("tcp-p-slider")[0].style.transform = "translateX(100%)";
    }

    //////////////////////////////////////////////////////////////////

    render() {
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

                    {Array(20).fill(<TcpPacket/>)}
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