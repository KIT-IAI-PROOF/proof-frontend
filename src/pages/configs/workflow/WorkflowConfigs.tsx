import {Fragment, ReactNode, useContext} from "react";
import {Box, Button, Paper, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {WorkflowListing} from "@kit-iai-proof/proof-config-manager-client";
import {ArrowForwardRounded, EditNoteRounded} from "@mui/icons-material";
import {useIsFetching} from "@tanstack/react-query";
import {WORKFLOWS_KEY} from "../../../utils/constants.ts";
import ConfigHeader from "../components/ConfigHeader.tsx";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";

const WorkflowConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();

    const {
        workflows,
        workflowsSortModel,
        workflowsFilterModel,
        workflowsPaginationModel,
        onSortModelChange,
        onFilterModelChange,
        onPaginationModelChange,
        workflowsRequest,
        updateWorkflowId
    } = useContext(ConfigContext);

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

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}>
                <Paper>
                    <Box padding={3}>
                        <ConfigHeader
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
                                                updateWorkflowId(undefined);
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
                                onSortModelChange(sortModel, true, false, false, false, false);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel, true, false, false, false, false);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel, true, false, false, false, false);
                            }}
                            onRowClick={(params: GridRowParams<WorkflowListing>): void => navigate(`/configs/workflows/${params.row.id}`)}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default WorkflowConfigs;