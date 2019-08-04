import React, { FC, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "sass/pages/index.scss"


const Layer1 = lazy(() => import("./app/pages/layers/Layer1"));
const Layer2 = lazy(() => import("./app/pages/layers/Layer2"));
const Layer3 = lazy(() => import("./app/pages/layers/Layer3"));
const Layer4 = lazy(() => import("./app/pages/layers/Layer4"));
const Layer5 = lazy(() => import("./app/pages/layers/Layer5"));

const Ipbits = lazy(() => import("./app/pages/tools/ipbits"));

const MainMenu = lazy(() => import("./app/pages/MainMenu"));


const Wireworks: FC = () =>

<Router>

    <header>
        <Link to="/" className="logo">wireworks</Link>
    </header>

    <Suspense fallback={<div>Loading...</div>}>
        <Switch>

                {/* All possible Routes */}

                <Route path="/" exact component={MainMenu}/>

                <Route path="/layers/3/ipbits"  component={Ipbits}/>

                <Route path="/layers/1"  component={Layer1}/>
                <Route path="/layers/2"  component={Layer2}/>
                <Route path="/layers/3"  component={Layer3}/>
                <Route path="/layers/4"  component={Layer4}/>
                <Route path="/layers/5"  component={Layer5}/>


                {/* 404 */}
                <Route component={() =>
                    <main>
                        <h2 className="font-big">Nada aqui <span style={{fontFamily: "monospace"}}>¯\_(ツ)_/¯</span></h2>
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
