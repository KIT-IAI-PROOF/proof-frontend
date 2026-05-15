import {useTranslation} from "react-i18next";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {ChangeEvent, Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {Box, Button, Divider, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Stack, TextField, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DeleteIcon from '@mui/icons-material/Delete';
import {AttachmentDetail, ProgramDetailRuntimeEnum} from "@kit-iai-proof/proof-config-manager-client";
import AddIcon from "@mui/icons-material/Add";
import {EditNoteRounded, Info} from "@mui/icons-material";
import ConfigHeader from "../components/ConfigHeader.tsx";
import {useIsFetching} from "@tanstack/react-query";
import {PROGRAMS_KEY} from "../../../utils/constants.ts";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import AddAttachmentsDialog from "../components/program/AddAttachmentsDialog.tsx";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import dayjs from "dayjs";

const ProgramConfigsDetail: () => ReactNode = (): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {programId} = useParams();
    const {hasUnsavedChanges, updateHasUnsavedChanges, updateAllowNavigation} = useContext<IAppContext>(AppContext);
    const {
        program,
        updateProgramId,
        programMutation,
        deleteProgramMutation
    } = useContext(ConfigContext);

    const isFetching: number = useIsFetching({queryKey: [PROGRAMS_KEY, programId], exact: true});

    const [label, setLabel] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [entryPoint, setEntryPoint] = useState<string | undefined>(undefined);
    const [runTime, setRunTime] = useState<ProgramDetailRuntimeEnum | undefined>(ProgramDetailRuntimeEnum.Python);
    const [programAttachments, setProgramAttachments] = useState<AttachmentDetail[] | undefined>(undefined);
    const [addAttachment, setAddAttachment] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [labelError, setLabelError] = useState(false);
    const [entryPointError, setEntryPointError] = useState(false);

    const handleSave = async () => {
        let valid = true;

        if (!label || label.trim() === "") {
            setLabelError(true);
            valid = false;
        } else {
            setLabelError(false);
        }

        if (!entryPoint || entryPoint.trim() === "") {
            setEntryPointError(true);
            valid = false;
        } else {
            setEntryPointError(false);
        }

        if (!valid) return;

        if (programId) {
            await programMutation.mutateAsync({
                ...program,
                label,
                description,
                entryPoint,
                runtime: runTime,
                attachments: programAttachments
            }).finally(() => {
                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
            });
        } else {
            updateAllowNavigation(true);
            await programMutation
                .mutateAsync({
                    ...program,
                    label,
                    description,
                    entryPoint,
                    runtime: runTime,
                    attachments: programAttachments
                })
                .then(() => {
                    if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                    updateAllowNavigation(false);
                    navigate("/configs/programs");
                });
        }
    };

    useEffect((): void => {
        setLabel(program?.label ?? "");
        setDescription(program?.description ?? "");
        setEntryPoint(program?.entryPoint ?? "");
        setRunTime(program?.runtime ?? ProgramDetailRuntimeEnum.Python);
        setProgramAttachments(program?.attachments ?? []);
    }, [program?.attachments, program?.description, program?.entryPoint, program?.label, program?.runtime]);

    useEffect((): void => {
        if (programId) updateProgramId(programId);
    }, [programId, updateProgramId]);

    useEffect((): void => {
        if (programAttachments && programAttachments.length === 0) {
            setEntryPoint("");
        }
    }, [programAttachments, entryPoint]);

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}
            >
                {(program || !programId) && !isFetching && <Paper elevation={0}>
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
                            headerKey={"page.header.configs.program"}
                            tooltipTitle={t("tooltip.program")}
                            subHeaderValue={program?.label ?? ""}
                            buttons={
                                <Fragment>
                                    <Button
                                        variant={"outlined"}
                                        onClick={async (): Promise<void> => {
                                            navigate('/configs/programs');
                                        }}
                                        color={"primary"}>
                                        {t("action.close")}
                                    </Button>
                                    <Button
                                        disabled={!!programId && !hasUnsavedChanges}
                                        variant={"outlined"}
                                        onClick={handleSave}
                                        color={"primary"}>
                                        {programId ? t("action.save") : t("action.create")}
                                    </Button>
                                    {
                                        programId && <Button
                                            variant={"outlined"}
                                            color={"error"}
                                            onClick={(): void => {
                                                setDeleteDialogOpen(true)
                                            }}
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
                                programId && <Fragment>
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
                                            value={program?.id ?? ""}
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
                                        {t("word.entryPoint")} *
                                    </Typography>
                                    <Tooltip title={t("tooltip.entryPoint")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <FormControl fullWidth={true} error={entryPointError}>
                                    <Select
                                        displayEmpty={true}
                                        value={entryPoint ?? ""}
                                        size={"small"}
                                        onChange={(event: SelectChangeEvent): void => {
                                            const entryPoint: string = event.target.value;
                                            setEntryPoint(entryPoint);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                        }}
                                        renderValue={(selected: string) => {
                                            if (selected === "") {
                                                return <Typography>{t("word.missingAttachment")}</Typography>;
                                            } else {
                                                return selected
                                            }
                                        }}
                                    >
                                        {programAttachments && programAttachments.map((attachment: AttachmentDetail): JSX.Element =>
                                            <MenuItem
                                                key={attachment.id}
                                                value={attachment.id}
                                            >
                                                {attachment.id}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    {entryPointError && (
                                        <Typography paddingLeft={2} paddingTop={0.5} variant="caption" color="error">
                                            {t("word.required")}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.runTime")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.runTime")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <FormControl fullWidth sx={{pb: 2}}>
                                    <InputLabel>{t("word.runTime")}</InputLabel>
                                    <Select
                                        size={"small"}
                                        variant="outlined"
                                        value={runTime}
                                        label={t("word.runTime")}
                                        onChange={(event: SelectChangeEvent<"PYTHON" | "MATLAB" | "JAVA">): void => {
                                            const runTime: string = event.target.value
                                            setRunTime(runTime as ProgramDetailRuntimeEnum);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
                                        }}>
                                        <MenuItem
                                            value={ProgramDetailRuntimeEnum.Python}>
                                            {ProgramDetailRuntimeEnum.Python}
                                        </MenuItem>
                                        {/* <MenuItem
                                            value={ProgramDetailRuntimeEnum.Java}>
                                            {ProgramDetailRuntimeEnum.Java}
                                        </MenuItem>
                                        <MenuItem
                                            value={ProgramDetailRuntimeEnum.Matlab}>
                                            {ProgramDetailRuntimeEnum.Matlab}
                                        </MenuItem> */}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {(programId && program) &&
                                <>
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
                                            value={program.lastModifiedBy ?? ""}
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
                                            value={program.lastModifiedDate ? dayjs.unix(Number(program.lastModifiedDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
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
                                            value={program.createdBy ?? ""}
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
                                            value={program.creationDate ? dayjs.unix(Number(program.creationDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                                            size={"small"}
                                            label={t("word.creationDate")}
                                            variant="outlined"
                                            disabled/>
                                    </Grid>
                                </>
                            }
                        </Grid>
                        <Paper style={{background: theme.palette.elevated.default}}>
                            <Stack spacing={2} padding={2}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography variant={"h5"} color={"textPrimary"}>
                                        {t("word.attachments")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.attachment")}>
                                        <Info
                                            color={"action"}
                                            sx={{cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                                <Stack spacing={1} paddingLeft={{xs: 1, sm: 5}} paddingRight={{xs: 1, sm: 5}}>
                                    {
                                        programAttachments && programAttachments.length > 0 && programAttachments
                                            .map((item: AttachmentDetail) => (
                                                <Paper
                                                    key={item.id}
                                                    elevation={0}
                                                    sx={{
                                                        padding: 2,
                                                        paddingLeft: 5,
                                                        borderRadius: 2,
                                                        background: theme.palette.elevated.paper
                                                    }}
                                                >
                                                    <Grid
                                                        container
                                                        spacing={1}
                                                        alignItems="center"
                                                    >
                                                        <Grid size={11}>
                                                            <Grid
                                                                container={true}
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    color="primary"
                                                                >
                                                                    {t("word.id")}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    component="span"
                                                                    sx={{pl: 10}}
                                                                >
                                                                    {item.id}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid
                                                                container={true}
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    color="primary"
                                                                >
                                                                    {t("word.label")}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    component="span"
                                                                    sx={{pl: 7}}
                                                                >
                                                                    {item.label}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid
                                                                container={true}
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    color="primary"
                                                                >
                                                                    {t("word.description")}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    component="span"
                                                                    sx={{pl: 2}}
                                                                >
                                                                    {item.description}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid
                                                                container={true}
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    color="primary"
                                                                >
                                                                    {t("word.path")}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    component="span"
                                                                    sx={{pl: 8}}
                                                                >
                                                                    {item.path}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid size={1}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(): void => setProgramAttachments(prevAttachments => prevAttachments!.filter(attachment => attachment.id !== item.id))}
                                                            >
                                                                <DeleteIcon fontSize="small"/>
                                                            </IconButton>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            ))
                                    }
                                    <Box padding={1}>
                                        <Button
                                            color={"inherit"}
                                            size="small"
                                            startIcon={<AddIcon/>}
                                            type="button"
                                            sx={{
                                                borderRadius: "8px",
                                                borderColor: "primary.main",
                                            }}
                                            onClick={() => setAddAttachment(true)}
                                        >
                                            <Typography textTransform={"initial"}>{t("action.add")}</Typography>
                                        </Button>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Box>
                </Paper>
                }
            </Box>
            <AddAttachmentsDialog
                programId={programId ?? undefined}
                addAttachment={addAttachment}
                setAddAttachment={setAddAttachment}
                setProgramAttachments={setProgramAttachments}
                programAttachments={programAttachments ?? []}
            />
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                callback={() => {
                    updateProgramId(undefined);
                    updateAllowNavigation(true)
                    deleteProgramMutation
                        .mutateAsync(programId!)
                        .then(() => {
                            if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                            updateAllowNavigation(false);
                            navigate("/configs/programs")
                        })
                        .catch((): void => {
                            navigate("/configs/programs")
                        });
                }}
            />
        </Fragment>
    )
}

export default ProgramConfigsDetail;