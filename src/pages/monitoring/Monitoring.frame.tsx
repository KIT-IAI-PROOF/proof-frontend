import {Fragment} from "react";
import {ReactFlowProvider} from "@xyflow/react";
import MonitoringProvider from "../../provider/MonitoringProvider.tsx";
import {Outlet} from "react-router-dom";

export const Frame = () => {

    return (
        <Fragment>
            <ReactFlowProvider>
                <MonitoringProvider>
                    <Outlet/>
                </MonitoringProvider>
            </ReactFlowProvider>
        </Fragment>
    );

}