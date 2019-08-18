import React, { FC, lazy, Suspense, useState } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { WireworksHeader, IHeader } from "./app/components/Header";
import "src/sass/pages/index.scss"
import { object, number } from "prop-types";


const Layer1 = lazy(() => import("./app/pages/layers/Layer1"));
const Layer2 = lazy(() => import("./app/pages/layers/Layer2"));
const Layer3 = lazy(() => import("./app/pages/layers/Layer3"));
const Layer4 = lazy(() => import("./app/pages/layers/Layer4"));
const Layer5 = lazy(() => import("./app/pages/layers/Layer5"));

const Ipbits = lazy(() => import("./app/pages/tools/layer-3/ipbits"));
const Undernets = lazy(() => import("./app/pages/tools/layer-3/undernets"));
const Planner = lazy(() => import("./app/pages/tools/layer-3/planner"));

const DnsFlow = lazy(() => import("./app/pages/tools/layer-5/dnsflow"));
const DnsTree = lazy(() => import("./app/pages/tools/layer-5/dnstree"));

const MainMenu = lazy(() => import("./app/pages/MainMenu"));


const Wireworks: FC = () =>

<Router>

    <Route path="/" component={WireworksHeader} />

    <Suspense fallback={<div className="vbox align-center px-3 py-3"><div className="lds-dual-ring"></div></div>}>
        <Switch>

                {/* All possible Routes */}

                {/* Main Menu */}
                <Route path="/" exact component={MainMenu}/>


                {/* Layer 3 */}
                <Route path="/layers/3/ipbits"  component={Ipbits}/>
                <Route path="/layers/3/undernets"  component={Undernets}/>
                <Route path="/layers/3/planner"  component={Planner}/>

                {/* Layer 5 */}
                <Route path="/layers/5/dnsflow"  component={DnsFlow}/>
                <Route path="/layers/5/dnstree"  component={DnsTree}/>


                {/* Layer Tools Menu */}
                <Route path="/layers/1"  component={Layer1}/>
                <Route path="/layers/2"  component={Layer2}/>
                <Route path="/layers/3"  component={Layer3}/>
                <Route path="/layers/4"  component={Layer4}/>
                <Route path="/layers/5"  component={Layer5}/>


                {/* 404 */}
                <Route component={() =>
                    <main>
                        <h2 className="font-big p-3">Nada aqui <span className="font-mono">¯\_(ツ)_/¯</span></h2>
                    </main>
                }/>

        </Switch>
    </Suspense>
</Router>



ReactDOM.render(<Wireworks/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();