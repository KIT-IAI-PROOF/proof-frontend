import {Fragment, ReactNode} from "react";
import {Box, Dialog, DialogTitle, Stack, Theme, Typography, useTheme} from "@mui/material";
import {useTranslation} from "react-i18next";
import packageJson from '../../../package.json';

interface IProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const AboutDialog = ({open, setOpen}: IProps): ReactNode => {
    const theme: Theme = useTheme();
    const {t} = useTranslation();

    return (
        <Fragment>
            <Dialog
                fullWidth={true}
                open={open}
                onClose={(): void => {
                    setOpen(false)
                }}>
                <Box
                    sx={{background: theme.palette.background.paper}}
                    padding={5}>
                    <DialogTitle>{t("dialog.header.about")}</DialogTitle>
                    <Stack pl={4} pr={4} spacing={2}>
                        <Typography variant={"body2"}>@ 2025 {t("about.kit")} <br/> {t("about.iai")}</Typography>
                        <Typography variant={"body2"}>{t('word.version')}: {packageJson.version}</Typography>
                    </Stack>
                </Box>
            </Dialog>
        </Fragment>
    );
};

export default AboutDialog;