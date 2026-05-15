import {Fragment, ReactNode, useContext} from "react";
import {Box, Button, Paper, Tooltip} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {TemplateListing} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useIsFetching} from "@tanstack/react-query";
import {TEMPLATES_KEY} from "../../../utils/constants.ts";
import {EditNoteRounded} from "@mui/icons-material";
import ConfigHeader from "../components/ConfigHeader.tsx";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";

const TemplateConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();

    const {
        templates,
        templatesSortModel,
        templatesFilterModel,
        templatesPaginationModel,
        onSortModelChange,
        onFilterModelChange,
        onPaginationModelChange,
        templatesRequest,
        updateTemplateId
    } = useContext(ConfigContext);

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
                                                updateTemplateId(undefined);
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
                                onSortModelChange(sortModel, false, true, false, false, false);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel, false, true, false, false, false);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel, false, true, false, false, false);
                            }}
                            onRowClick={(params: GridRowParams<TemplateListing>): void => navigate(`/configs/templates/${params.row.id}`)}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );
}

export default TemplateConfigs;