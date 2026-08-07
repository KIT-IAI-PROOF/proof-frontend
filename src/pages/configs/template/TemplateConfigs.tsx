import {Fragment, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {Box, Button, Paper, Tooltip} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {TemplateListing, TemplatePagingModelListing} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useIsFetching, useQuery, UseQueryResult} from "@tanstack/react-query";
import {DEFAULT_FILTER, DEFAULT_PAGINATION, DEFAULT_TEMPLATES_SORTING, TEMPLATES_KEY} from "../../../utils/constants.ts";
import {EditNoteRounded} from "@mui/icons-material";
import PageHeader from "../../../app/components/PageHeader.tsx";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {searchTemplatesQueryOptions} from "../../../query/options/templateQueryOptions.tsx";

const TemplateConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage} = useContext<IAppContext>(AppContext);

    const [templatesRequest, setTemplatesRequest] = useState<any>();
    const [templatesSortModel, setTemplatesSortModel] = useState<GridSortModel>(DEFAULT_TEMPLATES_SORTING);
    const [templatesFilterModel, setTemplatesFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [templatesPaginationModel, setTemplatesPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);

    const isFetching: number = useIsFetching({queryKey: [TEMPLATES_KEY, templatesRequest], exact: true});

    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: t("word.id"),
            width: 300,
            editable: false
        },
        {
            field: "name",
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
        setTemplatesRequest({
            sort: templatesSortModel,
            filter: templatesFilterModel,
            pagination: templatesPaginationModel
        })
    }, [templatesSortModel, templatesFilterModel, templatesPaginationModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setTemplatesSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setTemplatesFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setTemplatesPaginationModel(paginationModel);
    }, []);

    const {data: templates}: UseQueryResult<TemplatePagingModelListing, AxiosError> = useQuery(searchTemplatesQueryOptions(templatesRequest));

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
                            headerKey={"page.header.configs.templates"}
                            tooltipTitle={t("tooltip.templates")}
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                    <Tooltip title={t("action.addTemplate")}>
                                        <Button
                                            startIcon={<AddIcon/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                navigate("/configs/templates/create")
                                            }}
                                            color={"primary"}>
                                            {t("action.add")}
                                        </Button>
                                    </Tooltip>
                                    {/* <Tooltip title={t("action.importTemplate")}>
                                        <Button
                                            startIcon={<Upload/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateTemplateId(undefined);
                                                navigate("/configs/templates/import")
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip> */}
                                </Fragment>
                            }
                        />
                        <DataGrid<TemplateListing>
                            loading={!!isFetching}
                            rows={templates?.results ?? []}
                            rowCount={templates?.rowCount ?? 0}
                            columns={columns}
                            sortingMode={"server"}
                            paginationMode={"server"}
                            filterMode={"server"}
                            sortModel={templatesSortModel}
                            filterModel={templatesFilterModel}
                            paginationModel={templatesPaginationModel}
                            onSortModelChange={(sortModel: GridSortModel) => {
                                onSortModelChange(sortModel);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel);
                            }}
                            onRowClick={(params: GridRowParams<TemplateListing>): void => {
                                if (params.row.id) {
                                    publishEntityMessage(params.row.id, "templates")
                                    navigate(`/configs/templates/${params.row.id}`);
                                }
                            }}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );
}

export default TemplateConfigs;