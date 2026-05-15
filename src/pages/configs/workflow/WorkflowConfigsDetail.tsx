import {Fragment, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {NavigateFunction, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {Alert, Box, Button, Divider, Paper, Stack, Typography} from "@mui/material";
import WorkflowBasicSettingsPanel from "../components/workflow/WorkflowBasicSettingsPanel.tsx";
import {ExecutionListing, StepBasedConfigurationDetail, WorkflowDetailCommunicationParadigmEnum, WorkflowDetailSimulationStrategyEnum} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {useIsFetching, useQuery, UseQueryResult} from "@tanstack/react-query";
import {EXECUTIONS_KEY, STEPBASEDCONFIG_DEFAULT, WORKFLOWS_KEY} from "../../../utils/constants.ts";
import ConfigHeader from "../components/ConfigHeader.tsx";
import WorkflowStepBasedConfigPanel from "../components/workflow/WorkflowStepBasedConfigPanel.tsx";
import {EditNoteRounded} from "@mui/icons-material";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {AxiosError} from "axios";
import {IWorkflowService} from "../../../services/interfaces/IWorkflowService.ts";
import WorkflowService from "../../../services/WorkflowService.ts";
import {useAuth} from "react-oidc-context";

const MonitoringDetail: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const {user} = useAuth();
    const {workflowId} = useParams();
    const [searchParams] = useSearchParams();
    const {
        hasUnsavedChanges,
        updateHasUnsavedChanges,
        updateAllowNavigation,
        settings,
        updateLastUsedWorkflowId
    } = useContext<IAppContext>(AppContext);
    const {workflow, updateWorkflowId, workflowMutation, workflowDeletion} = useContext(ConfigContext);
    const navigate: NavigateFunction = useNavigate();
    const returnToWorkflowId: string | null = searchParams.get("workflowId");

    const workflowService: IWorkflowService = useMemo((): IWorkflowService => new WorkflowService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);
    const isFetching: number = useIsFetching({queryKey: [WORKFLOWS_KEY, workflowId], exact: true});

    const [stepBasedConfig, setStepBasedConfig] = useState<StepBasedConfigurationDetail | undefined>(undefined);
    const [communicationParadigm, setCommunicationParadigm] = useState<WorkflowDetailCommunicationParadigmEnum | undefined>(undefined);
    const [simulationStrategy, setSimulationStrategy] = useState<WorkflowDetailSimulationStrategyEnum | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [label, setLabel] = useState<string | undefined>(undefined);
    const [id, setId] = useState<string | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [labelError, setLabelError] = useState<boolean>(false);
    const [paradigmError, setParadigmError] = useState<boolean>(false);
    const [simulationStrategyError, setSimulationStrategyError] = useState<boolean>(false);
    const [keyErrors, setKeyErrors] = useState<{ [key: string]: boolean }>({});

    const {data: executions}: UseQueryResult<ExecutionListing[], AxiosError> = useQuery({
        queryKey: [EXECUTIONS_KEY, "workflow", workflowId],
        refetchOnWindowFocus: true,
        enabled: !!workflowId,
        retry: 2,
        queryFn: async ({signal}: any): Promise<ExecutionListing[]> => {
            return await workflowService.getExecutionsForWorkflow(workflowId!, signal);
        }
    });

    const handleSave = async () => {
        let valid = true;

        if (!label || label.trim() === '') {
            setLabelError(true);
            valid = false;
        } else {
            setLabelError(false);
        }

        if (!communicationParadigm) {
            setParadigmError(true);
            valid = false;
        } else {
            setParadigmError(false);
        }

        if (!simulationStrategy) {
            setSimulationStrategyError(true);
            valid = false;
        } else {
            setSimulationStrategyError(false);
        }

        Object.entries(keyErrors).forEach(([__key, value]) => {
            if (value) valid = false;
        })

        if (!valid) return

        await workflowMutation
            .mutateAsync({
                ...workflow,
                label: label,
                communicationParadigm: communicationParadigm,
                simulationStrategy: simulationStrategy,
                description: description,
                stepBasedConfig: stepBasedConfig,
                id: id
            })
        if (hasUnsavedChanges) updateHasUnsavedChanges(false)
    }

    useEffect((): void => {
        setLabel(workflow?.label);
        setCommunicationParadigm(workflow?.communicationParadigm ?? WorkflowDetailCommunicationParadigmEnum.Stepbased);
        setSimulationStrategy(workflow?.simulationStrategy ?? WorkflowDetailSimulationStrategyEnum.WaitAndContinue);
        setDescription(workflow?.description ?? workflow?.label);
        setStepBasedConfig(workflow?.stepBasedConfig ?? STEPBASEDCONFIG_DEFAULT);
        setId(workflow?.id);
    }, [workflow?.simulationStrategy, workflow?.communicationParadigm, workflow?.description, workflow?.id, workflow?.label, workflow?.stepBasedConfig]);

    useEffect(() => {
        if (workflowId) updateWorkflowId(workflowId);
    }, [updateWorkflowId, workflowId]);

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}
            >
                {
                    workflow && !isFetching && <Paper elevation={0} sx={{pb: 3}}>
                        <Box padding={3}>
                            <ConfigHeader
                                headerKey={"page.header.configs.workflow"}
                                tooltipTitle={"tooltip.workflow"}
                                subHeaderValue={workflow?.label ?? ""}
                                icon={
                                    <Fragment>
                                        <EditNoteRounded
                                            color={"primary"}
                                            fontSize={"large"}
                                        />
                                    </Fragment>
                                }
                                buttons={
                                    <Fragment>
                                        <Button
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                navigate(returnToWorkflowId ? `/editor/${returnToWorkflowId}` : `/configs/workflows/`, returnToWorkflowId ? {state: {from: location.pathname}} : {});
                                            }}
                                            color={"primary"}>
                                            {t("action.close")}
                                        </Button>
                                        <Button
                                            disabled={!hasUnsavedChanges}
                                            variant={"outlined"}
                                            onClick={handleSave}
                                            color={"primary"}>
                                            {t("action.save")}
                                        </Button>
                                        <Button
                                            variant={"outlined"}
                                            color={"error"}
                                            onClick={(): void => {
                                                setDeleteDialogOpen(true)
                                            }}
                                        >
                                            {t("action.delete")}
                                        </Button>
                                    </Fragment>
                                }
                            />
                            <Divider/>
                            <WorkflowBasicSettingsPanel
                                id={id}
                                setId={setId}
                                label={label}
                                labelError={labelError}
                                setLabel={setLabel}
                                description={description}
                                setDescription={setDescription}
                                communicationParadigm={communicationParadigm}
                                paradigmError={paradigmError}
                                setCommunicationParadigm={setCommunicationParadigm}
                                simulationStrategy={simulationStrategy}
                                simulationStrategyError={simulationStrategyError}
                                setSimulationStrategy={setSimulationStrategy}
                                stepBasedConfig={stepBasedConfig}
                                modifiedBy={workflow.lastModifiedBy!}
                                createdBy={workflow.createdBy!}
                                modifiedDate={new Date(workflow.lastModifiedDate!)}
                                creationDate={new Date(workflow.creationDate!)}
                            />
                            {
                                communicationParadigm === WorkflowDetailCommunicationParadigmEnum.Stepbased &&
                                <WorkflowStepBasedConfigPanel
                                    stepBasedConfig={stepBasedConfig}
                                    setStepBasedConfig={setStepBasedConfig}
                                    keyErrors={keyErrors}
                                    setKeyErrors={setKeyErrors}
                                />
                            }
                        </Box>
                    </Paper>
                }
            </Box>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                extraContent={
                    <Fragment>
                        {
                            executions && executions.length > 0 && <Alert severity="error">
                                <Typography paddingBottom={1}>{t("action.deleteAllExecutions")}:</Typography>
                                {
                                    executions.map((execution: ExecutionListing): ReactNode => {
                                        return (
                                            <Fragment key={execution.id}>
                                                <Stack direction={"row"} spacing={1}>
                                                    <Typography>{execution.label}, {execution.id}</Typography>
                                                </Stack>
                                            </Fragment>
                                        );
                                    })
                                }
                            </Alert>
                        }
                    </Fragment>
                }
                callback={() => {
                    updateWorkflowId(undefined);
                    updateAllowNavigation(true)
                    if (workflow?.id) {
                        updateWorkflowId(undefined)
                        workflowDeletion
                            .mutateAsync(workflow.id)
                            .then((): void => {
                                updateLastUsedWorkflowId("");
                                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                                updateAllowNavigation(false);
                                navigate(returnToWorkflowId ? `/editor/` : `/configs/workflows/`);
                            })
                            .catch((): void => {
                                navigate(returnToWorkflowId ? `/editor/` : `/configs/workflows/`);
                            });
                    }
                }}
            />
        </Fragment>
    );
};

export default MonitoringDetail;