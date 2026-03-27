import {Fragment, ReactNode} from "react";
import {Breakpoint, GridSize} from "@mui/material";
import Grid from "@mui/material/Grid2";

type ResponsiveStyleValue<T> = Array<T | null> | { [key in Breakpoint]?: T | null } | T

interface IProps {
    size: GridSize;
    sizes: ResponsiveStyleValue<GridSize>;
    labelNode?: ReactNode | undefined;
    valueNode?: ReactNode | undefined;
}

const AttributeGridItem = ({size, sizes, labelNode, valueNode}: IProps): ReactNode => {

    return (
        <Fragment>
            <Grid size={size}>
                <Grid container={true} alignItems={"center"} spacing={1}>
                    <Grid size={sizes} overflow={"hidden"}>
                        {labelNode}
                    </Grid>
                    <Grid size={sizes}>
                        {valueNode}
                    </Grid>
                </Grid>
            </Grid>
        </Fragment>
    );

}

export default AttributeGridItem