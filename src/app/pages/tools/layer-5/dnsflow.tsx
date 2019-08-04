import React, { Component } from "react";
import "app/old/src/app/layer-5/dnsflow"
import { resetCanvas, run, init, myRender } from "app/old/src/app/layer-5/dnsflow";
import { id } from "../../../old/src/core/utils/dom";
import "sass/pages/layers/5/dnsflow.scss"

class DnsFlow extends Component {

    componentDidMount() {

        init();

        resetCanvas();

        setInterval(myRender, 2000);

        id("run").addEventListener("click", run);

        id("domain").addEventListener("keydown", function (ev: KeyboardEvent): void {
            if (ev.key === "Enter")
                run();
        });
    }

    render () {
        return (
			<main>
				<div className="hbox">
					<div>
						<label htmlFor="domain">Domínio</label>
						<h1>
							<input type="text" name="domain" id="domain" placeholder="www.exemplo.com.br"/>
						</h1>
					</div>
					<div>
						<label htmlFor="speed">Velocidade</label>
						<h1>
							<select name="speed" id="speed">
								<option value="veryslow">Muito Lento</option>
								<option value="slow">Lento</option>
								<option value="normal" selected>Normal</option>
								<option value="fast">Rápido</option>
								<option value="veryfast">Muito Rápido</option>
							</select>
							<button id="run">Visualizar</button>
						</h1>
					</div>
				</div>
				
				<div id="error_wrapper"></div>

				<canvas id="canvas" width="750" height="560"></canvas>

				<div className="hbox">

					<div>
						<label>Local</label>
						<h1>
							<select id="local_mode">
								<option value="iterative">Iterativo</option>
								<option value="recursive" selected>Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>Root</label>
						<h1>
							<select id="root_mode">
								<option value="iterative" selected>Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>TLD</label>
						<h1>
							<select id="tld_mode">
								<option value="iterative" selected>Iterativo</option>
								<option value="recursive">Recursivo</option>
							</select>
						</h1>
					</div>
					<div>
						<label>Intermediários</label>
						<h1>
							<select id="inter_mode">
								<option value="iterative" selected>Iterativos</option>
								<option value="recursive">Recursivos</option>
							</select>
						</h1>
					</div>

				</div>

			</main>
        );
    }
}

export default DnsFlow;