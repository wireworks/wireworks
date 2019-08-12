import React, { createContext, FC, useState, Component } from "react";
import { string } from "prop-types";
import { Link } from "react-router-dom";

const titleContext = createContext({
    name: "Wireworks"
});

export class TitleContextProvider extends Component {

    setName = (newName: string) => this.setState({name: newName});

    state = {
        name: "wireworks",
        setName: this.setName
    };

    render() {
        return(
            <titleContext.Provider value={this.state}>
                {this.props.children}
            </titleContext.Provider>
        );
    }

}

export const WireworksHeader: FC = () =>

<header>
    <div className="spacer">
        <Link to="/" className="logo">wireworks</Link>
        <TitleContextProvider>
            <titleContext.Consumer>
                { ({name, setName} ) =>
                <span>
                    <Link to="./">{name}</Link>
                    <span className="breadcrumb"></span>
                    <span onClick={() => {setName("Camada 5")}}>DNSTree</span>
                </span>
                }
            </titleContext.Consumer>
        </TitleContextProvider>
        
    </div>
</header>

export const ToolTitleConsumer = titleContext.Consumer;

{/* <header>
    <div class="spacer">
        <a href="../../" class="logo">wireworks</a>
        <a href="./">Camada 5</a>
    </div>
</header> */}
