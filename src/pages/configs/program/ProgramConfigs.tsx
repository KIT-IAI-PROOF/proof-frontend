import {Fragment, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {Box, Button, Paper, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {ProgramListing, ProgramPagingModelListing} from "@kit-iai-proof/proof-config-manager-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {EditNoteRounded} from "@mui/icons-material";
import {useIsFetching, useQuery, UseQueryResult} from "@tanstack/react-query";
import {DEFAULT_CONFIGS_SORTING, DEFAULT_FILTER, DEFAULT_PAGINATION, PROGRAMS_KEY} from "../../../utils/constants.ts";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../../../app/components/PageHeader.tsx";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {searchProgramsQueryOptions} from "../../../query/options/programQueryOptions.tsx";

const ProgramConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage} = useContext<IAppContext>(AppContext);

    const [programsRequest, setProgramsRequest] = useState<any>();
    const [programsSortModel, setProgramsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [programsFilterModel, setProgramsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [programsPaginationModel, setProgramsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);

    const isFetching: number = useIsFetching({queryKey: [PROGRAMS_KEY, programsRequest], exact: true});

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
        setProgramsRequest({
            sort: programsSortModel,
            filter: programsFilterModel,
            pagination: programsPaginationModel
        })
    }, [programsSortModel, programsFilterModel, programsPaginationModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setProgramsSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setProgramsFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setProgramsPaginationModel(paginationModel);
    }, []);

    const {data: programs}: UseQueryResult<ProgramPagingModelListing, AxiosError> = useQuery(searchProgramsQueryOptions(programsRequest));

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
                            headerKey={"page.header.configs.programs"}
                            tooltipTitle={t("tooltip.programs")}
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                    <Tooltip title={t("action.addProgram")}>
                                        <Button
                                            startIcon={<AddIcon/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                navigate("/configs/programs/create")
                                            }}
                                            color={"primary"}>
                                            {t("action.add")}
                                        </Button>
                                    </Tooltip>
                                    {/* <Tooltip title={t("action.importProgram")}>
                                        <Button
                                            startIcon={<Upload/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateProgramId(undefined);
                                                navigate("/configs/programs/import")
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip> */}
                                </Fragment>
                            }
                        />
                        <DataGrid<ProgramListing>
                            loading={!!isFetching}
                            rows={programs?.results ?? []}
                            rowCount={programs?.rowCount ?? 0}
                            columns={columns}
                            sortingMode={"server"}
                            paginationMode={"server"}
                            filterMode={"server"}
                            sortModel={programsSortModel}
                            filterModel={programsFilterModel}
                            paginationModel={programsPaginationModel}
                            onSortModelChange={(sortModel: GridSortModel) => {
                                onSortModelChange(sortModel);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel);
                            }}
                            onRowClick={(params: GridRowParams<ProgramListing>): void => {
                                if (params.row.id) {
                                    publishEntityMessage(params.row.id, "programs")
                                    navigate(`/configs/programs/${params.row.id}`);
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

export default ProgramConfigs;