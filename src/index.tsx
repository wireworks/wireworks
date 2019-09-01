import React, { FC, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "src/sass/pages/index.scss";
import Footer from "./app/components/Footer";
import { WireworksHeader } from "./app/components/Header";
import * as serviceWorker from "./serviceWorker";


const Layer1 = lazy(() => import("./app/pages/layers/Layer1"));
const Layer2 = lazy(() => import("./app/pages/layers/Layer2"));
const Layer3 = lazy(() => import("./app/pages/layers/Layer3"));
const Layer4 = lazy(() => import("./app/pages/layers/Layer4"));
const Layer5 = lazy(() => import("./app/pages/layers/Layer5"));

const Ipbits = lazy(() => import("./app/pages/tools/layer-3/ipbits"));
const Undernets = lazy(() => import("./app/pages/tools/layer-3/undernets"));
const Planner = lazy(() => import("./app/pages/tools/layer-3/planner"));

const TcpCarrier = lazy(() => import("./app/pages/tools/layer-4/tcpcarrier"));

const DnsFlow = lazy(() => import("./app/pages/tools/layer-5/dnsflow"));
const DnsTree = lazy(() => import("./app/pages/tools/layer-5/dnstree"));

const MainMenu = lazy(() => import("./app/pages/MainMenu"));

const loader = <main>
	<div className="vbox align-center px-6 py-6">
		<div className="lds-ring">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</div>
</main>

const Wireworks: FC = () =>

<Router>

    <div className="content">
		
		<Route path="/" component={WireworksHeader} />

		<Suspense fallback={loader}>

			<Switch>

				{/* All possible Routes */}

				{/* Main Menu */}
				<Route path="/" exact component={MainMenu} />


				{/* Layer 3 */}
				<Route path="/layers/3/ipbits" component={Ipbits} />
				<Route path="/layers/3/undernets" component={Undernets} />
				<Route path="/layers/3/planner" component={Planner} />

				{/* Layer 4 */}
				<Route path="/layers/4/tcpcarrier" component={TcpCarrier} />

				{/* Layer 5 */}
				<Route path="/layers/5/dnsflow" component={DnsFlow} />
				<Route path="/layers/5/dnstree" component={DnsTree} />


				{/* Layer Tools Menu */}
				<Route path="/layers/1" component={Layer1} />
				<Route path="/layers/2" component={Layer2} />
				<Route path="/layers/3" component={Layer3} />
				<Route path="/layers/4" component={Layer4} />
				<Route path="/layers/5" component={Layer5} />


				{/* 404 */}
				<Route component={() =>
					<main>
						<h2 className="font-big p-3">Nada aqui <span className="font-mono">¯\_(ツ)_/¯</span></h2>
					</main>
				} />
                
			</Switch>
		</Suspense>

	</div>

	<Route path="/" component={Footer}/>

</Router>



ReactDOM.render(<Wireworks/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
