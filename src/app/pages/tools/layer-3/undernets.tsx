import React, { Component } from "react";
import "app/old/src/app/layer-3/undernets.ts"
import { reset, init } from "app/old/src/app/layer-3/undernets";
import { id } from "app/old/src/core/utils/dom";
import "sass/pages/undernets.scss"

class Undernets extends Component {

    componentDidMount() {
        id("address").addEventListener("keydown", function (ev: KeyboardEvent): void {
            if (ev.key === "Enter")
                reset();
        });
        
        id("button_generate").addEventListener("click", function (ev: MouseEvent): void {
            reset();
        });

        init()

    }

    render() {
        return (
            <main>
                <label htmlFor="address">Rede/Máscara</label>
                <h1>
                    <input type="text" name="address" id="address" placeholder="0.0.0.0/0"/>
                    <button type="button" id="button_generate">Visualizar Rede</button>
                </h1>
                <div id="error_wrapper"></div>
                <div className="blocks-wrapper">
                    <div className="subnet-block ss-0" id="root_block">
                        <h1>Insira a sua rede</h1>
                    </div>
                    <div className="tooltip-wrapper">
                        <span id="tooltip">Informações das suas sub-redes ficarão aqui</span>
                    </div>
                </div>

                <div className="subnet-tree" id="root_tree"></div>

            </main>
        );
    }

}

export default Undernets;