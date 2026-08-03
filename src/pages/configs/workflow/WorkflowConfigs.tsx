import {Fragment, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {Box, Button, Paper, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {WorkflowListing, WorkflowPagingModelListing} from "@webis/proof-config-manager-client";
import {ArrowForwardRounded, EditNoteRounded} from "@mui/icons-material";
import {useIsFetching, useQuery, UseQueryResult} from "@tanstack/react-query";
import {DEFAULT_CONFIGS_SORTING, DEFAULT_FILTER, DEFAULT_PAGINATION, WORKFLOWS_KEY} from "../../../utils/constants.ts";
import PageHeader from "../../../app/components/PageHeader.tsx";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {searchWorkflowsQueryOptions} from "../../../query/options/workflowQueryOptions.tsx";

const WorkflowConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage} = useContext<IAppContext>(AppContext);

    const [workflowsRequest, setWorkflowsRequest] = useState<any>();
    const [workflowsSortModel, setWorkflowsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [workflowsFilterModel, setWorkflowsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [workflowsPaginationModel, setWorkflowsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);

    const isFetching: number = useIsFetching({queryKey: [WORKFLOWS_KEY, workflowsRequest], exact: true});

    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: t("word.id"),
            width: 300,
            editable: false
        },
        {
            field: "label",
            headerName: t("word.label"),
            width: 500,
            editable: false
        },
        {
            field: "description",
            headerName: t("word.description"),
            flex: 1,
            editable: false
        }
    ];

    useEffect((): void => {
        setWorkflowsRequest({
            sort: workflowsSortModel,
            filter: workflowsFilterModel,
            pagination: workflowsPaginationModel
        });
    }, [workflowsSortModel, workflowsFilterModel, workflowsPaginationModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setWorkflowsSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setWorkflowsFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setWorkflowsPaginationModel(paginationModel);
    }, []);

    const {data: workflows}: UseQueryResult<WorkflowPagingModelListing, AxiosError> = useQuery(searchWorkflowsQueryOptions(workflowsRequest));

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}>
                <Paper>
                    <Box padding={3}>
                        <PageHeader
                            icon={
                                <Fragment>
                                    <EditNoteRounded
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                </Fragment>
                            }
                            headerKey={"page.header.configs.workflows"}
                            tooltipTitle={t("tooltip.workflows")}
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                    {/* <Tooltip title={t("action.importWorkflow")}>
                                        <Button
                                            startIcon={<Upload/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateWorkflowId(undefined);
                                                navigate("/configs/workflows/import")
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip> */}
                                    <Tooltip title={t("action.goToEditor")}>
                                        <Button
                                            startIcon={<ArrowForwardRounded/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                navigate("/editor")
                                            }}
                                            color={"primary"}>
                                            {t("action.toEditor")}
                                        </Button>
                                    </Tooltip>
                                </Fragment>
                            }
                        />
                        <DataGrid<WorkflowListing>
                            loading={!!isFetching}
                            rows={workflows?.results ?? []}
                            rowCount={workflows?.rowCount ?? 0}
                            columns={columns}
                            sortingMode={"server"}
                            paginationMode={"server"}
                            filterMode={"server"}
                            sortModel={workflowsSortModel}
                            filterModel={workflowsFilterModel}
                            paginationModel={workflowsPaginationModel}
                            onSortModelChange={(sortModel: GridSortModel) => {
                                onSortModelChange(sortModel);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel);
                            }}
                            onRowClick={(params: GridRowParams<WorkflowListing>): void => {
                                if (params.row.id) {
                                    publishEntityMessage(params.row.id, "workflows")
                                    navigate(`/configs/workflows/${params.row.id}`);
                                }
                            }}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default WorkflowConfigs;