import React, { FC } from "react";

interface ErrorBoxProps {
	errorMessage: string,
	className?: string
}

const ErrorBox: FC<ErrorBoxProps> = ({errorMessage, className}) => {

    if (errorMessage) {
        return (
            <div className={"errorbox " + (className? className : "")}>{errorMessage}</div>
        );
    }

    return null;

}

export default ErrorBox;