import {ChangeEvent, Fragment, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Paper,
    Stack,
    Switch,
    Theme,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useColorScheme,
    useMediaQuery,
    useTheme
} from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import {useTranslation} from "react-i18next";
import {ReactFlow} from "@xyflow/react";
import {IMonitoringContext} from "../../provider/MonitoringProvider";
import {TEdge} from "../../model/TEdge.ts";
import {TBlock} from "../../model/TBlock.ts";
import Grid from "@mui/material/Grid2";
import LogViewer from "./components/LogViewer.tsx";
import {MonitoringContext} from "../../provider/MonitoringContext.tsx";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";
import {IMessage} from "@stomp/stompjs";
import ConfirmDialog from "../../app/components/ConfirmDialog.tsx";
import {ExecutionDetail, ExecutionDetailStatusEnum, ExecutionListingStatusEnum} from "@webis/proof-config-manager-client";
import {saveAs} from 'file-saver';
import ExecutionSettingsPanel from "./components/ExecutionSettingsPanel.tsx";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {ENTITY_TYPES, EXECUTIONS_KEY, INVALIDATION_KEYS} from "../../utils/constants.ts";
import {getErrorMessage} from "../../utils/error.ts";
import {executionService, orchestrationService} from "../../services/instances.ts";
import {executionQueryOptions} from "../../query/options/executionQueryOptions.tsx";

