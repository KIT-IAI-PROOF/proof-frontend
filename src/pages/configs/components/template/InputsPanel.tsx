import React, {
    ChangeEvent,
    Dispatch,
    Fragment,
    MutableRefObject,
    ReactNode,
    SetStateAction,
    SyntheticEvent,
    useContext,
    useMemo,
} from "react";
import {
    InputDetail,
    InputDetailCommunicationTypeEnum,
    InputDetailPhaseEnum,
    InputDetailTypeEnum,
    OutputDetailPhaseEnum
} from "@webis/proof-config-manager-client";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Alert, Autocomplete, AutocompleteRenderInputParams, Box,
    Button,
    FormControl,
    FormControlLabel, FormLabel,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Switch,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {IAppContext} from "../../../../provider/AppProvider.tsx";
import {AppContext} from "../../../../provider/AppContext.tsx";
import {useTranslation} from "react-i18next";
import {Info, UploadRounded} from "@mui/icons-material";
import {useQuery} from "@tanstack/react-query";
import FileService from "../../../../services/FileService.ts";
import {useAuth} from "react-oidc-context";
import CodeMirror from "@uiw/react-codemirror";
import {json} from "@codemirror/lang-json";
import {jsonSyntaxLinter} from "../../../../utils/linter/jsonSyntaxLinter.ts";
import {EditorView} from "@codemirror/view";
import {oneDark} from "@codemirror/theme-one-dark";
import {githubLight} from "@uiw/codemirror-theme-github";
import {IConfigContext} from "../../../../provider/ConfigProvider.tsx";
import {ConfigContext} from "../../../../provider/IConfigContext.tsx";

interface IProps {
    inputs: InputDetail[] | undefined;
    setInputs: (inputs: InputDetail[]) => void;
    inputPanelExpanded: Record<string, boolean> | undefined;
    setInputPanelExpanded: Dispatch<SetStateAction<Record<string, boolean> | undefined>>;
    inputLabelsError: Record<string, string> | undefined;
    inputModelVarNamesError: Record<string, boolean> | undefined
    accordionRefs: MutableRefObject<Record<number, HTMLDivElement | null>>;
}

