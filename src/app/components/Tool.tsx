import { Component } from "react";
import { IO } from "./Exporter";

abstract class Tool extends Component<IO> {
    
    onExport = () => {
        return this.state;
    }

    onImport = (data: any) => {
        this.setState(data);
    }

    componentDidMount() {
        this.props.io.onExport = this.onExport;
        this.props.io.onImport = this.onImport;
    }


}

export default Tool