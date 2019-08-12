import { createContext, Component } from "react";

interface IWireworksContext {
    toolName: "fff"
};

const WireworksContext = createContext<IWireworksContext>(null);

class WireworksContextProvider extends Component<{}, IWireworksContext> {

    render() {
        return (
            <WireworksContext.Provider value={this.state}>
                {this.props.children}
            </WireworksContext.Provider>
        );
    }

}