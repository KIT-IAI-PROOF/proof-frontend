import {Fragment, ReactNode} from "react";
import {GridSpacing} from "@mui/material";
import Grid from "@mui/material/Grid2";

interface IProps {
    spacing: GridSpacing;
    children: ReactNode | ReactNode[];
}

const AttributeGridContainer = ({children, spacing}: IProps) => {

    return (
        <Fragment>
            <Grid container spacing={spacing} paddingBottom={1}>
                {children}
            </Grid>
        </Fragment>
    );

}

export default AttributeGridContainer;