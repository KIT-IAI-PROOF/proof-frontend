import {Fragment, ReactNode} from "react";
import Grid from "@mui/material/Grid2";
import {Stack, Tooltip, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";
import {useTranslation} from "react-i18next";

interface IProps {
    headerKey: string;
    subHeaderValue: string;
    tooltipTitle: string
    buttons?: ReactNode | undefined;
    icon?: ReactNode | undefined;
}

const ConfigHeader: ({buttons, headerKey, icon, subHeaderValue, tooltipTitle}: IProps) => ReactNode = ({
                                                                                                           buttons,
                                                                                                           headerKey,
                                                                                                           icon,
                                                                                                           subHeaderValue,
                                                                                                           tooltipTitle
                                                                                                       }: IProps): ReactNode => {

    const {t} = useTranslation();

    return (
        <Fragment>
            <Grid
                container={true}
                flex={1}
                justifyContent={"space-between"}
                alignItems={"center"}
                paddingBottom={2}
                spacing={2}
            >
                <Grid size={{xs: 12, lg: 8}}>
                    <Stack direction={"row"} spacing={2} alignItems={"center"}>
                        {
                            icon
                        }
                        <Typography
                            variant={"h2"}
                        >
                            {t(headerKey)}
                        </Typography>
                        <Typography
                            variant={"h2"}
                            color={"primary"}
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flexShrink: 1,
                                minWidth: 0
                            }}
                        >
                            {subHeaderValue}
                        </Typography>
                        <Tooltip title={t(tooltipTitle)}>
                            <Info
                                color={"action"}
                                sx={{ml: 2, cursor: "pointer", flexShrink: 0}}
                            />
                        </Tooltip>
                    </Stack>
                </Grid>
                <Grid size={{xs: 12, lg: 4}}>
                    <Stack direction={"row"} justifyContent={"right"} alignItems={"center"} spacing={1}>
                        {
                            buttons
                        }
                    </Stack>
                </Grid>
            </Grid>
        </Fragment>
    );

}

export default ConfigHeader;