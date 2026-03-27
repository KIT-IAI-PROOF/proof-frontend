import {Fragment, ReactNode, useContext, useEffect, useMemo} from "react";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {Box, Button, ButtonGroup, Paper, Stack, Tooltip, Typography} from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import {useTranslation} from "react-i18next";
import {IMonitoringContext} from "../../provider/MonitoringProvider";
import PreselectedStart from "./components/PreselectedStart.tsx";
import UnselectedStart from "./components/UnselectedStart.tsx";
import Grid from "@mui/material/Grid2";
import {
    AttachmentDetail,
    BlockDetail,
    ExecutionDetail,
    ExecutionDetailStatusEnum,
    InputDetail
} from "@webis/proof-config-manager-client";
import {Info} from "@mui/icons-material";
import {IOrchestrationService} from "../../services/interfaces/IOrchestrationService.ts";
import OrchestrationService from "../../services/OrchestrationService.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {MonitoringContext} from "../../provider/IMonitoringContext.tsx";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

const MonitoringStart: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const {workflowId} = useParams();
    const navigate: NavigateFunction = useNavigate();
    const {user}: AuthContextProps = useAuth();
    const {
        workflow,
        executions,
        executionsMutation,
        appliedInputs,
        executionLabel,
        executionDescription,
        jsonError,
        updateMissingRequiredFields
    } = useContext<IMonitoringContext>(MonitoringContext);
    const {settings}: IAppContext = useContext<IAppContext>(AppContext);

    const orchestrationService: IOrchestrationService = useMemo((): IOrchestrationService => new OrchestrationService(settings.executionBasePath, user?.access_token), [settings.executionBasePath, user?.access_token]);

    useEffect(() => {
        updateMissingRequiredFields([])
    }, [updateMissingRequiredFields, workflow]);

    const validateRequiredFields: () => boolean = (): boolean => {
        const missing: string[] = [];

        executions?.forEach((execution: ExecutionDetail): void => {
            if (execution.status !== ExecutionDetailStatusEnum.Stopped && execution.status !== ExecutionDetailStatusEnum.Aborted && execution.status !== ExecutionDetailStatusEnum.ShutDown) {
                missing.push('executionRunning:' + execution.label + '__' + execution.status);
            }
        })

        if (workflow?.blocks?.length === 0) {
            missing.push('missingBlock')
        }

        workflow?.blocks?.forEach((block: BlockDetail): void => {
            if (block.inputs?.length === 0 && block.outputs?.length === 0) {
                if (!missing.includes('missingHandles:' + block.id + '__' + block.label))
                    missing.push('missingHandles:' + block.id + '__' + block.label);
            }

            block.inputs?.forEach((handle: InputDetail): void => {
                if (handle.required && handle.communicationType?.includes("_STATIC")) {
                    const value: string = appliedInputs[handle.id!];
                    if (value === undefined || value === null || value.toString().trim() === "") {
                        missing.push(handle.id!)
                    }
                }
            });
            if (!block.program) {
                if (!missing.includes('missingProgram:' + block.id + '__' + block.label!))
                    missing.push('missingProgram:' + block.id + '__' + block.label!);
            } else if (!block.program.entryPoint) {
                if (!missing.includes('missingProgramEntryPoint:' + block.program.id + '__' + block.program.label!))
                    missing.push('missingProgramEntryPoint:' + block.program.id + '__' + block.program.label!);
            } else {
                const entryPoint = block.program.attachments!.find((attachment: AttachmentDetail) => attachment.id === block.program?.entryPoint)
                if (!entryPoint?.path || entryPoint.path.trim() === "") {
                    if (!missing.includes('missingEntryPointPath:' + entryPoint?.id + '__' + entryPoint?.label))
                        missing.push('missingEntryPointPath:' + entryPoint?.id + '__' + entryPoint?.label);
                }
            }
        });

        if (!executionLabel || executionLabel === '') {
            missing.push('missingLabel');
        }

        if (!workflow?.simulationStrategy) {
            missing.push('missingStrategy');
        }

        if (!workflow?.communicationParadigm) {
            missing.push('missingParadigm');
        }

        updateMissingRequiredFields(missing);
        return missing.length === 0;
    };

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}
            >
                <Paper elevation={0}>
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
                                        fontSize={"large"}/>
                                    <Typography variant={"h4"}>
                                        {t("page.header.execution")}
                                        <Tooltip title={t("tooltip.execution")}>
                                            <Info sx={{ml: 1, cursor: "pointer"}}/>
                                        </Tooltip>
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{sm: 12, md: "auto"}}>
                                <Stack
                                    direction={"row"}
                                    justifyContent={"flex-end"}>
                                    <ButtonGroup>
                                        <Button
                                            color={"primary"}
                                            variant={"outlined"}
                                            disabled={!workflowId || Object.values(jsonError).some((error: string | undefined): boolean => error !== undefined)}
                                            onClick={async (): Promise<void> => {
                                                if (!validateRequiredFields()) return;
                                                await executionsMutation
                                                    .mutateAsync({
                                                        options: {
                                                            override: false,
                                                            manual: false
                                                        },
                                                        workflow: workflow,
                                                        appliedInputs: appliedInputs,
                                                        label: executionLabel,
                                                        description: executionDescription,
                                                        status: ExecutionDetailStatusEnum.Unknown
                                                    })
                                                    .then(async (result: ExecutionDetail): Promise<void> => {
                                                        if (result.id) {
                                                            navigate(`/monitoring/${result.id}`)
                                                            await orchestrationService.startExecution(undefined, result.id)
                                                        }
                                                    })
                                            }}
                                        >
                                            {t("action.execute")}
                                        </Button>
                                    </ButtonGroup>
                                </Stack>
                            </Grid>
                        </Grid>
                        <Stack spacing={1}>
                            {
                                workflowId ?
                                    <PreselectedStart workflowId={workflowId}></PreselectedStart>
                                    :
                                    <UnselectedStart/>
                            }
                        </Stack>
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default MonitoringStart;