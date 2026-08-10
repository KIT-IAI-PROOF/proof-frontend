import {NavigateFunction, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {ChangeEvent, Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {Box, Button, Divider, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Stack, TextField, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import {Info} from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import {useTranslation} from "react-i18next";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {BLOCKS_KEY, ENTITY_TYPES, INVALIDATION_KEYS} from "../../../utils/constants.ts";
import PageHeader from "../../../app/components/PageHeader.tsx";
import ColorPicker from "../../../app/components/ColorPicker.tsx";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import dayjs from "dayjs";
import InputsPanel from "../components/blocks/InputsPanel.tsx";
import OutputsPanel from "../components/blocks/OutputsPanel.tsx";
import {BlockDetail, TemplateDetail, TemplateDetailSyncStrategyEnum} from "@kit-iai-proof/proof-config-manager-client";
import {AxiosError} from "axios";
import {v4 as uuidv4} from "uuid";
import {getErrorMessage} from "../../../utils/error.ts";
import {blockService} from "../../../services/instances.ts";
import {blockQueryOptions} from "../../../query/options/blockQueryOptions.tsx";
import {templateQueryOptions} from "../../../query/options/templateQueryOptions.tsx";

const BlockConfigsDetail: () => ReactNode = (): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const [searchParams] = useSearchParams();
    const {blockId} = useParams();
    const navigate: NavigateFunction = useNavigate();
    const queryClient = useQueryClient();
    const {hasUnsavedChanges, updateError, sessionKey, updateHasUnsavedChanges, updateAllowNavigation} = useContext<IAppContext>(AppContext);
    const returnToWorkflowId: string | null = searchParams.get("workflowId");

    const [label, setLabel] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [color, setColor] = useState<string | undefined>(undefined);
    const [textColor, setTextColor] = useState<string | undefined>(undefined);
    const [image, setImage] = useState<string | undefined>(undefined);
    const [syncStrategy, setSyncStrategy] = useState<TemplateDetailSyncStrategyEnum | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [shutdownRelevant, setShutdownRelevant] = useState<boolean>(true);

    const {data: block}: UseQueryResult<BlockDetail, AxiosError> = useQuery(blockQueryOptions(blockId));
    const {data: template}: UseQueryResult<TemplateDetail, AxiosError> = useQuery(templateQueryOptions(block?.templateId));

    const blockMutation: UseMutationResult<BlockDetail, AxiosError, BlockDetail, any> = useMutation({
        retry: false,
        mutationFn: async (block: BlockDetail): Promise<BlockDetail> => {
            if (block.id) return await blockService.updateBlock(block.id, block, undefined, sessionKey);
            else return await blockService.saveBlock({...block, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [BLOCKS_KEY]});
        },
        onSuccess: async (result: BlockDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[BLOCKS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([BLOCKS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[BLOCKS_KEY], t));
        }
    });

    const blockDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (blockId: string): Promise<boolean> => {
            return await blockService.deleteBlock(blockId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[BLOCKS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[BLOCKS_KEY], t));
        }
    });

    useEffect((): void => {
        setLabel(block?.label);
        setDescription(block?.description);
        setColor(block?.color);
        setTextColor(block?.textColor);
        setImage(block?.containerImage)
        setSyncStrategy(block?.syncStrategy);
        setShutdownRelevant(block?.shutdownRelevant ?? true);
    }, [block?.color, block?.description, block?.label, block?.syncStrategy, block?.shutdownRelevant, block?.containerImage, block?.textColor]);

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingBottom={10}
                paddingLeft={10}
            >
                <Paper elevation={0}>
                    <Box padding={3}>
                        <PageHeader
                            headerKey={"page.header.configs.block"}
                            tooltipTitle={t("tooltip.block")}
                            subHeaderValue={block?.label ?? ""}
                            buttons={
                                <Fragment>
                                    <Button
                                        variant={"outlined"}
                                        onClick={async (): Promise<void> => {
                                            navigate(returnToWorkflowId ? `/editor/${returnToWorkflowId}` : `/configs/blocks/`);
                                        }}
                                        color={"primary"}>
                                        {t("action.close")}
                                    </Button>
                                    <Button
                                        disabled={!hasUnsavedChanges}
                                        variant={"outlined"}
                                        onClick={async (): Promise<void> => {
                                            await blockMutation
                                                .mutateAsync({
                                                    ...block,
                                                    label: label,
                                                    description: description,
                                                    color: color,
                                                    containerImage: image,
                                                    textColor: textColor,
                                                    shutdownRelevant: shutdownRelevant,
                                                    syncStrategy: syncStrategy
                                                })
                                            if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                                        }}
                                        color={"primary"}>
                                        {t("action.save")}
                                    </Button>
                                    <Button
                                        variant={"outlined"}
                                        color={"error"}
                                        onClick={(): void => {
                                            setDeleteDialogOpen(true)
                                        }}
                                    >
                                        {t("action.delete")}
                                    </Button>
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
                                    value={block?.id ?? ""}
                                    size={"small"}
                                    label={t("word.id")}
                                    variant="outlined"
                                    disabled
                                />
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.index")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.index")}>
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
                                    value={block?.index ?? ""}
                                    size={"small"}
                                    label={t("word.index")}
                                    variant="outlined"
                                    disabled
                                />
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.label")}
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
                                    fullWidth={true}
                                    value={label ?? ""}
                                    size={"small"}
                                    label={t("word.label")}
                                    variant="outlined"
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        const label: string = event.target.value;
                                        setLabel(label);
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    }}/>
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.templateName")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.templateName")}>
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
                                    value={block?.templateName ?? ""}
                                    size={"small"}
                                    label={t("word.templateName")}
                                    variant="outlined"
                                    disabled/>
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
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    }}/>
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.image")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.image")}>
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
                                    value={image ?? ""}
                                    size={"small"}
                                    label={t("word.image")}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: (template?.containerImage !== block?.containerImage)
                                                    ? 'orange'
                                                    : undefined,
                                            },
                                        },
                                    }}
                                    onChange={(e) => {
                                        setImage(e.target.value)
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    }}
                                    helperText={
                                        template?.containerImage !== block?.containerImage ? `${t("word.valueDifferent")} ${template?.containerImage}` : ""
                                    }
                                />
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.blockType")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.blockType")}>
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
                                    value={block?.blockType ?? ""}
                                    size={"small"}
                                    label={t("word.blockType")}
                                    variant="outlined"
                                    disabled={true}
                                />
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.communicationParadigm")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.communicationParadigm")}>
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
                                    value={block?.communicationParadigm ?? ""}
                                    size={"small"}
                                    label={t("word.communicationParadigm")}
                                    variant="outlined"
                                    disabled={true}
                                />
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.syncStrategy")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.syncStrategy")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <FormControl
                                    fullWidth={true}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: (template?.syncStrategy !== block?.syncStrategy)
                                                    ? 'orange'
                                                    : undefined,
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel>{t("word.syncStrategy")}</InputLabel>
                                    <Select
                                        size={"small"}
                                        variant="outlined"
                                        value={syncStrategy ?? ""}
                                        label={t("word.syncStrategy")}
                                        onChange={(event: SelectChangeEvent<TemplateDetailSyncStrategyEnum>): void => {
                                            const syncStrategy: string = event.target.value;
                                            setSyncStrategy(syncStrategy as TemplateDetailSyncStrategyEnum);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    >
                                        <MenuItem
                                            value={TemplateDetailSyncStrategyEnum.AllValues}>
                                            {TemplateDetailSyncStrategyEnum.AllValues}
                                        </MenuItem>
                                        <MenuItem
                                            value={TemplateDetailSyncStrategyEnum.WaitForSync}>
                                            {TemplateDetailSyncStrategyEnum.WaitForSync}
                                        </MenuItem>
                                        {/*
                                        <MenuItem
                                            value={TemplateDetailSyncStrategyEnum.Instant}>
                                            {TemplateDetailSyncStrategyEnum.Instant}
                                        </MenuItem>
                                        */}
                                    </Select>
                                    <FormHelperText>
                                        {template?.syncStrategy !== block?.syncStrategy ? `${t("word.valueDifferent")} ${template?.syncStrategy}` : ""}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.shutdownRelevant")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.shutdownRelevant")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <FormControl
                                    fullWidth={true}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: (template?.shutdownRelevant !== block?.shutdownRelevant)
                                                    ? 'orange'
                                                    : undefined,
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel>{t('word.shutdownRelevant')}</InputLabel>
                                    <Select
                                        size={"small"}
                                        variant={"outlined"}
                                        label={t('word.shutdownRelevant')}
                                        value={shutdownRelevant ? "true" : "false"}
                                        onChange={() => {
                                            setShutdownRelevant(!shutdownRelevant)
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    >
                                        <MenuItem value={"true"}>
                                            {t('action.yes')}
                                        </MenuItem>
                                        <MenuItem value={"false"}>
                                            {t('action.no')}
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        {template?.shutdownRelevant !== block?.shutdownRelevant ? `${t("word.valueDifferent")} ${template?.shutdownRelevant ? t('action.yes') : t('action.no')}` : ""}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.color")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.color")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <ColorPicker
                                    color={color}
                                    onChange={(color: string): void => {
                                        setColor(color);
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    }}
                                />
                            </Grid>
                            <Grid size={{xs: 3, lg: 2, xl: 2}}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography
                                        variant={"body1"}
                                        color={"primary"}
                                    >
                                        {t("word.textColor")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.textColor")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 9, lg: 10, xl: 10}}>
                                <ColorPicker
                                    color={textColor}
                                    onChange={(textColor: string): void => {
                                        setTextColor(textColor);
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    }}
                                />
                            </Grid>
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
                                    value={block?.lastModifiedBy ?? ""}
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
                                    value={block?.lastModifiedDate ? dayjs.unix(Number(block.lastModifiedDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
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
                                    value={block?.createdBy ?? ""}
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
                                    value={block?.creationDate ? dayjs.unix(Number(block?.creationDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                                    size={"small"}
                                    label={t("word.creationDate")}
                                    variant="outlined"
                                    disabled/>
                            </Grid>
                        </Grid>
                        <Paper sx={{background: theme.palette.elevated.default}}>
                            <Stack spacing={2} padding={2}>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Typography variant={"h5"} color={"textPrimary"} padding={2} paddingRight={0}>
                                        {t("word.program")}
                                    </Typography>
                                    <Tooltip title={t("tooltip.program")}>
                                        <Info color={"action"} sx={{cursor: "pointer"}}/>
                                    </Tooltip>
                                </Stack>
                                <Box padding={1} paddingTop={0}>
                                    <FormControl fullWidth={true}>
                                        <InputLabel>{t("word.program")}</InputLabel>
                                        <Select
                                            size={"small"}
                                            label={t("word.program")}
                                            variant="outlined"
                                            value={block?.program?.id}
                                            disabled={true}
                                        >
                                            {block?.program?.id && (
                                                <MenuItem value={block?.program?.id}>
                                                    {block?.program?.label} (Id: {block?.program?.id})
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Stack>
                        </Paper>
                        <Grid
                            spacing={2}
                            pt={2}
                            pb={2}
                            container={true}>
                            <Grid size={{xs: 12, sm: 6, md: 6, lg: 6, xl: 6}}>
                                <Paper style={{background: theme.palette.elevated.default}}>
                                    <Box padding={2}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                            <Typography
                                                variant={"h5"}
                                                color={"textPrimary"}
                                                padding={2}
                                                paddingRight={0}
                                            >
                                                {t("word.inputs")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.inputs")}>
                                                <Info color={"action"} sx={{cursor: "pointer"}}/>
                                            </Tooltip>
                                        </Stack>
                                        <InputsPanel inputs={block?.inputs ?? []}/>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid size={{xs: 12, sm: 6, md: 6, lg: 6, xl: 6}}>
                                <Paper style={{background: theme.palette.elevated.default}}>
                                    <Box padding={2}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                            <Typography
                                                variant={"h5"}
                                                color={"textPrimary"}
                                                padding={2}
                                                paddingRight={0}
                                            >
                                                {t("word.outputs")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.outputs")}>
                                                <Info color={"action"} sx={{cursor: "pointer"}}/>
                                            </Tooltip>
                                        </Stack>
                                        <OutputsPanel outputs={block?.outputs ?? []}/>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                callback={() => {
                    updateAllowNavigation(true);
                    blockDeletion
                        .mutateAsync(blockId!)
                        .then((): void => {
                            if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                            updateAllowNavigation(false);
                            navigate(returnToWorkflowId ? `/editor/${returnToWorkflowId}` : `/configs/blocks/`);
                        })
                        .catch(() => {
                            navigate(returnToWorkflowId ? `/editor/${returnToWorkflowId}` : `/configs/blocks/`);
                        })
                }}
            />
        </Fragment>
    );
};

export default BlockConfigsDetail;