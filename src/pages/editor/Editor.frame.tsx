import {ReactFlowProvider} from "@xyflow/react";
import EditorProvider from "../../provider/EditorProvider.tsx";
import Editor from "./Editor.tsx";
import {withAuthenticationRequired} from "react-oidc-context";
import {Fragment, ReactNode} from "react";
import CircularLoader from "../../app/components/CircularLoader.tsx";

export const Frame = withAuthenticationRequired(
    (): ReactNode => {
        return (
            <Fragment>
                <ReactFlowProvider>
                    <EditorProvider>
                        <Editor/>
                    </EditorProvider>
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
            state: window.location.pathname === "/" ? "/editor" : window.location.pathname
        }
    });