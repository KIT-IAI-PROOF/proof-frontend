import {Fragment, ReactNode} from "react";
import {AuthProvider} from "react-oidc-context";
import {authConfig} from "../utils/auth.ts";

interface IProps {
    children: ReactNode;
}

const Auth = ({children}: IProps): ReactNode => {

    return (
        <Fragment>
            <AuthProvider {...authConfig}>
                {children}
            </AuthProvider>
        </Fragment>
    );

};

export default Auth;