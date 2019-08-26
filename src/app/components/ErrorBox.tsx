import React, { FC } from "react";

interface ErrorBoxProps {
	errorMessage: string
}

const ErrorBox: FC<ErrorBoxProps> = ({errorMessage}) => {

    if (errorMessage) {
        return (
            <div className="errorbox">{errorMessage}</div>
        );
    }

    return null;

}

export default ErrorBox;