const InputsPanel = ({
                         inputs,
                         inputLabelsError,
                         inputModelVarNamesError,
                         setInputs,
                         inputPanelExpanded,
                         setInputPanelExpanded,
                         accordionRefs
                     }: IProps) => {
    const {t} = useTranslation();
    const theme: Theme = useTheme();
    const {user} = useAuth();
    const {settings} = useContext<IAppContext>(AppContext);
    const {hasUnsavedChanges, updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);
    const {jsonError, updateJsonError} = useContext<IConfigContext>(ConfigContext);

    const fileService = useMemo(() => new FileService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const {data: files} = useQuery({
        queryKey: ['files'],
        queryFn: async ({signal}) => {
            return await fileService.listFiles("userdata", signal);
        }
    });

    return (
        <Fragment>
            {
                inputs?.map((handle: InputDetail, index): ReactNode => {
                    return (
                        <Accordion
                            ref={(el: HTMLDivElement | null) => {
                                accordionRefs.current[index] = el;
                            }}
                            expanded={!!inputPanelExpanded?.[index]}
                            onChange={() => inputPanelExpanded && inputPanelExpanded[index] ? setInputPanelExpanded(prevState => ({
                                ...prevState,
                                [index]: false
                            })) : setInputPanelExpanded(prevState => ({...prevState, [index]: true}))}
                            disableGutters={true}
                            key={handle.id || `Id ${index + 1}`} style={{
                            background: theme.palette.elevated.paper,
                            borderRadius: "5px"
                        }}
                        >
                            <AccordionSummary
                                sx={{
                                    overflow: "hidden",
                                    "& .MuiAccordionSummary-content": {
                                        minWidth: 0,
                                    }
                                }}
                                expandIcon={<ExpandMoreIcon/>}
                            >
                                <Typography sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    minWidth: 0
                                }}>
                                    {handle.label || `Input ${index + 1}`}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack direction={"row"}>
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.label") || ""}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <TextField
                                        sx={{pb: 2}}
                                        fullWidth={true}
                                        size={"small"}
                                        label={
                                            <Typography>
                                                {t("word.label")}
                                            </Typography>
                                        }
                                        error={inputLabelsError && !!inputLabelsError[index]}
                                        helperText={inputLabelsError && inputLabelsError[index] === "missing" ?
                                            t("word.required") : inputLabelsError && inputLabelsError[index] === "duplicate" ?
                                                t("word.labelAlreadyUsed") : ""}
                                        value={handle.label ?? ""}
                                        variant="outlined"
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                            const handleLabel: string = event.target.value;
                                            setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    label: handleLabel
                                                } : th
                                            ));
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </Stack>
                                <Stack direction={"row"}>
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.description")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <TextField
                                        sx={{pb: 2}}
                                        size={"small"}
                                        fullWidth={true}
                                        label={
                                            <Typography>
                                                {t("word.description")}
                                            </Typography>
                                        }
                                        value={handle.description ?? ""}
                                        variant="outlined"
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                            const handleDescription: string = event.target.value;
                                            setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    description: handleDescription
                                                } : th
                                            ));
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </Stack>
                                <Stack direction={"row"}>
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.unit")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <TextField
                                        sx={{pb: 2}}
                                        size={"small"}
                                        fullWidth={true}
                                        label={
                                            <Typography>
                                                {t("word.unit")}
                                            </Typography>
                                        }
                                        value={handle.unit ?? ""}
                                        variant="outlined"
                                        required={false}
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                            const unit: string = event.target.value;
                                            setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    unit: unit
                                                } : th
                                            ));
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </Stack>
                                <Stack direction={"row"}>
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.modelVarName")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <TextField
                                        sx={{pb: 2}}
                                        size={"small"}
                                        fullWidth={true}
                                        label={
                                            <Typography>
                                                {t("word.modelVarName")}
                                            </Typography>
                                        }
                                        error={inputModelVarNamesError && inputModelVarNamesError[index]}
                                        helperText={inputModelVarNamesError && inputModelVarNamesError[index] ? t("word.required") : ""}
                                        value={handle.modelVarName ?? ""}
                                        variant="outlined"
                                        required={false}
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                            const modelVarName: string = event.target.value;
                                            setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    modelVarName: modelVarName
                                                } : th
                                            ));
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </Stack>
                                <FormControl size={"small"} fullWidth sx={{pb: 2, flexDirection: "row"}}>
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.required")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <FormControlLabel
                                        control={<Switch
                                            checked={handle.required ?? false}/>}
                                        label={t("word.required")}
                                        onChange={(event: any): void => {
                                            setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                index === i ? {
                                                    ...th,
                                                    defaultValue: event.target.checked ? undefined : handle.defaultValue,
                                                    required: event.target.checked
                                                } : th
                                            ))
                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                        }}
                                    />
                                </FormControl>
                                <Stack direction={"row"}>
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.type")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <FormControl size={"small"} fullWidth sx={{pb: 2}}>
                                        <InputLabel>
                                            <Stack direction={"row"}>
                                                <Typography>
                                                    {t("word.type")}
                                                </Typography>
                                            </Stack>
                                        </InputLabel>
                                        <Select
                                            variant="outlined"
                                            size={"small"}
                                            value={handle.type ?? ""}
                                            label={
                                                <Typography>
                                                    {t("word.type")}
                                                </Typography>
                                            }
                                            onChange={(event: SelectChangeEvent<"" | InputDetailTypeEnum>): void => {
                                                const handleType: string = event.target.value;
                                                setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                    index === i ? {
                                                        ...th,
                                                        type: handleType as InputDetailTypeEnum
                                                    } : th
                                                ));
                                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                            }}>
                                            <MenuItem
                                                value={InputDetailTypeEnum.String ?? ""}>
                                                {InputDetailTypeEnum.String}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailTypeEnum.Float ?? ""}>
                                                {InputDetailTypeEnum.Float}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailTypeEnum.Integer ?? ""}>
                                                {InputDetailTypeEnum.Integer}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailTypeEnum.Object ?? ""}>
                                                {InputDetailTypeEnum.Object}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailTypeEnum.FileName ?? ""}>
                                                {InputDetailTypeEnum.FileName}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailTypeEnum.StringArray ?? ""}>
                                                {InputDetailTypeEnum.StringArray}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailTypeEnum.IntegerArray ?? ""}>
                                                {InputDetailTypeEnum.IntegerArray}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailTypeEnum.FloatArray ?? ""}>
                                                {InputDetailTypeEnum.FloatArray}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailTypeEnum.ObjectArray ?? ""}>
                                                {InputDetailTypeEnum.ObjectArray}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>
                                <Stack direction={"row"}>
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.communicationType")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <FormControl size={"small"} fullWidth sx={{pb: 2}}>
                                        <InputLabel>
                                            <Typography>
                                                {t("word.communicationType")}
                                            </Typography>
                                        </InputLabel>
                                        <Select
                                            variant="outlined"
                                            size={"small"}
                                            value={handle.communicationType ?? ""}
                                            label={
                                                <Typography>
                                                    {t("word.communicationType")}
                                                </Typography>
                                            }
                                            onChange={(event: SelectChangeEvent<"STEPBASED" | "EVENT" | "EVENT_STATIC" | "STEPBASED_STATIC">): void => {
                                                const handleCommunicationType: string = event.target.value;
                                                setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                    index === i ? {
                                                        ...th,
                                                        defaultValue: !handleCommunicationType.includes("STATIC") ? undefined : handle.defaultValue,
                                                        communicationType: handleCommunicationType as InputDetailCommunicationTypeEnum
                                                    } : th
                                                ));
                                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                            }}>
                                            <MenuItem
                                                value={InputDetailCommunicationTypeEnum.Stepbased ?? ""}>
                                                {InputDetailCommunicationTypeEnum.Stepbased}
                                            </MenuItem>
                                            {/* <MenuItem
                                                value={InputDetailCommunicationTypeEnum.Event ?? ""}>
                                                {InputDetailCommunicationTypeEnum.Event}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailCommunicationTypeEnum.EventStatic ?? ""}>
                                                {InputDetailCommunicationTypeEnum.EventStatic}
                                            </MenuItem> */}
                                            <MenuItem
                                                value={InputDetailCommunicationTypeEnum.StepbasedStatic ?? ""}>
                                                {InputDetailCommunicationTypeEnum.StepbasedStatic}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>
                                <Stack direction={"row"}>
                                    <InputAdornment position={"start"}>
                                        <Tooltip title={t("tooltip.phase")}>
                                            <Info
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                    <FormControl size={"small"} fullWidth sx={{pb: 2}}>
                                        <InputLabel>
                                            <Typography>
                                                {t("word.phase")}
                                            </Typography>
                                        </InputLabel>
                                        <Select
                                            variant="outlined"
                                            size={"small"}
                                            value={handle.phase ?? ""}
                                            label={
                                                <Typography>
                                                    {t("word.phase")}
                                                </Typography>
                                            }
                                            onChange={(event: SelectChangeEvent<InputDetailPhaseEnum>): void => {
                                                const phase: string = event.target.value;
                                                setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                    index === i ? {
                                                        ...th,
                                                        phase: phase as InputDetailPhaseEnum
                                                    } : th
                                                ));
                                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                            }}>
                                            <MenuItem
                                                value={InputDetailPhaseEnum.Create}>
                                                {InputDetailPhaseEnum.Create}
                                            </MenuItem>
                                            <MenuItem
                                                value={InputDetailPhaseEnum.Init}>
                                                {InputDetailPhaseEnum.Init}
                                            </MenuItem>
                                            {handle.communicationType !== InputDetailCommunicationTypeEnum.StepbasedStatic &&
                                                <MenuItem
                                                    value={OutputDetailPhaseEnum.Execute}>
                                                    {OutputDetailPhaseEnum.Execute}
                                                </MenuItem>}
                                            {handle.communicationType !== InputDetailCommunicationTypeEnum.StepbasedStatic &&
                                                <MenuItem
                                                    value={InputDetailPhaseEnum.Finalize}>
                                                    {InputDetailPhaseEnum.Finalize}
                                                </MenuItem>}
                                            {handle.communicationType !== InputDetailCommunicationTypeEnum.StepbasedStatic &&
                                                <MenuItem
                                                    value={InputDetailPhaseEnum.Shutdown}>
                                                    {InputDetailPhaseEnum.Shutdown}
                                                </MenuItem>}
                                        </Select>
                                    </FormControl>
                                </Stack>
                                {!handle.required && handle.communicationType?.includes("STATIC") &&
                                    <Stack direction={"row"}>
                                        <InputAdornment position={"start"}>
                                            <Tooltip title={t("tooltip.defaultValue")}>
                                                <Info
                                                    fontSize={"small"}
                                                    sx={{ml: 1, cursor: "pointer"}}
                                                />
                                            </Tooltip>
                                        </InputAdornment>

                                        {(handle.type === InputDetailTypeEnum.String || handle.type === InputDetailTypeEnum.Float || handle.type === InputDetailTypeEnum.Integer) &&
                                            <TextField
                                                type={handle.type === InputDetailTypeEnum.Integer || handle.type === InputDetailTypeEnum.Float ? "number" : "text"}
                                                sx={{pb: 2}}
                                                size={"small"}
                                                fullWidth={true}
                                                label={t("word.defaultValue")}
                                                value={handle.defaultValue ?? ""}
                                                variant="outlined"
                                                required={false}
                                                onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                                    const defaultValue: string = event.target.value;
                                                    setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                        index === i ? {
                                                            ...th,
                                                            defaultValue: defaultValue
                                                        } : th
                                                    ));
                                                    if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                }}
                                            />
                                        }
                                        {
                                            handle.type === InputDetailTypeEnum.FileName &&
                                            <Stack spacing={1} flex={1} direction={"row"} alignItems={"center"}
                                                   justifyContent={"center"} paddingBottom={2}>
                                                <Autocomplete
                                                    size={"small"}
                                                    fullWidth={true}
                                                    freeSolo={true}
                                                    multiple={false}
                                                    value={handle.defaultValue ?? ""}
                                                    options={files ?? []}
                                                    onChange={(_event: SyntheticEvent<Element, Event>, value: string | null): void => {
                                                        setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                            index === i ? {
                                                                ...th,
                                                                defaultValue: value ?? undefined
                                                            } : th
                                                        ));
                                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                    }}
                                                    renderInput={(params: AutocompleteRenderInputParams) =>
                                                        <TextField
                                                            label={t("word.defaultValue")}
                                                            {...params}
                                                            required={false}
                                                        />
                                                    }
                                                />
                                                <Stack direction={"row"} alignItems={"center"}>
                                                    <input
                                                        id={"file"}
                                                        type={"file"}
                                                        onChange={async (event: any): Promise<void> => {
                                                            const file: File = event.target.files[0];
                                                            const result: string = await fileService.uploadFile(file, "userdata", undefined);
                                                            setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                                index === i ? {
                                                                    ...th,
                                                                    defaultValue: result ?? undefined
                                                                } : th
                                                            ));
                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
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
                                            </Stack>
                                        }
                                        {
                                            (handle.type === InputDetailTypeEnum.Object || handle.type === InputDetailTypeEnum.ObjectArray || handle.type === InputDetailTypeEnum.StringArray || handle.type === InputDetailTypeEnum.IntegerArray || handle.type === InputDetailTypeEnum.FloatArray) &&
                                            <FormControl
                                                fullWidth={true}
                                                required={false}
                                            >
                                                <FormLabel>{t("word.defaultValue")}</FormLabel>
                                                <CodeMirror
                                                    value={handle.defaultValue ?? ""}
                                                    extensions={[json(), jsonSyntaxLinter(t, handle.type), EditorView.lineWrapping]}
                                                    onChange={(value: string): void => {
                                                        try {
                                                            JSON.parse(value)
                                                            updateJsonError(handle.id!, undefined);
                                                        } catch (error) {
                                                            if (error instanceof SyntaxError)
                                                                updateJsonError(handle.id!, error.message);
                                                        }
                                                        if (value === "")
                                                            updateJsonError(handle.id!, undefined);
                                                        if (value !== '') {
                                                            setInputs(inputs!.map((th: InputDetail, i): InputDetail =>
                                                                index === i ? {
                                                                    ...th,
                                                                    defaultValue: value ?? undefined
                                                                } : th
                                                            ));
                                                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                                        }
                                                    }}
                                                    theme={theme.palette.mode === "dark" ? oneDark : githubLight}
                                                >

                                                </CodeMirror>
                                                <Box paddingBottom={2}>
                                                    {
                                                        jsonError[handle.id!] &&
                                                        <Alert severity={"warning"}>
                                                            {jsonError[handle.id!]}
                                                        </Alert>
                                                    }
                                                </Box>
                                            </FormControl>
                                        }
                                    </Stack>
                                }
                                <Button
                                    onClick={async (): Promise<void> => {
                                        setInputs(inputs!.filter((__th: InputDetail, i): boolean => index !== i))
                                        if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                                    }}
                                    variant={"outlined"}
                                    color={"primary"}>
                                    {t("action.delete")}
                                </Button>
                            </AccordionDetails>
                        </Accordion>
                    )
                        ;
                })
            }
        </Fragment>
    )
}

export default React.memo(InputsPanel);