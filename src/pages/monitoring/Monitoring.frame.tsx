import {withAuthenticationRequired} from "react-oidc-context";
import {Fragment, ReactNode} from "react";
import {ReactFlowProvider} from "@xyflow/react";
import MonitoringProvider from "../../provider/MonitoringProvider.tsx";
import {Outlet} from "react-router-dom";
import CircularLoader from "../../app/components/CircularLoader.tsx";

export const Frame = withAuthenticationRequired(
    (): ReactNode => {
        return (
            <Fragment>
                <ReactFlowProvider>
                    <MonitoringProvider>
                        <Outlet/>
                    </MonitoringProvider>
                </ReactFlowProvider>
            </Fragment>
        );
    },
    {
        OnRedirecting: (): any => {
            return (
                <CircularLoader/>
            );
        },
        signinRedirectArgs: {
            extraQueryParams: {
                mode: window.localStorage.getItem("mui-mode") ?? "system",
                ui_locales: window.localStorage.getItem("i18nextLng") ?? "en"
            },
            state: window.location.pathname === "/" ? "/monitoring" : window.location.pathname
        }
    });