import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {ChangeEvent, Fragment, MutableRefObject, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {Alert, Box, Button, Divider, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Stack, TextField, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {useTranslation} from "react-i18next";
import {
    BlockDetail,
    InputDetail,
    OutputDetail,
    ProgramDetail,
    TemplateDetail,
    TemplateDetailBlockTypeEnum,
    TemplateDetailCommunicationParadigmEnum,
    TemplateDetailSyncStrategyEnum,
    WorkflowDetail
} from "@kit-iai-proof/proof-config-manager-client";
import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {ENTITY_TYPES, INVALIDATION_KEYS, TEMPLATES_KEY} from "../../../utils/constants.ts";
import {EditNoteRounded, Info} from "@mui/icons-material";
import PageHeader from "../../../app/components/PageHeader.tsx";
import AddHandleDialog from "../components/template/TemplateAddHandleDialog.tsx";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import InputsPanel from "../components/template/InputsPanel.tsx";
import OutputsPanel from "../components/template/OutputsPanel.tsx";
import {getBlockColor} from "../../../utils/palette.ts";
import dayjs from "dayjs";
import ColorPicker from "../../../app/components/ColorPicker.tsx";
import {AxiosError} from "axios";
import {templateService} from "../../../services/instances.ts";
import {v4 as uuidv4} from "uuid";
import {getErrorMessage} from "../../../utils/error.ts";
import {templateQueryOptions, workflowsForTemplateQueryOptions} from "../../../query/options/templateQueryOptions.tsx";
import {programsQueryOptions} from "../../../query/options/programQueryOptions.tsx";

const TemplateConfigsDetail: () => ReactNode = (): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {templateId} = useParams();
    const queryClient = useQueryClient();
    const {hasUnsavedChanges, updateError, sessionKey, updateHasUnsavedChanges, updateAllowNavigation, palette} = useContext<IAppContext>(AppContext);

    const [name, setName] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [image, setImage] = useState<string | undefined>(undefined);
    const [communicationParadigm, setCommunicationParadigm] = useState<TemplateDetailCommunicationParadigmEnum | undefined>(undefined);
    const [blockType, setBlockType] = useState<TemplateDetailBlockTypeEnum | undefined>(undefined);
    const [syncStrategy, setSyncStrategy] = useState<TemplateDetailSyncStrategyEnum | undefined>(undefined);
    const [textColor, setTextColor] = useState<string | undefined>(undefined);
    const [shutdownRelevant, setShutdownRelevant] = useState<boolean>(true);
    const [outputs, setOutputs] = useState<OutputDetail[] | undefined>([]);
    const [inputs, setInputs] = useState<InputDetail[] | undefined>([]);
    const [program, setProgram] = useState<ProgramDetail | undefined>(undefined);
    const [addSourceHandle, setAddSourceHandle] = useState<boolean>(false);
    const [addTargetHandle, setAddTargetHandle] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [copyDialogOpen, setCopyDialogOpen] = useState<boolean>(false);
    const [nameError, setNameError] = useState<boolean>();
    const [imageError, setImageError] = useState<boolean>();
    const [programError, setProgramError] = useState<boolean>();
    const [inputOutputError, setInputOutputError] = useState<boolean>();
    const [copyBeforeSavingError, setCopyBeforeSavingError] = useState<boolean>();
    const [inputPanelExpanded, setInputPanelExpanded] = useState<Record<string, boolean>>();
    const [inputLabelsError, setInputLabelsError] = useState<Record<string, string>>();
    const [inputModelVarNamesError, setInputModelVarNamesError] = useState<Record<string, boolean>>();
    const inputAccordionRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const [outputPanelExpanded, setOutputPanelExpanded] = useState<Record<string, boolean>>();
    const [outputLabelsError, setOutputLabelsError] = useState<Record<string, string>>();
    const [outputsModelVarNamesError, setOutputsModelVarNamesError] = useState<Record<string, boolean>>();
    const outputAccordionRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const [jsonError, setJsonError] = useState<{ [key: string]: string | undefined; }>({});

    const {data: programs}: UseQueryResult<ProgramDetail[], AxiosError> = useQuery(programsQueryOptions());
    const {data: template}: UseQueryResult<TemplateDetail, AxiosError> = useQuery(templateQueryOptions(templateId));
    const {data: workflowsForTemplate}: UseQueryResult<WorkflowDetail[], AxiosError> = useQuery(workflowsForTemplateQueryOptions(templateId));

    const templateMutation: UseMutationResult<TemplateDetail, AxiosError, TemplateDetail, any> = useMutation({
        retry: false,
        mutationFn: async (template: TemplateDetail): Promise<TemplateDetail> => {
            if (template.id) return await templateService.updateTemplate(template.id, template, undefined, sessionKey);
            else return await templateService.saveTemplate({...template, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [TEMPLATES_KEY]});
        },
        onSuccess: async (result: TemplateDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[TEMPLATES_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([TEMPLATES_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[TEMPLATES_KEY], t));
        }
    });

    const templateDeletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (templateId: string): Promise<boolean> => {
            return await templateService.deleteTemplate(templateId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[TEMPLATES_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[TEMPLATES_KEY], t));
        }
    });

    const scrollToAccordion = (index: number, ref: MutableRefObject<Record<number, HTMLDivElement | null>>) => {
        const el = ref.current[index];
        if (!el) return;
        setTimeout(() => {
            el.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 60);
    }

    const validation: () => boolean = (): boolean => {
        let valid: boolean = true;

        if (!name || name.trim() == '') {
            setNameError(true);
            valid = false;
        } else {
            setNameError(false);
        }

        if (!image || image.trim() === '') {
            setImageError(true);
            valid = false;
        } else {
            setImageError(false);
        }

        if (program === undefined) {
            setProgramError(true);
            valid = false;
        } else {
            setProgramError(false);
        }

        Object.entries(jsonError).forEach(([key, value]) => {
            if (value) {
                const inputPosition = inputs?.findIndex(input => input.id === key)
                scrollToAccordion(inputPosition!, inputAccordionRefs)
                valid = false;
            }
        })

        const inputLabels = inputs?.map(input => input.label?.trim() || '');
        inputs?.forEach((input, index) => {
            if (!input.label || input.label.trim() == '') {
                setInputLabelsError(prevState => ({...prevState, [index]: "missing"}))
                setInputPanelExpanded(prevState => ({...prevState, [index]: true}))
                scrollToAccordion(index, inputAccordionRefs)
                valid = false;
            } else {
                const foundLabel = inputLabels!.filter((label) => label === input.label!.trim())
                if (foundLabel.length > 1) {
                    setInputLabelsError(prevState => ({...prevState, [index]: "duplicate"}))
                    setInputPanelExpanded(prevState => ({...prevState, [index]: true}))
                    scrollToAccordion(index, inputAccordionRefs)
                    valid = false;
                    return;
                }
                setInputLabelsError(prev => {
                    const {[index]: __removed, ...rest} = prev || {};
                    return rest;
                });
            }
        })

        inputs?.forEach((input, index) => {
            if (!input.modelVarName || input.modelVarName.trim() == '') {
                setInputModelVarNamesError(prevState => ({...prevState, [index]: true}))
                setInputPanelExpanded(prevState => ({...prevState, [index]: true}))
                scrollToAccordion(index, inputAccordionRefs)
                valid = false;
            } else {
                setInputModelVarNamesError(prev => {
                    const {[index]: __removed, ...rest} = prev || {};
                    return rest;
                });
            }
        })

        const outputLabels = outputs?.map(output => output.label?.trim() || '');
        outputs?.forEach((output, index) => {
            if (!output.label || output.label.trim() == '') {
                setOutputLabelsError(prevState => ({...prevState, [index]: "missing"}))
                setOutputPanelExpanded(prevState => ({...prevState, [index]: true}))
                scrollToAccordion(index, outputAccordionRefs)
                valid = false;
            } else {
                const foundLabel = outputLabels!.filter((label) => label === output.label!.trim())
                if (foundLabel.length > 1) {
                    setOutputLabelsError(prevState => ({...prevState, [index]: "duplicate"}))
                    setOutputPanelExpanded(prevState => ({...prevState, [index]: true}))
                    scrollToAccordion(index, inputAccordionRefs)
                    valid = false;
                    return;
                }
                setOutputLabelsError(prev => {
                    const {[index]: __removed, ...rest} = prev || {};
                    return rest;
                });
            }
        })

        outputs?.forEach((output, index) => {
            if (!output.modelVarName || output.modelVarName.trim() == '') {
                setOutputsModelVarNamesError(prevState => ({...prevState, [index]: true}))
                setOutputPanelExpanded(prevState => ({...prevState, [index]: true}))
                scrollToAccordion(index, outputAccordionRefs)
                valid = false;
            } else {
                setOutputsModelVarNamesError(prev => {
                    const {[index]: __removed, ...rest} = prev || {};
                    return rest;
                });
            }
        })

        if (inputs?.length === 0 && outputs?.length === 0) {
            setInputOutputError(true);
            valid = false;
        } else {
            setInputOutputError(false);
        }

        return valid
    }

    const handleSave: () => Promise<void> = async (): Promise<void> => {
        const valid: boolean = validation();

        if (!valid) return;

        if (templateId) {
            await templateMutation.mutateAsync({
                ...template,
                name: name,
                description: description,
                containerImage: image,
                blockType: blockType,
                syncStrategy: syncStrategy,
                communicationParadigm: communicationParadigm,
                program: program,
                textColor: textColor,
                outputs: outputs,
                inputs: inputs,
                shutdownRelevant: shutdownRelevant,
            });
            if (hasUnsavedChanges) updateHasUnsavedChanges(false)
            setCopyBeforeSavingError(false)
        } else {
            updateAllowNavigation(true);
            await templateMutation.mutateAsync({
                ...template,
                name: name,
                description: description,
                containerImage: image,
                blockType: blockType,
                syncStrategy: syncStrategy,
                communicationParadigm: communicationParadigm,
                program: program,
                outputs: outputs,
                inputs: inputs,
                shutdownRelevant: shutdownRelevant,
                textColor: textColor,
                color: getBlockColor(blockType, palette),
                type: "block"
            }).then((): void => {
                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                updateAllowNavigation(false);
                navigate("/configs/templates");
            });
        }
    }

    const handleCopy: () => Promise<void> = async (): Promise<void> => {
        const outputsWithoutId = outputs!.map(({id, ...rest}) => rest)
        const inputsWithoutId = inputs!.map(({id, ...rest}) => rest)
        await templateMutation.mutateAsync({
            name: `${name} - Copy`,
            description: `${description}`,
            containerImage: image,
            blockType: blockType,
            syncStrategy: syncStrategy,
            communicationParadigm: communicationParadigm,
            program: program,
            outputs: outputsWithoutId,
            inputs: inputsWithoutId,
            shutdownRelevant: shutdownRelevant,
            textColor: textColor,
            color: getBlockColor(blockType, palette),
            type: "block"
        }).then((template): void => {
            navigate(`/configs/templates/${template.id}`);
        })
    }

    useEffect((): void => {
        setName(template?.name ?? "");
        setDescription(template?.description ?? "");
        setImage(template?.containerImage ?? "ghcr.io/kit-iai-proof/proof-worker-python:latest");
        setOutputs(template?.outputs ?? []);
        setInputs(template?.inputs ?? []);
        setTextColor(template?.textColor ?? "#ffffff")
        setSyncStrategy(template?.syncStrategy ?? TemplateDetailSyncStrategyEnum.WaitForSync);
        setBlockType(template?.blockType ?? TemplateDetailBlockTypeEnum.Base);
        setCommunicationParadigm(template?.communicationParadigm ?? TemplateDetailCommunicationParadigmEnum.Stepbased);
        setShutdownRelevant(template?.shutdownRelevant ?? true)
        setProgram(template?.program ?? undefined);
    }, [template?.communicationParadigm, template?.containerImage, template?.syncStrategy, template?.description, template?.name, template?.outputs, template?.inputs, template?.blockType, template?.program, template?.shutdownRelevant, template?.textColor]);

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}
            >
                <Paper elevation={0}>
                    {
                        inputOutputError ? <Box padding={1}>
                                <Alert severity="error">
                                    {t('word.enterOutputOrInput')}
                                </Alert>
                            </Box>
                            :
                            copyBeforeSavingError && <Box padding={1}>
                                <Alert severity="error">
                                    {t('word.saveBeforeCopying')}
                                </Alert>
                            </Box>
                    }
                    <Box padding={3}>
                        <PageHeader
                            headerKey={"page.header.configs.template"}
                            tooltipTitle={t("tooltip.template")}
                            icon={
                                <Fragment>
                                    <EditNoteRounded
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                </Fragment>
                            }
                            subHeaderValue={template?.name ?? ""}
                            buttons={
                                <Fragment>
                                    <Button
                                        variant={"outlined"}
                                        onClick={async (): Promise<void> => {
                                            navigate('/configs/templates');
                                        }}
                                        color={"primary"}
                                    >
                                        {t("action.close")}
                                    </Button>
                                    <Button
                                        disabled={!!templateId && !hasUnsavedChanges}
                                        variant={"outlined"}
                                        onClick={handleSave}
                                        color={"primary"}
                                    >
                                        {templateId ? t("action.save") : t("action.create")}
                                    </Button>
                                    {templateId &&
                                        <Button
                                            variant={"outlined"}
                                            color={"primary"}
                                            onClick={(): void => {
                                                const valid: boolean = validation();
                                                if (!valid) return;
                                                if (hasUnsavedChanges) {
                                                    setCopyBeforeSavingError(true)
                                                    return;
                                                }
                                                setCopyDialogOpen(true)
                                            }}
                                        >
                                            {t("action.copy")}
                                        </Button>
                                    }
                                    {templateId &&
                                        <Button
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
                                templateId && <Fragment>
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
                                            value={template?.id ?? ""}
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
                                    value={name ?? ""}
                                    size={"small"}
                                    label={t("word.label")}
                                    variant="outlined"
                                    error={nameError}
                                    helperText={nameError ? t("word.required") : ""}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        const name: string = event.target.value;
                                        setName(name);
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
                                        {t("word.image")} *
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
                                    required={true}
                                    fullWidth={true}
                                    value={image ?? ""}
                                    size={"small"}
                                    label={t("word.image")}
                                    variant="outlined"
                                    error={imageError}
                                    helperText={imageError ? t("word.required") : ""}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        const image: string = event.target.value;
                                        setImage(image);
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    }}/>
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
                                <FormControl fullWidth={true}>
                                    <InputLabel>{t("word.blockType")}</InputLabel>
                                    <Select
                                        size={"small"}
                                        variant="outlined"
                                        value={blockType ?? ""}
                                        label={t("word.blockType")}
                                        onChange={(event: SelectChangeEvent<TemplateDetailBlockTypeEnum>): void => {
                                            const blockType: string = event.target.value;
                                            setBlockType(blockType as TemplateDetailBlockTypeEnum);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    >
                                        <MenuItem
                                            value={TemplateDetailBlockTypeEnum.Base}>
                                            {TemplateDetailBlockTypeEnum.Base}
                                        </MenuItem>
                                        <MenuItem
                                            value={TemplateDetailBlockTypeEnum.Helper}>
                                            {TemplateDetailBlockTypeEnum.Helper}
                                        </MenuItem>
                                        <MenuItem
                                            value={TemplateDetailBlockTypeEnum.Specific}>
                                            {TemplateDetailBlockTypeEnum.Specific}
                                        </MenuItem>
                                        <MenuItem
                                            value={TemplateDetailBlockTypeEnum.Userdefined}>
                                            {TemplateDetailBlockTypeEnum.Userdefined}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
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
                                <FormControl fullWidth={true}>
                                    <InputLabel>{t("word.communicationParadigm")}</InputLabel>
                                    <Select
                                        size={"small"}
                                        variant="outlined"
                                        value={communicationParadigm ?? ""}
                                        label={t("word.communicationParadigm")}
                                        onChange={(event: SelectChangeEvent<TemplateDetailCommunicationParadigmEnum>): void => {
                                            const communicationParadigm: string = event.target.value;
                                            setCommunicationParadigm(communicationParadigm as TemplateDetailCommunicationParadigmEnum);
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    >
                                        {/* <MenuItem value={TemplateDetailCommunicationParadigmEnum.Event}>
                                                {TemplateDetailCommunicationParadigmEnum.Event}
                                            </MenuItem> */}
                                        <MenuItem
                                            value={TemplateDetailCommunicationParadigmEnum.Stepbased}>
                                            {TemplateDetailCommunicationParadigmEnum.Stepbased}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
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
                                <FormControl fullWidth={true}>
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
                                <FormControl fullWidth={true}>
                                    <InputLabel>{t('word.shutdownRelevant')}</InputLabel>
                                    <Select
                                        size={"small"}
                                        variant={"outlined"}
                                        label={t('word.recoveryExecution')}
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
                                </FormControl>
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
                                    value={template?.lastModifiedBy ?? ""}
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
                                    value={template?.lastModifiedDate ? dayjs.unix(Number(template.lastModifiedDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
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
                                    value={template?.createdBy ?? ""}
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
                                    value={template?.creationDate ? dayjs.unix(Number(template.creationDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
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
                                        {t("word.program")} *
                                    </Typography>
                                    <Tooltip title={t("tooltip.program")}>
                                        <Info
                                            color={"action"}
                                            sx={{cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Stack>
                                <Box padding={1} paddingTop={0}>
                                    {
                                        programs && <FormControl size={"small"} error={programError} fullWidth>
                                            <InputLabel>{t("word.program")} *</InputLabel>
                                            <Select
                                                size={"small"}
                                                label={t("word.program")}
                                                variant="outlined"
                                                value={program?.id ?? ""}
                                                onChange={(event: SelectChangeEvent): void => {
                                                    const programId: string = event.target.value;
                                                    const program: ProgramDetail | undefined = programs?.find((program: ProgramDetail): boolean => program.id === programId);
                                                    setProgram(program)
                                                    if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                }}
                                            >
                                                {
                                                    programs?.map((program: ProgramDetail): ReactNode =>
                                                        <MenuItem key={program.id} value={program.id}>
                                                            {program.label} (Id: {program.id})
                                                        </MenuItem>
                                                    )
                                                }
                                            </Select>
                                            {programError && (
                                                <Typography paddingLeft={2} paddingTop={0.5} variant="caption"
                                                            color="error">
                                                    {t("word.required")}
                                                </Typography>
                                            )}
                                        </FormControl>}
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
                                            <Typography variant={"h5"} color={"textPrimary"} padding={2}
                                                        paddingRight={0}>
                                                {t("word.inputs")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.inputs")}>
                                                <Info color={"action"} sx={{cursor: "pointer"}}/>
                                            </Tooltip>
                                        </Stack>
                                        <Stack spacing={1} padding={2}>
                                            <InputsPanel
                                                jsonError={jsonError}
                                                setJsonError={setJsonError}
                                                inputs={inputs}
                                                inputLabelsError={inputLabelsError}
                                                inputModelVarNamesError={inputModelVarNamesError}
                                                setInputs={setInputs}
                                                inputPanelExpanded={inputPanelExpanded}
                                                setInputPanelExpanded={setInputPanelExpanded}
                                                accordionRefs={inputAccordionRefs}
                                            />
                                        </Stack>
                                        <Box sx={{display: "flex", justifyContent: "flex-end"}}>
                                            <Button
                                                onClick={(): void => setAddTargetHandle(true)}
                                                sx={{mb: 2, mr: 2}}
                                                variant={"outlined"}
                                                color={"primary"}>
                                                {t("action.add")}
                                            </Button>
                                        </Box>
                                        <AddHandleDialog
                                            setTargetHandles={setInputs}
                                            setSourceHandles={setOutputs}
                                            isInput={true}
                                            dialogHeader={(t("word.addInput"))}
                                            open={addTargetHandle}
                                            setOpen={setAddTargetHandle}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid size={{xs: 12, sm: 6, md: 6, lg: 6, xl: 6}}>
                                <Paper style={{background: theme.palette.elevated.default}}>
                                    <Box padding={2}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                            <Typography variant={"h5"} color={"textPrimary"} padding={2}
                                                        paddingRight={0}>
                                                {t("word.outputs")}
                                            </Typography>
                                            <Tooltip title={t("tooltip.outputs")}>
                                                <Info color={"action"} sx={{cursor: "pointer"}}/>
                                            </Tooltip>
                                        </Stack>
                                        <Stack spacing={2} padding={2}>
                                            <OutputsPanel
                                                outputs={outputs}
                                                outputLabelsError={outputLabelsError}
                                                outModelVarNamesError={outputsModelVarNamesError}
                                                setOutputs={setOutputs}
                                                outPutPanelExpanded={outputPanelExpanded}
                                                setOutputPanelExpanded={setOutputPanelExpanded}
                                                accordionRefs={outputAccordionRefs}
                                            />
                                        </Stack>
                                        <Box sx={{display: "flex", justifyContent: "flex-end"}}>
                                            <Button
                                                onClick={(): void => setAddSourceHandle(true)}
                                                sx={{mb: 2, mr: 2}}
                                                variant={"outlined"}
                                                color={"primary"}>
                                                {t("action.add")}
                                            </Button>
                                        </Box>
                                        <AddHandleDialog
                                            setTargetHandles={setInputs}
                                            setSourceHandles={setOutputs}
                                            isInput={false}
                                            dialogHeader={t("word.addOutput")}
                                            open={addSourceHandle}
                                            setOpen={setAddSourceHandle}
                                        />
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
                disableAction={workflowsForTemplate && workflowsForTemplate.length > 0}
                extraContent={
                    <Fragment>
                        {
                            workflowsForTemplate && workflowsForTemplate.length > 0 && <Alert severity="error">
                                <Typography paddingBottom={1}>{t("action.dependingBlocks")}:</Typography>
                                <Stack spacing={1}>
                                    {
                                        workflowsForTemplate.map((workflow: WorkflowDetail): ReactNode => {
                                            return (
                                                <Fragment key={workflow.id}>
                                                    <Stack direction={"column"} spacing={1}>
                                                        <Typography>Workflow: {workflow.label}</Typography>
                                                        {
                                                            workflow.blocks?.filter((block: BlockDetail) => block.templateId === templateId).map((block: BlockDetail) => {
                                                                return <Typography paddingLeft={2} variant={"body2"} key={`${workflow.id}-${block.id}`}>Block: {block.label} ({block.index})</Typography>
                                                            })
                                                        }
                                                    </Stack>
                                                </Fragment>
                                            );
                                        })
                                    }
                                </Stack>
                            </Alert>
                        }
                    </Fragment>
                }
                callback={() => {
                    updateAllowNavigation(true);
                    templateDeletion
                        .mutateAsync(templateId!)
                        .then((): void => {
                            if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                            updateAllowNavigation(false);
                            navigate("/configs/templates");
                        }).catch((): void => {
                        navigate("/configs/templates");
                    })
                }}
            />
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmCopy")}
                confirmAction={t("action.copy")}
                open={copyDialogOpen}
                setOpen={setCopyDialogOpen}
                callback={handleCopy}
            />
        </Fragment>
    );
};

export default TemplateConfigsDetail;