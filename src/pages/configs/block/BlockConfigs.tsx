import {Fragment, useContext} from "react";
import {Box, Paper, Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {useTranslation} from "react-i18next";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {BlockListing} from "@kit-iai-proof/proof-config-manager-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {EditNoteRounded} from "@mui/icons-material";
import {useIsFetching} from "@tanstack/react-query";
import {BLOCKS_KEY} from "../../../utils/constants.ts";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";

const BlockConfigs = () => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();

    const {
        blocks,
        blocksSortModel,
        blocksFilterModel,
        blocksPaginationModel,
        onSortModelChange,
        onFilterModelChange,
        onPaginationModelChange,
        blocksRequest,
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
                                    <EditNoteRounded
                                        color={"primary"}
                                        fontSize={"large"}/>
                                    <Typography variant={"h4"}>{t("page.header.configs.blocks")}</Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                        <DataGrid<BlockListing>
                            loading={!!isFetching}
                            rows={blocks?.results ?? []}
                            rowCount={blocks?.rowCount ?? 0}
                            columns={columns}
                            sortingMode={"server"}
                            paginationMode={"server"}
                            filterMode={"server"}
                            sortModel={blocksSortModel}
                            filterModel={blocksFilterModel}
                            paginationModel={blocksPaginationModel}
                            onSortModelChange={(sortModel: GridSortModel) => {
                                onSortModelChange(sortModel, false, false, true, false, false);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel, false, false, true, false, false);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel, false, false, true, false, false);
                            }}
                            onRowClick={(params: GridRowParams<BlockListing>): void => navigate(`/configs/blocks/${params.row.id}`)}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default BlockConfigs;