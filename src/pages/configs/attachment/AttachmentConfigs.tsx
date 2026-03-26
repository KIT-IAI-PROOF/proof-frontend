import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {Fragment, ReactNode, useContext} from "react";
import {useIsFetching} from "@tanstack/react-query";
import {BLOCKS_KEY} from "../../../utils/constants.ts";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {Box, Button, Paper, Tooltip} from "@mui/material";
import {EditNoteRounded} from "@mui/icons-material";
import {AttachmentListing} from "@webis/proof-config-manager-client";
import ConfigHeader from "../components/ConfigHeader.tsx";
import AddIcon from "@mui/icons-material/Add";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";

const AttachmentConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();

    const {
        attachments,
        attachmentsSortModel,
        attachmentsFilterModel,
        attachmentsPaginationModel,
        onSortModelChange,
        onFilterModelChange,
        onPaginationModelChange,
        attachmentsRequest,
        updateAttachmentId
    } = useContext(ConfigContext);

    const isFetching: number = useIsFetching({queryKey: [BLOCKS_KEY, attachmentsRequest], exact: true});

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
                            headerKey={"page.header.configs.attachments"}
                            tooltipTitle={t("tooltip.attachments")}
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                    <Tooltip title={t("action.addAttachment")}>
                                        <Button
                                            startIcon={<AddIcon/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateAttachmentId(undefined);
                                                navigate("/configs/attachments/create")
                                            }}
                                            color={"primary"}>
                                            {t("action.add")}
                                        </Button>
                                    </Tooltip>
                                    {/* <Tooltip title={t("action.importAttachment")}>
                                        <Button
                                            startIcon={<Upload/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateAttachmentId(undefined);
                                                navigate("/configs/attachments/import")
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip> */}
                                </Fragment>
                            }
                        />
                        <DataGrid<AttachmentListing>
                            loading={!!isFetching}
                            rows={attachments?.results ?? []}
                            rowCount={attachments?.rowCount ?? 0}
                            columns={columns}
                            sortingMode={"server"}
                            paginationMode={"server"}
                            filterMode={"server"}
                            sortModel={attachmentsSortModel}
                            filterModel={attachmentsFilterModel}
                            paginationModel={attachmentsPaginationModel}
                            onSortModelChange={(sortModel: GridSortModel) => {
                                onSortModelChange(sortModel, false, false, false, false, true);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel, false, false, false, false, true);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel, false, false, false, false, true);
                            }}
                            onRowClick={(params: GridRowParams<AttachmentListing>): void => navigate(`/configs/attachments/${params.row.id}`)}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />


                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );
}

export default AttachmentConfigs;