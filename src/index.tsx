import React, { FC, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import "src/sass/pages/index.scss";
import { WireworksHeader } from "./app/components/Header";
import * as serviceWorker from "./serviceWorker";
import Footer from "./app/components/Footer";
import "src/sass/pages/index.scss"

const Layer1 = lazy(() => import("./app/pages/layers/Layer1"));
const Layer2 = lazy(() => import("./app/pages/layers/Layer2"));
const Layer3 = lazy(() => import("./app/pages/layers/Layer3"));
const Layer4 = lazy(() => import("./app/pages/layers/Layer4"));
const Layer5 = lazy(() => import("./app/pages/layers/Layer5"));

const BitFlux = lazy(() => import("./app/pages/tools/layer-1/bitflux"));

const MacFetch = lazy(() => import("./app/pages/tools/layer-2/macfetch"));

const Ipbits = lazy(() => import("./app/pages/tools/layer-3/ipbits"));
const Undernets = lazy(() => import("./app/pages/tools/layer-3/undernets"));
const Planner = lazy(() => import("./app/pages/tools/layer-3/planner"));

const ServerChat = lazy(() => import("./app/pages/tools/layer-4/serverchat"));

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

				{/* Layer 1 */}
				<Route path="/layers/1/bitflux" component={BitFlux} />

				{/* Layer 2*/}
				<Route path="/layers/2/macfetch" render={() => {return <MacFetch ipFetch={false}/>;}} />
				<Route path="/layers/2/ipfetch" render={() => { return <MacFetch ipFetch={true}/>;}} />				

				{/* Layer 3 */}
				<Route path="/layers/3/ipbits" component={Ipbits} />
				<Route path="/layers/3/undernets" component={Undernets} />
				<Route path="/layers/3/planner" component={Planner} />

				{/* Layer 4 */}
				<Route path="/layers/4/serverchat" component={ServerChat} />

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
						<h1 className="hbox align-center justify-center font-mono">404</h1>
						<h2 className="hbox align-center justify-center">Não há nada por aqui.</h2>
						<h2 className="hbox align-center justify-center">¯\_(ツ)_/¯</h2>
						<Link className="hbox align-center justify-center" to="/">Menu inicial</Link>
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
