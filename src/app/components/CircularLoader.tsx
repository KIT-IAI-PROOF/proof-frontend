import {Fragment, ReactNode} from "react";
import {Backdrop, CircularProgress, Theme} from "@mui/material";

const CircularLoader: () => ReactNode = (): ReactNode => {

    return (
        <Fragment>
            <Backdrop
                open={true}
                sx={(theme: Theme): any => ({
                    background: theme.palette.background.default,
                    color: theme.palette.primary.main,
                    zIndex: theme.zIndex.drawer + 1000
                })}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
        </Fragment>
    );

};

export default CircularLoader;