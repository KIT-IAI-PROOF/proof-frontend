import {Fragment, ReactNode, useContext} from "react";
import {Box, Button, Paper, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {ProgramListing} from "@webis/proof-config-manager-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {EditNoteRounded} from "@mui/icons-material";
import {useIsFetching} from "@tanstack/react-query";
import {BLOCKS_KEY} from "../../../utils/constants.ts";
import AddIcon from "@mui/icons-material/Add";
import ConfigHeader from "../components/ConfigHeader.tsx";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";

const ProgramConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();

    const {
        programs,
        programsSortModel,
        programsFilterModel,
        programsPaginationModel,
        onSortModelChange,
        onFilterModelChange,
        onPaginationModelChange,
        blocksRequest,
        updateProgramId,
    } = useContext(ConfigContext);

    const isFetching: number = useIsFetching({queryKey: [BLOCKS_KEY, blocksRequest], exact: true});

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
                                                updateProgramId(undefined);
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
                                onSortModelChange(sortModel, false, false, false, true, false);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel, false, false, false, true, false);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel, false, false, false, true, false);
                            }}
                            onRowClick={(params: GridRowParams<ProgramListing>): void => navigate(`/configs/programs/${params.row.id}`)}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default ProgramConfigs;