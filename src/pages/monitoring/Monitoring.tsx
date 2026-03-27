import {Fragment, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {Alert, Box, Button, ButtonGroup, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import StopIcon from '@mui/icons-material/Stop';
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRenderCellParams, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {IMonitoringContext} from "../../provider/MonitoringProvider.tsx";
import Grid from "@mui/material/Grid2";
import {ExecutionListing, ExecutionListingStatusEnum} from "@webis/proof-config-manager-client";
import {QueryClient, useIsFetching, useMutation, UseMutationResult, useQueryClient} from "@tanstack/react-query";
import {EXECUTIONS_KEY, INVALIDATION_KEYS} from "../../utils/constants.ts";
import {IOrchestrationService} from "../../services/interfaces/IOrchestrationService.ts";
import OrchestrationService from "../../services/OrchestrationService.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {MonitoringContext} from "../../provider/IMonitoringContext.tsx";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";
import {RestartAlt, UploadRounded} from "@mui/icons-material";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import {IExecutionService} from "../../services/interfaces/IExecutionService.ts";
import ExecutionService from "../../services/ExecutionService.ts";
import {AxiosError} from "axios";
import {isAdmin} from "../../utils/auth.ts";
import ConfirmDialog from "../../app/components/ConfirmDialog.tsx";

const Monitoring: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const theme: Theme = useTheme();
    const {settings, sessionKey}: IAppContext = useContext<IAppContext>(AppContext);
    const [deleteExecution, setDeleteExecution] = useState<string | undefined>(undefined);
    const {user}: AuthContextProps = useAuth();
    const queryClient: QueryClient = useQueryClient();

    const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
    const [value, setValue] = useState<File | undefined>(undefined);
    const [error, setError] = useState<string>();
    const {
        updateExecutionId,
        filteredExecutions,
        sortModel,
        filterModel,
        onFilterModelChange,
        onPaginationModelChange,
        paginationModel,
        onSortModelChange,
        executionRequest,
        deleteExecutionMutation
    } = useContext<IMonitoringContext>(MonitoringContext);

    const orchestrationService: IOrchestrationService = useMemo((): IOrchestrationService => new OrchestrationService(settings.executionBasePath, user?.access_token), [settings.executionBasePath, user?.access_token]);
    const executionService: IExecutionService = useMemo((): IExecutionService => new ExecutionService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const isFetching: number = useIsFetching({queryKey: [EXECUTIONS_KEY, executionRequest], exact: true});

    const columns: GridColDef<ExecutionListing>[] = [
        {
            field: "label",
            headerName: t("word.label"),
            width: 250,
            filterable: false,
            editable: false
        },
        {
            field: "description",
            headerName: t("word.description"),
            width: 250,
            filterable: false,
            editable: false
        },
        {
            field: "workflow",
            headerName: t("word.workflow"),
            width: 250,
            filterable: false,
            editable: false,
            valueGetter: (_value: any, row: ExecutionListing): string => {
                return row.workflow?.label ?? "";
            }
        },
        {
            field: "id",
            headerName: t("word.id"),
            width: 250,
            filterable: false,
            editable: false
        },
        {
            field: "status",
            headerName: t("word.status"),
            width: 150,
            filterable: false,
            editable: false,
            renderCell: (params: GridRenderCellParams<ExecutionListing>): ReactNode => {
                return (
                    <Chip label={params.row.status}/>
                );
            }
        },
        {
            field: "startedAt",
            headerName: t("word.startedAt"),
            width: 150,
            filterable: false,
            editable: false,
            renderCell: (params: GridRenderCellParams<ExecutionListing>): ReactNode => {
                return (
                    params.row.startedAt ? <Chip label={dayjs(params.row.startedAt).format("DD.MM.YYYY HH:mm")}/> : ""
                );
            }
        },
        {
            field: "stoppedAt",
            headerName: t("word.stoppedAt"),
            width: 150,
            filterable: false,
            editable: false,
            renderCell: (params: GridRenderCellParams<ExecutionListing>): ReactNode => {
                return (
                    params.row.startedAt ? <Chip label={dayjs(params.row.stoppedAt).format("DD.MM.YYYY HH:mm")}/> : ""
                );
            }
        },
        {
            field: "buttonGroup",
            headerName: t("word.actions"),
            flex: 1,
            align: "right",
            headerAlign: "right",
            sortable: false,
            editable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams<ExecutionListing>): ReactNode => (
                <ButtonGroup
                    size="small"
                    variant="outlined"
                    onClick={async (e): Promise<void> => {
                        e.stopPropagation()
                    }}
                >
                    <Tooltip
                        title={t("action.stop")}
                    >
                        <Box>
                            <IconButton
                                color="error"
                                disabled={params.row.status === ExecutionListingStatusEnum.Stopped || params.row.status === ExecutionListingStatusEnum.Aborted || params.row.status === ExecutionListingStatusEnum.ShutDown}
                                onClick={async (e): Promise<void> => {
                                    e.stopPropagation()
                                    if (params.row.id) await orchestrationService.abortExecution(undefined, params.row.id)
                                }}
                            >
                                <StopIcon/>
                            </IconButton>
                        </Box>
                    </Tooltip>
                    <Tooltip
                        title={t('action.restart')}
                    >
                        <Box>
                            <IconButton
                                disabled={params.row.status !== ExecutionListingStatusEnum.Stopped && params.row.status !== ExecutionListingStatusEnum.Aborted && params.row.status !== ExecutionListingStatusEnum.ShutDown}
                                color="primary"
                                onClick={async (e): Promise<void> => {
                                    e.stopPropagation()
                                    if (params.row.id) await orchestrationService.startExecution(undefined, params.row.id)
                                }}
                            >
                                <RestartAlt/>
                            </IconButton>
                        </Box>
                    </Tooltip>
                    <Tooltip
                        title={t("action.delete")}
                    >
                        <Box>
                            <IconButton
                                color="error"
                                onClick={async (e): Promise<void> => {
                                    e.stopPropagation()
                                    setDeleteExecution(params.row.id)
                                }}
                            >
                                <DeleteIcon/>
                            </IconButton>
                        </Box>
                    </Tooltip>
                </ButtonGroup>
            )
        }
    ];

    const handleChange: (e: any) => void = (e: any): void => {
        if (e.target.files && e.target.files[0]) {
            setValue(e.target.files[0]);
            setError(undefined);
        }
    };


    const mutation: UseMutationResult<void, AxiosError, File, any> = useMutation({
        retry: false,
        mutationFn: async (file: File): Promise<void> => {
            await executionService.importExecution(file, undefined, sessionKey)
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [EXECUTIONS_KEY]});
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[EXECUTIONS_KEY]) await queryClient.invalidateQueries({queryKey: [queryKey], exact: false});
        }
    });

    useEffect(() => {
        updateExecutionId(undefined)
    }, [updateExecutionId]);

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}>
                <Paper>
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
                                    <Typography variant={"h4"}>{t("page.header.monitoring.index")}</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{sm: 12, md: "auto"}}>
                                <Stack
                                    direction={"row"}
                                    justifyContent={"flex-end"}
                                >
                                    <ButtonGroup>
                                        <Button
                                            color={"primary"}
                                            variant={"outlined"}
                                            onClick={(): void => navigate("/monitoring/execution")}
                                        >
                                            {t("action.run")}
                                        </Button>
                                        {
                                            user && isAdmin(user) && <Button
                                                color={"primary"}
                                                variant={"outlined"}
                                                onClick={(): void => setImportDialogOpen(true)}
                                            >
                                                {t("action.import")}
                                            </Button>
                                        }
                                    </ButtonGroup>
                                </Stack>
                            </Grid>
                        </Grid>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <DataGrid<ExecutionListing>
                                loading={!!isFetching}
                                rows={filteredExecutions?.results ?? []}
                                rowCount={filteredExecutions?.rowCount ?? 0}
                                columns={columns}
                                sortingMode={"server"}
                                paginationMode={"server"}
                                filterMode={"server"}
                                filterDebounceMs={500}
                                sortModel={sortModel}
                                filterModel={filterModel}
                                paginationModel={paginationModel}
                                onSortModelChange={(model: GridSortModel): void => onSortModelChange(model)}
                                onFilterModelChange={(model: GridFilterModel): void => onFilterModelChange(model)}
                                onPaginationModelChange={(model: GridPaginationModel): void => onPaginationModelChange(model)}
                                onRowClick={(params: GridRowParams<ExecutionListing>): void => navigate("/monitoring/" + params.row.id)}
                                pageSizeOptions={[10, 25, 50, 100]}
                                disableRowSelectionOnClick={true}
                                checkboxSelection={false}
                                pagination={true}
                            />
                        </div>
                    </Box>
                </Paper>
            </Box>
            <Dialog
                maxWidth={"xl"}
                fullWidth={true}
                onClose={(): void => setImportDialogOpen(false)}
                open={importDialogOpen}
            >
                <Box
                    style={{background: theme.palette.background.paper}}
                    padding={1}
                >
                    <DialogTitle>{t("dialog.header.import")}</DialogTitle>
                    <DialogContent>
                        <Stack direction={"row"} spacing={1} paddingBottom={1} alignItems={"center"}>
                            <input
                                id={"file"}
                                onChange={handleChange}
                                type={"file"}
                                accept={".proof"}
                                multiple={false}
                                style={{display: "none"}}
                            />
                            <label
                                htmlFor={"file"}
                                style={{
                                    cursor: "pointer",
                                    color: theme.palette.primary.main,
                                    border: "1px solid " + theme.palette.primary.main,
                                    padding: "5px 20px",
                                    borderRadius: "4px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Stack direction={"row"} spacing={1}>
                                    <UploadRounded/>
                                    <Typography variant={"body1"}>
                                        Upload
                                    </Typography>
                                </Stack>
                            </label>
                        </Stack>
                        <Stack padding={1}>
                            {
                                error && <Alert sx={{marginBottom: 2}} severity={"warning"}>
                                    {error}
                                </Alert>
                            }
                            {
                                value && <Fragment>
                                    <Paper sx={{background: theme.palette.elevated.default, width: "100%"}}>
                                        <Box padding={1} width={"100%"}>
                                            <Typography>{value?.name}</Typography>
                                            <Typography>{value?.size / 1000} kB</Typography>
                                        </Box>
                                    </Paper>
                                </Fragment>
                            }
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Stack paddingX={3} direction={"row"} alignItems={"center"} flexGrow={1}>
                            <Box>
                                <Button
                                    onClick={async (): Promise<void> => {
                                        if (value) {
                                            await mutation
                                                .mutateAsync(value)
                                                .finally(() => setImportDialogOpen(false))
                                        }
                                    }}
                                >
                                    {t("action.import")}
                                </Button>
                            </Box>
                        </Stack>
                    </DialogActions>
                </Box>
            </Dialog>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={!!deleteExecution}
                setOpen={() => setDeleteExecution(undefined)}
                callback={() => {
                    if (deleteExecution) {
                        updateExecutionId(undefined)
                        deleteExecutionMutation
                            .mutateAsync(deleteExecution)
                            .catch((): void => {
                                navigate(`/monitoring/`);
                            });
                    }
                }}
            />
        </Fragment>
    );

};

export default Monitoring;