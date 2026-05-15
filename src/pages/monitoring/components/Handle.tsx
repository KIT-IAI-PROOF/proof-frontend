import {InputDetail, InputDetailTypeEnum} from "@kit-iai-proof/proof-config-manager-client";
import React, {ChangeEvent, Fragment, ReactNode, SyntheticEvent, useContext, useMemo} from "react";
import Grid from "@mui/material/Grid2";
import {
    Alert,
    Autocomplete,
    AutocompleteRenderInputParams,
    Box,
    FormControl,
    FormLabel,
    Stack,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import {json} from "@codemirror/lang-json";
import {jsonSyntaxLinter} from "../../../utils/linter/jsonSyntaxLinter.ts";
import {EditorView} from "@codemirror/view";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/IMonitoringContext.tsx";
import {useTranslation} from "react-i18next";
import {Info, UploadRounded} from "@mui/icons-material";
import {oneDark} from "@codemirror/theme-one-dark";
import {githubLight} from "@uiw/codemirror-theme-github";
import {useQuery} from "@tanstack/react-query";
import {useAuth} from "react-oidc-context";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import FileService from "../../../services/FileService.ts";

interface IProps {
    handle: InputDetail
}

const Handle = ({handle}: IProps): ReactNode => {

    const {t} = useTranslation();
    const theme: Theme = useTheme();
    const {user} = useAuth();
    const {settings} = useContext<IAppContext>(AppContext);
    const {
        appliedInputs,
        addAppliedInput,
        removeKeyFromAppliedInputs,
        jsonError,
        updateJsonError,
        missingRequiredFields,
    } = useContext<IMonitoringContext>(MonitoringContext);

    const fileService = useMemo(() => new FileService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const {data: files} = useQuery({
        queryKey: ['files'],
        queryFn: async ({signal}) => {
            return await fileService.listFiles("userdata", signal);
        }
    });

    return (
        <Fragment>
            <Grid
                key={handle.id}
                size={12}
                container={true}
                spacing={1}
                paddingBottom={2}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
            >
                <Grid
                    size={{xs: 4, lg: 3}}
                >
                    <Stack direction={"row"} alignItems={"center"}>
                        <Typography
                            variant={"body1"}
                            color={"primary"}
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flexShrink: 1,
                                minWidth: 0
                            }}
                        >
                            {handle.label} {handle.required && '*'}
                        </Typography>
                        <Tooltip
                            title={
                                <Stack>
                                    <Typography>
                                        {handle.description}
                                    </Typography>
                                    {handle.defaultValue &&
                                        <Typography>
                                            {t("word.defaultValue")}: {handle.defaultValue}
                                        </Typography>
                                    }
                                </Stack>
                            }
                        >
                            <Info
                                color={"primary"}
                                fontSize={"small"}
                                sx={{ml: 1, cursor: "pointer"}}
                            />
                        </Tooltip>
                    </Stack>
                </Grid>
                <Grid
                    size={{xs: 8, lg: 9}}
                >
                    <Stack direction={"row"} alignItems={"center"} spacing={2}>
                        {
                            handle.type === InputDetailTypeEnum.FileName &&
                            <Stack
                                spacing={1}
                                flex={1}
                                direction={"row"}
                                alignItems={"center"}
                                justifyContent={"center"}
                            >
                                <Autocomplete
                                    size={"small"}
                                    fullWidth={true}
                                    freeSolo={true}
                                    multiple={false}
                                    value={appliedInputs[handle.id!] ?? handle.defaultValue ?? ""}
                                    options={files ?? []}
                                    onInputChange={(_event: SyntheticEvent<Element, Event>, value: string | null): void => {
                                        if (value && value !== "") {
                                            console.debug(value);
                                            addAppliedInput(handle.id!, value)
                                        } else {
                                            removeKeyFromAppliedInputs(handle.id!)
                                        }
                                    }}
                                    renderInput={(params: AutocompleteRenderInputParams) => <TextField
                                        {...params}
                                        required={handle.required}
                                        error={handle.required && missingRequiredFields.includes(handle.id!)}
                                        helperText={
                                            handle.required && missingRequiredFields.includes(handle.id!)
                                                ? t("word.required")
                                                : ""
                                        }
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
                                            addAppliedInput(handle.id!, result)
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
                            (handle.type === InputDetailTypeEnum.String || handle.type === InputDetailTypeEnum.Float || handle.type === InputDetailTypeEnum.Integer) &&
                            <TextField
                                type={handle.type === InputDetailTypeEnum.Integer || handle.type === InputDetailTypeEnum.Float ? "number" : "text"}
                                size={"small"}
                                required={handle.required}
                                value={appliedInputs[handle.id!] ?? handle.defaultValue ?? ""}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                    if (event.target.value.toString() !== "")
                                        addAppliedInput(handle.id!, event.target.value.toString())
                                    else
                                        removeKeyFromAppliedInputs(handle.id!)
                                }}
                                fullWidth={true}
                                error={handle.required && missingRequiredFields.includes(handle.id!)}
                                helperText={
                                    handle.required && missingRequiredFields.includes(handle.id!)
                                        ? t("word.required")
                                        : ""
                                }
                            >
                            </TextField>
                        }
                        {
                            (handle.type === InputDetailTypeEnum.Object || handle.type === InputDetailTypeEnum.ObjectArray || handle.type === InputDetailTypeEnum.StringArray || handle.type === InputDetailTypeEnum.IntegerArray || handle.type === InputDetailTypeEnum.FloatArray) &&
                            <FormControl
                                fullWidth={true}
                                required={handle.required}
                                error={handle.required && missingRequiredFields.includes(handle.id!)}
                            >
                                <CodeMirror
                                    value={appliedInputs[handle.id!] ?? handle.defaultValue ?? ""}
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
                                        if (value !== '')
                                            addAppliedInput(handle.id!, value)
                                        else
                                            removeKeyFromAppliedInputs(handle.id!)
                                    }}
                                    theme={theme.palette.mode === "dark" ? oneDark : githubLight}
                                >

                                </CodeMirror>
                                <Box paddingTop={1}>
                                    {
                                        (handle.required && missingRequiredFields.includes(handle.id!)) && (
                                            <Alert severity="error" sx={{mt: 1}}>
                                                {t("word.required")}
                                            </Alert>
                                        )}
                                    {
                                        jsonError[handle.id!] &&
                                        <Alert severity={"warning"}>
                                            {jsonError[handle.id!]}
                                        </Alert>
                                    }
                                </Box>
                            </FormControl>
                        }
                        <Box>
                            {
                                handle.unit && <FormLabel color={"primary"}>{handle.unit}</FormLabel>
                            }
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        </Fragment>
    );
}

export default React.memo(Handle)