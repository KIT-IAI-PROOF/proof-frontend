import {Fragment, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Backdrop, Box, Button, Stack, Theme, Typography} from "@mui/material";
import {QueryClient, useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "../../utils/axios.ts";
import {DEFAULT_SETTINGS} from "../../utils/settings.ts";

export const ConnectionStatus: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const queryClient: QueryClient = useQueryClient();

    const {data: isHealthy} = useQuery({
        queryKey: ["backend-health"],
        queryFn: async () => {
            try {
                const response = await axios.get(`${DEFAULT_SETTINGS.configBasePath}/actuator/health`, {timeout: 1000});
                const {status} = response.data;
                return status === "UP";
            } catch (e) {
                return false;
            }
        },
        retry: false,
        retryDelay: 10000,
        refetchInterval: 10000,
        meta: {
            isBackground: true
        }
    });

    return (
        <Fragment>
            <Backdrop
                color={"#164194"}
                open={isHealthy === false}
                sx={(theme: Theme): { background: string; zIndex: number } => ({
                    background: theme.palette.error.main,
                    zIndex: theme.zIndex.drawer + 1
                })}
            >
                <Stack spacing={1} justifyContent={"center"} alignItems={"center"}>
                    <Typography
                        variant={"body1"}
                        fontSize={"20px"}
                        sx={(theme: Theme): { color: string } => ({color: theme.palette.background.default})}
                    >
                        {t('error.noConnection')}
                    </Typography>
                    <Box paddingTop={3}>
                        <Button
                            color={"error"}
                            fullWidth={true}
                            onClick={() => queryClient.invalidateQueries({queryKey: ["backend-health"]})}
                            sx={(theme: Theme): { background: string; width: "200px" } => ({
                                background: theme.palette.background.default,
                                width: "200px"
                            })}
                        >
                            {t("action.reload")}
                        </Button>
                    </Box>
                </Stack>
            </Backdrop>
        </Fragment>
    );

};