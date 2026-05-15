import {NavigateFunction, useNavigate} from "react-router-dom";
import {Fragment, ReactNode, useContext, useState} from "react";
import {Box, Button, Divider, Paper, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {EditNoteRounded, Save} from "@mui/icons-material";
import ConfigHeader from "../components/ConfigHeader.tsx";
import {AttachmentDetail} from "@kit-iai-proof/proof-config-manager-client";
import UploadPanel from "../components/UploadPanel.tsx";
import {ConfigContext} from "../../../provider/IConfigContext.tsx";

const AttachmentConfigsImport: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {updateAttachmentId, attachmentMutation} = useContext(ConfigContext);
    const [value, setValue] = useState<AttachmentDetail | undefined>(undefined);
    const [error, setError] = useState<string>();

    const handleImport: () => Promise<void> = async (): Promise<void> => {
        if (error) {
            return;
        }
        if (!value?.label || value.label === "") {
            setError(t('word.missingLabel'))
            return;
        }
        if (value) {
            await attachmentMutation.mutateAsync({attachment: value, file: undefined})
            setError(undefined)
        }
    }

    const handleChange: (e: any) => void = (e: any): void => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = ({target}): void => {
            if (target) {
                const content: string | undefined = target?.result?.toString();
                if (content) {
                    const value: AttachmentDetail = JSON.parse(content);
                    setValue(value);
                    setError(undefined);
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
                            headerKey={"page.header.configs.attachment"}
                            tooltipTitle={"tooltip.attachment"}
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
                                                updateAttachmentId(undefined);
                                                navigate('/configs/attachments');
                                            }}
                                            color={"primary"}
                                        >
                                            {t("action.close")}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={t("action.importAttachment")}>
                                        <Button
                                            disabled={!value}
                                            startIcon={<Save/>}
                                            variant={"outlined"}
                                            onClick={async (): Promise<void> => handleImport()}
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

export default AttachmentConfigsImport;