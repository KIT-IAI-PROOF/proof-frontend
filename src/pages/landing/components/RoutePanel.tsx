import {Fragment, ReactNode} from "react";
import {Box, Card, CardActionArea, CardContent, Stack, Theme, Typography, useTheme} from "@mui/material";
import {IRoute} from "../../../model/IRoute.ts";
import {NavigateFunction, useNavigate} from "react-router-dom";
import Grid from "@mui/material/Grid2";

interface IProps {
    route: IRoute;
}

const RoutePanel = ({route}: IProps): ReactNode => {

    const navigate: NavigateFunction = useNavigate();
    const theme: Theme = useTheme();

    return (
        <Fragment>
            <Grid size={{xs: 12, sm: 6, lg: 4}}>
                <Card variant={"outlined"}>
                    <CardActionArea onClick={(): void => navigate(route.displayPath)}>
                        <CardContent style={{background: theme.palette.elevated.default}}>
                            <Box padding={2}>
                                <Stack spacing={1} direction={"row"}>
                                    {
                                        route.icon
                                    }
                                    <Typography
                                        color={"primary"}
                                        variant={"h5"}
                                        paddingBottom={2}
                                    >
                                        {route.name}
                                    </Typography>
                                </Stack>
                                <Typography variant={"body1"}>
                                    {route.description}
                                </Typography>
                            </Box>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Grid>
        </Fragment>
    );

};

export default RoutePanel;