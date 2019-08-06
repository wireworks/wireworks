import React, { FC, Component } from "react";
import "sass/pages/ipbits.scss"
import "app/old/src/app/layer-3/ipbits.ts"
import { loadDOMComponents, updateDisplays, copyIPToClipboard, copyMaskToClipboard } from "app/old/src/app/layer-3/ipbits";
import { id } from "app/old/src/core/utils/dom";

class Ipbits extends Component {

    componentDidMount() {
        loadDOMComponents();
        updateDisplays();
        id("copy_ip").addEventListener("click", ev => copyIPToClipboard())
        id("copy_mask").addEventListener("click", ev => copyMaskToClipboard())
    }

    render() {
        return(
            <main>
                <div className="spacer">
                    <h2>Máscara <i className="far fa-clipboard copy-icon" id="copy_mask"></i> <span className="copy-text"
                            id="copy_mask_text">Máscara copiada</span></h2>
                    <h2 className="text-light font-light" id="mask_value"></h2>
                </div>
                
                <div className="box">
                
                    <div className="block">
                        <div id="display_mask_0" className="mask-display">0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_7" type="checkbox"/><label htmlFor="byte_mask_0_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_6" type="checkbox"/><label htmlFor="byte_mask_0_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_5" type="checkbox"/><label htmlFor="byte_mask_0_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_4" type="checkbox"/><label htmlFor="byte_mask_0_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_3" type="checkbox"/><label htmlFor="byte_mask_0_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_2" type="checkbox"/><label htmlFor="byte_mask_0_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_1" type="checkbox"/><label htmlFor="byte_mask_0_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_0_0" type="checkbox"/><label htmlFor="byte_mask_0_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_mask_1" className="mask-display">0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_7" type="checkbox"/><label htmlFor="byte_mask_1_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_6" type="checkbox"/><label htmlFor="byte_mask_1_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_5" type="checkbox"/><label htmlFor="byte_mask_1_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_4" type="checkbox"/><label htmlFor="byte_mask_1_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_3" type="checkbox"/><label htmlFor="byte_mask_1_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_2" type="checkbox"/><label htmlFor="byte_mask_1_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_1" type="checkbox"/><label htmlFor="byte_mask_1_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_1_0" type="checkbox"/><label htmlFor="byte_mask_1_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_mask_2" className="mask-display">0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_7" type="checkbox"/><label htmlFor="byte_mask_2_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_6" type="checkbox"/><label htmlFor="byte_mask_2_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_5" type="checkbox"/><label htmlFor="byte_mask_2_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_4" type="checkbox"/><label htmlFor="byte_mask_2_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_3" type="checkbox"/><label htmlFor="byte_mask_2_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_2" type="checkbox"/><label htmlFor="byte_mask_2_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_1" type="checkbox"/><label htmlFor="byte_mask_2_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_2_0" type="checkbox"/><label htmlFor="byte_mask_2_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_mask_3" className="mask-display">0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_7" type="checkbox"/><label htmlFor="byte_mask_3_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_6" type="checkbox"/><label htmlFor="byte_mask_3_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_5" type="checkbox"/><label htmlFor="byte_mask_3_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_4" type="checkbox"/><label htmlFor="byte_mask_3_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_3" type="checkbox"/><label htmlFor="byte_mask_3_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_2" type="checkbox"/><label htmlFor="byte_mask_3_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_1" type="checkbox"/><label htmlFor="byte_mask_3_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_mask_3_0" type="checkbox"/><label htmlFor="byte_mask_3_0"></label>
                            </div>
                        </div>
                    </div>
                
                </div>
                
                <div className="spacer">
                    <h2>IP <i className="far fa-clipboard copy-icon" id="copy_ip"></i> <span className="copy-text" id="copy_ip_text">IP
                            Copiado</span></h2>
                    <h2 className="text-light font-light" id="ip_value"></h2>
                </div>
                
                <div className="box">
                
                    <div className="block">
                        <div id="display_ip_0" className="display" contentEditable>0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_7" type="checkbox"/><label htmlFor="byte_ip_0_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_6" type="checkbox"/><label htmlFor="byte_ip_0_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_5" type="checkbox"/><label htmlFor="byte_ip_0_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_4" type="checkbox"/><label htmlFor="byte_ip_0_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_3" type="checkbox"/><label htmlFor="byte_ip_0_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_2" type="checkbox"/><label htmlFor="byte_ip_0_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_1" type="checkbox"/><label htmlFor="byte_ip_0_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_0_0" type="checkbox"/><label htmlFor="byte_ip_0_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_ip_1" className="display" contentEditable>0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_7" type="checkbox"/><label htmlFor="byte_ip_1_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_6" type="checkbox"/><label htmlFor="byte_ip_1_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_5" type="checkbox"/><label htmlFor="byte_ip_1_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_4" type="checkbox"/><label htmlFor="byte_ip_1_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_3" type="checkbox"/><label htmlFor="byte_ip_1_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_2" type="checkbox"/><label htmlFor="byte_ip_1_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_1" type="checkbox"/><label htmlFor="byte_ip_1_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_1_0" type="checkbox"/><label htmlFor="byte_ip_1_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_ip_2" className="display" contentEditable>0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_7" type="checkbox"/><label htmlFor="byte_ip_2_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_6" type="checkbox"/><label htmlFor="byte_ip_2_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_5" type="checkbox"/><label htmlFor="byte_ip_2_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_4" type="checkbox"/><label htmlFor="byte_ip_2_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_3" type="checkbox"/><label htmlFor="byte_ip_2_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_2" type="checkbox"/><label htmlFor="byte_ip_2_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_1" type="checkbox"/><label htmlFor="byte_ip_2_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_2_0" type="checkbox"/><label htmlFor="byte_ip_2_0"></label>
                            </div>
                        </div>
                    </div>
                
                    <div className="dot"></div>
                
                    <div className="block">
                        <div id="display_ip_3" className="display" contentEditable>0</div>
                        <div className="bit-box">
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_7" type="checkbox"/><label htmlFor="byte_ip_3_7"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_6" type="checkbox"/><label htmlFor="byte_ip_3_6"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_5" type="checkbox"/><label htmlFor="byte_ip_3_5"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_4" type="checkbox"/><label htmlFor="byte_ip_3_4"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_3" type="checkbox"/><label htmlFor="byte_ip_3_3"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_2" type="checkbox"/><label htmlFor="byte_ip_3_2"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_1" type="checkbox"/><label htmlFor="byte_ip_3_1"></label>
                            </div>
                            <div className="bit"><input tabIndex={-1} id="byte_ip_3_0" type="checkbox"/><label htmlFor="byte_ip_3_0"></label>
                            </div>
                        </div>
                    </div>
                
                </div>
            </main>

        );
    }

}


export default Ipbits;