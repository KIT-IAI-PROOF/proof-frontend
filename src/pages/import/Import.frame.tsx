import {Fragment} from "react";
import {Outlet} from "react-router-dom";

export const Frame = () => {

    return (
        <Fragment>
            <Outlet/>
        </Fragment>
    );

}