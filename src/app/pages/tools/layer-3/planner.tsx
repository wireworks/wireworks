import React, { Component } from "react";
import "app/old/src/app/layer-3/planner.ts"
import { id } from "app/old/src/core/utils/dom";
import { createPlan, init } from "app/old/src/app/layer-3/planner";
import "sass/pages/planner.scss"

class Planner extends Component {

	componentDidMount() {

		init()

		id("address").addEventListener("keydown", function(ev: KeyboardEvent): void {
			if (ev.key === "Enter")
				createPlan();
		});
		
		id("button_generate").addEventListener("click", function(ev: MouseEvent):void {
			createPlan();
		});
	}

    render() {
        return (
            <main>
				<label htmlFor="address">Rede/Máscara</label>
				<h1>
					<input type="text" name="address" id="address" placeholder="0.0.0.0/0"/>
					<button type="button" id="button_generate">Gerar plano</button>
				</h1>
				<div id="plan-wrapper"></div>
			</main>
        );
    }
}

export default Planner;