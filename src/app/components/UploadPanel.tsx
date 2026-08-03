import {Fragment, ReactNode} from "react";
import Grid from "@mui/material/Grid2";
import {Alert, Box, Paper, Stack, Theme, Typography, useTheme} from "@mui/material";
import {UploadRounded} from "@mui/icons-material";
import CodeMirror from "@uiw/react-codemirror";
import {json} from "@codemirror/lang-json";
import {oneDark} from "@codemirror/theme-one-dark";
import {githubLight} from "@uiw/codemirror-theme-github";
import {useTranslation} from "react-i18next";
import {jsonSyntaxLinter} from "../../utils/linter/jsonSyntaxLinter.ts";
import {EditorView} from "@codemirror/view";

interface IProps {
    handleChange?: (e: any) => void;
    accept: string;
    value: any;
    setValue: any;
    error: string | undefined;
    setError: (error?: string) => void;
}

const UploadPanel: ({handleChange, value, accept, setValue, error, setError}: IProps) => ReactNode = ({
                                                                                                          handleChange,
                                                                                                          value,
                                                                                                          accept,
                                                                                                          setValue,
                                                                                                          error,
                                                                                                          setError
                                                                                                      }: IProps): ReactNode => {

    const {t} = useTranslation();
    const theme: Theme = useTheme();

    return (
        <Fragment>
            <Grid
                container={true}
                padding={1}
                paddingTop={5}
                spacing={2}
                paddingBottom={5}
            >
                <Grid size={{xs: 12}} paddingBottom={3}>
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
                        <input
                            id={"file"}
                            onChange={handleChange}
                            type={"file"}
                            accept={accept}
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
                {
                    value && <Paper sx={{background: theme.palette.elevated.default, width: "100%"}}>
                        <Box padding={1} width={"100%"}>
                            <Typography paddingBottom={2} paddingLeft={1} variant={"h6"}>
                                {t("word.preview")}
                            </Typography>
                            {error &&
                                <Alert sx={{marginBottom: 2}} severity={"warning"}>
                                    {error}
                                </Alert>
                            }
                            <CodeMirror
                                style={{borderRadius: "5px"}}
                                value={JSON.stringify(value, null, 2)}
                                extensions={[json(), jsonSyntaxLinter(t), EditorView.lineWrapping]}
                                onChange={(value: string): void => {
                                    try {
                                        JSON.parse(value)
                                        setError(undefined);
                                    } catch (error) {
                                        if (error instanceof SyntaxError)
                                            setError(error.message);
                                    }
                                    if (value === "")
                                        setError(undefined);
                                    if (value !== '')
                                        setValue(JSON.parse(value))
                                }}
                                theme={theme.palette.mode === "dark" ? oneDark : githubLight}
                            />
                        </Box>
                    </Paper>
                }
            </Grid>
        </Fragment>
    )

}

export default UploadPanel;