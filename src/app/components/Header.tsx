import React, { FC } from "react";
import { Link, RouteComponentProps } from "react-router-dom";

export interface IHeader {layer: number, toolname: string}

export const WireworksHeader: FC<RouteComponentProps> = ({match}) => {

    const reg = /\/layers\/(\d)(?:\/([a-z]*))?/;

    const toolNames : { [key:string]:string; } = {
		
        'bitflux': "Bit Flux",
        'framer': "Framer",

        'macfetch': "MAC Fetch",
        'ipfetch': "IP Fetch",
		
		'ipbits': 'IPBits',
        'planner': 'Planner',
        'undernets': 'Undernets',

        'tcpcarrier': 'TCP Carrier',
        'udpcarrier': 'UDP Carrier',
        'serverchat': 'Server Chat',
        
        'dnsflow': 'DNS Flow',
        'dnstree': 'DNS Tree'
    };

    let layer = 0;
    let toolname;

    let regm = reg.exec(window.location.pathname);
    if (regm) {

        layer = parseInt(regm[1]);
        
        if (regm[2]) {
            toolname = toolNames[regm[2]];
        }
        
    }

    if (layer <= 5 && layer >= 1) {
        document.body.className = "theme-layer"+layer;
    }
    else {
        document.body.className = "theme-wireworks";
    }

    return (
        <header>
            <div className="spacer">
                <Link to="/" className="logo">wireworks</Link>
                <span>
                    {
                    layer > 0 &&
                    <Link to={`/layers/${layer}`}>Camada {layer}</Link>
                    }

                    {
                    toolname === undefined ||
                    <>
                        <span className="breadcrumb"></span>
                        <span>{toolname}</span>
                    </>
                    }
                </span>
            </div>
        </header>
    );

}