const MonitoringDetail: () => ReactNode = (): ReactNode => {

    const {mode} = useColorScheme();
    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const {executionId} = useParams();
    const queryClient = useQueryClient();
    const {sessionKey}: IAppContext = useContext<IAppContext>(AppContext);
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const {nodes, nodeTypes, edgeTypes, edges, updateBlockStates, blockStates, updateExecution} = useContext<IMonitoringContext>(MonitoringContext);
    const navigate: NavigateFunction = useNavigate();

    const [appId, setAppId] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<IMessage[]>([])
    const [follow, setFollow] = useState<boolean>(true);
    const [level, setLevel] = useState<string>("INFO");
    const [deleteExecutionDialogOpen, setDeleteExecutionDialogOpen] = useState<boolean>(false);

    const logSourceName: string | undefined = useMemo((): string | undefined => {
        if (!appId) return undefined;
        if (appId.startsWith("execution.")) return "Orchestrator";
        const match: RegExpMatchArray | null = appId.match(/^block\.(.+?)\.execution\./);
        if (match) {
            const blockId: string = match[1];
            const node = nodes.find((n) => n.data.id === blockId);
            const name: string = node?.data.label ?? node?.data.templateName ?? blockId;
            const index: number | undefined = node?.data.index;
            return index !== undefined ? `${name} (${index})` : name;
        }
        return undefined;
    }, [appId, nodes]);

    const {data: execution}: UseQueryResult<ExecutionDetail, AxiosError> = useQuery(executionQueryOptions(executionId));

    const executionDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (executionId: string): Promise<boolean> => {
            return await executionService.deleteExecution(executionId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[EXECUTIONS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            getErrorMessage(error, ENTITY_TYPES[EXECUTIONS_KEY], t)
        }
    });

    useEffect((): void => {
        if (execution) updateExecution(execution);
    }, [updateExecution, execution]);

    const restartExecution = async (): Promise<void> => {
        let blockStatesCopy = blockStates
        execution?.workflow?.blocks?.forEach(block => {
            const index: number = blockStatesCopy.findIndex((blockState: {
                blockId: string,
                status: string | undefined,
                cp?: number
            }): boolean => blockState.blockId === block.id);
            if (index !== -1) {
                blockStatesCopy[index].status = undefined;
                blockStatesCopy[index].cp = undefined;
            }
        })
        updateBlockStates(blockStatesCopy)

        if (execution?.id) await orchestrationService.startExecution(undefined, execution?.id)
    }

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}
            >
                {
                    execution && <Paper elevation={0} sx={{pb: 3}}>
                        <Box padding={3}>
                            <Grid
                                container={true}
                                justifyContent={"space-between"}
                                alignItems={"center"}
                                paddingBottom={2}
                                spacing={1}
                            >
                                <Grid>
                                    <Stack
                                        direction={"row"}
                                        spacing={1}>
                                        <MonitorHeartIcon
                                            color={"primary"}
                                            fontSize={"large"}
                                        />
                                        <Typography variant={"h4"}>{t("page.header.monitoring.detail")}</Typography>
                                    </Stack>
                                </Grid>
                                <Grid size={{xs: 12, lg: "auto"}}>
                                    <Stack
                                        direction={"row"}
                                        justifyContent={"flex-end"}
                                        spacing={1}
                                    >
                                        <ButtonGroup
                                            orientation={isMobile ? "vertical" : "horizontal"}
                                        >
                                            <Button
                                                color={"primary"}
                                                variant={"outlined"}
                                                disabled={execution?.status !== ExecutionListingStatusEnum.Stopped && execution?.status !== ExecutionListingStatusEnum.Aborted && execution?.status !== ExecutionListingStatusEnum.ShutDown}
                                                onClick={async (): Promise<void> => {
                                                    await restartExecution()
                                                }}
                                            >
                                                {t('action.restart')}
                                            </Button>
                                            <Button
                                                color={"primary"}
                                                variant={"outlined"}
                                                disabled={execution?.status === ExecutionDetailStatusEnum.Stopped || execution?.status === ExecutionDetailStatusEnum.Aborted || execution?.status === ExecutionDetailStatusEnum.ShutDown}
                                                onClick={async (): Promise<void> => {
                                                    if (execution?.id) await orchestrationService.abortExecution(undefined, execution.id)
                                                }}
                                            >
                                                {t('action.stop')}
                                            </Button>
                                            <Button
                                                color={"primary"}
                                                variant={"outlined"}
                                                onClick={(): void => setAppId(`execution.${executionId}`)}
                                            >
                                                {t("action.logs")} (Orchestrator)
                                            </Button>
                                            <Button
                                                color={"primary"}
                                                variant={"outlined"}
                                                onClick={async (): Promise<void> => {
                                                    if (execution?.id) {
                                                        const file: File = await executionService.exportExecution(execution.id, undefined);
                                                        saveAs(file, "export-" + execution.label + "_" + execution.id + ".proof");
                                                    }
                                                }}
                                            >
                                                {t('action.export')}
                                            </Button>
                                            <Button
                                                variant={"outlined"}
                                                color={"error"}
                                                onClick={(): void => {
                                                    setDeleteExecutionDialogOpen(true)
                                                }}
                                            >
                                                {t("action.delete")}
                                            </Button>
                                        </ButtonGroup>

                                    </Stack>
                                </Grid>
                            </Grid>
                            <Stack spacing={1}>
                                <ExecutionSettingsPanel execution={execution}/>
                                <Paper variant={"outlined"}>
                                    <Box height={"calc(80vh - 400px)"}>
                                        <ReactFlow<TBlock, TEdge>
                                            id={"monitoring"}
                                            key={"monitoring"}
                                            fitView={true}
                                            zoomOnScroll={false}
                                            zoomOnDoubleClick={false}
                                            zoomOnPinch={false}
                                            draggable={false}
                                            panOnDrag={false}
                                            elementsSelectable={false}
                                            panOnScroll={false}
                                            style={{borderRadius: "5px"}}
                                            nodes={nodes}
                                            edges={edges}
                                            proOptions={{account: "paid-pro", hideAttribution: true}}
                                            nodeTypes={nodeTypes}
                                            edgeTypes={edgeTypes}
                                            colorMode={mode}
                                            nodesFocusable={false}
                                            nodesConnectable={false}
                                            nodesDraggable={false}
                                            onNodeClick={(_event: any, node) => {
                                                setAppId(`block.${node.data.id}.execution.${executionId}`)
                                            }}
                                        />
                                    </Box>
                                </Paper>
                            </Stack>
                        </Box>
                    </Paper>
                }
            </Box>
            <Dialog
                maxWidth={"xl"}
                fullWidth={true}
                onClose={(): void => setAppId(undefined)}
                open={!!appId}
            >
                <Box
                    style={{background: theme.palette.background.paper}}
                    padding={1}
                >
                    <DialogTitle>{t("dialog.header.logs")}{logSourceName ? ` — ${logSourceName}` : ""}</DialogTitle>
                    <DialogContent>
                        <Paper variant={"outlined"}>
                            <LogViewer
                                level={level}
                                messages={messages}
                                setMessages={setMessages}
                                follow={follow}
                                appId={appId}
                            />
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Stack paddingX={3} direction={"row"} alignItems={"center"} flexGrow={1}>
                            <Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={follow}
                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                                setFollow(event?.target.checked)
                                            }}
                                            name="notifications"
                                        />
                                    }
                                    label={follow ? t("action.follow") : t("action.notFollow")}
                                />
                            </Box>
                            <Box>
                                <ToggleButtonGroup
                                    size={"small"}
                                    color={"primary"}
                                    value={level}
                                    exclusive={true}
                                    onChange={(event: any): void => {
                                        const value: string = event.target.value;
                                        setLevel(value);
                                    }}
                                >
                                    <ToggleButton color={"info"} value="INFO">INFO</ToggleButton>
                                    <ToggleButton color={"warning"} value="WARN">WARN</ToggleButton>
                                    <ToggleButton color={"error"} value="ERROR">ERROR</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                            <Box flex={1}></Box>
                            <Box>
                                <Button
                                    onClick={(): void => {
                                        const text: string = messages.map(message => message.body).join("");
                                        const blob = new Blob([text], {type: 'text/plain'});
                                        const url: string = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = `logs-${appId}-${new Date().toISOString()}.log`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(url);
                                    }}
                                >
                                    {t("action.download")}
                                </Button>
                            </Box>
                            <Box>
                                <Button
                                    onClick={(): void => {
                                        setMessages([]);
                                    }}
                                >
                                    {t("action.clear")}
                                </Button>
                            </Box>
                        </Stack>
                    </DialogActions>
                </Box>
            </Dialog>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteExecutionDialogOpen}
                setOpen={setDeleteExecutionDialogOpen}
                callback={() => {
                    if (execution?.id) {
                        executionDeletion
                            .mutateAsync(execution.id)
                            .then((): void => {
                                navigate(`/monitoring/`);
                            })
                            .catch((): void => {
                                navigate(`/monitoring/`);
                            });
                    }
                }}
            />
        </Fragment>
    );

};

export default MonitoringDetail;