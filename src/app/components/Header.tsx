import React, { createContext, FC, useState, Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";

export interface IHeader {layer: number, toolname: string}

export const WireworksHeader: FC<RouteComponentProps> = ({match}) => {

    const reg = /\/layers\/(\d)(?:\/([a-z]*))?/;

    const toolNames : { [key:string]:string; } = {
        'ipbits': 'IPBits',
        'planner': 'Planner',
        'undernets': 'Undernets',

        'tcpcarrier': 'TCP Carrier',

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

{/* <header>
    <div class="spacer">
        <a href="../../" class="logo">wireworks</a>
        <a href="./">Camada 5</a>
    </div>
</header> */}
