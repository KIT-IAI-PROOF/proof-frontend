import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {Fragment, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {useIsFetching, useQuery, UseQueryResult} from "@tanstack/react-query";
import {ATTACHMENTS_KEY, DEFAULT_CONFIGS_SORTING, DEFAULT_FILTER, DEFAULT_PAGINATION} from "../../../utils/constants.ts";
import {DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams, GridSortModel} from "@mui/x-data-grid";
import {Box, Button, Paper, Tooltip} from "@mui/material";
import {EditNoteRounded} from "@mui/icons-material";
import {AttachmentListing, AttachmentPagingModelListing} from "@webis/proof-config-manager-client";
import PageHeader from "../../../app/components/PageHeader.tsx";
import AddIcon from "@mui/icons-material/Add";
import {AxiosError} from "axios";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {searchAttachmentsQueryOptions} from "../../../query/options/attachmentQueryOptions.tsx";

const AttachmentConfigs: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {publishEntityMessage} = useContext<IAppContext>(AppContext);

    const [attachmentsRequest, setAttachmentsRequest] = useState<any>();
    const [attachmentsSortModel, setAttachmentsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [attachmentsFilterModel, setAttachmentsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [attachmentsPaginationModel, setAttachmentsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);

    const isFetching: number = useIsFetching({queryKey: [ATTACHMENTS_KEY, attachmentsRequest], exact: true});

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

    useEffect(() => {
        setAttachmentsRequest({
            sort: attachmentsSortModel,
            filter: attachmentsFilterModel,
            pagination: attachmentsPaginationModel
        })
    }, [attachmentsFilterModel, attachmentsPaginationModel, attachmentsSortModel]);

    const onSortModelChange = useCallback((sortModel: GridSortModel) => {
        setAttachmentsSortModel(sortModel);
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel) => {
        setAttachmentsFilterModel(filterModel);
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel) => {
        setAttachmentsPaginationModel(paginationModel);
    }, []);

    const {data: attachments}: UseQueryResult<AttachmentPagingModelListing, AxiosError> = useQuery(searchAttachmentsQueryOptions(attachmentsRequest));

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
                                onSortModelChange(sortModel);
                            }}
                            onFilterModelChange={(filterModel: GridFilterModel) => {
                                onFilterModelChange(filterModel);
                            }}
                            onPaginationModelChange={(paginationModel: GridPaginationModel) => {
                                onPaginationModelChange(paginationModel);
                            }}
                            onRowClick={(params: GridRowParams<AttachmentListing>): void => {
                                if (params.row.id) {
                                    publishEntityMessage(params.row.id, "attachments")
                                    navigate(`/configs/attachments/${params.row.id}`);
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

export default AttachmentConfigs;