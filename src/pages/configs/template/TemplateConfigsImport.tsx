import {NavigateFunction, useNavigate} from "react-router-dom";
import {Fragment, ReactNode, useContext, useState} from "react";
import {Box, Button, Divider, Paper, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {EditNoteRounded, Save} from "@mui/icons-material";
import ConfigHeader from "../components/ConfigHeader.tsx";
import {TemplateDetail} from "@kit-iai-proof/proof-config-manager-client";
import UploadPanel from "../components/UploadPanel.tsx";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";
import {getBlockColor} from "../../../utils/palette.ts";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";

const TemplateConfigsImport: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {palette} = useContext<IAppContext>(AppContext);
    const {updateTemplateId, templateMutation} = useContext(ConfigContext);
    const [value, setValue] = useState<TemplateDetail | undefined>(undefined);
    const [error, setError] = useState<string>();

    const handleChange: (e: any) => void = (e: any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = ({target}): void => {
            if (target) {
                const content: string | undefined = target?.result?.toString();
                if (content) {
                    const value: TemplateDetail = JSON.parse(content);
                    setValue(value);
                }
            }
        };
    };

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={15}
            >
                <Paper elevation={0}>
                    <Box padding={3}>
                        <ConfigHeader
                            headerKey={"page.header.configs.template"}
                            tooltipTitle={"tooltip.template"}
                            icon={
                                <Fragment>
                                    <EditNoteRounded
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                </Fragment>
                            }
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                    <Tooltip title={t("action.close")}>
                                        <Button
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                updateTemplateId(undefined);
                                                navigate('/configs/templates');
                                            }}
                                            color={"primary"}
                                        >
                                            {t("action.close")}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={t("action.importTemplate")}>
                                        <Button
                                            disabled={!value}
                                            startIcon={<Save/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => {
                                                if (value) {
                                                    await templateMutation.mutateAsync({
                                                        ...value,
                                                        color: value.color ? value.color : (value.blockType ? getBlockColor(value.blockType, palette) : palette[0].hex)
                                                    })
                                                }
                                            }}
                                            color={"primary"}>
                                            {t("action.import")}
                                        </Button>
                                    </Tooltip>
                                </Fragment>
                            }
                        />
                        <Divider/>
                        <UploadPanel
                            accept={"application/json"}
                            handleChange={handleChange}
                            value={value}
                            setValue={setValue}
                            error={error}
                            setError={setError}
                        />
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default TemplateConfigsImport;