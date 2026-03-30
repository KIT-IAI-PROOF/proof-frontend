import {ChangeEvent, Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {Box, Button, Divider, Paper, Stack, TextField, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import {NavigateFunction, useLocation, useNavigate, useParams} from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {useTranslation} from "react-i18next";
import {EditNoteRounded, Info, UploadRounded} from "@mui/icons-material";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {useIsFetching} from "@tanstack/react-query";
import {PROGRAMS_KEY} from "../../../utils/constants.ts";
import ConfigHeader from "../components/ConfigHeader.tsx";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import dayjs from "dayjs";

const AttachmentConfigsDetail: () => ReactNode = (): ReactNode => {

    const theme: Theme = useTheme();
    const {attachmentId} = useParams();
    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const {
        hasUnsavedChanges,
        updateHasUnsavedChanges,
        updateAllowNavigation,
    } = useContext<IAppContext>(AppContext);
    const isFetching: number = useIsFetching({queryKey: [PROGRAMS_KEY, attachmentId], exact: true});

    const [file, setFile] = useState<File | undefined>(undefined);
    const [label, setLabel] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [path, setPath] = useState<string | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [labelError, setLabelError] = useState<boolean>();

    const {
        attachment,
        updateAttachmentId,
        attachmentMutation,
        attachmentDeletion
    } = useContext(ConfigContext);

    const handleSave = async () => {
        let valid = true;

        if (!label || label.trim() === "") {
            setLabelError(true);
            valid = false;
        }

        if (!valid) return;

        if (attachmentId) {
            await attachmentMutation.mutateAsync({
                    file: file,
                    attachment: {
                        ...attachment,
                        label: label,
                        description: description,
                        path: path,
                    }
                }
            ).finally(() => {
                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
            })
        } else {
            updateAllowNavigation(true);
            await attachmentMutation.mutateAsync({
                file: file,
                attachment: {
                    ...attachment,
                    label: label,
                    description: description,
                    path: path,
                }
            }).then(() => {
                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                updateAllowNavigation(false);
                if (location.state?.from.includes("/configs/programs")) navigate(location.state.from)
                else navigate("/configs/attachments");
            });
        }
    }

    useEffect(() => {
        setLabel(attachment?.label ?? "");
        setDescription(attachment?.description ?? "");
        setPath(attachment?.path ?? "");
    }, [attachment?.description, attachment?.label, attachment?.path]);

    useEffect(() => {
        if (attachmentId) updateAttachmentId(attachmentId);
    }, [attachmentId, updateAttachmentId]);

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}
            >
                {(attachment || !attachmentId) && !isFetching && <Paper elevation={0}>
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
                            headerKey={"page.header.configs.attachment"}
                            tooltipTitle={t("tooltip.attachment")}
                            subHeaderValue={attachment?.label ?? ""}
                            buttons={
                                <Fragment>
                                    <Button
                                        variant={"outlined"}
                                        onClick={async (): Promise<void> => {
                                            if (location.state?.from.includes("/configs/programs"))
                                                navigate(location.state.from)
                                            else
                                                navigate("/configs/attachments");
                                        }}
                                        color={"primary"}>
                                        {t("action.close")}
                                    </Button>
                                    <Button
                                        disabled={!!attachmentId && !hasUnsavedChanges}
                                        variant={"outlined"}
                                        onClick={handleSave}
                                        color={"primary"}
                                    >
                                        {attachmentId ? t("action.save") : t("action.create")}
                                    </Button>
                                    {attachmentId &&
                                        <Button
                                            variant={"outlined"}
                                            onClick={(): void => {
                                                setDeleteDialogOpen(true)
                                            }}
                                            color={"error"}
                                        >
                                            {t("action.delete")}
                                        </Button>
                                    }
                                </Fragment>
                            }
                        />
                        <Divider/>
                        <Grid
                            container={true}
                            padding={1}
                            paddingTop={5}
                            spacing={2}
                            paddingBottom={5}
                        >
                            {
                                attachmentId &&
                                <Fragment>
                                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                        <Stack direction={"row"} alignItems={"center"}>
                                            <Typography
                                                variant={"body1"}
                                                color={"primary"}
                                            >
                                                {t("word.id")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.id")}>
                                                <Info
                                                    color={"primary"}
                                                    fontSize={"small"}
                                                    sx={{ml: 1, cursor: "pointer"}}
                                                />
                                            </Tooltip>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment?.id ?? ""}
                                            size={"small"}
                                            label={t("word.id")}
                                            variant="outlined"
                                            disabled/>
                                    </Grid>
                                </Fragment>
                            }
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.label")} *
                                    </Typography>
                                    <Tooltip title={t("tooltip.label")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <TextField
                                    required={true}
                                    fullWidth={true}
                                    value={label ?? ""}
                                    size={"small"}
                                    label={t("word.label")}
                                    variant="outlined"
                                    error={labelError}
                                    helperText={labelError ? t("word.required") : ""}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        const label: string = event.target.value;
                                        setLabel(label);
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                    }}/>
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.description")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.description")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <TextField
                                    fullWidth={true}
                                    value={description ?? ""}
                                    size={"small"}
                                    label={t("word.description")}
                                    variant="outlined"
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        const description: string = event.target.value;
                                        setDescription(description);
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                    }}/>
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.fileName")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.fileName")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <TextField
                                    fullWidth={true}
                                    disabled={true}
                                    value={file?.name ? file.name : (path?.split("/").at(-1) ?? "")}
                                    size={"small"}
                                    label={t("word.fileName")}
                                    variant={"outlined"}
                                />
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Stack direction={"row"} alignItems={"center"}>
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.file")} *
                                        </Typography>
                                        <Tooltip title={t("tooltip.file")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <Stack direction={"row"} alignItems={"center"}>
                                    <input
                                        id={"file"}
                                        type={"file"}
                                        onChange={async (event: any): Promise<void> => {
                                            const file: File = event.target.files[0];
                                            setFile(file);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                        }}
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
                            </Grid>
                            {(attachmentId && attachment) &&
                                <Fragment>
                                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                        <Stack direction={"row"} alignItems={"center"}>
                                            <Typography
                                                variant={"body1"}
                                                color={"primary"}
                                            >
                                                {t("word.lastModifiedBy")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.lastModifiedBy")}>
                                                <Info
                                                    color={"primary"}
                                                    fontSize={"small"}
                                                    sx={{ml: 1, cursor: "pointer"}}
                                                />
                                            </Tooltip>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment.lastModifiedBy ?? ""}
                                            size={"small"}
                                            label={t("word.lastModifiedBy")}
                                            variant="outlined"
                                            disabled/>
                                    </Grid>
                                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                        <Stack direction={"row"} alignItems={"center"}>
                                            <Typography
                                                variant={"body1"}
                                                color={"primary"}
                                            >
                                                {t("word.lastModifiedDate")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.lastModifiedDate")}>
                                                <Info
                                                    color={"primary"}
                                                    fontSize={"small"}
                                                    sx={{ml: 1, cursor: "pointer"}}
                                                />
                                            </Tooltip>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment.lastModifiedDate ? dayjs.unix(Number(attachment.lastModifiedDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                                            size={"small"}
                                            label={t("word.lastModifiedDate")}
                                            variant="outlined"
                                            disabled/>
                                    </Grid>
                                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                        <Stack direction={"row"} alignItems={"center"}>
                                            <Typography
                                                variant={"body1"}
                                                color={"primary"}
                                            >
                                                {t("word.createdBy")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.createdBy")}>
                                                <Info
                                                    color={"primary"}
                                                    fontSize={"small"}
                                                    sx={{ml: 1, cursor: "pointer"}}
                                                />
                                            </Tooltip>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment.createdBy ?? ""}
                                            size={"small"}
                                            label={t("word.createdBy")}
                                            variant="outlined"
                                            disabled/>
                                    </Grid>
                                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                        <Stack direction={"row"} alignItems={"center"}>
                                            <Typography
                                                variant={"body1"}
                                                color={"primary"}
                                            >
                                                {t("word.creationDate")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.creationDate")}>
                                                <Info
                                                    color={"primary"}
                                                    fontSize={"small"}
                                                    sx={{ml: 1, cursor: "pointer"}}
                                                />
                                            </Tooltip>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                        <TextField
                                            fullWidth={true}
                                            value={attachment.creationDate ? dayjs.unix(Number(attachment.creationDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                                            size={"small"}
                                            label={t("word.creationDate")}
                                            variant="outlined"
                                            disabled/>
                                    </Grid>
                                </Fragment>
                            }
                        </Grid>
                    </Box>
                </Paper>}
            </Box>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                callback={() => {
                    updateAttachmentId(undefined);
                    updateAllowNavigation(true);
                    attachmentDeletion
                        .mutateAsync(attachmentId!)
                        .then(() => {
                            if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                            updateAllowNavigation(false);
                            navigate("/configs/attachments")
                        })
                        .catch((): void => {
                            navigate("/configs/attachments")
                        })
                }}
            />
        </Fragment>
    );
}

export default AttachmentConfigsDetail;