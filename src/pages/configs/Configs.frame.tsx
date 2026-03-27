import {withAuthenticationRequired} from "react-oidc-context";
import {Fragment, ReactNode} from "react";
import CircularLoader from "../../app/components/CircularLoader.tsx";
import {Outlet} from "react-router-dom";
import ConfigProvider from "../../provider/ConfigProvider.tsx";

export const Frame = withAuthenticationRequired(
    (): ReactNode => {
        return (
            <Fragment>
                <ConfigProvider>
                    <Outlet/>
                </ConfigProvider>
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
            state: window.location.pathname === "/" ? "/configs" : window.location.pathname
        }
    });